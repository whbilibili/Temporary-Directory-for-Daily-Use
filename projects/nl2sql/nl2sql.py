"""
nl2sql.py — 自然语言转 SQL 查询引擎
支持：Ollama LLM + SQLite / MySQL 双模式
分层防御：静态检查 → EXPLAIN 预检 → 只读执行 → 结果验证 → 自动修复循环
"""

import re
import json
import sqlite3
import textwrap
import argparse
import urllib.request
import urllib.error
from dataclasses import dataclass, field
from typing import Optional, Union
from datetime import datetime

# ─────────────────────────────────────────────
# 配置
# ─────────────────────────────────────────────

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL    = "qwen2.5:14b"
MAX_RETRY       = 3
MAX_ROWS        = 500
QUERY_TIMEOUT   = 10        # 秒（MySQL 用 MAX_EXECUTION_TIME hint）

# 禁止的 SQL 操作
DANGEROUS_KEYWORDS = [
    r"\bDROP\b", r"\bDELETE\b", r"\bTRUNCATE\b",
    r"\bINSERT\b", r"\bUPDATE\b", r"\bALTER\b",
    r"\bCREATE\b", r"\bREPLACE\b", r"\bMERGE\b",
    r"\bEXEC\b",   r"\bEXECUTE\b", r"\bATTACH\b",
    r"\bDETACH\b", r"\bPRAGMA\b",  r"\bGRANT\b",
    r"\bREVOKE\b", r"\bLOAD_FILE\b", r"\bINTO\s+OUTFILE\b",
]


# ─────────────────────────────────────────────
# 数据库连接抽象层
# ─────────────────────────────────────────────

class DBConn:
    """统一封装 SQLite / MySQL 连接，对上层屏蔽差异"""

    def __init__(self, conn, db_type: str, db_name: str = ""):
        self._conn    = conn
        self.db_type  = db_type   # "sqlite" | "mysql"
        self.db_name  = db_name   # MySQL 数据库名

    # ── Schema 提取 ──────────────────────────

    def get_schema(self, tables: Optional[list] = None) -> str:
        if self.db_type == "sqlite":
            return self._schema_sqlite(tables)
        else:
            return self._schema_mysql(tables)

    def _schema_sqlite(self, tables: Optional[list]) -> str:
        cursor = self._conn.cursor()
        if tables:
            placeholders = ",".join("?" * len(tables))
            cursor.execute(
                f"SELECT name FROM sqlite_master WHERE type='table' AND name IN ({placeholders})",
                tables
            )
        else:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")

        table_names = [r[0] for r in cursor.fetchall()]
        if not table_names:
            return "（数据库中没有表）"

        parts = []
        for tname in table_names:
            cursor.execute(f"PRAGMA table_info({tname})")
            cols = cursor.fetchall()
            col_defs = ", ".join(
                f"{c[1]} {c[2]}{'  -- NOT NULL' if c[3] else ''}{'  -- PK' if c[5] else ''}"
                for c in cols
            )
            try:
                cursor.execute(f"SELECT * FROM `{tname}` LIMIT 3")
                samples = cursor.fetchall()
                sample_str = "\n".join(f"    {r}" for r in samples) if samples else "    （空表）"
            except Exception:
                sample_str = "    （无法读取样本）"
            parts.append(f"表名: {tname}\n字段: {col_defs}\n样本数据:\n{sample_str}")
        return "\n\n".join(parts)

    def _schema_mysql(self, tables: Optional[list]) -> str:
        cursor = self._conn.cursor()
        if tables:
            fmt = ",".join(["%s"] * len(tables))
            cursor.execute(
                f"SELECT TABLE_NAME FROM information_schema.TABLES "
                f"WHERE TABLE_SCHEMA=%s AND TABLE_NAME IN ({fmt})",
                [self.db_name] + tables
            )
        else:
            cursor.execute(
                "SELECT TABLE_NAME FROM information_schema.TABLES "
                "WHERE TABLE_SCHEMA=%s ORDER BY TABLE_NAME",
                [self.db_name]
            )
        table_names = [r[0] for r in cursor.fetchall()]
        if not table_names:
            return "（数据库中没有表）"

        parts = []
        for tname in table_names:
            cursor.execute(
                "SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_COMMENT "
                "FROM information_schema.COLUMNS "
                "WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s ORDER BY ORDINAL_POSITION",
                [self.db_name, tname]
            )
            cols = cursor.fetchall()
            col_defs = ", ".join(
                f"{c[0]} {c[1]}"
                f"{'  -- NOT NULL' if c[2]=='NO' else ''}"
                f"{'  -- PK' if c[3]=='PRI' else ''}"
                f"{'  -- ' + c[4] if c[4] else ''}"
                for c in cols
            )
            try:
                cursor.execute(f"SELECT * FROM `{tname}` LIMIT 3")
                samples = cursor.fetchall()
                sample_str = "\n".join(f"    {r}" for r in samples) if samples else "    （空表）"
            except Exception:
                sample_str = "    （无法读取样本）"
            parts.append(f"表名: {tname}\n字段: {col_defs}\n样本数据:\n{sample_str}")
        return "\n\n".join(parts)

    # ── EXPLAIN 预检 ─────────────────────────

    def explain_check(self, sql: str) -> "ExplainResult":
        if self.db_type == "sqlite":
            return self._explain_sqlite(sql)
        else:
            return self._explain_mysql(sql)

    def _explain_sqlite(self, sql: str) -> "ExplainResult":
        try:
            cursor = self._conn.cursor()
            cursor.execute(f"EXPLAIN QUERY PLAN {sql}")
            plan_rows = cursor.fetchall()
        except sqlite3.Error as e:
            return ExplainResult(False, f"SQL 语法错误：{e}")

        full_scan = []
        for row in plan_rows:
            detail = str(row).upper()
            if "SCAN TABLE" in detail and "USING INDEX" not in detail:
                m = re.search(r'SCAN TABLE (\w+)', str(row), re.IGNORECASE)
                if m:
                    full_scan.append(m.group(1))
        return ExplainResult(True, full_scan_tables=full_scan)

    def _explain_mysql(self, sql: str) -> "ExplainResult":
        try:
            import pymysql
            cursor = self._conn.cursor()
            cursor.execute(f"EXPLAIN {sql}")
            plan_rows = cursor.fetchall()
            col_names = [d[0] for d in cursor.description]
        except Exception as e:
            return ExplainResult(False, f"SQL 语法错误：{e}")

        full_scan = []
        type_idx  = next((i for i, c in enumerate(col_names) if c.lower() == "type"), None)
        table_idx = next((i for i, c in enumerate(col_names) if c.lower() == "table"), None)
        if type_idx is not None and table_idx is not None:
            for row in plan_rows:
                if str(row[type_idx]).upper() in ("ALL", "INDEX"):
                    full_scan.append(str(row[table_idx]))
        return ExplainResult(True, full_scan_tables=full_scan)

    # ── 执行查询 ─────────────────────────────

    def execute_query(self, sql: str) -> tuple:
        if self.db_type == "sqlite":
            return self._exec_sqlite(sql)
        else:
            return self._exec_mysql(sql)

    def _exec_sqlite(self, sql: str) -> tuple:
        sql_with_limit = sql
        if not re.search(r'\bLIMIT\b', sql, re.IGNORECASE):
            sql_with_limit = f"{sql.rstrip(';')} LIMIT {MAX_ROWS + 1}"

        self._conn.execute("BEGIN")
        try:
            cursor = self._conn.cursor()
            start = datetime.now()

            def timeout_check():
                if (datetime.now() - start).total_seconds() > QUERY_TIMEOUT:
                    raise sqlite3.OperationalError(f"查询超时（>{QUERY_TIMEOUT}s）")
                return 0
            self._conn.set_progress_handler(timeout_check, 1000)

            cursor.execute(sql_with_limit)
            columns = [d[0] for d in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            truncated = len(rows) > MAX_ROWS
            return columns, rows[:MAX_ROWS] if truncated else rows, truncated
        finally:
            self._conn.rollback()
            self._conn.set_progress_handler(None, 0)

    def _exec_mysql(self, sql: str) -> tuple:
        import pymysql
        # 注入超时 hint（MySQL 8.0+）
        if not re.search(r'/\*\+.*MAX_EXECUTION_TIME', sql, re.IGNORECASE):
            sql_timed = re.sub(
                r'^(\s*SELECT\b)',
                f"SELECT /*+ MAX_EXECUTION_TIME({QUERY_TIMEOUT * 1000}) */",
                sql, count=1, flags=re.IGNORECASE
            )
        else:
            sql_timed = sql

        # 注入 LIMIT
        if not re.search(r'\bLIMIT\b', sql_timed, re.IGNORECASE):
            sql_timed = f"{sql_timed.rstrip(';')} LIMIT {MAX_ROWS + 1}"

        cursor = self._conn.cursor()
        try:
            # 开启只读事务
            cursor.execute("SET SESSION TRANSACTION READ ONLY")
            cursor.execute("START TRANSACTION")
            cursor.execute(sql_timed)
            columns = [d[0] for d in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            truncated = len(rows) > MAX_ROWS
            return columns, rows[:MAX_ROWS] if truncated else rows, truncated
        except pymysql.err.OperationalError as e:
            raise pymysql.err.OperationalError(str(e))
        finally:
            try:
                cursor.execute("ROLLBACK")
                cursor.execute("SET SESSION TRANSACTION READ WRITE")
            except Exception:
                pass
            cursor.close()

    # ── 通用错误类型 ─────────────────────────

    def is_db_error(self, e: Exception) -> bool:
        if self.db_type == "sqlite":
            return isinstance(e, sqlite3.Error)
        else:
            try:
                import pymysql
                return isinstance(e, pymysql.Error)
            except ImportError:
                return False


# ─────────────────────────────────────────────
# 数据结构
# ─────────────────────────────────────────────

@dataclass
class QueryResult:
    success: bool
    sql: str = ""
    columns: list = field(default_factory=list)
    rows: list    = field(default_factory=list)
    row_count: int = 0
    truncated: bool = False
    explanation: str = ""
    warnings: list = field(default_factory=list)
    error: str = ""
    retry_count: int = 0
    duration_ms: float = 0.0

@dataclass
class StaticCheckResult:
    passed: bool
    reason: str = ""

@dataclass
class ExplainResult:
    passed: bool
    reason: str = ""
    full_scan_tables: list = field(default_factory=list)


# ─────────────────────────────────────────────
# 连接工厂
# ─────────────────────────────────────────────

def connect_sqlite(path: str) -> DBConn:
    conn = sqlite3.connect(path)
    return DBConn(conn, "sqlite")

def connect_mysql(host: str = "127.0.0.1", port: int = 3306,
                  user: str = "root", password: str = "",
                  database: str = "") -> DBConn:
    try:
        import pymysql
    except ImportError:
        raise RuntimeError("缺少 pymysql，请运行：pip3 install pymysql")

    conn = pymysql.connect(
        host=host, port=port, user=user, password=password,
        database=database, charset="utf8mb4",
        connect_timeout=10,
        cursorclass=pymysql.cursors.Cursor,
    )
    return DBConn(conn, "mysql", db_name=database)


# ─────────────────────────────────────────────
# LLM 调用（Ollama）
# ─────────────────────────────────────────────

def call_ollama(prompt: str, system: str = "") -> str:
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {"temperature": 0.1, "num_predict": 1024},
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_BASE_URL}/api/generate",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result.get("response", "").strip()
    except urllib.error.URLError as e:
        raise RuntimeError(
            f"无法连接 Ollama（{OLLAMA_BASE_URL}）。\n"
            f"请确认已启动：ollama serve\n原始错误：{e}"
        )


def generate_sql(question: str, schema: str, db_type: str,
                 error_context: str = "") -> tuple:
    dialect = "MySQL" if db_type == "mysql" else "SQLite"
    time_fn = (
        "NOW()/DATE()/DATE_FORMAT()/DATEDIFF() 等 MySQL 函数"
        if db_type == "mysql"
        else "date()/datetime()/strftime() 等 SQLite 函数"
    )

    system = textwrap.dedent(f"""
        你是一个 {dialect} SQL 专家。根据用户的自然语言问题和数据库 Schema，生成正确的 SELECT 查询。

        规则：
        1. 只生成 SELECT 语句，禁止 DROP/DELETE/UPDATE/INSERT/ALTER/CREATE 等写操作
        2. 使用标准 {dialect} 语法，时间相关查询使用 {time_fn}，不要硬编码日期
        3. 表名和字段名用反引号（`）包裹，避免关键字冲突
        4. 如果字段名不确定，优先参考 Schema 中的样本数据推断
        5. 必须按以下 JSON 格式输出，不要有任何额外文字：
           {{"sql": "SELECT ...", "explanation": "这条查询的作用是..."}}
    """).strip()

    error_hint = ""
    if error_context:
        error_hint = f"\n\n上一次生成的 SQL 执行失败，错误信息如下，请修正：\n{error_context}"

    prompt = textwrap.dedent(f"""
        数据库类型：{dialect}
        数据库 Schema：
        {schema}

        用户问题：{question}{error_hint}

        请生成 SQL 查询（JSON 格式）：
    """).strip()

    raw = call_ollama(prompt, system)

    json_match = re.search(r'\{.*?"sql".*?\}', raw, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group())
            return parsed.get("sql", "").strip(), parsed.get("explanation", "").strip()
        except json.JSONDecodeError:
            pass

    sql_match = re.search(r'```sql\s*(.*?)\s*```', raw, re.DOTALL | re.IGNORECASE)
    if sql_match:
        return sql_match.group(1).strip(), ""

    return raw.strip(), ""


# ─────────────────────────────────────────────
# 静态检查
# ─────────────────────────────────────────────

def static_check(sql: str) -> StaticCheckResult:
    sql_upper = sql.upper()

    stripped = re.sub(r'/\*.*?\*/', '', sql, flags=re.DOTALL)
    stripped = re.sub(r'--[^\n]*', '', stripped)
    stripped = stripped.strip()
    if not re.match(r'^SELECT\b', stripped, re.IGNORECASE):
        return StaticCheckResult(False, f"SQL 必须以 SELECT 开头，当前开头为：{stripped[:30]!r}")

    for pattern in DANGEROUS_KEYWORDS:
        if re.search(pattern, sql_upper):
            keyword = re.search(pattern, sql_upper).group()
            return StaticCheckResult(False, f"检测到禁止的操作：{keyword}")

    if re.search(r';\s*\w', sql):
        return StaticCheckResult(False, "检测到多条语句（分号后有内容），禁止执行")

    return StaticCheckResult(True)


# ─────────────────────────────────────────────
# 结果验证
# ─────────────────────────────────────────────

def validate_result(columns: list, rows: list, question: str) -> list:
    warnings = []
    if not rows:
        warnings.append("⚠️  查询返回了 0 行，请确认条件是否过于严格")
        return warnings

    for i, col in enumerate(columns):
        col_lower = col.lower()
        if any(kw in col_lower for kw in ["amount", "price", "count", "total", "num", "金额", "数量", "价格"]):
            values = [row[i] for row in rows if row[i] is not None]
            if values:
                if all(isinstance(v, (int, float)) and v < 0 for v in values):
                    warnings.append(f"⚠️  字段 '{col}' 的所有值均为负数，请确认是否符合预期")
                if all(isinstance(v, (int, float)) and v == 0 for v in values):
                    warnings.append(f"⚠️  字段 '{col}' 的所有值均为 0，请确认是否符合预期")
    return warnings


# ─────────────────────────────────────────────
# 主流程：自动修复循环
# ─────────────────────────────────────────────

def nl2sql(question: str, db: DBConn, tables: Optional[list] = None) -> QueryResult:
    schema = db.get_schema(tables)
    error_context = ""
    retry_count = 0
    t_start = datetime.now()
    last_sql = ""

    for attempt in range(MAX_RETRY + 1):
        print(f"\n{'─'*50}")
        print(f"🤖 正在生成 SQL..." if attempt == 0 else f"🔄 第 {attempt} 次自动修复...")

        try:
            sql, explanation = generate_sql(question, schema, db.db_type, error_context)
        except RuntimeError as e:
            return QueryResult(success=False, error=str(e))

        last_sql = sql
        if not sql:
            error_context = "模型返回了空的 SQL，请重新生成"
            continue

        print(f"📝 生成的 SQL：\n   {sql}")
        if explanation:
            print(f"💬 SQL 含义：{explanation}")

        # 静态检查
        static = static_check(sql)
        if not static.passed:
            error_context = f"静态安全检查失败：{static.reason}"
            print(f"🚫 {error_context}")
            retry_count += 1
            continue

        # EXPLAIN 预检
        explain = db.explain_check(sql)
        if not explain.passed:
            error_context = f"SQL 语法/结构错误：{explain.reason}"
            print(f"❌ {error_context}")
            retry_count += 1
            continue

        warnings = []
        if explain.full_scan_tables:
            w = f"⚠️  以下表将进行全表扫描（无索引），大数据量时可能较慢：{explain.full_scan_tables}"
            warnings.append(w)
            print(f"   {w}")

        # 执行查询
        print(f"⚡ 执行查询...")
        try:
            columns, rows, truncated = db.execute_query(sql)
        except Exception as e:
            error_context = f"执行错误：{e}\nSQL：{sql}"
            print(f"❌ 执行失败：{e}")
            retry_count += 1
            continue

        # 结果验证
        warnings.extend(validate_result(columns, rows, question))
        duration_ms = (datetime.now() - t_start).total_seconds() * 1000

        return QueryResult(
            success=True, sql=sql, columns=columns, rows=rows,
            row_count=len(rows), truncated=truncated,
            explanation=explanation, warnings=warnings,
            retry_count=retry_count, duration_ms=duration_ms,
        )

    duration_ms = (datetime.now() - t_start).total_seconds() * 1000
    return QueryResult(
        success=False, sql=last_sql,
        error=f"经过 {MAX_RETRY} 次尝试仍无法生成可靠的 SQL。最后一次错误：{error_context}",
        retry_count=retry_count, duration_ms=duration_ms,
    )


# ─────────────────────────────────────────────
# 结果展示
# ─────────────────────────────────────────────

def print_result(result: QueryResult):
    print(f"\n{'═'*60}")
    if not result.success:
        print(f"❌ 查询失败\n   {result.error}")
        if result.sql:
            print(f"\n最后生成的 SQL：\n   {result.sql}")
        return

    status = f"✅ 查询成功  |  {result.row_count} 行  |  耗时 {result.duration_ms:.0f}ms"
    if result.retry_count > 0:
        status += f"  |  自动修复 {result.retry_count} 次"
    print(status)
    if result.truncated:
        print(f"⚠️  结果已截断，仅显示前 {MAX_ROWS} 行")
    for w in result.warnings:
        print(f"   {w}")
    if not result.columns:
        print("（无列信息）")
        return

    col_widths = [len(str(c)) for c in result.columns]
    for row in result.rows:
        for i, val in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(val) if val is not None else "NULL"))
    col_widths = [min(w, 30) for w in col_widths]

    def fmt(val, width):
        s = str(val) if val is not None else "NULL"
        return (s[:width-1] + "…" if len(s) > width else s).ljust(width)

    header = "  ".join(fmt(c, col_widths[i]) for i, c in enumerate(result.columns))
    sep    = "  ".join("─" * w for w in col_widths)
    print(f"\n{header}\n{sep}")
    for row in result.rows:
        print("  ".join(fmt(v, col_widths[i]) for i, v in enumerate(row)))
    print(f"\n共 {result.row_count} 行")


# ─────────────────────────────────────────────
# Demo 数据库（SQLite 内存版，供测试用）
# ─────────────────────────────────────────────

def create_demo_db(path: str = ":memory:") -> DBConn:
    conn = sqlite3.connect(path)
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL,
            email TEXT UNIQUE, city TEXT,
            created_at TEXT DEFAULT (date('now'))
        );
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL,
            category TEXT, price REAL NOT NULL, stock INTEGER DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL, total_price REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT (datetime('now'))
        );
        INSERT OR IGNORE INTO users VALUES
            (1,'张三','zhangsan@example.com','北京','2024-01-15'),
            (2,'李四','lisi@example.com','上海','2024-02-20'),
            (3,'王五','wangwu@example.com','北京','2024-03-10'),
            (4,'赵六','zhaoliu@example.com','广州','2024-04-05');
        INSERT OR IGNORE INTO products VALUES
            (1,'iPhone 15','手机',7999.0,50),
            (2,'MacBook Pro','电脑',14999.0,20),
            (3,'AirPods Pro','耳机',1999.0,100),
            (4,'机械键盘','外设',599.0,200),
            (5,'显示器','外设',2499.0,30);
        INSERT OR IGNORE INTO orders VALUES
            (1,1,1,1,7999.0,'completed','2024-11-01 10:00:00'),
            (2,1,3,2,3998.0,'completed','2024-11-15 14:30:00'),
            (3,2,2,1,14999.0,'completed','2024-11-20 09:00:00'),
            (4,3,4,3,1797.0,'pending','2024-12-01 16:00:00'),
            (5,2,5,1,2499.0,'completed','2024-12-10 11:00:00'),
            (6,4,1,2,15998.0,'completed','2024-12-15 13:00:00'),
            (7,1,2,1,14999.0,'cancelled','2025-01-05 10:00:00'),
            (8,3,3,1,1999.0,'completed','2025-01-10 15:00:00');
    """)
    return DBConn(conn, "sqlite")


# ─────────────────────────────────────────────
# CLI 入口
# ─────────────────────────────────────────────

def main():
    global OLLAMA_MODEL, MAX_ROWS

    parser = argparse.ArgumentParser(
        description="nl2sql — 自然语言转 SQL（Ollama + SQLite/MySQL）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""
            示例：
              # 内置 Demo（SQLite 内存库）
              python3 nl2sql.py --demo

              # 连接本地 SQLite 文件
              python3 nl2sql.py --db mydata.db

              # 连接本地 MySQL
              python3 nl2sql.py --mysql --mysql-db shop

              # MySQL 带密码
              python3 nl2sql.py --mysql --mysql-db shop --mysql-user root --mysql-password 123456

              # 单次查询（非交互）
              python3 nl2sql.py --mysql --mysql-db shop --question "销售额最高的商品"
        """)
    )
    # 数据源
    src = parser.add_mutually_exclusive_group()
    src.add_argument("--demo",  action="store_true", help="使用内置 Demo 数据库（SQLite 内存）")
    src.add_argument("--db",    default=None,        help="SQLite 数据库文件路径")
    src.add_argument("--mysql", action="store_true", help="连接本地 MySQL")

    # MySQL 参数
    parser.add_argument("--mysql-host",     default="127.0.0.1", help="MySQL 主机（默认 127.0.0.1）")
    parser.add_argument("--mysql-port",     type=int, default=3306, help="MySQL 端口（默认 3306）")
    parser.add_argument("--mysql-user",     default="root",      help="MySQL 用户名（默认 root）")
    parser.add_argument("--mysql-password", default="",          help="MySQL 密码（默认空）")
    parser.add_argument("--mysql-db",       default="",          help="MySQL 数据库名")

    # 通用参数
    parser.add_argument("--question", default=None, help="直接传入问题（非交互模式）")
    parser.add_argument("--model",    default=OLLAMA_MODEL, help=f"Ollama 模型（默认 {OLLAMA_MODEL}）")
    parser.add_argument("--tables",   default=None, help="限定查询的表（逗号分隔）")
    parser.add_argument("--max-rows", type=int, default=MAX_ROWS, help=f"最大返回行数（默认 {MAX_ROWS}）")
    args = parser.parse_args()

    OLLAMA_MODEL = args.model
    MAX_ROWS     = args.max_rows

    # 建立连接
    if args.demo:
        print("🗄️  使用内置 Demo 数据库（SQLite 内存）")
        db = create_demo_db()
    elif args.db:
        print(f"🗄️  连接 SQLite：{args.db}")
        db = connect_sqlite(args.db)
    elif args.mysql:
        if not args.mysql_db:
            print("❗ 使用 --mysql 时必须指定 --mysql-db <数据库名>")
            return
        print(f"🗄️  连接 MySQL：{args.mysql_user}@{args.mysql_host}:{args.mysql_port}/{args.mysql_db}")
        try:
            db = connect_mysql(
                host=args.mysql_host, port=args.mysql_port,
                user=args.mysql_user, password=args.mysql_password,
                database=args.mysql_db,
            )
            print("✅ MySQL 连接成功")
        except Exception as e:
            print(f"❌ MySQL 连接失败：{e}")
            return
    else:
        print("❗ 请指定数据源：--demo / --db <文件> / --mysql --mysql-db <库名>")
        parser.print_help()
        return

    tables = [t.strip() for t in args.tables.split(",")] if args.tables else None

    print(f"🤖 LLM：Ollama / {OLLAMA_MODEL}")
    print(f"📊 Schema 预览：")
    schema_preview = db.get_schema(tables)
    for line in schema_preview.split("\n")[:15]:
        print(f"   {line}")
    if schema_preview.count("\n") > 15:
        print("   ...")

    if args.question:
        result = nl2sql(args.question, db, tables)
        print_result(result)
        return

    print(f"\n{'═'*60}")
    print("💬 交互模式（输入 'exit' 退出）")

    while True:
        try:
            print()
            question = input("❓ 请输入问题：").strip()
            if not question:
                continue
            if question.lower() in ("exit", "quit", "q", "退出"):
                print("👋 再见！")
                break
            result = nl2sql(question, db, tables)
            print_result(result)
        except KeyboardInterrupt:
            print("\n👋 再见！")
            break
        except Exception as e:
            print(f"❌ 意外错误：{e}")


if __name__ == "__main__":
    main()

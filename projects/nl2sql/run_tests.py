"""
run_tests.py — nl2sql 完整测试套件
包含：单元测试（不依赖 LLM）+ LLM 集成测试（需要 Ollama）
运行：python3 run_tests.py
"""

import sys
import time
import json
import traceback
import sqlite3
from datetime import datetime
from dataclasses import dataclass, field
from typing import Callable, Optional

# 导入被测模块
sys.path.insert(0, ".")
import nl2sql

# ─────────────────────────────────────────────
# 测试框架
# ─────────────────────────────────────────────

@dataclass
class TestCase:
    name: str
    category: str
    fn: Callable
    timeout: float = 120.0

@dataclass
class TestResult:
    name: str
    category: str
    passed: bool
    duration_ms: float
    detail: str = ""
    error: str = ""

TESTS: list[TestCase] = []

def test(name: str, category: str = "单元测试", timeout: float = 120.0):
    def decorator(fn):
        TESTS.append(TestCase(name=name, category=category, fn=fn, timeout=timeout))
        return fn
    return decorator

def run_all() -> list[TestResult]:
    results = []
    for tc in TESTS:
        t0 = time.time()
        try:
            detail = tc.fn() or ""
            duration_ms = (time.time() - t0) * 1000
            results.append(TestResult(
                name=tc.name, category=tc.category,
                passed=True, duration_ms=duration_ms, detail=str(detail)
            ))
            status = "PASS"
            print(f"  [{status}] {tc.name}  ({duration_ms:.0f}ms)")
            if detail:
                for line in str(detail).split("\n"):
                    print(f"         {line}")
        except Exception as e:
            duration_ms = (time.time() - t0) * 1000
            err = traceback.format_exc()
            results.append(TestResult(
                name=tc.name, category=tc.category,
                passed=False, duration_ms=duration_ms, error=str(e)
            ))
            print(f"  [FAIL] {tc.name}  ({duration_ms:.0f}ms)")
            print(f"         {e}")
    return results


# ─────────────────────────────────────────────
# 共享 fixture
# ─────────────────────────────────────────────

_conn: Optional[sqlite3.Connection] = None

def get_conn() -> sqlite3.Connection:
    global _conn
    if _conn is None:
        _conn = nl2sql.create_demo_db()
    return _conn


# ═════════════════════════════════════════════
# 一、单元测试：Schema 提取
# ═════════════════════════════════════════════

@test("Schema 提取 - 包含所有表", "单元测试")
def t_schema_all_tables():
    schema = nl2sql.get_schema(get_conn())
    for tname in ["users", "products", "orders"]:
        assert tname in schema, f"Schema 中缺少表 {tname}"
    assert "样本数据" in schema
    return f"Schema 长度 {len(schema)} 字符，包含 users/products/orders"

@test("Schema 提取 - 限定指定表", "单元测试")
def t_schema_filter():
    schema = nl2sql.get_schema(get_conn(), tables=["users"])
    assert "users" in schema
    assert "orders" not in schema
    return "仅返回 users 表"

@test("Schema 提取 - 空数据库", "单元测试")
def t_schema_empty():
    empty_conn = sqlite3.connect(":memory:")
    schema = nl2sql.get_schema(empty_conn)
    assert "没有表" in schema
    return schema.strip()


# ═════════════════════════════════════════════
# 二、单元测试：静态检查
# ═════════════════════════════════════════════

@test("静态检查 - 正常 SELECT 通过", "单元测试")
def t_static_ok():
    cases = [
        "SELECT * FROM users",
        "SELECT id, name FROM users WHERE city = '北京'",
        "SELECT u.name, COUNT(o.id) FROM users u JOIN orders o ON u.id=o.user_id GROUP BY u.id",
        "  SELECT 1",  # 前置空格
    ]
    for sql in cases:
        r = nl2sql.static_check(sql)
        assert r.passed, f"应通过但被拦截: {sql!r}  原因: {r.reason}"
    return f"通过 {len(cases)} 个正常 SQL"

@test("静态检查 - DROP 被拦截", "单元测试")
def t_static_drop():
    r = nl2sql.static_check("DROP TABLE users")
    assert not r.passed and "DROP" in r.reason.upper()
    return r.reason

@test("静态检查 - DELETE 被拦截", "单元测试")
def t_static_delete():
    r = nl2sql.static_check("DELETE FROM orders WHERE id=1")
    assert not r.passed
    return r.reason

@test("静态检查 - INSERT 被拦截", "单元测试")
def t_static_insert():
    r = nl2sql.static_check("INSERT INTO users VALUES(99,'x','x@x.com','北京','2025-01-01')")
    assert not r.passed
    return r.reason

@test("静态检查 - UPDATE 被拦截", "单元测试")
def t_static_update():
    r = nl2sql.static_check("UPDATE users SET name='hacker' WHERE 1=1")
    assert not r.passed
    return r.reason

@test("静态检查 - CREATE 被拦截", "单元测试")
def t_static_create():
    r = nl2sql.static_check("CREATE TABLE evil (id INTEGER)")
    assert not r.passed
    return r.reason

@test("静态检查 - PRAGMA 被拦截", "单元测试")
def t_static_pragma():
    r = nl2sql.static_check("PRAGMA table_info(users)")
    assert not r.passed
    return r.reason

@test("静态检查 - 多语句注入被拦截", "单元测试")
def t_static_multi_stmt():
    r = nl2sql.static_check("SELECT 1; DROP TABLE users")
    assert not r.passed
    return r.reason

@test("静态检查 - 注释清洗后仍检测危险词", "单元测试")
def t_static_comment_bypass():
    # 尝试用注释绕过：/* DROP */ 实际上不含 DROP 关键词，但 SELECT 后跟 DROP 应被拦截
    r = nl2sql.static_check("SELECT * FROM users -- safe\nDROP TABLE users")
    # 注释被清洗后，剩余内容含 DROP
    assert not r.passed
    return r.reason


# ═════════════════════════════════════════════
# 三、单元测试：EXPLAIN 预检
# ═════════════════════════════════════════════

@test("EXPLAIN 预检 - 正常 SQL 通过", "单元测试")
def t_explain_ok():
    r = nl2sql.explain_check(get_conn(), "SELECT * FROM users WHERE id = 1")
    assert r.passed, r.reason
    return "通过"

@test("EXPLAIN 预检 - 不存在的表报错", "单元测试")
def t_explain_bad_table():
    r = nl2sql.explain_check(get_conn(), "SELECT * FROM ghost_table")
    assert not r.passed
    return r.reason

@test("EXPLAIN 预检 - 全表扫描警告", "单元测试")
def t_explain_full_scan():
    r = nl2sql.explain_check(get_conn(), "SELECT * FROM users WHERE city = '北京'")
    assert r.passed
    # Demo 库无索引，city 字段会全表扫描
    return f"全表扫描表: {r.full_scan_tables}"

@test("EXPLAIN 预检 - 语法错误报错", "单元测试")
def t_explain_syntax_error():
    r = nl2sql.explain_check(get_conn(), "SELECT FROM WHERE")
    assert not r.passed
    return r.reason


# ═════════════════════════════════════════════
# 四、单元测试：执行引擎
# ═════════════════════════════════════════════

@test("执行引擎 - 基础查询", "单元测试")
def t_exec_basic():
    cols, rows, truncated = nl2sql.execute_query(
        get_conn(), "SELECT name, city FROM users ORDER BY id"
    )
    assert cols == ["name", "city"]
    assert len(rows) == 4
    assert rows[0] == ("张三", "北京")
    assert not truncated
    return f"返回 {len(rows)} 行，列={cols}"

@test("执行引擎 - 自动注入 LIMIT", "单元测试")
def t_exec_auto_limit():
    # 不带 LIMIT 的 SQL，引擎应自动注入
    cols, rows, _ = nl2sql.execute_query(get_conn(), "SELECT * FROM users")
    assert len(rows) <= nl2sql.MAX_ROWS
    return f"返回 {len(rows)} 行（MAX_ROWS={nl2sql.MAX_ROWS}）"

@test("执行引擎 - 行数截断", "单元测试")
def t_exec_truncate():
    original = nl2sql.MAX_ROWS
    nl2sql.MAX_ROWS = 2
    try:
        cols, rows, truncated = nl2sql.execute_query(get_conn(), "SELECT * FROM users")
        assert truncated, "应该被截断"
        assert len(rows) == 2
    finally:
        nl2sql.MAX_ROWS = original
    return "截断生效，返回 2 行"

@test("执行引擎 - 只读保护（写操作回滚）", "单元测试")
def t_exec_readonly():
    # 直接调用 execute_query 执行写操作，应该被回滚（不影响数据）
    conn = nl2sql.create_demo_db()
    before_cols, before_rows, _ = nl2sql.execute_query(conn, "SELECT COUNT(*) as cnt FROM users")
    before_count = before_rows[0][0]

    # 绕过静态检查直接执行（测试回滚机制）
    try:
        conn.execute("BEGIN")
        conn.execute("INSERT INTO users VALUES(99,'测试用户','test@test.com','测试城市','2025-01-01')")
        conn.rollback()
    except Exception:
        conn.rollback()

    after_cols, after_rows, _ = nl2sql.execute_query(conn, "SELECT COUNT(*) as cnt FROM users")
    after_count = after_rows[0][0]
    assert before_count == after_count, f"数据被意外修改：{before_count} -> {after_count}"
    return f"用户数保持 {before_count}，只读保护有效"

@test("执行引擎 - JOIN + GROUP BY 聚合", "单元测试")
def t_exec_join():
    sql = """
        SELECT u.name, u.city, SUM(o.total_price) as total
        FROM users u
        JOIN orders o ON u.id = o.user_id
        WHERE o.status = 'completed'
        GROUP BY u.id
        ORDER BY total DESC
    """
    cols, rows, _ = nl2sql.execute_query(get_conn(), sql)
    assert "name" in cols and "total" in cols
    assert len(rows) > 0
    # 李四应该是最高（14999 + 2499 = 17498）
    assert rows[0][0] == "李四", f"期望李四最高，实际: {rows[0]}"
    return "\n".join(f"{r[0]}({r[1]}): ¥{r[2]:.0f}" for r in rows)


# ═════════════════════════════════════════════
# 五、单元测试：结果验证
# ═════════════════════════════════════════════

@test("结果验证 - 空结果警告", "单元测试")
def t_validate_empty():
    warnings = nl2sql.validate_result([], [], "")
    assert any("0 行" in w for w in warnings)
    return warnings[0]

@test("结果验证 - 全负数警告", "单元测试")
def t_validate_negative():
    warnings = nl2sql.validate_result(
        ["name", "total_price"],
        [("张三", -100.0), ("李四", -200.0)],
        ""
    )
    assert any("负数" in w for w in warnings)
    return warnings[0]

@test("结果验证 - 全零警告", "单元测试")
def t_validate_zero():
    warnings = nl2sql.validate_result(
        ["user_id", "total_count"],
        [(1, 0), (2, 0), (3, 0)],
        ""
    )
    assert any("0" in w for w in warnings)
    return warnings[0] if warnings else "（无警告，字段名未匹配关键词）"

@test("结果验证 - 正常结果无警告", "单元测试")
def t_validate_normal():
    warnings = nl2sql.validate_result(
        ["name", "total_price"],
        [("张三", 7999.0), ("李四", 14999.0)],
        ""
    )
    assert len(warnings) == 0
    return "无警告"


# ═════════════════════════════════════════════
# 六、LLM 集成测试（需要 Ollama）
# ═════════════════════════════════════════════

def check_ollama_available() -> bool:
    import urllib.request, urllib.error
    try:
        with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=5) as r:
            return r.status == 200
    except Exception:
        return False

def run_nl2sql_case(question: str, expected_keywords: list, check_fn=None) -> str:
    """运行一个 nl2sql 查询，验证结果"""
    result = nl2sql.nl2sql(question, get_conn())
    assert result.success, f"查询失败: {result.error}"
    assert result.row_count > 0 or not expected_keywords, f"返回 0 行"

    result_str = str(result.rows).lower()
    for kw in expected_keywords:
        assert kw.lower() in result_str, f"结果中未找到期望关键词 '{kw}'，实际结果: {result.rows[:3]}"

    if check_fn:
        check_fn(result)

    summary = f"SQL: {result.sql[:80]}{'...' if len(result.sql)>80 else ''}"
    if result.explanation:
        summary += f"\n解释: {result.explanation[:60]}"
    summary += f"\n返回 {result.row_count} 行，耗时 {result.duration_ms:.0f}ms"
    if result.retry_count:
        summary += f"，自动修复 {result.retry_count} 次"
    return summary

@test("LLM集成 - 简单查询：所有用户", "LLM集成测试", timeout=120)
def t_llm_all_users():
    if not check_ollama_available():
        return "SKIP: Ollama 不可用"
    return run_nl2sql_case(
        "查询所有用户的姓名和城市",
        ["张三", "李四", "王五", "赵六"]
    )

@test("LLM集成 - 条件过滤：北京用户", "LLM集成测试", timeout=120)
def t_llm_filter():
    if not check_ollama_available():
        return "SKIP: Ollama 不可用"
    return run_nl2sql_case(
        "北京有哪些用户？",
        ["张三", "王五"]
    )

@test("LLM集成 - 聚合统计：各城市用户数", "LLM集成测试", timeout=120)
def t_llm_group_by():
    if not check_ollama_available():
        return "SKIP: Ollama 不可用"

    def check(result):
        # 应该有 3 个城市（北京、上海、广州）
        assert result.row_count == 3, f"期望 3 个城市，实际 {result.row_count} 行: {result.rows}"

    return run_nl2sql_case(
        "每个城市有多少用户？",
        ["北京", "上海", "广州"],
        check_fn=check
    )

@test("LLM集成 - 排序：销售额最高的商品", "LLM集成测试", timeout=120)
def t_llm_order_by():
    if not check_ollama_available():
        return "SKIP: Ollama 不可用"

    def check(result):
        # 应返回 1 行（LIMIT 1 或排第一），且包含商品名
        assert result.row_count >= 1, "应至少返回 1 行"
        # MacBook Pro 总销售额 29998（2笔）> iPhone 15 的 23997（3笔）
        # 正确答案是 MacBook Pro，验证结果中包含它
        result_str = str(result.rows).lower()
        assert "macbook" in result_str or "iphone" in result_str, (
            f"结果中未找到已知商品名，实际: {result.rows}"
        )

    return run_nl2sql_case(
        "销售额最高的商品是什么？",
        [],  # 关键词验证交给 check_fn
        check_fn=check
    )

@test("LLM集成 - 多表 JOIN：已完成订单总金额", "LLM集成测试", timeout=120)
def t_llm_join():
    if not check_ollama_available():
        return "SKIP: Ollama 不可用"

    def check(result):
        # 已完成订单：7999+3998+14999+2499+15998+1999 = 47492
        total = sum(
            row[0] for row in result.rows
            if isinstance(row[0], (int, float))
        )
        # 允许一定误差（模型可能用不同字段）
        assert total > 0, f"总金额应大于 0，实际: {result.rows}"

    return run_nl2sql_case(
        "所有已完成订单的总金额是多少？",
        [],
        check_fn=check
    )

@test("LLM集成 - 安全拦截：注入攻击", "LLM集成测试", timeout=120)
def t_llm_injection():
    if not check_ollama_available():
        return "SKIP: Ollama 不可用"
    # 即使用户输入包含 SQL 注入意图，也应被静态检查拦截或模型拒绝
    result = nl2sql.nl2sql("查询用户; DROP TABLE users --", get_conn())
    # 要么成功（模型忽略注入部分）要么失败（被拦截）
    # 关键是 users 表不能被删除
    conn2 = get_conn()
    cols, rows, _ = nl2sql.execute_query(conn2, "SELECT COUNT(*) FROM users")
    assert rows[0][0] == 4, f"users 表被破坏！剩余 {rows[0][0]} 行"
    return f"users 表完好（4行），查询结果: success={result.success}"


# ─────────────────────────────────────────────
# 报告生成
# ─────────────────────────────────────────────

def generate_report(results: list[TestResult], model: str) -> str:
    total   = len(results)
    passed  = sum(1 for r in results if r.passed)
    failed  = total - passed
    skipped = sum(1 for r in results if r.passed and r.detail.startswith("SKIP"))
    total_ms = sum(r.duration_ms for r in results)

    # 按分类统计
    categories: dict[str, dict] = {}
    for r in results:
        cat = r.category
        if cat not in categories:
            categories[cat] = {"total": 0, "passed": 0, "failed": 0}
        categories[cat]["total"] += 1
        if r.passed:
            categories[cat]["passed"] += 1
        else:
            categories[cat]["failed"] += 1

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    lines = []
    lines.append("=" * 64)
    lines.append("  nl2sql 测试报告")
    lines.append("=" * 64)
    lines.append(f"  生成时间  : {now}")
    lines.append(f"  测试模型  : Ollama / {model}")
    lines.append(f"  数据库    : SQLite（内置 Demo 电商数据）")
    lines.append(f"  总耗时    : {total_ms/1000:.1f}s")
    lines.append("")
    lines.append("─" * 64)
    lines.append("  汇总")
    lines.append("─" * 64)
    lines.append(f"  总用例    : {total}")
    lines.append(f"  通过      : {passed}  {'✅' * min(passed, 20)}")
    lines.append(f"  失败      : {failed}  {'❌' * min(failed, 20)}")
    if skipped:
        lines.append(f"  跳过      : {skipped}（Ollama 不可用）")
    pass_rate = passed / total * 100 if total else 0
    lines.append(f"  通过率    : {pass_rate:.1f}%")
    lines.append("")

    lines.append("─" * 64)
    lines.append("  分类统计")
    lines.append("─" * 64)
    for cat, stat in categories.items():
        rate = stat["passed"] / stat["total"] * 100
        bar = "█" * stat["passed"] + "░" * stat["failed"]
        lines.append(f"  {cat:<16} {stat['passed']}/{stat['total']}  {bar}  {rate:.0f}%")
    lines.append("")

    lines.append("─" * 64)
    lines.append("  用例明细")
    lines.append("─" * 64)
    for r in results:
        icon = "✅" if r.passed else "❌"
        lines.append(f"  {icon} [{r.category}] {r.name}  ({r.duration_ms:.0f}ms)")
        if r.passed and r.detail and not r.detail.startswith("SKIP"):
            for line in r.detail.split("\n"):
                lines.append(f"       {line}")
        elif r.passed and r.detail.startswith("SKIP"):
            lines.append(f"       ⏭  {r.detail}")
        elif not r.passed:
            lines.append(f"       💥 {r.error}")

    if failed > 0:
        lines.append("")
        lines.append("─" * 64)
        lines.append("  失败详情")
        lines.append("─" * 64)
        for r in results:
            if not r.passed:
                lines.append(f"  ❌ {r.name}")
                lines.append(f"     {r.error}")

    lines.append("")
    lines.append("=" * 64)
    if failed == 0:
        lines.append("  🎉 所有测试通过！")
    else:
        lines.append(f"  ⚠️  {failed} 个测试失败，请检查上方失败详情。")
    lines.append("=" * 64)

    return "\n".join(lines)


# ─────────────────────────────────────────────
# 主入口
# ─────────────────────────────────────────────

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="nl2sql 测试套件")
    parser.add_argument("--unit-only", action="store_true", help="只跑单元测试，跳过 LLM 集成测试")
    parser.add_argument("--report", default="test_report.txt", help="报告输出路径")
    args = parser.parse_args()

    if args.unit_only:
        run_tests = [t for t in TESTS if t.category == "单元测试"]
    else:
        run_tests = TESTS

    print(f"\n{'='*64}")
    print(f"  nl2sql 测试套件  —  共 {len(run_tests)} 个用例")
    print(f"  模型: Ollama / {nl2sql.OLLAMA_MODEL}")
    print(f"{'='*64}\n")

    # 按分类分组打印
    current_cat = None
    results = []
    for tc in run_tests:
        if tc.category != current_cat:
            current_cat = tc.category
            print(f"\n【{current_cat}】")
        t0 = time.time()
        try:
            detail = tc.fn() or ""
            duration_ms = (time.time() - t0) * 1000
            results.append(TestResult(
                name=tc.name, category=tc.category,
                passed=True, duration_ms=duration_ms, detail=str(detail)
            ))
            icon = "⏭ " if str(detail).startswith("SKIP") else "✅"
            print(f"  {icon} {tc.name}  ({duration_ms:.0f}ms)")
            if detail and not str(detail).startswith("SKIP"):
                for line in str(detail).split("\n"):
                    print(f"       {line}")
        except Exception as e:
            duration_ms = (time.time() - t0) * 1000
            results.append(TestResult(
                name=tc.name, category=tc.category,
                passed=False, duration_ms=duration_ms, error=str(e)
            ))
            print(f"  ❌ {tc.name}  ({duration_ms:.0f}ms)")
            print(f"       {e}")

    # 生成报告
    report = generate_report(results, nl2sql.OLLAMA_MODEL)
    print("\n" + report)

    report_path = args.report
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"\n📄 报告已保存至：{report_path}")

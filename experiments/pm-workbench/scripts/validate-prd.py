#!/usr/bin/env python3
"""
PRD 完整性验证脚本
检查一份 PRD 文档是否满足基本的结构和内容要求。

用法:
    python3 validate-prd.py <prd文件路径>

退出码:
    0 - 全部通过
    1 - 有必须修复的问题
    2 - 有警告但可接受
"""

import sys
import re
from pathlib import Path


def validate_prd(filepath: str) -> tuple[list[str], list[str]]:
    """验证 PRD 文件，返回 (errors, warnings)"""
    errors = []
    warnings = []

    path = Path(filepath)
    if not path.exists():
        errors.append(f"文件不存在: {filepath}")
        return errors, warnings

    # 跳过模板文件
    if "template" in path.name.lower():
        return errors, [f"跳过模板文件: {path.name}"]

    content = path.read_text(encoding="utf-8")

    # === 必须有的章节 ===
    required_sections = [
        ("背景与目标", "## 1. 背景与目标"),
        ("用户与场景", "## 2. 用户与场景"),
        ("功能设计", "## 3. 功能设计"),
        ("验收标准", "## 4. 验收标准"),
    ]

    for name, marker in required_sections:
        if marker not in content:
            errors.append(f"缺少必要章节: {name}")

    # === 必须有量化目标 ===
    if "衡量指标" not in content and "成功指标" not in content and "目标值" not in content:
        errors.append("缺少可量化的成功指标（衡量指标/成功指标/目标值）")

    # === 必须引用用户画像 ===
    persona_refs = re.findall(r"persona-\d+", content)
    if not persona_refs:
        errors.append("未引用任何用户画像（persona-xxx）")

    # === 必须有验收标准条目 ===
    acceptance_items = re.findall(r"- \[[ x]\]", content)
    if len(acceptance_items) < 3:
        warnings.append(f"验收标准条目过少（当前 {len(acceptance_items)} 条，建议至少 3 条）")

    # === 建议有的内容 ===
    if "不做" not in content and "边界" not in content:
        warnings.append("缺少边界说明（做什么/不做什么）")

    if "风险" not in content:
        warnings.append("缺少风险识别章节")

    if "埋点" not in content and "数据" not in content:
        warnings.append("缺少数据埋点方案")

    # === 检查是否有未填写的占位符 ===
    placeholders = re.findall(r"\{[^}]+\}", content)
    template_placeholders = [p for p in placeholders if "YYYY" in p or "待填写" in p or "功能名" in p]
    if template_placeholders:
        warnings.append(f"仍有未填写的模板占位符: {template_placeholders[:3]}")

    return errors, warnings


def main():
    if len(sys.argv) < 2:
        print("用法: python3 validate-prd.py <prd文件路径>")
        print("      python3 validate-prd.py outputs/prds/  (验证目录下所有PRD)")
        sys.exit(1)

    target = Path(sys.argv[1])

    if target.is_dir():
        files = list(target.glob("*.md"))
        if not files:
            print(f"目录中没有找到 .md 文件: {target}")
            sys.exit(0)
    else:
        files = [target]

    total_errors = 0
    total_warnings = 0

    for f in files:
        print(f"\n{'='*60}")
        print(f"📄 验证: {f.name}")
        print(f"{'='*60}")

        errors, warnings = validate_prd(str(f))

        if errors:
            print("\n❌ 错误（必须修复）:")
            for e in errors:
                print(f"   • {e}")
            total_errors += len(errors)

        if warnings:
            print("\n⚠️  警告（建议修复）:")
            for w in warnings:
                print(f"   • {w}")
            total_warnings += len(warnings)

        if not errors and not warnings:
            print("\n✅ 全部通过")

    # 汇总
    print(f"\n{'='*60}")
    print(f"📊 汇总: {len(files)} 个文件 | {total_errors} 个错误 | {total_warnings} 个警告")
    print(f"{'='*60}")

    if total_errors > 0:
        sys.exit(1)
    elif total_warnings > 0:
        sys.exit(2)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()

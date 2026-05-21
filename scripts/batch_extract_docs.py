#!/usr/bin/env python3
"""
Batch extract citadel documents from /tmp/doc_*.txt files.
Reads title from each file and writes to appropriate research/ subdirectory.
"""
import os
import re
import sys
import glob

BASE_DIR = "/Users/wanghong/Projects/日常临时目录"

def extract_content(filepath):
    """Extract markdown content from a citadel log file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract title
    title_match = re.search(r'文档标题：《(.+?)》', content)
    if not title_match:
        title_match = re.search(r'文档标题：(.+)', content)
    title = title_match.group(1).strip() if title_match else None
    
    # Find content after the separator block
    sep = '============================================================\n'
    idx = content.find(sep)
    if idx != -1:
        idx2 = content.find(sep, idx + 1)
        if idx2 != -1:
            idx = idx2 + len(sep)
        else:
            idx = idx + len(sep)
    else:
        # Try alternative: find content after ---\n\n
        idx = content.find('\n---\n\n')
        if idx != -1:
            idx = idx + 6
        else:
            idx = 0
    
    # Find end marker
    end_markers = ['---DONE---', '\nexit_code:']
    end_idx = len(content)
    for marker in end_markers:
        pos = content.find(marker, idx)
        if pos != -1 and pos < end_idx:
            end_idx = pos
    
    md_content = content[idx:end_idx].strip()
    
    # Remove the warning block if present
    warning_start = md_content.find('> ⚠️')
    if warning_start != -1:
        warning_end = md_content.find('\n---\n', warning_start)
        if warning_end != -1:
            md_content = md_content[warning_end + 5:].strip()
    
    return title, md_content


def classify_doc(title, content):
    """Classify document into appropriate research subdirectory."""
    if not title:
        return None, None
    
    title_lower = title.lower()
    content_lower = content[:500].lower() if content else ''
    
    # Classification rules
    if any(kw in title_lower for kw in ['mcp', 'model context protocol']):
        subdir = 'tech-learning-resources'
    elif any(kw in title_lower for kw in ['harness', '驾驭', 'agent提示词']):
        subdir = 'harness-engineering-notes'
    elif any(kw in title_lower for kw in ['context engineering', '上下文工程']):
        subdir = 'harness-engineering-notes'
    elif any(kw in title_lower for kw in ['evals', '评估', 'evaluation']):
        subdir = 'ai-agent-research'
    elif any(kw in title_lower for kw in ['可观测', 'observability', 'llm监控', 'tracing']):
        subdir = 'ai-agent-research'
    elif any(kw in title_lower for kw in ['computer use', 'gui agent', '图形界面']):
        subdir = 'ai-agent-research'
    elif any(kw in title_lower for kw in ['工作流', 'workflow', '自动化']):
        subdir = 'ai-agent-research'
    elif any(kw in title_lower for kw in ['ai coding', 'coding工具', '编程工具', '代码工具', 'cursor', 'copilot']):
        subdir = 'ai-coding'
    elif any(kw in title_lower for kw in ['产品经理', 'pm', '需求', 'prd']):
        subdir = 'ai-pm-practice'
    elif any(kw in title_lower for kw in ['学习资源', '学习资料', '资源整理', '资料精选', '手册']):
        subdir = 'tech-learning-resources'
    elif any(kw in title_lower for kw in ['发版', '发布', '上线', '部署', '流程']):
        subdir = 'ai-coding'
    elif any(kw in title_lower for kw in ['agent', '智能体', '多智能体']):
        subdir = 'ai-agent-research'
    elif any(kw in title_lower for kw in ['提示词', 'prompt']):
        subdir = 'tech-learning-resources'
    elif any(kw in title_lower for kw in ['function calling', 'tool use']):
        subdir = 'tech-learning-resources'
    else:
        subdir = 'research'  # fallback to root research
    
    # Generate filename from title
    # Convert to lowercase, replace spaces and special chars with hyphens
    filename = title.lower()
    filename = re.sub(r'[：:《》【】「」\(\)（）]', '', filename)
    filename = re.sub(r'[\s/\\]+', '-', filename)
    filename = re.sub(r'-+', '-', filename)
    filename = filename.strip('-')
    filename = filename + '.md'
    
    return subdir, filename


def main():
    doc_files = glob.glob('/tmp/doc_*.txt')
    
    results = []
    for filepath in sorted(doc_files):
        doc_id = os.path.basename(filepath).replace('doc_', '').replace('.txt', '')
        
        title, content = extract_content(filepath)
        
        if not content or len(content) < 50:
            results.append(f"SKIP {doc_id}: empty or too short")
            continue
        
        if not title:
            # Try to extract title from content
            h1_match = re.search(r'^# (.+)', content, re.MULTILINE)
            if h1_match:
                title = h1_match.group(1).strip()
        
        if not title:
            results.append(f"SKIP {doc_id}: no title found")
            continue
        
        subdir, filename = classify_doc(title, content)
        
        if subdir == 'research':
            out_dir = os.path.join(BASE_DIR, 'research')
        else:
            out_dir = os.path.join(BASE_DIR, 'research', subdir)
        
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, filename)
        
        # Check if file already exists (skip if already written)
        if os.path.exists(out_path):
            results.append(f"EXISTS {doc_id}: {subdir}/{filename}")
            continue
        
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        results.append(f"WRITTEN {doc_id}: {subdir}/{filename} ({len(content)} chars) | title: {title}")
    
    for r in results:
        print(r)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Extract document content from citadel log file and write to markdown."""
import sys

def main():
    if len(sys.argv) < 3:
        print("Usage: extract_doc.py <log_file> <output_file>")
        sys.exit(1)
    
    log_file = sys.argv[1]
    out_file = sys.argv[2]
    
    with open(log_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the start of actual markdown content (after the warning block)
    # Look for the first heading after the separator line
    sep = '============================================================\n'
    idx = content.find(sep)
    if idx == -1:
        # Try to find content after the header block
        idx = content.find('\n---\n\n')
        if idx != -1:
            idx = idx + 6
    else:
        # Skip the second separator line
        idx2 = content.find(sep, idx + 1)
        if idx2 != -1:
            idx = idx2 + len(sep)
    
    if idx == -1:
        print("ERROR: Could not find content start marker")
        sys.exit(1)
    
    # Find end marker
    end_markers = ['---DONE---', 'exit_code:']
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
    
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"Written {len(md_content)} chars to {out_file}")

if __name__ == '__main__':
    main()

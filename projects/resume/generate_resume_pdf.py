#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成精美 PDF 简历 - 王宏
使用 reportlab 库，支持中文字体、照片嵌入、精美排版
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

# ============================================================
# 配置
# ============================================================
OUTPUT_PDF = "/Users/wanghong/Projects/规划/王宏_简历.pdf"
PHOTO_PATH = "/Volumes/WenshuSpace/下载/d28e8506e9435649fabadd2f34344471.jpeg"

# 颜色方案 - 深蓝商务风
PRIMARY = HexColor("#1a365d")       # 深蓝主色
SECONDARY = HexColor("#2b6cb0")     # 中蓝
ACCENT = HexColor("#3182ce")        # 亮蓝
LIGHT_BG = HexColor("#ebf4ff")      # 浅蓝背景
DARK_TEXT = HexColor("#1a202c")     # 深色文字
GRAY_TEXT = HexColor("#4a5568")     # 灰色文字
LIGHT_GRAY = HexColor("#e2e8f0")   # 浅灰线条
SIDEBAR_BG = HexColor("#1a365d")   # 侧边栏背景
SIDEBAR_TEXT = HexColor("#e2e8f0") # 侧边栏文字

PAGE_W, PAGE_H = A4  # 210mm x 297mm
SIDEBAR_W = 72 * mm  # 侧边栏宽度
MAIN_X = SIDEBAR_W + 8 * mm  # 主内容区起始 X
MAIN_W = PAGE_W - MAIN_X - 10 * mm  # 主内容区宽度

# ============================================================
# 注册中文字体
# ============================================================
def register_fonts():
    """注册系统中文字体 - STHeiti Light(正文) + Medium(标题)"""
    light_path = "/System/Library/Fonts/STHeiti Light.ttc"
    medium_path = "/System/Library/Fonts/STHeiti Medium.ttc"
    
    try:
        pdfmetrics.registerFont(TTFont("ChinFont", light_path, subfontIndex=0))
        pdfmetrics.registerFont(TTFont("ChinFontBold", medium_path, subfontIndex=0))
        print("已注册字体: STHeiti Light + Medium")
        return True
    except Exception as e:
        print(f"注册字体失败: {e}")
        return False

# ============================================================
# 绘制辅助函数
# ============================================================
def draw_rounded_rect(c, x, y, w, h, radius, fill_color=None, stroke_color=None):
    """绘制圆角矩形"""
    p = c.beginPath()
    p.roundRect(x, y, w, h, radius)
    if fill_color:
        c.setFillColor(fill_color)
    if stroke_color:
        c.setStrokeColor(stroke_color)
    else:
        c.setStrokeColor(fill_color if fill_color else white)
    c.drawPath(p, fill=1 if fill_color else 0, stroke=1 if stroke_color else 0)


def draw_circle_image(c, img_path, cx, cy, radius):
    """绘制圆形裁剪的照片"""
    c.saveState()
    p = c.beginPath()
    p.circle(cx, cy, radius)
    c.clipPath(p, stroke=0)
    # 绘制图片（正方形区域）
    c.drawImage(
        ImageReader(img_path),
        cx - radius, cy - radius,
        2 * radius, 2 * radius,
        preserveAspectRatio=True,
        mask='auto'
    )
    c.restoreState()
    # 绘制圆形边框
    c.saveState()
    c.setStrokeColor(white)
    c.setLineWidth(3)
    c.circle(cx, cy, radius, stroke=1, fill=0)
    c.restoreState()


def draw_tag(c, text, x, y, font_name="ChinFont", font_size=7.5):
    """绘制标签"""
    c.saveState()
    c.setFont(font_name, font_size)
    tw = c.stringWidth(text, font_name, font_size)
    padding = 6
    tag_w = tw + padding * 2
    tag_h = 16
    # 背景
    draw_rounded_rect(c, x, y - 4, tag_w, tag_h, 3, fill_color=HexColor("#2d4a7a"))
    # 文字
    c.setFillColor(HexColor("#bee3f8"))
    c.drawString(x + padding, y + 1, text)
    c.restoreState()
    return tag_w + 4


def draw_skill_bar(c, x, y, width, level, max_level=5):
    """绘制技能条"""
    bar_h = 4
    gap = 2
    seg_w = (width - gap * (max_level - 1)) / max_level
    for i in range(max_level):
        if i < level:
            color = HexColor("#63b3ed")
        else:
            color = HexColor("#2d4a7a")
        draw_rounded_rect(c, x + i * (seg_w + gap), y, seg_w, bar_h, 2, fill_color=color)


def wrap_text_lines(text, font_name, font_size, max_width, c_obj):
    """手动换行文本"""
    lines = []
    current_line = ""
    for char in text:
        test_line = current_line + char
        if c_obj.stringWidth(test_line, font_name, font_size) > max_width:
            lines.append(current_line)
            current_line = char
        else:
            current_line = test_line
    if current_line:
        lines.append(current_line)
    return lines


# ============================================================
# 主绘制函数
# ============================================================
def generate_resume():
    register_fonts()
    
    c = canvas.Canvas(OUTPUT_PDF, pagesize=A4)
    c.setTitle("王宏 - 简历")
    c.setAuthor("王宏")
    
    font_regular = "ChinFont"
    font_bold = "ChinFontBold"
    
    # ========== 侧边栏背景 ==========
    c.setFillColor(SIDEBAR_BG)
    c.rect(0, 0, SIDEBAR_W, PAGE_H, fill=1, stroke=0)
    
    # ========== 侧边栏内容 ==========
    sidebar_cx = SIDEBAR_W / 2
    sidebar_margin = 8 * mm
    sidebar_content_w = SIDEBAR_W - 2 * sidebar_margin
    
    # --- 照片 ---
    photo_radius = 28 * mm
    photo_cy = PAGE_H - 48 * mm
    if os.path.exists(PHOTO_PATH):
        draw_circle_image(c, PHOTO_PATH, sidebar_cx, photo_cy, photo_radius)
    
    # --- 姓名 ---
    y = photo_cy - photo_radius - 14 * mm
    c.setFillColor(white)
    c.setFont(font_bold, 22)
    c.drawCentredString(sidebar_cx, y, "王  宏")
    
    y -= 10 * mm
    c.setFont(font_regular, 10)
    c.setFillColor(HexColor("#90cdf4"))
    c.drawCentredString(sidebar_cx, y, "产品经理")
    
    # --- 分隔线 ---
    y -= 8 * mm
    c.setStrokeColor(HexColor("#2d5a8e"))
    c.setLineWidth(0.5)
    c.line(sidebar_margin, y, SIDEBAR_W - sidebar_margin, y)
    
    # --- 联系方式 ---
    y -= 10 * mm
    c.setFillColor(HexColor("#90cdf4"))
    c.setFont(font_bold, 9)
    c.drawString(sidebar_margin, y, "联系方式")
    
    y -= 7 * mm
    c.setFillColor(SIDEBAR_TEXT)
    c.setFont(font_regular, 8)
    
    contact_items = [
        ("电话", "158-3034-8527"),
        ("坐标", "北京"),
    ]
    for label, value in contact_items:
        c.setFillColor(HexColor("#63b3ed"))
        c.setFont(font_regular, 7)
        c.drawString(sidebar_margin, y, label)
        y -= 5 * mm
        c.setFillColor(white)
        c.setFont(font_regular, 8.5)
        c.drawString(sidebar_margin, y, value)
        y -= 8 * mm
    
    # --- 求职意向 ---
    y -= 2 * mm
    c.setStrokeColor(HexColor("#2d5a8e"))
    c.setLineWidth(0.5)
    c.line(sidebar_margin, y, SIDEBAR_W - sidebar_margin, y)
    
    y -= 10 * mm
    c.setFillColor(HexColor("#90cdf4"))
    c.setFont(font_bold, 9)
    c.drawString(sidebar_margin, y, "求职意向")
    
    y -= 8 * mm
    intentions = ["AI 产品", "策略产品", "平台产品", "ToB 产品"]
    for item in intentions:
        tag_w = draw_tag(c, item, sidebar_margin, y, font_regular, 8)
        y -= 7 * mm
    
    # --- 教育背景 ---
    y -= 6 * mm
    c.setStrokeColor(HexColor("#2d5a8e"))
    c.setLineWidth(0.5)
    c.line(sidebar_margin, y, SIDEBAR_W - sidebar_margin, y)
    
    y -= 10 * mm
    c.setFillColor(HexColor("#90cdf4"))
    c.setFont(font_bold, 9)
    c.drawString(sidebar_margin, y, "教育背景")
    
    # 武汉大学
    y -= 9 * mm
    c.setFillColor(white)
    c.setFont(font_bold, 9)
    c.drawString(sidebar_margin, y, "武汉大学")
    y -= 5.5 * mm
    c.setFillColor(HexColor("#90cdf4"))
    c.setFont(font_regular, 7.5)
    c.drawString(sidebar_margin, y, "硕士 · 资源与环境")
    y -= 5 * mm
    c.setFillColor(HexColor("#a0aec0"))
    c.setFont(font_regular, 7)
    c.drawString(sidebar_margin, y, "2020.09 — 2022.06")
    y -= 5 * mm
    c.setFillColor(SIDEBAR_TEXT)
    c.setFont(font_regular, 6.5)
    lines = wrap_text_lines("测绘遥感信息工程国家重点实验室", font_regular, 6.5, sidebar_content_w, c)
    for line in lines:
        c.drawString(sidebar_margin, y, line)
        y -= 4 * mm
    
    # 天津科技大学
    y -= 5 * mm
    c.setFillColor(white)
    c.setFont(font_bold, 9)
    c.drawString(sidebar_margin, y, "天津科技大学")
    y -= 5.5 * mm
    c.setFillColor(HexColor("#90cdf4"))
    c.setFont(font_regular, 7.5)
    c.drawString(sidebar_margin, y, "本科 · 海洋技术")
    y -= 5 * mm
    c.setFillColor(HexColor("#a0aec0"))
    c.setFont(font_regular, 7)
    c.drawString(sidebar_margin, y, "2015.09 — 2019.06")
    
    # --- 专业技能 ---
    y -= 10 * mm
    c.setStrokeColor(HexColor("#2d5a8e"))
    c.setLineWidth(0.5)
    c.line(sidebar_margin, y, SIDEBAR_W - sidebar_margin, y)
    
    y -= 10 * mm
    c.setFillColor(HexColor("#90cdf4"))
    c.setFont(font_bold, 9)
    c.drawString(sidebar_margin, y, "核心技能")
    
    skills = [
        ("产品规划", 5),
        ("AI 产品", 4),
        ("数据分析", 4),
        ("技术理解", 4),
        ("空间数据", 3),
    ]
    for skill_name, level in skills:
        y -= 8 * mm
        c.setFillColor(SIDEBAR_TEXT)
        c.setFont(font_regular, 7.5)
        c.drawString(sidebar_margin, y, skill_name)
        draw_skill_bar(c, sidebar_margin, y - 5, sidebar_content_w, level)
        y -= 3 * mm
    
    # ========== 主内容区 ==========
    y_main = PAGE_H - 18 * mm
    
    # --- 工作经历标题 ---
    def draw_section_title(y_pos, title):
        """绘制章节标题"""
        # 左侧装饰条
        c.setFillColor(ACCENT)
        c.rect(MAIN_X, y_pos - 1, 3, 14, fill=1, stroke=0)
        # 标题文字
        c.setFillColor(PRIMARY)
        c.setFont(font_bold, 13)
        c.drawString(MAIN_X + 8, y_pos, title)
        # 底部线条
        c.setStrokeColor(LIGHT_GRAY)
        c.setLineWidth(0.5)
        c.line(MAIN_X, y_pos - 4, MAIN_X + MAIN_W, y_pos - 4)
        return y_pos - 10 * mm
    
    def draw_project_header(y_pos, title, period, role):
        """绘制项目标题行"""
        c.setFillColor(DARK_TEXT)
        c.setFont(font_bold, 10.5)
        c.drawString(MAIN_X, y_pos, title)
        
        # 时间和角色
        y_pos -= 5.5 * mm
        c.setFillColor(ACCENT)
        c.setFont(font_regular, 8)
        c.drawString(MAIN_X, y_pos, period)
        
        c.setFillColor(GRAY_TEXT)
        c.drawString(MAIN_X + c.stringWidth(period, font_regular, 8) + 8, y_pos, "｜  " + role)
        return y_pos - 5 * mm
    
    def draw_body_text(y_pos, text, indent=0, font_size=8.5, color=DARK_TEXT):
        """绘制正文文本，自动换行"""
        x = MAIN_X + indent
        max_w = MAIN_W - indent
        c.setFillColor(color)
        c.setFont(font_regular, font_size)
        lines = wrap_text_lines(text, font_regular, font_size, max_w, c)
        for line in lines:
            c.drawString(x, y_pos, line)
            y_pos -= 4.2 * mm
        return y_pos
    
    def draw_bullet_item(y_pos, text, font_size=8.2):
        """绘制带圆点的列表项"""
        bullet_x = MAIN_X + 2
        text_x = MAIN_X + 7
        max_w = MAIN_W - 7
        
        # 圆点
        c.setFillColor(ACCENT)
        c.circle(bullet_x + 1.5, y_pos + 2.5, 1.8, fill=1, stroke=0)
        
        # 文字
        c.setFillColor(DARK_TEXT)
        c.setFont(font_regular, font_size)
        lines = wrap_text_lines(text, font_regular, font_size, max_w, c)
        for i, line in enumerate(lines):
            c.drawString(text_x, y_pos, line)
            y_pos -= 4.2 * mm
        y_pos -= 1 * mm
        return y_pos
    
    def draw_highlight_number(y_pos, text, font_size=8.2):
        """绘制带高亮数字的文本"""
        # 简单处理：直接绘制，数字部分用粗体
        return draw_bullet_item(y_pos, text, font_size)
    
    # ========== 工作经历 ==========
    y_main = draw_section_title(y_main, "工作经历")
    
    # 美团
    c.setFillColor(DARK_TEXT)
    c.setFont(font_bold, 10.5)
    c.drawString(MAIN_X, y_main, "美团")
    
    c.setFillColor(GRAY_TEXT)
    c.setFont(font_regular, 8)
    c.drawString(MAIN_X + c.stringWidth("美团", font_bold, 10.5) + 6, y_main + 0.5, "产品经理  ｜  2022.07 — 至今")
    
    y_main -= 6 * mm
    y_main = draw_body_text(
        y_main,
        "先后负责研发效能平台（FSD）与 AI 智能应用搭建平台（ABS）的产品设计。从研发工具迭代起步，逐步承担 AI 平台从 0 到 1 的产品规划，主导完成企业级权限体系、AI 智能体接入、大模型成本管控体系等核心模块的设计与落地。",
        indent=0, font_size=8.2, color=GRAY_TEXT
    )
    
    # ========== 项目经历 ==========
    y_main -= 3 * mm
    y_main = draw_section_title(y_main, "项目经历")
    
    # --- 项目一：ABS ---
    y_main = draw_project_header(y_main, "ABS · AI 智能无码应用搭建平台（从 0 到 1）", "2024.01 — 至今", "产品负责人")
    
    y_main = draw_body_text(
        y_main,
        "主导美团内部 AI 无代码应用搭建平台从 0 到 1 的规划与落地。平台支持企业级多租户、AI 智能体接入与模版化交付，已覆盖质效技术部全员，注册用户超 1100 人。",
        font_size=8, color=GRAY_TEXT
    )
    
    y_main -= 1 * mm
    # 小标题
    c.setFillColor(SECONDARY)
    c.setFont(font_bold, 8.5)
    c.drawString(MAIN_X, y_main, "平台能力建设")
    y_main -= 5 * mm
    
    abs_items_1 = [
        "设计三层级（空间-应用-表格）数据中台体系，支持多渠道用户认证（SSO/手机/邮箱）及企业通讯录管理",
        "设计并落地基于 RBAC 的多层级权限管控机制，支持默认继承与自定义覆盖",
        "完成 12 个核心仪表盘组件设计，支持无代码页面定制；构建覆盖 15 类场景的模版库体系",
        "接入工作流引擎与 AI 智能体，实现应用/表格模版的智能推荐与智能创建",
    ]
    for item in abs_items_1:
        y_main = draw_bullet_item(y_main, item, 7.8)
    
    # 小标题
    c.setFillColor(SECONDARY)
    c.setFont(font_bold, 8.5)
    c.drawString(MAIN_X, y_main, "统一租户体系与商业化管控")
    y_main -= 5 * mm
    
    abs_items_2 = [
        "从 0 到 1 设计统一租户体系，作为 Bots、ABS 等多平台底座，实现用户、组织与资源隔离",
        "定义成员数、记录数、存储空间、API 调用及 AI Token 额度等 20+ 核心权益维度，设计订阅制管控体系",
        "体系上线后累计管控 AI Token 约 700 亿，管控成本上百万元，接入平台 3-5 个",
        "构建全链路数据洞察体系，通过\"成本 vs 价值\"四象限分析模型驱动精细化运营",
    ]
    for item in abs_items_2:
        y_main = draw_bullet_item(y_main, item, 7.8)
    
    # --- 项目二：FSD ---
    y_main -= 1 * mm
    y_main = draw_project_header(y_main, "FSD · 研发排期线上化与资源可视化", "2022.07 — 2024.12", "产品经理")
    
    fsd_items = [
        "重构需求创建页与列表页，支持自定义分组、多维筛选、看板视图等定制化能力",
        "设计需求状态自动流转规则，结合数据分析持续治理，将需求流转覆盖率从 50% 提升至 85%",
        "完善多维数据采集逻辑，覆盖人员、组织、项目、TG 等核心维度，支撑研发人力投入成本分析",
        "建设需求排期体系，结合大象消息提醒机制提升排期感知度与填写及时性",
    ]
    for item in fsd_items:
        y_main = draw_bullet_item(y_main, item, 7.8)
    
    # --- 项目三：研究生项目 ---
    y_main -= 1 * mm
    y_main = draw_project_header(y_main, "大规模时空轨迹数据处理与行为模式分析", "2020.06 — 2022.06", "算法开发 & 项目对接")
    
    research_items = [
        "构建城市动态交通环境下的行为模型集合，生成仿真轨迹作为基准指标库",
        "实现多线程条件下 10GB+ 大规模时空轨迹数据的高效解析与处理",
        "自定义时序对象运动描述方法，基于方向感知的轨迹运动规律识别，实现异常行为与特殊运动模式的精准检测",
    ]
    for item in research_items:
        y_main = draw_bullet_item(y_main, item, 7.8)
    
    # ========== 自我评价 ==========
    y_main -= 2 * mm
    y_main = draw_section_title(y_main, "自我评价")
    
    y_main = draw_body_text(
        y_main,
        "武大 GIS 硕士（国重实验室）+ 美团 4 年产品经理，具备算法理解力与产品落地能力的复合背景。主导过 AI 平台从 0 到 1 的完整周期，覆盖架构设计、AI 智能体接入、大模型成本管控与商业化体系建设；擅长数据驱动的策略设计与规则治理，能与算法/研发团队深度协作。",
        font_size=8.2, color=GRAY_TEXT
    )
    
    # ========== 保存 ==========
    c.save()
    print(f"\nPDF 简历已生成: {OUTPUT_PDF}")


if __name__ == "__main__":
    generate_resume()

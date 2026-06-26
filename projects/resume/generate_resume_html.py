#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成精美 HTML 简历 - 王宏
照片以 base64 嵌入，HTML 文件可独立使用
"""

import base64
import os

PHOTO_PATH = "/Volumes/WenshuSpace/下载/d28e8506e9435649fabadd2f34344471.jpeg"
OUTPUT_HTML = "/Users/wanghong/Projects/规划/王宏_简历.html"

# 读取照片并转为 base64
def get_photo_base64():
    if os.path.exists(PHOTO_PATH):
        with open(PHOTO_PATH, "rb") as f:
            return base64.b64encode(f.read()).decode()
    return ""

photo_b64 = get_photo_base64()

html_content = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>王宏 - 简历</title>
    <style>
        /* ============================================================
           CSS Reset & Base
           ============================================================ */
        *, *::before, *::after {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        @page {{
            size: A4;
            margin: 0;
        }}

        html {{
            font-size: 14px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}

        body {{
            font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
            color: #1a202c;
            background: #f0f4f8;
            line-height: 1.6;
        }}

        /* ============================================================
           Page Container
           ============================================================ */
        .resume-page {{
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            background: #fff;
            display: grid;
            grid-template-columns: 220px 1fr;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
            overflow: hidden;
        }}

        @media print {{
            body {{
                background: #fff;
            }}
            .resume-page {{
                margin: 0;
                box-shadow: none;
                width: 100%;
                min-height: 100vh;
            }}
        }}

        /* ============================================================
           Sidebar
           ============================================================ */
        .sidebar {{
            background: linear-gradient(180deg, #1a365d 0%, #1e3a5f 40%, #1a365d 100%);
            color: #e2e8f0;
            padding: 32px 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 0;
        }}

        /* Photo */
        .photo-wrapper {{
            text-align: center;
            margin-bottom: 20px;
        }}

        .photo {{
            width: 140px;
            height: 140px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid rgba(255,255,255,0.25);
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }}

        /* Name & Title */
        .name {{
            text-align: center;
            font-size: 1.65rem;
            font-weight: 700;
            color: #fff;
            letter-spacing: 6px;
            margin-bottom: 4px;
        }}

        .title {{
            text-align: center;
            font-size: 0.82rem;
            color: #90cdf4;
            letter-spacing: 2px;
            margin-bottom: 18px;
        }}

        /* Sidebar Sections */
        .sidebar-divider {{
            height: 1px;
            background: rgba(255,255,255,0.12);
            margin: 14px 0;
        }}

        .sidebar-section-title {{
            font-size: 0.72rem;
            font-weight: 600;
            color: #90cdf4;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }}

        /* Contact */
        .contact-item {{
            margin-bottom: 10px;
        }}

        .contact-label {{
            font-size: 0.65rem;
            color: #63b3ed;
            margin-bottom: 1px;
        }}

        .contact-value {{
            font-size: 0.78rem;
            color: #fff;
            font-weight: 500;
        }}

        /* Intention Tags */
        .tag-list {{
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }}

        .tag {{
            display: inline-block;
            padding: 3px 10px;
            background: rgba(45, 74, 122, 0.8);
            border-radius: 4px;
            font-size: 0.7rem;
            color: #bee3f8;
            border: 1px solid rgba(99, 179, 237, 0.2);
        }}

        /* Education */
        .edu-item {{
            margin-bottom: 12px;
        }}

        .edu-school {{
            font-size: 0.82rem;
            font-weight: 600;
            color: #fff;
        }}

        .edu-degree {{
            font-size: 0.7rem;
            color: #90cdf4;
            margin-top: 1px;
        }}

        .edu-period {{
            font-size: 0.65rem;
            color: #a0aec0;
            margin-top: 1px;
        }}

        .edu-detail {{
            font-size: 0.62rem;
            color: #cbd5e0;
            margin-top: 2px;
            line-height: 1.4;
        }}

        /* Skills */
        .skill-item {{
            margin-bottom: 10px;
        }}

        .skill-name {{
            font-size: 0.72rem;
            color: #e2e8f0;
            margin-bottom: 4px;
        }}

        .skill-bar {{
            display: flex;
            gap: 3px;
        }}

        .skill-seg {{
            flex: 1;
            height: 4px;
            border-radius: 2px;
            background: rgba(45, 74, 122, 0.8);
        }}

        .skill-seg.active {{
            background: #63b3ed;
        }}

        /* ============================================================
           Main Content
           ============================================================ */
        .main-content {{
            padding: 28px 28px 24px 24px;
        }}

        /* Section Title */
        .section-title {{
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 14px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e2e8f0;
        }}

        .section-title::before {{
            content: "";
            display: block;
            width: 3.5px;
            height: 18px;
            background: #3182ce;
            border-radius: 2px;
            flex-shrink: 0;
        }}

        .section-title h2 {{
            font-size: 1.02rem;
            font-weight: 700;
            color: #1a365d;
            letter-spacing: 1px;
        }}

        /* Work Experience Header */
        .work-header {{
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin-bottom: 6px;
        }}

        .work-company {{
            font-size: 0.92rem;
            font-weight: 700;
            color: #1a202c;
        }}

        .work-meta {{
            font-size: 0.72rem;
            color: #718096;
        }}

        .work-desc {{
            font-size: 0.76rem;
            color: #4a5568;
            line-height: 1.65;
            margin-bottom: 16px;
        }}

        /* Project */
        .project {{
            margin-bottom: 16px;
        }}

        .project-title {{
            font-size: 0.88rem;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 3px;
        }}

        .project-meta {{
            font-size: 0.7rem;
            color: #3182ce;
            margin-bottom: 6px;
        }}

        .project-meta span {{
            color: #718096;
        }}

        .project-intro {{
            font-size: 0.74rem;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 8px;
        }}

        .project-subtitle {{
            font-size: 0.78rem;
            font-weight: 600;
            color: #2b6cb0;
            margin-bottom: 6px;
            margin-top: 8px;
        }}

        /* Bullet List */
        .bullet-list {{
            list-style: none;
            padding: 0;
        }}

        .bullet-list li {{
            position: relative;
            padding-left: 14px;
            font-size: 0.73rem;
            color: #2d3748;
            line-height: 1.6;
            margin-bottom: 5px;
        }}

        .bullet-list li::before {{
            content: "";
            position: absolute;
            left: 0;
            top: 7px;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #3182ce;
        }}

        .bullet-list li strong {{
            color: #1a365d;
            font-weight: 600;
        }}

        /* Highlight numbers */
        .highlight {{
            color: #2b6cb0;
            font-weight: 700;
        }}

        /* Self Evaluation */
        .self-eval {{
            font-size: 0.76rem;
            color: #4a5568;
            line-height: 1.7;
        }}

        /* ============================================================
           Responsive for screen
           ============================================================ */
        @media screen and (max-width: 800px) {{
            .resume-page {{
                grid-template-columns: 1fr;
                width: 100%;
                min-height: auto;
            }}
            .sidebar {{
                padding: 24px 20px;
            }}
            .main-content {{
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="resume-page">
        <!-- ==================== Sidebar ==================== -->
        <aside class="sidebar">
            <!-- Photo -->
            <div class="photo-wrapper">
                <img class="photo" src="data:image/jpeg;base64,{photo_b64}" alt="王宏照片">
            </div>

            <!-- Name -->
            <div class="name">王 宏</div>
            <div class="title">产品经理</div>

            <div class="sidebar-divider"></div>

            <!-- Contact -->
            <div class="sidebar-section-title">联系方式</div>
            <div class="contact-item">
                <div class="contact-label">电话</div>
                <div class="contact-value">158-3034-8527</div>
            </div>
            <div class="contact-item">
                <div class="contact-label">坐标</div>
                <div class="contact-value">北京</div>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Intention -->
            <div class="sidebar-section-title">求职意向</div>
            <div class="tag-list">
                <span class="tag">AI 产品</span>
                <span class="tag">策略产品</span>
                <span class="tag">平台产品</span>
                <span class="tag">ToB 产品</span>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Education -->
            <div class="sidebar-section-title">教育背景</div>
            <div class="edu-item">
                <div class="edu-school">武汉大学</div>
                <div class="edu-degree">硕士 · 资源与环境（测绘工程）</div>
                <div class="edu-period">2020.09 — 2022.06</div>
                <div class="edu-detail">测绘遥感信息工程国家重点实验室</div>
            </div>
            <div class="edu-item">
                <div class="edu-school">天津科技大学</div>
                <div class="edu-degree">本科 · 海洋技术</div>
                <div class="edu-period">2015.09 — 2019.06</div>
            </div>

            <div class="sidebar-divider"></div>

            <!-- Skills -->
            <div class="sidebar-section-title">核心技能</div>
            <div class="skill-item">
                <div class="skill-name">产品规划</div>
                <div class="skill-bar">
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                </div>
            </div>
            <div class="skill-item">
                <div class="skill-name">AI 产品</div>
                <div class="skill-bar">
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg"></div>
                </div>
            </div>
            <div class="skill-item">
                <div class="skill-name">数据分析</div>
                <div class="skill-bar">
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg"></div>
                </div>
            </div>
            <div class="skill-item">
                <div class="skill-name">技术理解</div>
                <div class="skill-bar">
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg"></div>
                </div>
            </div>
            <div class="skill-item">
                <div class="skill-name">空间数据</div>
                <div class="skill-bar">
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg active"></div>
                    <div class="skill-seg"></div>
                    <div class="skill-seg"></div>
                </div>
            </div>
        </aside>

        <!-- ==================== Main Content ==================== -->
        <main class="main-content">
            <!-- Work Experience -->
            <div class="section-title"><h2>工作经历</h2></div>
            <div class="work-header">
                <span class="work-company">美团</span>
                <span class="work-meta">产品经理 ｜ 2022.07 — 至今</span>
            </div>
            <p class="work-desc">
                先后负责研发效能平台（FSD）与 AI 智能应用搭建平台（ABS）的产品设计。从研发工具迭代起步，逐步承担 AI 平台从 0 到 1 的产品规划，主导完成企业级权限体系、AI 智能体接入、大模型成本管控体系等核心模块的设计与落地。
            </p>

            <!-- Projects -->
            <div class="section-title"><h2>项目经历</h2></div>

            <!-- Project 1: ABS -->
            <div class="project">
                <div class="project-title">ABS · AI 智能无码应用搭建平台（从 0 到 1）</div>
                <div class="project-meta">2024.01 — 至今 <span>｜ 产品负责人</span></div>
                <p class="project-intro">
                    主导美团内部 AI 无代码应用搭建平台从 0 到 1 的规划与落地。平台支持企业级多租户、AI 智能体接入与模版化交付，已覆盖质效技术部全员，注册用户超 <strong class="highlight">1100 人</strong>。
                </p>

                <div class="project-subtitle">平台能力建设</div>
                <ul class="bullet-list">
                    <li>设计三层级（空间-应用-表格）数据中台体系，支持多渠道用户认证（SSO/手机/邮箱）及企业通讯录管理</li>
                    <li>设计并落地基于 RBAC 的多层级权限管控机制，支持默认继承与自定义覆盖</li>
                    <li>完成 <strong class="highlight">12</strong> 个核心仪表盘组件设计，支持无代码页面定制；构建覆盖 <strong class="highlight">15</strong> 类场景的模版库体系</li>
                    <li>接入工作流引擎与 AI 智能体，实现应用/表格模版的智能推荐与智能创建，推动部门级 AI 工具规模化落地</li>
                </ul>

                <div class="project-subtitle">统一租户体系与商业化管控</div>
                <ul class="bullet-list">
                    <li>从 0 到 1 设计统一租户体系，作为 Bots、ABS 等多平台底座，实现用户、组织与资源隔离</li>
                    <li>定义成员数、记录数、存储空间、API 调用及 AI Token 额度等 <strong class="highlight">20+</strong> 核心权益维度，设计订阅制管控体系</li>
                    <li>体系上线后累计管控 AI Token 约 <strong class="highlight">700 亿</strong>，管控成本<strong class="highlight">上百万元</strong>，接入平台 3—5 个</li>
                    <li>构建全链路数据洞察体系，通过"成本 vs 价值"四象限分析模型驱动精细化运营</li>
                </ul>
            </div>

            <!-- Project 2: FSD -->
            <div class="project">
                <div class="project-title">FSD · 研发排期线上化与资源可视化</div>
                <div class="project-meta">2022.07 — 2024.12 <span>｜ 产品经理</span></div>
                <ul class="bullet-list">
                    <li>重构需求创建页与列表页，支持自定义分组、多维筛选、看板视图等定制化能力</li>
                    <li>设计需求状态自动流转规则，结合数据分析持续治理，将需求流转覆盖率从 <strong class="highlight">50%</strong> 提升至 <strong class="highlight">85%</strong></li>
                    <li>完善多维数据采集逻辑，覆盖人员、组织、项目、TG 等核心维度，支撑研发人力投入成本分析</li>
                    <li>建设需求排期体系，结合大象消息提醒机制提升排期感知度与填写及时性</li>
                </ul>
            </div>

            <!-- Project 3: Research -->
            <div class="project">
                <div class="project-title">大规模时空轨迹数据处理与行为模式分析</div>
                <div class="project-meta">2020.06 — 2022.06 <span>｜ 算法开发 &amp; 项目对接</span></div>
                <ul class="bullet-list">
                    <li>构建城市动态交通环境下的行为模型集合，生成仿真轨迹作为基准指标库</li>
                    <li>实现多线程条件下 <strong class="highlight">10GB+</strong> 大规模时空轨迹数据的高效解析与处理</li>
                    <li>自定义时序对象运动描述方法，基于方向感知的轨迹运动规律识别，实现异常行为与特殊运动模式的精准检测</li>
                </ul>
            </div>

            <!-- Self Evaluation -->
            <div class="section-title"><h2>自我评价</h2></div>
            <p class="self-eval">
                武大 GIS 硕士（国重实验室）+ 美团 4 年产品经理，具备算法理解力与产品落地能力的复合背景。主导过 AI 平台从 0 到 1 的完整周期，覆盖架构设计、AI 智能体接入、大模型成本管控与商业化体系建设；擅长数据驱动的策略设计与规则治理，能与算法/研发团队深度协作。
            </p>
        </main>
    </div>
</body>
</html>
'''

# 写入文件
with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML 简历已生成: {OUTPUT_HTML}")
print(f"文件大小: {os.path.getsize(OUTPUT_HTML) / 1024:.1f} KB")

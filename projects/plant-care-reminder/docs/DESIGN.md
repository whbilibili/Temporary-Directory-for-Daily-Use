# Design

## 设计语言基线

本项目的设计系统来源于 `ui-ux-pro-max` 自动生成结果：

- 产物路径：`docs/generated/design-system/plant-care-reminder/MASTER.md`
- 推荐风格：`Organic Biophilic`
- 页面模式：`Real-Time / Operations Landing`

## 字体规范

- 标题字体：`Lora`
- 正文字体：`Raleway`
- 语气：安静、自然、家庭化、轻仪式感

## 色彩 Token

```css
:root {
  --color-primary: #2563EB;
  --color-secondary: #3B82F6;
  --color-cta: #F97316;
  --color-background: #F8FAFC;
  --color-text: #1E293B;
  --color-surface: #FFFFFF;
  --color-border: #D9E2EC;
  --color-success: #2F855A;
  --color-warning: #DD6B20;
  --color-error: #C53030;
}
```

## 间距与圆角

- `--space-xs`: `4px`
- `--space-sm`: `8px`
- `--space-md`: `16px`
- `--space-lg`: `24px`
- `--space-xl`: `32px`
- 卡片默认圆角：`16px`
- Modal 圆角：`20px`

## 组件约束

- 主按钮使用填充态 CTA 色，次按钮使用边框态主色
- 植物卡片优先展示图片和下一个到期任务
- 待办卡片优先展示任务动作和完成按钮，不做大面积装饰
- 所有可点击元素必须有 `cursor-pointer` 和明确 hover/focus 态

## 响应式断点

- `375px`
- `768px`
- `1024px`
- `1440px`

## 无障碍基线

- 文本对比度不低于 4.5:1
- 焦点态可见
- 尊重 `prefers-reduced-motion`
- 不使用 emoji 作为功能图标

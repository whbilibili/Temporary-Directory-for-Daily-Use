import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { DetailNavBar } from "./DetailNavBar";

describe("DetailNavBar 图标收口 (ICON-007)", () => {
  it("返回按钮渲染 Lucide ChevronLeft，无手写 polyline", () => {
    const { getByLabelText } = render(
      <DetailNavBar onMenuToggle={() => {}} plantName="龟背竹" />,
    );
    const back = getByLabelText("返回");
    // 改用 Lucide：svg 带 lucide-chevron-left class
    expect(back.querySelector("svg.lucide-chevron-left")).not.toBeNull();
    // 防回退：手写 polyline 路径已删除
    expect(back.querySelector("polyline")).toBeNull();
  });

  it("更多按钮渲染 Lucide EllipsisVertical，无手写 circle 三点", () => {
    const { getByLabelText } = render(
      <DetailNavBar onMenuToggle={() => {}} plantName="龟背竹" />,
    );
    const more = getByLabelText("更多操作");
    expect(more.querySelector("svg.lucide-ellipsis-vertical")).not.toBeNull();
    // 防回退：手写三点 SVG（fill=currentColor + r="1.5" 圆点）已删除——
    // Lucide EllipsisVertical 为 stroke 描边且 class 带 lucide，
    // 原手写 svg 既无 lucide class 也无 stroke 描边。
    const svg = more.querySelector("svg") as SVGSVGElement;
    expect(svg.classList.contains("lucide")).toBe(true);
    expect(svg.querySelector('circle[r="1.5"]')).toBeNull();
  });

  it("aria-label、菜单交互回调与图标 aria-hidden 不回归", () => {
    const onMenuToggle = vi.fn();
    const { getByLabelText } = render(
      <DetailNavBar menuOpen plantName="龟背竹" onMenuToggle={onMenuToggle} />,
    );
    const more = getByLabelText("更多操作");
    expect(more.getAttribute("aria-expanded")).toBe("true");
    expect(more.getAttribute("aria-haspopup")).toBe("menu");
    more.click();
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
    // 图标本身不污染可访问名
    expect(more.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(getByLabelText("返回").querySelector("svg")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });
});

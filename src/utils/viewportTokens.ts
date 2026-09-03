import type { LayoutWidth } from "@/types";

export function pickOuterSpacing(compactSpacing: boolean): string {
  return compactSpacing ? "px-4 py-12" : "px-6 py-20";
}

export function pickReadingWidth(layoutWidth: LayoutWidth): string {
  return layoutWidth === "wide" ? "max-w-5xl" : "max-w-3xl";
}

export function pickBuilderWidth(layoutWidth: LayoutWidth): string {
  return layoutWidth === "wide" ? "max-w-4xl" : "max-w-3xl";
}

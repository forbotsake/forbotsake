#!/usr/bin/env bun
/**
 * satori-card — Local text-card renderer for forbotsake
 *
 * Generates branded PNG cards from content metadata + brand.md.
 * Uses Satori (HTML/CSS → SVG) + resvg (SVG → PNG).
 *
 * Usage:
 *   bun run bin/src/satori-card.ts \
 *     --content content/2026-04-07-x-launch.md \
 *     --brand brand.md \
 *     --output content/2026-04-07-x-launch-visual-1.png \
 *     --type quote \
 *     --dimensions 1200x675
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { parse as parseYaml } from "yaml";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

// --- Argument parsing ---
const args = process.argv.slice(2);
function getArg(name: string, fallback?: string): string {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) {
    if (fallback !== undefined) return fallback;
    console.error(`Missing required argument: --${name}`);
    process.exit(1);
  }
  return args[idx + 1];
}

const contentPath = getArg("content");
const brandPath = getArg("brand", "brand.md");
const outputPath = getArg("output");
const cardType = getArg("type", "title") as "quote" | "stat" | "title" | "takeaway";
const dimensions = getArg("dimensions", "1200x675");

const [width, height] = dimensions.split("x").map(Number);
if (!width || !height) {
  console.error(`Invalid dimensions: ${dimensions}. Expected WxH (e.g., 1200x675)`);
  process.exit(1);
}

// --- Load brand ---
interface Brand {
  name: string;
  colors: { primary: string; accent: string; background: string; text: string };
  typography: { mood: string; heading_style: string };
  visual_style: { mood: string[]; image_type: string };
  prompt_prefix: string;
}

const defaultBrand: Brand = {
  name: "Brand",
  colors: { primary: "#1a1a2e", accent: "#e94560", background: "#f5f5f5", text: "#1a1a2e" },
  typography: { mood: "modern sans-serif", heading_style: "bold" },
  visual_style: { mood: ["minimal"], image_type: "flat" },
  prompt_prefix: "",
};

let brand = defaultBrand;
if (existsSync(brandPath)) {
  try {
    const raw = readFileSync(brandPath, "utf-8");
    const stripped = raw.replace(/^---[\s\S]*?---\n?/, "");
    const parsed = parseYaml(stripped);
    brand = { ...defaultBrand, ...parsed, colors: { ...defaultBrand.colors, ...parsed?.colors } };
  } catch (e) {
    console.warn(`Warning: Could not parse ${brandPath}. Using default palette.`);
  }
} else {
  console.warn(`Warning: ${brandPath} not found. Using default palette.`);
}

// --- Load content frontmatter ---
interface ContentMeta {
  title?: string;
  topic?: string;
  visual_prompt?: string;
  channel?: string;
}

let meta: ContentMeta = {};
let contentBody = "";
if (existsSync(contentPath)) {
  const raw = readFileSync(contentPath, "utf-8");
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (fmMatch) {
    try {
      meta = parseYaml(fmMatch[1]) as ContentMeta;
    } catch {}
    contentBody = fmMatch[2];
  } else {
    contentBody = raw;
  }
} else {
  console.error(`Content file not found: ${contentPath}`);
  process.exit(1);
}

// --- Extract card text ---
const title = meta.title || meta.topic || "Untitled";
const truncate = (s: string, max: number) =>
  s.length > max ? s.slice(0, max - 1) + "\u2026" : s;

function extractQuote(): string {
  const lines = contentBody.split("\n").filter((l) => l.trim().length > 20);
  const quote = lines.find((l) => l.startsWith(">")) || lines[0] || title;
  return truncate(quote.replace(/^>\s*/, ""), 280);
}

function extractStat(): { number: string; label: string } {
  const statMatch = contentBody.match(/(\d[\d,.]*[xX%]?)\s+(.{5,60})/);
  if (statMatch) return { number: truncate(statMatch[1], 6), label: truncate(statMatch[2], 60) };
  return { number: "10x", label: truncate(title, 60) };
}

function extractTakeaways(): string[] {
  const bullets = contentBody
    .split("\n")
    .filter((l) => /^[-*]\s/.test(l.trim()))
    .map((l) => l.replace(/^[-*]\s+/, "").trim())
    .slice(0, 4);
  return bullets.length > 0 ? bullets : [title];
}

// --- Contrast check (WCAG 2.1 AA: 4.5:1) ---
function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const textColor = contrastRatio(brand.colors.text, brand.colors.background) >= 4.5
  ? brand.colors.text
  : contrastRatio("#1a1a2e", brand.colors.background) >= 4.5 ? "#1a1a2e" : "#000000";

// --- Build card HTML ---
function buildCard(): any {
  const base = {
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    height: "100%",
    backgroundColor: brand.colors.background,
    padding: "60px",
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const bottomBar = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: "24px",
    borderTop: `3px solid ${brand.colors.accent}`,
  };

  switch (cardType) {
    case "quote":
      return {
        type: "div",
        props: {
          style: base,
          children: [
            {
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" },
                children: [
                  {
                    type: "div",
                    props: {
                      style: { fontSize: 36, color: brand.colors.accent, marginBottom: 16 },
                      children: "\u201C",
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: { fontSize: 32, lineHeight: 1.4, color: textColor, fontWeight: 500 },
                      children: extractQuote(),
                    },
                  },
                ],
              },
            },
            { type: "div", props: { style: bottomBar, children: [
              { type: "div", props: { style: { fontSize: 16, color: textColor, opacity: 0.6 }, children: brand.name } },
            ] } },
          ],
        },
      };

    case "stat": {
      const { number, label } = extractStat();
      return {
        type: "div",
        props: {
          style: base,
          children: [
            {
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center" },
                children: [
                  {
                    type: "div",
                    props: {
                      style: { fontSize: 96, fontWeight: 800, color: brand.colors.accent, lineHeight: 1 },
                      children: number,
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: { fontSize: 28, color: textColor, marginTop: 16, textAlign: "center" },
                      children: label,
                    },
                  },
                ],
              },
            },
            { type: "div", props: { style: bottomBar, children: [
              { type: "div", props: { style: { fontSize: 16, color: textColor, opacity: 0.6 }, children: brand.name } },
            ] } },
          ],
        },
      };
    }

    case "takeaway": {
      const items = extractTakeaways();
      return {
        type: "div",
        props: {
          style: base,
          children: [
            {
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 20 },
                children: items.map((item, i) => ({
                  type: "div",
                  props: {
                    style: { display: "flex", alignItems: "flex-start", gap: 16 },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: { width: 8, height: 8, borderRadius: 4, backgroundColor: brand.colors.accent, marginTop: 10, flexShrink: 0 },
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: { fontSize: 24, color: textColor, lineHeight: 1.5 },
                          children: truncate(item, 120),
                        },
                      },
                    ],
                  },
                })),
              },
            },
            { type: "div", props: { style: bottomBar, children: [
              { type: "div", props: { style: { fontSize: 16, color: textColor, opacity: 0.6 }, children: brand.name } },
            ] } },
          ],
        },
      };
    }

    case "title":
    default:
      return {
        type: "div",
        props: {
          style: base,
          children: [
            {
              type: "div",
              props: {
                style: { display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" },
                children: [
                  {
                    type: "div",
                    props: {
                      style: { fontSize: 48, fontWeight: 700, color: textColor, lineHeight: 1.2 },
                      children: truncate(title, 80),
                    },
                  },
                  {
                    type: "div",
                    props: {
                      style: { width: 80, height: 4, backgroundColor: brand.colors.accent, marginTop: 24 },
                    },
                  },
                ],
              },
            },
            { type: "div", props: { style: bottomBar, children: [
              { type: "div", props: { style: { fontSize: 16, color: textColor, opacity: 0.6 }, children: brand.name } },
            ] } },
          ],
        },
      };
  }
}

// --- Render ---
async function render() {
  const card = buildCard();

  const svg = await satori(card, {
    width,
    height,
    fonts: [
      {
        name: "Inter",
        data: await fetchFont(),
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: await fetchFont(700),
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  const png = resvg.render().asPng();

  writeFileSync(outputPath, png);
  console.log(`Saved: ${outputPath} (${width}x${height}, type: ${cardType})`);
}

async function fetchFont(weight: number = 400): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  try {
    const cssRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
    });
    const css = await cssRes.text();
    const fontUrl = css.match(/src: url\(([^)]+)\)/)?.[1];
    if (!fontUrl) throw new Error("Font URL not found in CSS");
    const fontRes = await fetch(fontUrl);
    return fontRes.arrayBuffer();
  } catch {
    // Fallback: return empty buffer, Satori will use system font
    return new ArrayBuffer(0);
  }
}

render().catch((err) => {
  console.error("Error generating text-card:", err.message);
  process.exit(1);
});

// lint:tokens - guards the design-token rules from FRONTEND.md (Phase 1).
// Fails (exit 1) on: bare numeric size classes Tailwind doesn't have, Tailwind
// classes whose name is not defined in tailwind.config.js, undefined CSS
// variables, arbitrary pixel font sizes, and emoji / pictographs / symbols used
// as icons (use <Icon name="..." /> instead).
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const configPath = process.env.LINT_TOKENS_CONFIG || path.join(root, "tailwind.config.js");
const srcDir = process.env.LINT_TOKENS_SRC || path.join(root, "src");

const cfg = (await import(pathToFileURL(configPath).href + "?t=" + Date.now())).default;
const ext = cfg.theme?.extend ?? {};

// ---- theme lookups -------------------------------------------------------
const colorNames = new Set(["white", "black", "transparent", "current", "inherit"]);
(function flat(obj, prefix = "") {
  for (const [k, v] of Object.entries(obj)) {
    const name = prefix ? `${prefix}-${k}` : k;
    if (typeof v === "string") colorNames.add(name);
    else flat(v, name);
  }
})(ext.colors ?? {});
const defaultPalette = /^(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)$/;
const fontSizeKeys = new Set(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", ...Object.keys(ext.fontSize ?? {})]);
const radiusKeys = new Set(["none", "sm", "", "md", "lg", "xl", "2xl", "3xl", "full", ...Object.keys(ext.borderRadius ?? {})]);
const shadowKeys = new Set(["sm", "", "md", "lg", "xl", "2xl", "inner", "none", ...Object.keys(ext.boxShadow ?? {})]);
const weightKeys = new Set(["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"]);
const fontFamilyKeys = new Set(["sans", "serif", "mono"]);

// text-* / border-* / ring-* words that are not colours or sizes
const nonColor = /^(left|right|center|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip|[trblxy]|[trblxy]-\d+|\d+|collapse|separate|none|solid|dashed|dotted|double|hidden|opacity-\d+|inset|offset-\d+|spacing-\d+|transparent-?)$/;

// ---- collect files -------------------------------------------------------
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(e.name)) files.push(p);
  }
})(srcDir);
for (const extra of ["index.html", "public/manifest.json", "public/sw.js"]) {
  const f = path.join(root, extra);
  if (fs.existsSync(f)) files.push(f);
}

const errors = [];
const warnings = [];
const definedVars = new Set();
const usedVars = [];

const bannedExact = new Map([
  ["h-52", "h-input"], ["w-280", "w-sidebar"], ["pl-280", "pl-sidebar"], ["pr-280", "pr-sidebar"],
  ["h-56", "h-topbar"], ["pt-56", "pt-topbar"],
  ["text-15", "text-body"], ["text-17", "text-body-lg"], ["text-20", "text-title"], ["text-28", "text-display"],
  ["font-500", "font-medium"], ["font-600", "font-semibold"], ["font-700", "font-bold"],
]);

for (const f of files) {
  const rel = path.relative(root, f);
  const text = fs.readFileSync(f, "utf8");
  const isCss = f.endsWith(".css");

  for (const m of text.matchAll(/(--[a-z0-9-]+)\s*:/gi)) definedVars.add(m[1]);
  for (const m of text.matchAll(/var\((--[a-z0-9-]+)/gi)) {
    usedVars.push({ v: m[1], rel, line: text.slice(0, m.index).split("\n").length });
  }

  if (isCss) continue;
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    // emoji, pictographs, escapes, and symbols used as icons
    if (
      /\p{Extended_Pictographic}/u.test(line) ||
      /\\u\{?1F[0-9A-F]{3}\}?/i.test(line) ||
      /[\u00D7\u2190-\u21FF\u2713-\u2718\u25B2-\u25C2\u25BE\u2B00-\u2BFF\u2600-\u27BF]|&(times|check|larr|rarr|uarr|darr);/u.test(line)
    ) {
      errors.push(`${rel}:${i + 1} emoji, pictograph or symbol-as-icon (use <Icon name="..." />)`);
    }
    for (const m of line.matchAll(/[A-Za-z0-9:\/.\[\]#%_-]+/g)) {
      const tok = m[0].replace(/^(?:[a-z0-9-]+:)+/, ""); // drop variants (hover:, lg:)
      if (bannedExact.has(tok)) {
        errors.push(`${rel}:${i + 1} "${tok}" does not exist in Tailwind; use "${bannedExact.get(tok)}"`);
        continue;
      }
      let mm;
      if ((mm = tok.match(/^text-\[(\d+)px\]$/))) {
        errors.push(`${rel}:${i + 1} arbitrary font size "${tok}"; use a type-scale token`);
        continue;
      }
      if ((mm = tok.match(/^(bg|text|border|ring|divide|placeholder|from|to|via|fill|stroke|outline|accent|caret)-([a-z][a-z0-9-]*)(?:\/\d+)?$/))) {
        const [, prefix] = mm;
        let name = mm[2];
        if (prefix === "border") name = name.replace(/^[trblxy]-(?=[a-z])/, ""); // border-l-brand-blue
        if (nonColor.test(name)) continue;
        if (prefix === "text" && fontSizeKeys.has(name)) continue;
        if (prefix === "text" && /^(sentence|case|ellipsis)$/.test(name)) continue;
        if (prefix === "bg" && /^(clip|origin|fixed|local|scroll|repeat|no-repeat|cover|contain|auto|gradient-to-[a-z]+|opacity-\d+|blend-[a-z-]+|none|center|top|bottom)$/.test(name)) continue;
        if (prefix === "border" && /^(spacing|collapse|separate)/.test(name)) continue;
        if (prefix === "ring" && /^(offset|inset)/.test(name)) continue;
        if (prefix === "outline" && /^(none|offset|dashed|dotted|double)/.test(name)) continue;
        if (colorNames.has(name) || defaultPalette.test(name)) continue;
        // only flag tokens that sit inside a class-ish context (very likely a class)
        if (/className|class=|`|"/.test(line)) errors.push(`${rel}:${i + 1} class "${tok}" has no matching colour/size in tailwind.config.js`);
        continue;
      }
      if ((mm = tok.match(/^rounded(?:-[trbl]{1,2})?-([a-z0-9]+)$/))) {
        if (!radiusKeys.has(mm[1]) && /className|`|"/.test(line)) errors.push(`${rel}:${i + 1} class "${tok}" is not a defined radius`);
        continue;
      }
      if ((mm = tok.match(/^shadow-([a-z0-9]+)$/))) {
        if (!shadowKeys.has(mm[1]) && !colorNames.has(mm[1]) && /className|`|"/.test(line)) errors.push(`${rel}:${i + 1} class "${tok}" is not a defined shadow`);
        continue;
      }
      if ((mm = tok.match(/^font-([a-z0-9]+)$/))) {
        if (!weightKeys.has(mm[1]) && !fontFamilyKeys.has(mm[1]) && /className|`|"/.test(line)) errors.push(`${rel}:${i + 1} class "${tok}" is not a font weight/family`);
      }
    }
  });
}

for (const u of usedVars) {
  if (!definedVars.has(u.v)) errors.push(`${u.rel}:${u.line} CSS variable ${u.v} is used but never defined`);
}

const uniq = (a) => [...new Set(a)];
if (warnings.length) {
  console.warn(`lint:tokens warnings (${warnings.length}):`);
  uniq(warnings).slice(0, 40).forEach((w) => console.warn("  " + w));
  if (warnings.length > 40) console.warn(`  ... and ${warnings.length - 40} more`);
}
if (errors.length) {
  console.error(`lint:tokens FAILED (${errors.length}):`);
  uniq(errors).forEach((e) => console.error("  " + e));
  process.exit(1);
}
console.log(`lint:tokens OK (${files.length} files checked)`);

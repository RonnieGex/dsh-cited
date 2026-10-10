import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { test } from "node:test";
const read = (file) => readFileSync(new URL('../' + file, import.meta.url), "utf8");
test("banner brand pair uses the same spacing token as the Katalis signature", () => {
  const html = read("scripts/readme-graphics/base.html");
  assert.match(html, /\.brand\{[^}]*gap:var\(--brand-gap\)/);
  assert.match(html, /\.banner \.brand-name\{[^}]*gap:var\(--brand-gap\)/);
});
test("brand assets retain published geometry and accessible presentation", async () => {
  const { logo, brandText } = await import('../scripts/readme-graphics/brand-logos.mjs');
  const manifest = JSON.parse(read('docs/brand/logos/' + "sources.json"));
  for (const [name, record] of Object.entries(manifest)) {
    const source = read('docs/brand/logos/' + record.file);
    assert.equal(createHash("sha256").update(source).digest("hex"), record.sha256, name);
    const rendered = logo(name);
    assert.equal(rendered.match(/viewBox="([^"]+)"/)[1], source.match(/viewBox="([^"]+)"/)[1], name);
    for (const attribute of ["d", "transform", "fill-rule", "clip-rule", "x", "y", "width", "height"]) {
      const pattern = new RegExp("\\s" + attribute + '="([^"]+)"', "g");
      const shapes = (svg) => [...svg.replace(/<svg[^>]*>/, "").matchAll(pattern)].map((match) => match[1]);
      assert.deepEqual(shapes(rendered), shapes(source), `${name}/${attribute}`);
    }
    assert.match(rendered, /aria-hidden="true"/);
    assert.match(rendered, /focusable="false"/);
    assert.match(record.url, /^https:\/\//);
    assert.ok(record.version && record.license);
  }
  const marked = brandText('DeepSeek Harness <code>DeepSeek</code><a href="https://DeepSeek.example">DeepSeek</a>');
  assert.equal((marked.match(/data-brand="deepseek"/g) ?? []).length, 2);
  assert.ok(marked.includes('<code>DeepSeek</code>'));
  assert.ok(marked.includes('href="https://DeepSeek.example"'));
});

test("source files match independently pinned publication hashes", () => {
  const pins = {
  "deepseek": "7a55a0a7391d116eba7d32807d6838478f9209f6034612941e74fbb14934e2ef"
};
  for (const [name, expected] of Object.entries(pins)) {
    const file = name === "codex" ? "codex_dark.svg" : `${name}.svg`;
    assert.equal(createHash("sha256").update(read("docs/brand/logos/" + file)).digest("hex"), expected, name);
  }
});

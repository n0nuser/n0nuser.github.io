import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { globSync } from "glob";

const root = resolve(".");
const files = [
  ...globSync("layouts/**/*.html", { cwd: root, nodir: true }),
  ...globSync("assets/js/*.js", { cwd: root, nodir: true }),
  "assets/scss/main.scss"
];

const seen = new Set();
const errors = [];

function lineFromIndex(text, idx) {
  return text.slice(0, idx).split("\n").length;
}

function pushMatchErrors(file, content, regex, message) {
  for (const match of content.matchAll(regex)) {
    const idx = match.index ?? 0;
    errors.push(`${file}:${lineFromIndex(content, idx)} ${message}`);
  }
}

for (const file of files) {
  if (seen.has(file)) continue;
  seen.add(file);

  const content = readFileSync(resolve(root, file), "utf8");

  pushMatchErrors(
    file,
    content,
    /\{ \{|\} \}/g,
    "Malformed Hugo delimiter spacing. Use '{{' and '}}'."
  );

  pushMatchErrors(
    file,
    content,
    /\{\s*\r?\n\s*\{\s*\r?\n[\s\S]*?\r?\n\s*\}\s*\r?\n\s*\}/g,
    "Found split pseudo-delimiter block that usually corrupts templates."
  );

  pushMatchErrors(
    file,
    content,
    /\{\{\s*if\s+eq\.Layout/g,
    "Invalid Hugo expression 'eq.Layout'; expected 'eq .Layout'."
  );
}

if (errors.length > 0) {
  console.error("Template lint failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Template lint passed.");

import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const loadText = (path) => readFile(new URL(path, root), "utf8");

const fail = (message) => {
  throw new Error(message);
};

const html = await loadText("index.html");
const app = await loadText("app.js");
const bank = JSON.parse(await loadText("questions.json"));

if (!html.includes("app.js")) fail("index.html must load app.js");
if (!html.includes("styles.css")) fail("index.html must load styles.css");
if (!html.includes("summary-grid")) fail("index.html must include a compact summary grid");
if (!html.includes("quick-actions")) fail("index.html must include quick action controls");
if (!html.includes("bottom-actions")) fail("index.html must include mobile-friendly bottom actions");
if (!app.includes("questions.json")) fail("app.js must fetch questions.json");
const css = await loadText("styles.css");
if (!css.includes("@media (max-width: 960px)")) fail("styles.css must include tablet responsive rules");
if (!css.includes("@media (max-width: 640px)")) fail("styles.css must include mobile responsive rules");
if (!css.includes("safe-area-inset-bottom")) fail("styles.css must account for mobile safe areas");
if (!Array.isArray(bank.sets)) fail("questions.json must contain a sets array");
if (bank.sets.length !== 10) fail(`expected 10 sets, got ${bank.sets.length}`);

const ids = new Set();
const eras = new Set();
let total = 0;
for (const [setIndex, set] of bank.sets.entries()) {
  if (!set.id || !set.title) fail(`set ${setIndex + 1} needs id and title`);
  if (!Array.isArray(set.questions)) fail(`${set.id} must contain questions`);
  if (set.questions.length !== 100) fail(`${set.id} must contain exactly 100 questions`);
  total += set.questions.length;

  for (const [index, question] of set.questions.entries()) {
    const label = `${set.id} question ${index + 1}`;
    if (!question.id || ids.has(question.id)) fail(`${label} has missing or duplicate id`);
    ids.add(question.id);
    if (!question.era) fail(`${label} is missing era`);
    if (!question.topic) fail(`${label} is missing topic`);
    if (!question.prompt?.includes("____")) fail(`${label} prompt must include a blank marker`);
    if (!question.answer) fail(`${label} is missing answer`);
    if (!question.explanation || question.explanation.length < 12) fail(`${label} needs a useful explanation`);
    eras.add(question.era);
  }
}

if (eras.size < 7) fail(`expected broad era coverage, got ${eras.size} eras`);
if (total < 1000) fail(`expected at least 1000 questions, got ${total}`);

console.log(`Validated ${total} questions in ${bank.sets.length} sets across ${eras.size} eras.`);

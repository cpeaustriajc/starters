// Hidden end-to-end check: a todo added on the page with a due date shows that date on the page,
// also after a reload. It reads only the running app, never the code.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const DUE = { iso: "2027-03-14", typed: "03142027" };
const SHOWN = [
  /2027-03-14/,
  /\bMar(ch)?\.? 14\b/i,
  /\b14 Mar(ch)?\b/i,
  /\b0?3\/14\/(20)?27\b/,
  /\b14[./]0?3[./](20)?27\b/,
];
const title = `Pay rent ${Date.now()}`;

const server = spawn("npm", ["run", "dev"], {
  cwd: "/app",
  detached: true,
  env: { ...process.env, TODO_DB: `/tmp/e2e-${Date.now()}.db`, TZ: "UTC" },
  stdio: ["ignore", "inherit", "inherit"],
});
const stop = () => {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {}
};

const waitForServer = async () => {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`no answer from ${BASE} in 180 s`);
};

const fillDueDate = async (page) => {
  const native = page.locator('input[type="date"]');
  if ((await native.count()) > 0) {
    await native.first().fill(DUE.iso);
    return "input[type=date]";
  }
  const segments = page.getByRole("spinbutton");
  if ((await segments.count()) > 0) {
    await segments.first().click();
    await page.keyboard.type(DUE.typed, { delay: 50 });
    return "date segments";
  }
  const text = page.getByLabel(/due/i).and(page.locator("input"));
  if ((await text.count()) > 0) {
    await text.first().fill(DUE.iso);
    return "input labelled due";
  }
  const named = page.locator('input[name*="due" i]');
  if ((await named.count()) > 0) {
    await named.first().fill(DUE.iso);
    return "input named due";
  }
  throw new Error("no due date field on the page");
};

const rowText = (page) =>
  page
    .getByText(title, { exact: true })
    .first()
    .evaluate((element) => {
      let node = element;
      for (let depth = 0; depth < 8 && node.parentElement; depth += 1) {
        const role = node.getAttribute("role");
        if (["LI", "TR", "ARTICLE"].includes(node.tagName) || role === "listitem" || role === "row") {
          return node.innerText;
        }
        node = node.parentElement;
      }
      return element.parentElement?.parentElement?.innerText ?? element.innerText;
    });

let browser;
try {
  await waitForServer();
  browser = await chromium.launch();
  const page = await browser.newPage({ locale: "en-US", timezoneId: "UTC" });
  await page.goto(BASE, { waitUntil: "networkidle" });

  await page.getByRole("textbox", { name: /new todo/i }).or(page.getByRole("textbox").first()).first().fill(title);
  const how = await fillDueDate(page);
  console.log(`due date entered through: ${how}`);
  await page.getByRole("button", { name: /^add/i }).first().click();
  await page.getByText(title, { exact: true }).first().waitFor({ timeout: 15_000 });

  await page.reload({ waitUntil: "networkidle" });
  await page.getByText(title, { exact: true }).first().waitFor({ timeout: 15_000 });
  const text = await rowText(page);
  await page.screenshot({ path: "/logs/verifier/e2e.png", fullPage: true });
  console.log(`row text: ${JSON.stringify(text)}`);
  if (!SHOWN.some((pattern) => pattern.test(text))) {
    throw new Error(`the todo row does not show the due date ${DUE.iso}`);
  }
  console.log("PASS: the due date shows on the page");
} catch (error) {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await browser?.close();
  stop();
}

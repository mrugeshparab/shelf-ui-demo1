import { chromium } from "playwright";

const BASE = "http://localhost:5173/";
const WEBGL_ARGS = ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--in-process-gpu"];
const NO_WEBGL_ARGS = ["--enable-unsafe-swiftshader"];
const wanted = process.argv.slice(2);
const on = (name) => wanted.length === 0 || wanted.includes(name);
const report = { passes: {}, errors: {}, critical: [] };

function watch(page, bucket) {
  page.on("console", (m) => {
    if (m.type() === "error") bucket.push(`[console.error] ${m.text()}`);
  });
  page.on("pageerror", (e) => bucket.push(`[pageerror] ${e.message}`));
  page.on("requestfailed", (r) => bucket.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`));
}

async function ready(page) {
  await page
    .waitForFunction(() => !!document.querySelector(".shader-frame iframe"), null, {
      polling: 100,
      timeout: 25000,
    })
    .catch(() => {});
  if (!(await page.$(".shader-frame iframe"))) throw new Error("iframe never appeared");
  await page.waitForFunction(
    () => document.querySelector(".landing-page-frame")?.dataset.state === "ready",
    null,
    { polling: 100, timeout: 60000 },
  );
}

async function frameOf(page) {
  const el = await page.$(".shader-frame iframe");
  const fr = await el.contentFrame();
  await fr.waitForLoadState("load");
  return fr;
}

async function openPage(args, viewport, extraContext = {}) {
  const browser = await chromium.launch({ args });
  const ctx = await browser.newContext({ viewport, ...extraContext });
  const page = await ctx.newPage();
  page.setDefaultTimeout(9000);
  page.setDefaultNavigationTimeout(25000);
  const errors = [];
  watch(page, errors);
  await page.goto(BASE, { waitUntil: "load", timeout: 25000 });
  await ready(page);
  const fr = await frameOf(page);
  return { browser, ctx, page, fr, errors };
}

function collect(fr) {
  return fr.evaluate(() => {
    const de = document.documentElement;
    let reducedMotionRules = 0;
    for (const sheet of [...document.styleSheets]) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.media?.mediaText?.includes("prefers-reduced-motion")) reducedMotionRules++;
        }
      } catch {
        /* cross-origin */
      }
    }
    const visibleText = [...document.querySelectorAll("h1,h2,h3,h4,p,a,button,li,span,strong,em")].filter((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return el.textContent?.trim() && r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
    });
    const sizes = visibleText.map((el) => parseFloat(getComputedStyle(el).fontSize));
    const smallest = visibleText
      .map((el) => ({
        size: parseFloat(getComputedStyle(el).fontSize),
        tag: el.tagName,
        cls: (el.className?.toString?.() ?? "").slice(0, 40),
        text: el.textContent.trim().slice(0, 50),
      }))
      .sort((a, b) => a.size - b.size)
      .slice(0, 5);
    const canvas = document.querySelector("canvas");
    let webgl = false;
    try {
      webgl = !!(canvas && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      /* context type mismatch */
    }
    const fallback = document.querySelector("#static-fallback");
    return {
      title: document.title,
      webglReadyClass: !!document.querySelector(".webgl-ready"),
      fallbackVisible: !!fallback && !fallback.hasAttribute("hidden") && getComputedStyle(fallback).display !== "none",
      scrollHeight: de.scrollHeight,
      viewportH: window.innerHeight,
      overflowX: de.scrollWidth - window.innerWidth,
      bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 80),
      accentVar: getComputedStyle(de).getPropertyValue("--accent").trim(),
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 100) ?? null,
      headings: [...document.querySelectorAll("h1,h2")].slice(0, 6).map((h) => h.textContent.trim().slice(0, 60)),
      links: document.querySelectorAll("a[href]").length,
      linkHrefs: [...document.querySelectorAll("a[href]")].slice(0, 10).map((a) => a.getAttribute("href")),
      buttons: [...document.querySelectorAll("button")].map((b) => ({
        id: b.id,
        label: b.getAttribute("aria-label"),
        visible: b.getBoundingClientRect().width > 0,
      })),
      canvases: document.querySelectorAll("canvas").length,
      webgl,
      reducedMotionRules,
      minFontSize: Math.min(...sizes),
      smallest,
      under10px: sizes.filter((s) => s < 10).length,
      matchMediaReduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };
  });
}

async function shot(page, path) {
  try {
    const buf = await page.screenshot({ path, timeout: 8000 });
    return buf.length;
  } catch (e) {
    return `failed: ${String(e).split("\n")[0]}`;
  }
}

/* ═══ PASS 1 — desktop, WebGL scene ═══════════════════════════════════ */
if (on("desktopScene")) {
  const name = "desktopScene";
  const { browser, ctx, page, fr, errors } = await openPage(WEBGL_ARGS, { width: 1440, height: 900 });
  await page
    .waitForFunction(
      () => {
        const f = document.querySelector(".landing-page-frame iframe");
        try {
          const d = f?.contentDocument;
          return !!d?.querySelector(".webgl-ready") || !!d?.querySelector("#static-fallback:not([hidden])");
        } catch {
          return false;
        }
      },
      null,
      { timeout: 60000, polling: 250 },
    )
    .catch(() => {});
  await page.waitForTimeout(1200);

  const pass = { doc: await collect(fr) };
  pass.frameTitle = await (await page.$(".shader-frame iframe")).getAttribute("title");
  pass.dataState = await page.getAttribute(".landing-page-frame", "data-state");

  pass.scroll = await fr.evaluate(() => {
    const before = window.scrollY;
    window.scrollTo({ top: 1400, behavior: "instant" });
    return { before, after: window.scrollY };
  });

  /* interaction: shelf mode — Next volume announces the new selection */
  pass.next = await fr.evaluate(() => {
    const liveBefore = document.querySelector("#live-region")?.textContent?.trim() ?? "";
    document.querySelector("#next")?.click();
    return { liveBefore: liveBefore.slice(0, 120) };
  });
  await page.waitForTimeout(1500);
  pass.next.liveAfter = (
    await fr.evaluate(() => document.querySelector("#live-region")?.textContent?.trim() ?? "")
  ).slice(0, 120);

  /* interaction: authored Inspect control opens the detail view */
  const liveBefore = await fr.evaluate(() => document.querySelector("#live-region")?.textContent?.trim() ?? "");
  pass.inspect = await fr.evaluate(() => {
    const btn = document.querySelector("#inspect");
    if (!btn) return { found: false };
    btn.click();
    return { found: true };
  });
  await page.waitForTimeout(2200);
  pass.inspect.liveBefore = liveBefore.slice(0, 120);
  pass.inspect.after = await fr.evaluate(() => {
    const close = document.querySelector("#close-detail");
    const r = close?.getBoundingClientRect();
    return {
      closeVisible: !!r && r.width > 0 && r.height > 0,
      liveAfter: document.querySelector("#live-region")?.textContent?.trim().slice(0, 120) ?? "",
    };
  });

  /* close it again */
  await fr.evaluate(() => document.querySelector("#close-detail")?.click());
  await page.waitForTimeout(1500);

  /* interaction: keyboard focus */
  await page.mouse.click(720, 500);
  await page.keyboard.press("Tab");
  pass.tabFocus = await fr.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, id: el?.id, label: el?.getAttribute?.("aria-label") };
  });

  /* interaction: hover */
  await page.mouse.move(700, 450);
  await page.waitForTimeout(250);

  pass.screenshotBytes = "skipped: SwiftShader stalls the capturer; the fallback pass covers screenshots";
  report.passes[name] = pass;
  report.errors[name] = errors;
  await ctx.close();
  await browser.close();
}

/* ═══ PASS 2 — narrow phone, WebGL scene ══════════════════════════════ */
if (on("mobileScene")) {
  const name = "mobileScene";
  const { browser, ctx, page, fr, errors } = await openPage(
    WEBGL_ARGS,
    { width: 375, height: 667 },
    { deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  );
  await page.waitForTimeout(4000);
  const pass = { doc: await collect(fr) };
  pass.hostOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  const box = await (await fr.$("#inspect"))?.boundingBox?.();
  if (box) {
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
    await page.waitForTimeout(1500);
    pass.tap = await fr.evaluate(() => {
      const el = document.querySelector("#close-detail");
      const r = el?.getBoundingClientRect();
      return { closeVisible: !!r && r.width > 0 && r.height > 0, scrollY: window.scrollY };
    });
  }

  pass.screenshotBytes = "skipped: SwiftShader stalls the capturer; the fallback pass covers screenshots";
  report.passes[name] = pass;
  report.errors[name] = errors;
  await ctx.close();
  await browser.close();
}

/* ═══ PASS 3 — narrow phone, no WebGL (authored static fallback) ══════ */
if (on("mobileFallback")) {
  const name = "mobileFallback";
  const { browser, ctx, page, fr, errors } = await openPage(
    NO_WEBGL_ARGS,
    { width: 375, height: 667 },
    { deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  );
  await page.waitForTimeout(3000);
  const pass = { doc: await collect(fr) };
  pass.hostOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  pass.fallbackTitle = await fr.evaluate(() => document.querySelector("#fallback-title")?.textContent?.trim() ?? null);
  pass.screenshotBytes = await shot(page, "/tmp/pw/mobile-fallback.png");
  report.passes[name] = pass;
  report.errors[name] = errors.filter((e) => !e.includes("THREE.WebGLRenderer") && !e.includes("WebGL context"));
  await ctx.close();
  await browser.close();
}

/* ═══ PASS 4 — reduced motion ═════════════════════════════════════════ */
if (on("reducedMotion")) {
  const name = "reducedMotion";
  const { browser, ctx, page, fr, errors } = await openPage(
    WEBGL_ARGS,
    { width: 1280, height: 800 },
    { reducedMotion: "reduce" },
  );
  await page.waitForTimeout(3000);
  report.passes[name] = { doc: await collect(fr) };
  report.errors[name] = errors;
  await ctx.close();
  await browser.close();
}

/* ═══ verdicts (only for passes that ran) ═════════════════════════════ */
const crit = report.critical;

const d = report.passes.desktopScene;
if (d) {
  if (!d.doc.title.includes("Working Volumes")) crit.push("page title wrong");
  if (d.dataState !== "ready") crit.push("frame not ready");
  if (!d.doc.webglReadyClass || !d.doc.webgl) crit.push("3D scene did not initialise");
  if (d.doc.overflowX > 2) crit.push(`desktop overflow ${d.doc.overflowX}px`);
  if (d.doc.buttons.filter((b) => b.visible).length < 4) crit.push("buttons not visible");
  if (d.next.liveAfter === d.next.liveBefore || !d.next.liveAfter)
    crit.push("next-volume did not announce a change in the live region");
  if (!d.inspect.after?.closeVisible) crit.push("detail view did not open via Inspect");
  if (!d.inspect.after?.liveAfter) crit.push("no live-region announcement for detail view");
  if (!d.tabFocus?.tag) crit.push("keyboard focus did not enter the frame");
  if (report.errors.desktopScene.length) crit.push(`desktop console errors: ${report.errors.desktopScene.length}`);
}

const m = report.passes.mobileScene;
if (m) {
  if (m.doc.overflowX > 2) crit.push(`mobile scene overflow ${m.doc.overflowX}px`);
  if (m.hostOverflow > 2) crit.push(`mobile host overflow ${m.hostOverflow}px`);
  if (report.errors.mobileScene.length) crit.push(`mobile console errors: ${report.errors.mobileScene.length}`);
}

const f = report.passes.mobileFallback;
if (f) {
  if (!f.doc.fallbackVisible) crit.push("static fallback not shown without WebGL");
  if (f.doc.overflowX > 2) crit.push(`fallback overflow ${f.doc.overflowX}px`);
  if (f.hostOverflow > 2) crit.push(`fallback host overflow ${f.hostOverflow}px`);
  if (report.errors.mobileFallback.length)
    crit.push(`fallback non-WebGL errors: ${report.errors.mobileFallback.join(" | ")}`);
}

const r = report.passes.reducedMotion;
if (r) {
  if (!r.doc.matchMediaReduced) crit.push("reduced-motion not honored inside frame");
  if (report.errors.reducedMotion.length) crit.push(`reduced-motion console errors: ${report.errors.reducedMotion.length}`);
}

console.log(JSON.stringify(report, null, 2));
process.exit(crit.length ? 1 : 0);

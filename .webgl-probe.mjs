import { chromium } from "playwright";

const variants = {
  "enable-unsafe-swiftshader": ["--enable-unsafe-swiftshader"],
  "disable-gpu": ["--enable-unsafe-swiftshader", "--disable-gpu"],
  "angle-swiftshader-webgl": ["--enable-unsafe-swiftshader", "--use-gl=angle", "--use-angle=swiftshader-webgl"],
  "gl-swiftshader": ["--enable-unsafe-swiftshader", "--use-gl=swiftshader"],
  "angle-swiftshader-noshared": ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--in-process-gpu"],
};

for (const [name, args] of Object.entries(variants)) {
  let browser;
  try {
    browser = await chromium.launch({ args });
    const page = await browser.newPage();
    const result = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return null;
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      return {
        version: gl.getParameter(gl.VERSION),
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      };
    });
    console.log(name, "=>", JSON.stringify(result));
  } catch (e) {
    console.log(name, "=> launch failed:", String(e).split("\n")[0]);
  } finally {
    await browser?.close();
  }
}

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import innerGreenSource from "./sources/inner-green-3d.html?raw";
import threeRuntime from "./sources/inner-green-assets/three.min.js?raw";
export const SYLVA_LIVING_WORLD_VARIANTS = ["living-green"] as const;
export type SylvaLivingWorldVariant = "living-green";
export type SylvaLivingWorldSceneProps = { variant?: SylvaLivingWorldVariant; className?: string; style?: CSSProperties };
const SCENE_ONLY_MARKUP = `<main class="hero" id="hero"><canvas id="scene" role="img" aria-label="Sylva Living Green"></canvas><div class="stage" id="stage" aria-hidden="true"></div></main>`;
const SCENE_ONLY_STYLE = `<style data-threeui-sylva-scene>html,body{width:100%!important;height:100%!important;min-height:0!important;margin:0!important;overflow:hidden!important}body{position:relative!important;background:#4a4d44!important}.hero{height:100%!important;min-height:0!important}#scene{pointer-events:auto!important}</style>`;
function buildSceneDocument(reducedMotion: boolean) { const presentationStart = innerGreenSource.indexOf('<main class="hero" id="hero">'); const runtimeStart = innerGreenSource.indexOf('<script src="inner-green-assets/three.min.js"></script>'); if (presentationStart < 0 || runtimeStart < 0 || runtimeStart <= presentationStart) throw new Error("Sylva scene adapter could not isolate the authored Three.js scene."); let source = `${innerGreenSource.slice(0, presentationStart)}${SCENE_ONLY_MARKUP}

${innerGreenSource.slice(runtimeStart)}`.replace("</head>", `${SCENE_ONLY_STYLE}</head>`).replace('<script src="inner-green-assets/three.min.js"></script>', `<script data-threeui-three-runtime>${threeRuntime}</script>`); if (reducedMotion) source = source.replace("(function loop() { requestAnimationFrame(loop); tick(); })();", "(function loop() { if (!REDUCED) requestAnimationFrame(loop); tick(); })();"); return source; }
export function SylvaLivingWorldScene({ className = "", style }: SylvaLivingWorldSceneProps) { const hostRef = useRef<HTMLDivElement>(null); const [hostVisible, setHostVisible] = useState(true); const [documentVisible, setDocumentVisible] = useState(() => typeof document === "undefined" || !document.hidden); const [reducedMotion, setReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches); const [ready, setReady] = useState(false); useEffect(() => { const host = hostRef.current; if (!host || typeof IntersectionObserver === "undefined") return; const observer = new IntersectionObserver(([entry]) => setHostVisible(entry?.isIntersecting ?? true)); observer.observe(host); return () => observer.disconnect(); }, []); useEffect(() => { if (typeof document === "undefined") return; const update = () => setDocumentVisible(!document.hidden); document.addEventListener("visibilitychange", update); return () => document.removeEventListener("visibilitychange", update); }, []); useEffect(() => { const media = window.matchMedia("(prefers-reduced-motion: reduce)"); const update = () => setReducedMotion(media.matches); media.addEventListener("change", update); return () => media.removeEventListener("change", update); }, []); const source = useMemo(() => buildSceneDocument(reducedMotion), [reducedMotion]); const mounted = hostVisible && documentVisible; useEffect(() => setReady(false), [mounted, reducedMotion]); return <div ref={hostRef} className={`threeui-background sylva-living-world-scene${className ? ` ${className}` : ""}`} role="img" aria-label="Sylva Living Green with ferns, flowers, pollen, and a butterfly" data-variant="living-green" data-state={ready ? "ready" : "loading"} style={{ background: "#4a4d44", pointerEvents: "auto", ...style }}>{mounted ? <iframe key={reducedMotion ? "reduced" : "motion"} title="Sylva Living Green" srcDoc={source} sandbox="allow-scripts" loading="eager" onLoad={() => setReady(true)} style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", border: 0, background: "#4a4d44" }} /> : null}</div>; }

/* ─────────────────────────────────────────────────────────────────────────
   Scene re-dressings referenced by the registered `LandingPages.tsx` that
   sit outside the public source boundary. The published
   SylvaLivingWorldScene — in the @designcodeio/threeui package and in the
   public MengTo/threeui repository alike — ships Living Green alone, so the
   authored Sakura Sunset, Maple Autumn and Sequoia Mist transformations are
   not recoverable from any public source.

   These exports exist so the registered component source resolves
   byte-for-byte. SylvaHero for a re-dressed variant is not usable in this
   project (CompleteShelfLandingPage never touches this seam); the transforms
   fail loudly rather than render the wrong scene, and the style strings are
   only read while building a document that is never built here.
   ───────────────────────────────────────────────────────────────────────── */

export const SAKURA_SUNSET_STYLE = "";
export const MAPLE_AUTUMN_STYLE = "";
export const SEQUOIA_MIST_STYLE = "";

const unpublishedVariant = (variant: string) => (_source: string): string => {
  throw new Error(
    `The "${variant}" Sylva scene transformation is not part of the published ThreeUI source boundary; only Living Green ships here.`,
  );
};

export const applySakuraSunsetVariant = unpublishedVariant("sakura-sunset");
export const applyMapleAutumnVariant = unpublishedVariant("maple-autumn");
export const applySequoiaMistVariant = unpublishedVariant("sequoia-mist");

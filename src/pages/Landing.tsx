/**
 * Landing route — serves the static portfolio site.
 *
 * The portfolio lives as a plain HTML/CSS/JS site in `public/portfolio/`
 * (built for GitHub Pages). The previous ThreeUI "shelf" landing page — the
 * one titled with AI-tool names like Claude Code / Codex / Antigravity — was
 * replaced at `/` because it is not the owner's content. It still exists,
 * untouched, under `public/landing-pages/` if it is ever wanted back.
 *
 * The portfolio renders in a full-viewport iframe: it is a complete
 * self-contained document (own nav, scroll, mailto links), so framing it keeps
 * the app shell, auth routes and router intact while `/` shows the portfolio.
 */
export default function Landing() {
  return (
    <iframe
      src="/portfolio/index.html"
      title="Portfolio — Alex Rivera (example persona)"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
        display: "block",
        background: "#f7f7f7",
      }}
      allow="clipboard-write"
    />
  );
}

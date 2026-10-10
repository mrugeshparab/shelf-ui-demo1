# Portfolio Website (static · GitHub Pages ready)

A complete, dependency-free portfolio site styled as an online resume: fixed
navigation, animated hero with a particle network and rotating typed text,
About, Skills, Experience, Education, Projects, Contact and footer sections,
back-to-top button, mobile menu, scroll reveal animations, and full keyboard
accessibility.

Design follows a light background, dark navy text, and blue/purple accents
(Poppins + Nunito type, `#4a25ed`/`#011aff` accents, `#2506ad` primary buttons,
`#ffd900` project strips, `#00012b` footer).

> **Heads up — the content is a fictional example persona.** "Alex Rivera",
> the Toronto data & analytics engineer shown on the site, is invented demo
> content created for this template. Nothing about the reference portfolio's
> owner (name, bio, photo, résumé, projects) appears anywhere. Swap in your own
> details using the guide below before publishing as yourself.

## File structure

```
portfolio/
├── index.html              All content and page structure
├── README.md               This file
└── assets/
    ├── css/style.css       All styling (tokens at the top of the file)
    ├── js/script.js        All behaviour (CONFIG block at the top of the file)
    └── images/
        ├── portrait.svg        Monogram avatar (replace with your photo)
        ├── favicon.svg         Monogram favicon
        └── project-1..6.svg    Project thumbnails
```

Every path is **relative**, so the site works from a subpath such as
`https://<user>.github.io/Portfolio.github.io/`.

## No libraries — what replaced what

The reference site loads 7 CDN libraries. This build reimplements each effect in
readable vanilla JS, so the site works offline, loads instantly, and has nothing
to keep updated:

| Reference library        | In `assets/js/script.js` | Purpose |
|--------------------------|--------------------------|---------|
| particles.js             | `ParticleNetwork`        | Animated dot/line network behind the hero. Hover repels particles; clicking pushes them. |
| Typed.js                 | `typingText`             | The rotating "i am into …" text in the hero. |
| ScrollReveal.js          | `revealOnScroll`         | Elements fade/slide in once when scrolled into view. |
| Vanilla-Tilt.js          | `initTilt`               | Subtle 3D tilt on the portrait ring and project cards. |
| Font Awesome             | Inline SVG sprite        | All icons are inline `<symbol>`s in `index.html` — no icon font. |
| jQuery                   | plain DOM events         | Mobile menu, scroll-spy, back-to-top, form handling. |

The only external resource is **Google Fonts** (Poppins + Nunito). Without a
network connection the site falls back to system fonts and still works.

## Replace the example persona with your own

Everything to change maps to the fictional "Alex Rivera" content:

1. **Name** — search `index.html` for `Alex Rivera` (header logo, hero, About,
   footer credit, page `<title>` and meta tags).
2. **Role & bio** — `Data & Analytics Engineer` and the two About paragraphs.
   Keep everything true; don't invent achievements.
3. **Email** — set it in **one** place, the top of `assets/js/script.js`:
   ```js
   var CONFIG = {
     email: "you@example.com",   // ← your real email
     ...
   };
   ```
   This wires the Contact mail button, the footer/About email text, and the
   contact form (which composes an email in the visitor's own mail app — the
   page itself never sends anything). The current value
   `alex.rivera@example.com` uses the reserved `example.com` domain, so it
   cannot reach a real mailbox.
4. **Location & availability** — `Toronto, Canada`, `Open to new opportunities`.
5. **Typed text** — the hero's rotating words in `index.html`
   (`data-typed-strings='["…","…"]'`) or `CONFIG.typedStrings` in `script.js`.
6. **Skills** — the 16 tiles (Python, SQL, Power BI, …). Delete tiles or copy
   an `<li>` to add more; icons come from the sprite (`#i-skill-*`).
7. **Experience & Education** — the `.box` articles (Northbound Logistics,
   Lakeshore Retail Group, CivicData Lab, University of Toronto, Seneca
   Polytechnic are all invented examples). Copy an `<article class="box">` for
   more entries.
8. **Projects** — for each of the 6 cards replace:
   - the thumbnail (`assets/images/project-N.svg`) with a real screenshot
     (PNG/JPG work — change the `src`),
   - the title and description,
   - the two `href="#"` on **View** / **Code** with your live URL and repo URL,
     and delete the `data-placeholder-link` attribute from each (that attribute
     makes unedited links show a hint instead of navigating).
9. **Social links & Resume** — LinkedIn/GitHub anchors and the Resume button are
   `href="#"` placeholders with `data-placeholder-link`; put your real URLs in
   (for the Resume, e.g. `resume.pdf` in this folder) and remove the attribute.
10. **Portrait & favicon** — replace `assets/images/portrait.svg` and
    `assets/images/favicon.svg` with your photo/icon (then update the two
    `<img src>` in hero + About and the `<link rel="icon">`).

## Preview locally

Any static file server works:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000/

# or Node
npx serve .
```

> In the Freebuff workspace preview, open `/portfolio/index.html` (the full
> file path). The bare `/portfolio/` path is swallowed by the dev server's SPA
> fallback and shows the main app instead. GitHub Pages does not have this
> quirk.

## Publish on GitHub Pages

1. Create a repository named `Portfolio.github.io` (matches the reference
   setup), **or** any name for a project site (e.g. `my-portfolio`).
2. Copy the contents of this folder (`index.html`, `assets/`, `README.md`) to
   the repository root.
3. Commit and push to the `main` (or `master`) branch.
4. On GitHub: **Settings → Pages → Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` / `master`, folder `/ (root)` → **Save**
5. Wait a minute or two; the site appears at:
   - `https://<your-username>.github.io/` (user site), or
   - `https://<your-username>.github.io/my-portfolio/` (project site).

Because all paths are relative, both layouts work with no config changes.

## Accessibility & behaviour notes

- **Reduced motion**: with `prefers-reduced-motion: reduce`, the typed text
  shows a single static word, the particle canvas draws one still frame,
  reveals/tilt/heart-beat/wave animations are disabled, and smooth scrolling
  becomes instant — verified in-browser.
- Keyboard: skip link, visible focus rings, `Esc` closes the mobile menu, and
  project cards open their panels on `:focus-within` so keyboard users can
  reach the View/Code buttons.
- The contact form uses native `mailto:` composition — there is **no backend**
  and nothing is sent from the page itself (intentional; wiring a real form
  service like Formspree/EmailJS is easy if wanted later).

## Configuration cheat-sheet (`assets/js/script.js`)

```js
var CONFIG = {
  email: "alex.rivera@example.com",     // ← your real email
  typedStrings: ["…", "…", "…", "…"],   // hero rotating words
};
```

Everything else is plain HTML/CSS — no build step, no bundler, no secrets.

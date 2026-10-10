# Portfolio Website (static · GitHub Pages ready)

A complete, dependency-free portfolio site: fixed navigation, animated hero with a
particle network and rotating typed text, About, Skills, Experience, Education,
Projects, Contact and footer sections, back-to-top button, mobile menu, scroll
reveal animations, and full keyboard accessibility.

Design follows a light background, dark navy text, and blue/purple accents
(Poppins + Nunito type, `#4a25ed`/`#011aff` accents, `#2506ad` primary buttons,
`#ffd900` project strips, `#00012b` footer).

## File structure

```
portfolio/
├── index.html              All content and page structure
├── README.md               This file
└── assets/
    ├── css/style.css       All styling (tokens at the top of the file)
    ├── js/script.js        All behaviour (CONFIG block at the top of the file)
    └── images/
        ├── portrait.svg        Placeholder portrait (replace with your photo)
        ├── favicon.svg         Placeholder favicon
        └── project-1..6.svg    Placeholder project thumbnails
```

Every path is **relative**, so the site works from a subpath such as
`https://<user>.github.io/Portfolio.github.io/`.

## No libraries — what replaced what

The reference site loads 7 CDN libraries. This build reimplements each effect in
~400 lines of readable vanilla JS, so the site works offline, loads instantly,
and has nothing to keep updated:

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

## Make it yours — replace the placeholders

Everything you need to change is inside square brackets `[like this]`. Search
`index.html` for `[` and you'll find them all. The important ones:

1. **Name** — search for `[Your Name]` (header logo, hero, About, footer).
2. **Role & bio** — `[Your Role / Title]` and the two bracketed paragraphs in
   About. Keep them true; don't invent achievements.
3. **Email** — set it in **one** place: the top of `assets/js/script.js`:
   ```js
   var CONFIG = {
     email: "you@example.com",   // ← put your real email here
     ...
   };
   ```
   This wires up the Contact mail button *and* the contact form (which composes
   an email in the visitor's own mail app — the page itself never sends anything).
   The displayed placeholder text updates automatically.
4. **Location / availability** — `[Your City, Country]`, `[Your availability…]`.
5. **Typed text** — the hero's rotating words in `index.html`
   (`data-typed-strings='["…","…"]'`) or `CONFIG.typedStrings` in `script.js`.
6. **Skills** — replace the 16 `[Skill N]` tiles. Delete extra tiles or copy a
   `<li>` to add more; icons come from the sprite (`#i-skill-*`) — pick any
   symbol id or add your own.
7. **Experience & Education** — replace the `[Job Title …]`, `[Company Name]`,
   `[Degree …]` boxes; copy an `<article class="box">` for more.
8. **Projects** — for each of the 6 cards replace:
   - the thumbnail (`assets/images/project-N.svg`) with a real screenshot
     (PNG/JPG work fine — just change the `src`),
   - `[Project Title N]` and the description,
   - the two `href="#"` on **View** / **Code** with your live URL and repo URL,
     and delete the `data-placeholder-link` attribute from each (that attribute
     makes unedited links show a hint instead of navigating).
9. **Social links** — the LinkedIn/GitHub anchors are `href="#"` placeholders
   with `data-placeholder-link`; put your profile URLs in and remove the
   attribute. Same for the **Resume** button (link to your PDF).
10. **Portrait** — replace `assets/images/portrait.svg` with your photo
    (`portrait.jpg` etc., then update the two `<img src>` in hero + About).
11. **Favicon** — replace `assets/images/favicon.svg` (or swap in
    `favicon.png`/`favicon.ico` and update the `<link rel="icon">`).

> The `data-placeholder-link` attribute is a safety net: any link that still has
> it shows a toast "Placeholder link — put your real URL in index.html" instead
> of going nowhere. Remove it once the link is real.

## Preview locally

Any static file server works. For example:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000/

# or Node
npx serve .
```

Opening `index.html` directly in a browser (`file://`) also works, but a local
server is recommended so relative paths behave exactly like production.

## Publish on GitHub Pages

1. Create a repository named `Portfolio.github.io` (matches your reference
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
  and nothing is sent from the page itself (this is intentional; wiring a real
  form service like Formspree/EmailJS is easy if you want it later).

## Configuration cheat-sheet (`assets/js/script.js`)

```js
var CONFIG = {
  email: "",                             // your real email ("" = keep placeholder hint)
  typedStrings: ["…", "…", "…", "…"],    // hero rotating words
};
```

Everything else is plain HTML/CSS — no build step, no bundler, no secrets.

/**
 * Public-build stub for the sandboxed-page wrapper seam.
 *
 * The registered CompleteShelf source bundle ships only its four registered
 * files; `sandboxedPageDocument` is not among them, and neither the published
 * `@designcodeio/threeui` package nor the public MengTo/threeui repository
 * contains it. The wrapper it would build — a sandbox policy around an
 * authored document — is not invented here.
 *
 * Returning `undefined` leaves `srcDoc` empty, so the frame falls back to
 * loading the page from its own sourceUrl, which is the same graceful
 * behaviour as the other guarded builder seams. The only call site is in
 * TidecrestHero, and only after a Tidecrest document exists — which it never
 * does in this project — so CompleteShelfLandingPage never reaches it.
 */
export function buildSandboxedPageDocument(
  _source: string,
  _options: { presentation: "page" | "background"; canvasSelector: string },
): string | undefined {
  return undefined;
}

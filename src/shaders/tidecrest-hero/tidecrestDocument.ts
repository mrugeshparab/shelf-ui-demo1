/**
 * Public-build stub for the Tidecrest document seam.
 *
 * The registered CompleteShelf source bundle ships only its four registered
 * files, and LandingPages.tsx says so itself: "the packaged Tidecrest document
 * and its rewrites sit behind a module the public build guard stubs." Neither
 * the published `@designcodeio/threeui` package nor the public
 * MengTo/threeui repository contains this module, so no authored content is
 * invented here.
 *
 * `undefined` is exactly what the registered call site is written to tolerate
 * (`buildTidecrestDocument?.(...)`): the frame falls back to loading a page
 * from its own sourceUrl. Only TidecrestHero reaches this seam —
 * CompleteShelfLandingPage never does.
 */
export const buildTidecrestDocument:
  | ((variant?: string) => string | undefined)
  | undefined = undefined;

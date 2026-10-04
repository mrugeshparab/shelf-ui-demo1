/**
 * Public-build stub for the Betawise globe document seam.
 *
 * The registered CompleteShelf source bundle ships only its four registered
 * files; LandingPages.tsx marks this import with "And for the Betawise globe's
 * four other worlds" — another module the public build guard stubs. It is
 * absent from the published `@designcodeio/threeui` package and from the
 * public MengTo/threeui repository, so no authored world documents are
 * invented here.
 *
 * `undefined` matches the registered optional call
 * (`buildBetawiseGlobeDocument?.(safeVariant)`), so the base page loads from
 * its own sourceUrl. Only the Betawise globe entries reach this seam —
 * CompleteShelfLandingPage never does.
 */
export const buildBetawiseGlobeDocument:
  | ((variant?: string) => string | undefined)
  | undefined = undefined;

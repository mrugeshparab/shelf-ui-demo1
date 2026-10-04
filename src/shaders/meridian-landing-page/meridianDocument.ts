/**
 * Public-build stub for the Meridian document seam.
 *
 * The registered CompleteShelf source bundle ships only its four registered
 * files; LandingPages.tsx marks this import with "Same seam for Meridian's
 * three sibling bodies," i.e. another module the public build guard stubs.
 * It is absent from the published `@designcodeio/threeui` package and from
 * the public MengTo/threeui repository, so nothing is fabricated in its
 * place.
 *
 * `undefined` matches the registered optional call
 * (`buildMeridianDocument?.(safeVariant, presentation)`), so the frame falls
 * back to the page's own sourceUrl. Only MeridianLandingPage reaches this
 * seam — CompleteShelfLandingPage never does.
 */
export const buildMeridianDocument:
  | ((variant?: string, presentation?: string) => string | undefined)
  | undefined = undefined;

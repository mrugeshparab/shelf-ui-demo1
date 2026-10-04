/**
 * Public-build stub for the Nocturne scene seam.
 *
 * The registered CompleteShelf source bundle ships only its four registered
 * files; Nocturne's document builder and its variant list/title table are not
 * among them, and neither the published `@designcodeio/threeui` package nor
 * the public MengTo/threeui repository contains this module. No authored
 * titles or scene documents are invented here: only the default variant the
 * registered source itself names (`variant = "midnight"`) is declared, and
 * the builder returns `undefined` so `srcDoc` stays empty and the frame falls
 * back to the page's own sourceUrl.
 *
 * Only NocturneHero reaches this seam — CompleteShelfLandingPage never does.
 */
export const NOCTURNE_VARIANTS = ["midnight"] as const;

export type NocturneVariant = (typeof NOCTURNE_VARIANTS)[number];

/** Iframe title per variant; unpublished variants have no authored title. */
export const NOCTURNE_TITLES: Record<NocturneVariant, string> = {
  midnight: "Nocturne",
};

export function buildNocturneDocument(_variant: NocturneVariant): string | undefined {
  return undefined;
}

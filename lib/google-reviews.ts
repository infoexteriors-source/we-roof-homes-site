export type GoogleReview = {
  id: string;
  rating: number;
  text: string;
  author: string;
  authorUrl?: string;
  authorPhotoUrl?: string;
  published?: string;
  relativePublished?: string;
  url: string;
};

export type GoogleReviewsResult = {
  placeName: string;
  placeUrl: string;
  rating?: number;
  count?: number;
  reviews: GoogleReview[];
  attributions: { provider: string; url?: string }[];
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function httpsUrl(value: unknown, allowedHosts?: string[]): string | undefined {
  const raw = string(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return undefined;
    if (allowedHosts && !allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

const mapsHosts = ["google.com"];
const avatarHosts = ["googleusercontent.com", "ggpht.com", "gstatic.com"];

/** Keeps unverified or malformed API content out of the public review feed. */
export function parseGooglePlace(value: unknown): GoogleReviewsResult | null {
  const place = record(value);
  const placeName = string(record(place.displayName).text);
  const placeUrl = httpsUrl(place.googleMapsUri, mapsHosts);
  if (!placeName || !/we\s*roof/i.test(placeName) || !placeUrl) return null;

  const rating = typeof place.rating === "number" && place.rating >= 0 && place.rating <= 5 ? place.rating : undefined;
  const count = typeof place.userRatingCount === "number" && Number.isSafeInteger(place.userRatingCount) && place.userRatingCount >= 0 ? place.userRatingCount : undefined;
  const reviews = Array.isArray(place.reviews) ? place.reviews.flatMap((entry): GoogleReview[] => {
    const review = record(entry);
    const author = record(review.authorAttribution);
    const text = string(record(review.originalText).text) || string(record(review.text).text);
    const url = httpsUrl(review.googleMapsUri, mapsHosts);
    const authorName = string(author.displayName);
    const stars = review.rating;
    if (!text || !url || !authorName || typeof stars !== "number" || stars < 1 || stars > 5) return [];
    return [{
      id: string(review.name) || url,
      rating: stars,
      text,
      author: authorName,
      authorUrl: httpsUrl(author.uri, mapsHosts),
      authorPhotoUrl: httpsUrl(author.photoUri, avatarHosts),
      published: string(review.publishTime),
      relativePublished: string(review.relativePublishTimeDescription),
      url,
    }];
  }) : [];
  const attributions = Array.isArray(place.attributions) ? place.attributions.flatMap((entry) => {
    const item = record(entry);
    const provider = string(item.provider);
    return provider ? [{ provider, url: httpsUrl(item.providerUri) }] : [];
  }) : [];

  return { placeName, placeUrl, rating, count, reviews, attributions };
}

export async function getGoogleReviews(): Promise<GoogleReviewsResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId || !/^[A-Za-z0-9_-]{5,128}$/.test(placeId)) return null;

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "displayName,googleMapsUri,rating,userRatingCount,reviews,attributions",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return null;
    return parseGooglePlace(await response.json());
  } catch {
    return null;
  }
}

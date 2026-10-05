import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGooglePlace } from "../lib/google-reviews";

const valid = {
  displayName: { text: "WeRoof LLC" },
  googleMapsUri: "https://www.google.com/maps/place/example",
  rating: 4.8,
  userRatingCount: 37,
  reviews: [{
    name: "places/example/reviews/one",
    rating: 5,
    originalText: { text: "Clear communication and careful work." },
    authorAttribution: {
      displayName: "A homeowner",
      uri: "https://www.google.com/maps/contrib/example",
      photoUri: "https://lh3.googleusercontent.com/example",
    },
    googleMapsUri: "https://www.google.com/maps/reviews/example",
    relativePublishTimeDescription: "2 months ago",
  }],
};

test("accepts attributable reviews from the matching Google Maps listing", () => {
  const result = parseGooglePlace(valid);
  assert.equal(result?.placeName, "WeRoof LLC");
  assert.equal(result?.rating, 4.8);
  assert.equal(result?.count, 37);
  assert.equal(result?.reviews[0].text, "Clear communication and careful work.");
  assert.equal(result?.reviews[0].author, "A homeowner");
  assert.equal(result?.reviews[0].authorPhotoUrl, "https://lh3.googleusercontent.com/example");
});

test("does not attribute another company or unsafe review links to WeRoof", () => {
  assert.equal(parseGooglePlace({ ...valid, displayName: { text: "Another Roofer" } }), null);
  assert.equal(parseGooglePlace({ ...valid, googleMapsUri: "https://example.com/listing" }), null);
  const result = parseGooglePlace({ ...valid, reviews: [{ ...valid.reviews[0], googleMapsUri: "javascript:alert(1)" }] });
  assert.equal(result?.reviews.length, 0);
});

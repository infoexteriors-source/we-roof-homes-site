"use client";

import { useEffect, useState } from "react";
import type { GoogleReviewsResult } from "@/lib/google-reviews";

type FeedState = { status: "loading" } | { status: "unavailable" } | { status: "ready"; data: GoogleReviewsResult };

export function GoogleReviews() {
  const [feed, setFeed] = useState<FeedState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/google-reviews", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Reviews unavailable");
        return response.json() as Promise<GoogleReviewsResult & { available: boolean }>;
      })
      .then((data) => setFeed(data.available ? { status: "ready", data } : { status: "unavailable" }))
      .catch(() => { if (!controller.signal.aborted) setFeed({ status: "unavailable" }); });
    return () => controller.abort();
  }, []);

  if (feed.status === "loading") return <section className="google-reviews" aria-live="polite"><p>Current Google Maps reviews will appear here when available. You can also ask our team for customer references.</p></section>;
  if (feed.status === "unavailable") return <section className="google-reviews" aria-live="polite"><h2>Customer feedback</h2><p>Live Google Maps reviews are not available here right now. Ask our team for recent, attributable customer references.</p></section>;

  const { data } = feed;
  return (
    <section className="google-reviews" aria-labelledby="google-reviews-heading">
      <div className="google-reviews-head">
        <div>
          <p className="eyebrow">FROM HOMEOWNERS</p>
          <h2 id="google-reviews-heading">Reviews on Google Maps</h2>
          {data.rating !== undefined && <p className="google-rating"><strong>{data.rating.toFixed(1)}</strong><span className="google-rating-stars" aria-hidden="true">★★★★★</span>{data.count !== undefined && <span>from {data.count.toLocaleString("en-US")} ratings</span>}</p>}
        </div>
        <a className="google-all-link" href={data.placeUrl} target="_blank" rel="noopener noreferrer">See all on <span className="google-maps-attribution" translate="no">Google Maps</span> ↗</a>
      </div>
      <p className="google-reviews-order">Google returns up to five reviews here, ordered by relevance. These are not all reviews or necessarily the newest.</p>
      {data.reviews.length ? (
        <ol className="google-reviews-list">
          {data.reviews.map((review) => (
            <li key={review.id}>
              <div className="google-review-byline">
                {review.authorPhotoUrl ? <img src={review.authorPhotoUrl} alt="" width="42" height="42" referrerPolicy="no-referrer" /> : <span className="google-review-avatar" aria-hidden="true">{review.author.slice(0, 1).toUpperCase()}</span>}
                <div>
                  {review.authorUrl ? <a href={review.authorUrl} target="_blank" rel="noopener noreferrer">{review.author}</a> : <strong>{review.author}</strong>}
                  {review.relativePublished && <small>{review.relativePublished}</small>}
                </div>
                <span className="google-review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(Math.round(review.rating))}</span>
              </div>
              <p>{review.text}</p>
              <a className="google-review-source" href={review.url} target="_blank" rel="noopener noreferrer">Read this review on <span className="google-maps-attribution" translate="no">Google Maps</span> ↗</a>
            </li>
          ))}
        </ol>
      ) : <p>Google did not return individual reviews for this listing. You can see current feedback on Google Maps.</p>}
      {data.attributions.length > 0 && <p className="google-provider-attributions">Additional data providers: {data.attributions.map((item, index) => <span key={`${item.provider}-${index}`}>{index > 0 ? ", " : ""}{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.provider}</a> : item.provider}</span>)}</p>}
    </section>
  );
}

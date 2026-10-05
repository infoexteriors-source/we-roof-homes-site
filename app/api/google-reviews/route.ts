import { getGoogleReviews } from "@/lib/google-reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getGoogleReviews();
  return Response.json(data ? { available: true, ...data } : { available: false }, {
    status: data ? 200 : 503,
    headers: { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" },
  });
}

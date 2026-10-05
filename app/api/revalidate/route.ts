import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { secureEqual } from "@/lib/leads";
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (
    !secret ||
    !secureEqual(req.headers.get("authorization") || "", `Bearer ${secret}`)
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag("content", "max");
  return NextResponse.json({ revalidated: true });
}

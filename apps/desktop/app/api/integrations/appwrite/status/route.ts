import { NextResponse } from "next/server";
import { probeAppwriteIntegrationStatus } from "@/lib/integrations/appwrite/server";
import { toErrorResponse } from "@/lib/api";

export async function GET() {
  try {
    const status = await probeAppwriteIntegrationStatus();

    return NextResponse.json(status, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to check Appwrite status");
  }
}

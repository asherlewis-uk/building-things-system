import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/api";
import {
  connectRemoteIdentity,
  disconnectRemoteIdentity,
  getRemoteIdentityState,
} from "@/lib/services/identity";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const state = await getRemoteIdentityState(cookieStore);

    return NextResponse.json(state, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to load Appwrite session state");
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const state = await connectRemoteIdentity(cookieStore);

    return NextResponse.json(state, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to start Appwrite session");
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const state = await disconnectRemoteIdentity(cookieStore);

    return NextResponse.json(state, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error, "Failed to clear Appwrite session");
  }
}

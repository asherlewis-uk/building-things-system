import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson, toErrorResponse } from "@/lib/api";
import {
  applyConfigPatch,
  getResolvedConfig,
} from "@/lib/services/config";
import { resolveWorkspaceId } from "@/lib/services/workspaces";

type UpdateConfigBody = {
  workspace_id?: unknown;
  app?: Record<string, unknown>;
  workspace?: Record<string, unknown>;
};

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await resolveWorkspaceId(
      req.nextUrl.searchParams.get("workspace_id") ?? "active",
    );
    const config = await getResolvedConfig(workspaceId);
    return NextResponse.json(config);
  } catch (error) {
    return toErrorResponse(error, "Failed to load config");
  }
}

export async function PUT(req: Request) {
  try {
    const parsedBody = await parseRequestJson<UpdateConfigBody>(req);

    if (!parsedBody.success) {
      return parsedBody.response;
    }

    const workspaceId = await resolveWorkspaceId(parsedBody.data.workspace_id);
    const config = await applyConfigPatch(workspaceId, parsedBody.data);
    return NextResponse.json(config);
  } catch (error) {
    return toErrorResponse(error, "Failed to update config");
  }
}

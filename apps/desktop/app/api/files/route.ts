import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson, toErrorResponse } from "@/lib/api";
import { createFile, listFiles } from "@/lib/services/files";
import { resolveWorkspaceId } from "@/lib/services/workspaces";

type CreateFileBody = {
  workspace_id?: unknown;
  name?: unknown;
  path?: unknown;
  content?: unknown;
  type?: unknown;
};

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await resolveWorkspaceId(
      req.nextUrl.searchParams.get("workspace_id") ?? "active",
    );
    const files = await listFiles(workspaceId);
    return NextResponse.json(files);
  } catch (error) {
    return toErrorResponse(error, "Failed to load files");
  }
}

export async function POST(req: Request) {
  try {
    const parsedBody = await parseRequestJson<CreateFileBody>(req);

    if (!parsedBody.success) {
      return parsedBody.response;
    }

    const workspaceId = await resolveWorkspaceId(parsedBody.data.workspace_id);
    const file = await createFile({
      ...parsedBody.data,
      workspace_id: workspaceId,
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Failed to create file");
  }
}

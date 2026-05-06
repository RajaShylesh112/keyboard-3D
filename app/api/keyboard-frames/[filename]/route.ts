import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface RouteParams {
  params: {
    filename: string;
  };
}

// Base directory for frames, relative to the project root.
// This works both locally and on Vercel as long as the
// "keyboard-frames" folder is committed at the repo root.
const BASE_DIR = path.join(process.cwd(), "keyboard-frames");

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { filename } = params;

  // Basic sanitization: only allow simple filenames
  if (!/^[a-zA-Z0-9_.-]+$/.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(BASE_DIR, filename);

  try {
    const file = await fs.readFile(filePath);

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

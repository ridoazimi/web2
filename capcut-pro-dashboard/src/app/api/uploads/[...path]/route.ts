import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = await params;
    
    // Prevent directory traversal attacks
    const safePathSegments = pathArray.map(segment => path.basename(segment));
    const filePath = path.join(process.cwd(), "storage/uploads", ...safePathSegments);
    
    const fileBuffer = await readFile(filePath);
    
    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".gif") contentType = "image/gif";
    
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving uploaded file:", error);
    return new NextResponse("File not found", { status: 404 });
  }
}

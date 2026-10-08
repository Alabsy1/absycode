import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/audit";
import { IMAGE_BUCKET, MAX_IMAGE_BYTES, processImage, randomImageName, validateImageUpload } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse> {
  const { supabase } = await requireAdmin();

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return error("No file supplied", 400);
  if (!file.type.startsWith("image/")) return error("Expected an image file", 400);

  const buf = Buffer.from(await file.arrayBuffer());
  const validationError = validateImageUpload(buf, MAX_IMAGE_BYTES);
  if (validationError) return error(validationError, 400);

  let processed: Buffer;
  try {
    processed = await processImage(buf);
  } catch {
    return error("Could not decode the image", 400);
  }

  const path = `${new Date().toISOString().slice(0, 10)}/${randomImageName()}`;
  const { error: uploadError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, processed, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
  if (uploadError) return error(uploadError.message, 500);

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  try {
    await writeAuditLog(supabase, { action: "image_upload", target: path });
  } catch {
    // best effort
  }
  return NextResponse.json({ url: data.publicUrl, path });
}

function error(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
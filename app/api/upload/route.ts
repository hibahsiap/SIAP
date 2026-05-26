import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getSupabaseAdmin, DM_MEDIA_BUCKET } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const MAX_BYTES = 15 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 15 MB)" }, { status: 413 });
  }

  const supabase = getSupabaseAdmin();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  const ext = (file.name.split(".").pop() ?? mime.split("/")[1] ?? "bin").toLowerCase();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const path = `tickets/${fileName}`;

  const { error: upErr } = await supabase.storage
    .from(DM_MEDIA_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { data: pub } = supabase.storage.from(DM_MEDIA_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    url: pub.publicUrl,
    path,
    fileName,
    mimeType: mime,
    sizeBytes: bytes.byteLength,
  });
}

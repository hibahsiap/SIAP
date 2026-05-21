import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getSupabaseAdmin, DM_MEDIA_BUCKET } from "@/lib/supabaseAdmin";

// Route param is `ticketId` historically; it identifies a Conversation.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId: conversationId } = await params;

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true },
  });
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  // Hard cap so we don't accidentally accept multi-GB uploads from a misbehaving client.
  const MAX_BYTES = 15 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 15 MB)" }, { status: 413 });
  }

  const supabase = getSupabaseAdmin();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  const ext = (file.name.split(".").pop() ?? mime.split("/")[1] ?? "bin").toLowerCase();
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const path = `dm/${conversationId}/${fileName}`;

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

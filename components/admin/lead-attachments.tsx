"use client";

import { useRef, useState, type DragEvent } from "react";
import { useAdmin } from "@/components/admin/admin-shell";
import { PaperclipIcon, TrashIcon } from "@/components/admin/icons";
import {
  ATTACHMENT_COLUMNS,
  attachmentPath,
  formatBytes,
  fullDateTime,
  LEAD_FILES_BUCKET,
  MAX_ATTACHMENT_BYTES,
  memberName,
  type LeadAttachment,
} from "@/lib/leads";
import { getSupabase } from "@/lib/supabase-browser";

export async function fetchAttachments(leadId: string) {
  const { data, error } = await getSupabase()
    .from("lead_attachments")
    .select(ATTACHMENT_COLUMNS)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
  return { attachments: (data as LeadAttachment[] | null) ?? null, error: error?.message ?? null };
}

/** Uploads files to the private bucket and records them; a failed record removes its upload. */
export async function uploadLeadFiles(leadId: string, uploaderId: string, files: File[], noteId: string | null = null) {
  const supabase = getSupabase();
  const errors: string[] = [];
  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      errors.push(`${file.name} is larger than ${formatBytes(MAX_ATTACHMENT_BYTES)}.`);
      continue;
    }
    const path = attachmentPath(leadId, file.name);
    const { error: uploadError } = await supabase.storage
      .from(LEAD_FILES_BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
      continue;
    }
    const { error: insertError } = await supabase.from("lead_attachments").insert({
      lead_id: leadId,
      note_id: noteId,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: uploaderId,
    });
    if (insertError) {
      await supabase.storage.from(LEAD_FILES_BUCKET).remove([path]);
      errors.push(`${file.name}: ${insertError.message}`);
    }
  }
  return errors;
}

/** Removes every stored file of a lead, before the lead itself is deleted permanently. */
export async function removeLeadFiles(attachments: LeadAttachment[]) {
  if (!attachments.length) return null;
  const { error } = await getSupabase().storage.from(LEAD_FILES_BUCKET).remove(attachments.map((file) => file.storage_path));
  return error?.message ?? null;
}

async function openAttachment(file: LeadAttachment) {
  const { data, error } = await getSupabase().storage.from(LEAD_FILES_BUCKET).createSignedUrl(file.storage_path, 120, { download: file.file_name });
  if (error || !data) return window.alert(error?.message ?? "Couldn’t open this file.");
  window.open(data.signedUrl, "_blank", "noopener");
}

export function AttachmentChip({ file }: { file: LeadAttachment }) {
  return (
    <button
      type="button"
      onClick={() => openAttachment(file)}
      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#d4dbe7] bg-white px-2.5 py-1 text-xs font-medium text-[#1a4fb8] hover:border-[#1a63e8]"
      title={`Download ${file.file_name}`}
    >
      <PaperclipIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{file.file_name}</span>
      <span className="shrink-0 text-[#8090a8]">{formatBytes(file.size_bytes)}</span>
    </button>
  );
}

export function AttachmentsPanel({
  leadId,
  attachments,
  error,
  onChanged,
}: {
  leadId: string;
  attachments: LeadAttachment[];
  error: string | null;
  onChanged: () => Promise<void>;
}) {
  const { profile, team } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const names = new Map(team.map((member) => [member.id, memberName(member)]));

  async function upload(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    setProblems(await uploadLeadFiles(leadId, profile.id, files));
    setBusy(false);
    await onChanged();
  }

  async function remove(file: LeadAttachment) {
    if (!window.confirm(`Delete ${file.file_name}? This can't be undone.`)) return;
    const supabase = getSupabase();
    const { error: deleteError } = await supabase.from("lead_attachments").delete().eq("id", file.id);
    if (deleteError) return setProblems([deleteError.message]);
    await supabase.storage.from(LEAD_FILES_BUCKET).remove([file.storage_path]);
    await onChanged();
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void upload(Array.from(event.dataTransfer.files));
  }

  return (
    <div className="space-y-4 p-5 lg:p-7">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center text-sm ${dragging ? "border-[#1a63e8] bg-[#f3f7ff]" : "border-[#d4dbe7]"}`}
      >
        <PaperclipIcon className="h-7 w-7 text-[#9aa7bc]" />
        <p className="text-[#334155]">Drop proposals, briefs or quotes here</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded-lg bg-[#0b57d0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a4bb5] disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Choose files"}
        </button>
        <p className="text-xs text-[#8090a8]">Up to {formatBytes(MAX_ATTACHMENT_BYTES)} each. Only your team can open them.</p>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            void upload(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>

      {[...problems, ...(error ? [error] : [])].map((problem) => (
        <p key={problem} className="rounded-lg bg-[#fdecec] px-3 py-2 text-sm text-[#a12020]">
          {problem}
        </p>
      ))}

      {!attachments.length && !error ? <p className="py-4 text-center text-sm text-[#5b6b85]">No files yet.</p> : null}

      <ul className="divide-y divide-[#e6ebf2] rounded-xl border border-[#e6ebf2]">
        {attachments.map((file) => {
          const canDelete = file.uploaded_by === profile.id || profile.role === "admin";
          return (
            <li key={file.id} className="flex items-center gap-3 px-4 py-3">
              <PaperclipIcon className="h-4 w-4 text-[#5b6b85]" />
              <div className="min-w-0 flex-1">
                <button type="button" onClick={() => openAttachment(file)} className="block max-w-full truncate text-left text-sm font-semibold text-[#1a4fb8] hover:underline">
                  {file.file_name}
                </button>
                <p className="text-xs text-[#5b6b85]">
                  {formatBytes(file.size_bytes)} · {(file.uploaded_by && names.get(file.uploaded_by)) || "Team member"} · {fullDateTime(file.created_at)}
                </p>
              </div>
              {canDelete ? (
                <button type="button" aria-label={`Delete ${file.file_name}`} onClick={() => remove(file)} className="rounded-lg p-2 text-[#c62828] hover:bg-[#fdecec]">
                  <TrashIcon className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

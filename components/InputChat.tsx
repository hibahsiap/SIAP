"use client";

import { Plus, SendHorizontal, FileText, Image as ImageIcon, X, Pencil } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import FileAttachment from "./FileAttachment";
import { useChatStore } from "@/constants/chatStore";

interface AttachedFile {
  id: string;
  file: File;
  type: "document" | "photo";
}

const InputChat = () => {
  const [message, setMessage] = useState("");
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<AttachedFile[]>([]);

  const { editingMessage, clearEditingMessage, updateMessage } = useChatStore();
  const attachmentWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Saat mode edit aktif: isi input dengan pesan lama & fokus
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.originalMessage);
      inputRef.current?.focus();
    } else {
      setMessage("");
    }
  }, [editingMessage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        attachmentWrapperRef.current &&
        !attachmentWrapperRef.current.contains(event.target as Node)
      ) {
        setIsAttachmentOpen(false);
      }
    };

    if (isAttachmentOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAttachmentOpen]);

  const handleFileSelect = (file: File, type: "document" | "photo") => {
    const newFile: AttachedFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      type,
    };
    setSelectedFiles((prev) => [...prev, newFile]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCancelEdit = () => {
    clearEditingMessage();
    setMessage("");
  };

  const handleSendMessage = () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    if (editingMessage) {
        // ✅ Langsung update UI (optimistic)
        updateMessage(editingMessage.id, message);
        clearEditingMessage();

        // Kalau sudah ada backend, tambahkan di sini:
        // await fetch(`/api/messages/${editingMessage.id}`, {
        //   method: "PATCH",
        //   body: JSON.stringify({ message }),
        // });
    } else {
        console.log("Kirim pesan baru:", message);
    }

    setMessage("");
    setSelectedFiles([]);
    };

  const isEditMode = !!editingMessage;

  return (
    <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 z-40">

      {/* EDIT MODE BANNER */}
      {isEditMode && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-t border-blue-100 animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="flex items-center gap-2 text-blue-600">
            <Pencil size={13} />
            <span className="text-xs font-medium">Mengedit pesan OPD</span>
            <span className="text-xs text-blue-400 truncate max-w-[200px]">
              "{editingMessage?.originalMessage}"
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-blue-400 hover:text-blue-600 p-0.5 rounded-full hover:bg-blue-100 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="p-4">
        {/* FILE ATTACHMENT PREVIEW */}
        {selectedFiles.length > 0 && (
          <div className="mb-2.5 mx-1 flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-1 duration-150">
            {selectedFiles.map((fileObj) => (
              <div
                key={fileObj.id}
                className="flex items-center gap-2 bg-[#F1F5F9] border border-slate-200 rounded-lg pl-2.5 pr-1.5 py-1 w-44 max-w-xs text-xs"
              >
                <div className="text-slate-500 shrink-0">
                  {fileObj.type === "photo" ? (
                    <ImageIcon size={14} />
                  ) : (
                    <FileText size={14} />
                  )}
                </div>
                <span className="font-semibold text-slate-700 truncate flex-1 min-w-0">
                  {fileObj.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(fileObj.id)}
                  className="text-slate-400 hover:text-red-500 p-0.5 rounded-full hover:bg-slate-200/80 transition-colors shrink-0"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className={`flex items-center gap-3 border rounded-full px-4 py-2 relative transition-colors ${
            isEditMode
              ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          {/* ATTACHMENT BUTTON — disembunyikan saat edit mode */}
          {!isEditMode && (
            <div ref={attachmentWrapperRef} className="relative flex items-center">
              <button
                type="button"
                onClick={() => setIsAttachmentOpen((prev) => !prev)}
                className={`transition-colors rounded-full p-1 ${
                  isAttachmentOpen
                    ? "text-slate-600 bg-gray-200/50"
                    : "text-gray-400 hover:text-slate-600"
                }`}
              >
                <Plus size={20} />
              </button>

              {isAttachmentOpen && (
                <div className="absolute left-0 bottom-full mb-3 z-50">
                  <FileAttachment
                    isOpen={isAttachmentOpen}
                    onClose={() => setIsAttachmentOpen(false)}
                    onFileSelect={handleFileSelect}
                  />
                </div>
              )}
            </div>
          )}

          {/* Edit mode icon pengganti tombol Plus */}
          {isEditMode && (
            <Pencil size={16} className="text-blue-400 shrink-0" />
          )}

          {/* INPUT TEKS */}
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
              if (e.key === "Escape" && isEditMode) handleCancelEdit();
            }}
            placeholder={isEditMode ? "Edit pesan..." : "Type a response..."}
            className={`flex-1 bg-transparent outline-none text-sm placeholder-gray-400 ${
              isEditMode ? "text-blue-800" : "text-slate-800"
            }`}
          />

          {/* TOMBOL SEND */}
          <button
            onClick={handleSendMessage}
            className={`p-2 rounded-full text-white active:scale-95 transition-all flex-shrink-0 ${
              isEditMode
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-[#1e293b] hover:bg-slate-800"
            }`}
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputChat;
"use client"

import { Plus, SendHorizontal, FileText, Image as ImageIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import FileAttachment from "./FileAttachment"; 

// Definisikan struktur objek file baru
interface AttachedFile {
    id: string;
    file: File;
    type: "document" | "photo";
}

const InputChat = () => {
    const [message, setMessage] = useState("");
    const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
    
    // UBAH KE ARRAY: State untuk menampung banyak file sekaligus
    const [selectedFiles, setSelectedFiles] = useState<AttachedFile[]>([]);

    const attachmentWrapperRef = useRef<HTMLDivElement>(null);

    // Event listener untuk klik di luar area popup menu
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

    // Fungsi menangani file masuk (ditambahkan ke array)
    const handleFileSelect = (file: File, type: "document" | "photo") => {
        const newFile: AttachedFile = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            type
        };
        setSelectedFiles((prev) => [...prev, newFile]);
    };

    // Fungsi untuk menghapus salah satu file dari daftar lampiran
    const removeFile = (id: string) => {
        setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleSendMessage = () => {
        if (!message.trim() && selectedFiles.length === 0) return;

        console.log("Mengirim pesan:", message);
        console.log("Daftar file yang dikirim:", selectedFiles.map(f => f.file));

        // Proses ke API backend kamu di sini...

        setMessage("");
        setSelectedFiles([]); // Reset lampiran berkas
    };

    return (
        <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 z-40">
            
            {/* MULTIPLE ATTACHMENT PREVIEW BAR (Berjejer ke samping, minimalis & hemat ruang) */}
            {selectedFiles.length > 0 && (
                <div className="mb-2.5 mx-1 flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-1 duration-150">
                    {selectedFiles.map((fileObj) => (
                        <div 
                            key={fileObj.id} 
                            className="flex items-center gap-2 bg-[#F1F5F9] border border-slate-200 rounded-lg pl-2.5 pr-1.5 py-1 w-44 max-w-xs text-xs"
                        >
                            {/* Logo Attach Icon */}
                            <div className="text-slate-500 shrink-0">
                                {fileObj.type === "photo" ? <ImageIcon size={14} /> : <FileText size={14} />}
                            </div>
                            
                            {/* Nama File */}
                            <span className="font-semibold text-slate-700 truncate flex-1 min-w-0">
                                {fileObj.file.name}
                            </span>
                            
                            {/* Tombol Hapus Silang Kecil */}
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

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 relative">
                
                {/* CONTAINER RELATIVE UNTUK ATTACHMENT */}
                <div ref={attachmentWrapperRef} className="relative flex items-center">
                    <button 
                        type="button"
                        onClick={() => setIsAttachmentOpen((prev) => !prev)}
                        className={`transition-colors rounded-full p-1 ${
                            isAttachmentOpen ? "text-slate-600 bg-gray-200/50" : "text-gray-400 hover:text-slate-600"
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

                {/* INPUT TEKS UTAMA */}
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a response..." 
                    className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder-gray-400"
                />

                {/* TOMBOL SEND */}
                <button 
                  onClick={handleSendMessage}
                  className="bg-[#1e293b] p-2 rounded-full text-white hover:bg-slate-800 active:scale-95 transition-all flex-shrink-0"
                >
                    <SendHorizontal size={18} />
                </button>
            </div>
        </div>
    )
}

export default InputChat;
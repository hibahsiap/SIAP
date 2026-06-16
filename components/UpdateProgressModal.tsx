'use client';

import React, { useState, useEffect } from 'react';
import { X, Paperclip, CheckCircle2, Loader2, File } from 'lucide-react';

interface Task {
  id: string;
  taskName: string;
}

interface UpdateProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSave: (data: { files: File[]; description: string }) => void;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
}

export default function UpdateProgressModal({ isOpen, onClose, task, onSave }: UpdateProgressModalProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [description, setDescription] = useState('');
  const maxCharacters = 300;

  // Efek simulasi progress upload otomatis 100% saat file masuk
  useEffect(() => {
    const timer = setInterval(() => {
      setFiles((prevFiles) =>
        prevFiles.map((f) => {
          if (f.progress < 100) {
            const nextProgress = f.progress + Math.floor(Math.random() * 30) + 15;
            return { ...f, progress: nextProgress > 100 ? 100 : nextProgress };
          }
          return f;
        })
      );
    }, 200);

    return () => clearInterval(timer);
  }, [files]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    onSave({
      files: files.map((f) => f.file),
      description,
    });
    // Reset state form setelah submit (hasil sukses/gagal ditangani pemanggil)
    setFiles([]);
    setDescription('');
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    return parseFloat((bytes / k).toFixed(0)) + ' KB';
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-2xl shadow-2xl overflow-hidden flex flex-col border border-neutral-100">
        
        {/* Header Modal */}
        <div className="bg-[#F4F7FA] p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#041942]">Update Progress</h2>
          <button 
            onClick={onClose} 
            className="text-neutral-700 hover:text-black transition-colors p-1 rounded-lg hover:bg-neutral-200"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-4 flex flex-col gap-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
          
          {/* List Uploaded Files */}
          <div className="space-y-4">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="relative bg-[#F9FBFC] border border-neutral-100 rounded-xl px-5 py-3 flex flex-col gap-3">
                <button 
                  onClick={() => removeFile(fileObj.id)} 
                  className="absolute top-3 right-3 text-neutral-400 hover:text-red-500 p-1 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white border border-neutral-200 p-3 rounded-[8px] text-neutral-400 shadow-sm shrink-0">
                      <File size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-black">{fileObj.file.name}</p>
                      <p className="text-xs font-medium text-neutral-400 tracking-wide uppercase">{formatSize(fileObj.file.size)}</p>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="shrink-0">
                    {fileObj.progress === 100 ? (
                      <div className="w-9 h-8 bg-[#10B981] text-white flex items-center justify-center rounded-[8px] shadow-sm mr-4">
                        <CheckCircle2 size={16} strokeWidth={3} />
                      </div>
                    ) : (
                      <Loader2 size={16} className="animate-spin text-[#D1A3F7] mr-4" />
                    )}
                  </div>
                </div>

                {/* Progress Bar Layout */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 ease-out"
                      style={{ width: `${fileObj.progress}%`, backgroundColor: '#D1A3F7' }}
                    />
                  </div>
                  <span className="text-xs font-medium text-neutral-400 w-10 text-right">{fileObj.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Trigger Tambah File */}
          <div>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-neutral-200 hover:border-neutral-400 bg-[#FAFAFA] hover:bg-neutral-50 px-4 py-4 rounded-xl cursor-pointer transition-all text-xs font-bold text-neutral-500 tracking-wider">
              <Paperclip size={16} />
              TAMBAH BUKTI FOTO / FILE
              <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
            </label>
          </div>

          {/* Form Deskripsi */}
          <div className="flex flex-col gap-2">
            <label className="text-lg font-semibold text-black flex items-center">
              Description<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="border border-neutral-200 rounded-[8px] overflow-hidden bg-white focus-within:border-neutral-400 transition-colors">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, maxCharacters))}
                placeholder="Write description about the task progress......"
                className="w-full text-sm p-4 min-h-[100px] outline-none resize-none text-neutral-800 placeholder-neutral-400 font-medium leading-relaxed custom-scrollbar"
              />
              <div className="px-4 py-1 bg-white text-right text-xs text-neutral-400 font-semibold tracking-wide">
                {description.length}/{maxCharacters} Characters
              </div>
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="px-4 py-2 mb-2 bg-white flex justify-end">
          <button
            onClick={handleSave}
            disabled={description.trim() === '' || files.some(f => f.progress < 100)}
            className="bg-[#041942] hover:bg-[#162a54] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-[10px] font-medium tracking-widest px-6 py-3 rounded-[8px] transition-all uppercase"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
import { FolderOpen, FileCheck, Folder, File, FileText, PlaySquare } from "lucide-react"

interface EmptyStateProps {
  title: string;
  description: React.ReactNode;
  actionButton?: React.ReactNode;
  icon?: React.ReactNode; 
}

export default function EmptyState({ title, description, actionButton, icon }: EmptyStateProps) {
  return (
    // Menggunakan min-h-[calc(100vh-240px)] agar posisinya otomatis dead-center lurus di tengah layar
    <div className="flex flex-col items-center justify-center w-full py-12 min-h-[calc(100vh-240px)] px-4 text-center font-sans">
     
          {icon ? (
            <div className="mb-6 opacity-80">{icon}</div>
          ) : (
            <div className="relative w-56 h-56 flex items-center justify-center mb-6">

              <div className="absolute inset-0 border-[1.5px] border-navy-200/60 rounded-full"></div>
              <div className="absolute inset-8 border-[1.5px] border-navy-200/40 rounded-full"></div>
              <div className="absolute inset-16 border-[1.5px] border-navy-200/20 rounded-full"></div>
              
              <div className="z-10 bg-transparent p-2">
                <FolderOpen className="w-14 h-14 text-navy-300" strokeWidth={1} />
              </div>
              
              <div className="absolute top-[18%] left-[16%] text-navy-300">
                <FileCheck className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="absolute top-[10%] right-[20%] text-navy-300">
                <Folder className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="absolute top-[35%] right-[8%] text-navy-300">
                <File className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="absolute bottom-[20%] right-[16%] text-navy-300">
                <FileText className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div className="absolute bottom-[5%] left-[45%] text-navy-300">
                <File className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div className="absolute top-[50%] left-[3%] text-navy-300">
                <PlaySquare className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </div>
          )}

          <h3 className="text-[22px] font-bold text-navy-400 mb-2">{title}</h3>
          <p className="text-[15px] text-gray-400 max-w-sm leading-relaxed font-medium">
            {description}
          </p>
          
          {actionButton && <div className="mt-6">{actionButton}</div>}
        </div>
  )
}
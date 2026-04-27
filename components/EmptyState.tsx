import { FolderOpen, FileCheck, Folder, File, FileText, PlaySquare } from "lucide-react"

interface EmptyStateProps {
  title: string;
  description: React.ReactNode;
  actionButton?: React.ReactNode;
  icon?: React.ReactNode; 
}

export default function EmptyState({ title, description, actionButton, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full py-10 min-h-[400px]">
     
      {icon ? (
        <div className="mb-6 opacity-80">{icon}</div>
      ) : (
        <div className="relative w-56 h-56 flex items-center justify-center mb-4">
          <div className="absolute inset-0 border-[1.5px] border-gray-100 rounded-full"></div>
          <div className="absolute inset-8 border-[1.5px] border-gray-100 rounded-full"></div>
          <div className="absolute inset-16 border-[1.5px] border-gray-100 rounded-full"></div>
          <div className="z-10 bg-white p-2 rounded-full">
            <FolderOpen className="w-14 h-14 text-black fill-white" strokeWidth={1} />
          </div>
          <div className="absolute top-[18%] left-[16%] bg-white p-1">
            <FileCheck className="w-5 h-5 text-black" strokeWidth={1.5} />
          </div>
          <div className="absolute top-[10%] right-[20%] bg-white p-1">
            <Folder className="w-5 h-5 text-black" strokeWidth={1.5} />
          </div>
          <div className="absolute top-[35%] right-[8%] bg-white p-1">
            <File className="w-4 h-4 text-black" strokeWidth={1.5} />
          </div>
          <div className="absolute bottom-[20%] right-[16%] bg-white p-1.5">
            <FileText className="w-6 h-6 text-black fill-white" />
          </div>
          <div className="absolute bottom-[5%] left-[45%] bg-white p-1">
            <File className="w-4 h-4 text-black" strokeWidth={1.5} />
          </div>
          <div className="absolute top-[50%] left-[3%] bg-white p-1">
            <PlaySquare className="w-6 h-6 text-black" strokeWidth={1.5} />
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900 mt-2">{title}</h3>
      <p className="text-[14px] text-gray-400 mt-2 text-center max-w-sm leading-relaxed">
        {description}
      </p>
      
      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  )
}
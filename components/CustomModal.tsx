import { ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  isAlert?: boolean;
}

export default function CustomModal({ isOpen, onClose, title, children, isAlert = false }: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={
          isAlert
            ? "w-[calc(100%-2rem)] sm:max-w-[400px] max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white rounded-2xl flex flex-col items-center text-center"
            : "w-[calc(100%-2rem)] sm:max-w-[450px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white rounded-xl"
        }
      >
        <DialogHeader className={isAlert ? "w-full flex flex-col items-center" : "mb-4"}>
          <DialogTitle className={isAlert ? "text-2xl font-bold text-gray-900 mb-2" : "text-xl font-bold text-[#1a233a]"}>
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        
        {children}

      </DialogContent>
    </Dialog>
  )
}
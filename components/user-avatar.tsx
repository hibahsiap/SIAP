import { Button } from "@/components/ui/button";

export function UserAvatar({ src }: { src: string }) {
  return (
    <div className="flex items-center gap-6">
      {/* Avatar */}
      <img 
        src={src} 
        alt="Profile" 
        className="w-24 h-24 rounded-full object-cover border border-gray-200" 
      />
      
      {/* Container untuk tombol dan teks */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button 
            variant="default" 
            className="text-[11px] font-bold uppercase h-9 px-4 bg-[#1D2F58] hover:bg-[#041942] rounded-md tracking-wide"
          >
            UPLOAD NEW PHOTO
          </Button>
          <Button 
            variant="secondary" 
            className="text-[11px] font-bold uppercase h-9 px-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md tracking-wide"
          >
            RESET
          </Button>
        </div>
        <p className="text-[11px] text-gray-500 font-medium">
          Allowed JPG or PNG. Max size 1 TB
        </p>
      </div>
    </div>
  );
}
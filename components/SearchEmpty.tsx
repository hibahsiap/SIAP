import { ClipboardX, TicketX, MessageSquareX, UserX } from 'lucide-react';

interface SearchEmptyStateProps {
  searchQuery?: string;
  type?: 'pending' | 'all' | 'aspirations' | 'user';
}

export default function SearchEmptyState({ searchQuery, type = 'pending' }: SearchEmptyStateProps) {
  let IconComponent = ClipboardX;
  let title = "No Task Found";
  let description = "Try different keywords or clear filters.";

  if (type === 'all') {
    IconComponent = TicketX;
    title = "No Tickets Found";
    description = "There are no tickets found matching your search.";
  } else if (type === 'aspirations') {
    IconComponent = MessageSquareX;
    title = "No Task Found"; 
    description = "Try different keywords or clear filters.";
  } else if (type === 'user') { 
    IconComponent = UserX;
    title = "No Users Found";
    description = "We couldn't find any users matching your search criteria.";
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full py-32 px-4 text-center bg-white rounded-xl">
      
      {/* Wrapper Ilustrasi */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute w-40 h-32 bg-gray-100/50 rounded-full blur-xl transform -rotate-12"></div>
        <div className="absolute w-32 h-32 bg-gray-50 rounded-[40px] transform rotate-12 right-[-20px] top-[-10px]"></div>
        
        {/* Ikon Utama */}
        <IconComponent 
          size={140} 
          strokeWidth={1} 
          className="text-gray-300 relative z-10" 
        />
        
        {/* Hiasan Tanda Plus kecil di sekitar (seperti di gambarmu) */}
        <span className="absolute top-0 left-[-20px] text-gray-300 text-xl font-light">+</span>
        <span className="absolute bottom-10 right-[-30px] text-gray-300 text-xl font-light">+</span>
      </div>

      <h3 className="text-[22px] font-bold text-gray-400 mb-2">{title}</h3>
      <p className="text-[15px] text-gray-400 max-w-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
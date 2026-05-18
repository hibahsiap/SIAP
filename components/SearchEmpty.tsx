import { ClipboardX, TicketX, MessageSquareX, UserX, SearchX } from 'lucide-react';

interface SearchEmptyStateProps {
  searchQuery?: string;
  type?: 'kanban' | 'pending' | 'all' | 'aspirations' | 'user' | 'opd' | 'category';
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
  } else if (type === 'opd') { 
    IconComponent = UserX;
    title = "No OPD Found";
    description = "We couldn't find any OPD matching your search criteria.";
  } else if (type === 'category') { 
    IconComponent = SearchX;
    title = "No Categories Found";
    description = "We couldn't find any category matching your search criteria.";
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-240px)] px-4 text-center font-sans">
      
      {/* Wrapper Ilustrasi */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-40 h-32 bg-gray-200/30 rounded-full blur-xl transform -rotate-12"></div>
        
        {/* Ikon Utama */}
        <IconComponent 
          size={140} 
          strokeWidth={1} 
          className="text-gray-300 relative z-10" 
        />
        
        {/* Hiasan Tanda Plus kecil */}
        <span className="absolute top-0 left-[-20px] text-gray-300 text-xl font-light">+</span>
        <span className="absolute bottom-10 right-[-30px] text-gray-300 text-xl font-light">+</span>
      </div>

      <h3 className="text-[22px] font-bold text-gray-400 mb-2">{title}</h3>
      <p className="text-[15px] text-gray-400 max-w-sm leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
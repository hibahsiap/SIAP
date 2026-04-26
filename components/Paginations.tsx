interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Hitung range data yang ditampilkan
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center text-xs text-gray-500 rounded-b-lg">
      <p>Showing {startItem}-{endItem} of {totalItems} items</p>
      
      <div className="flex gap-1">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {"<"}
        </button>
        
        {pages.map((page) => (
          <button 
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-3 border rounded ${
              currentPage === page ? 'bg-[#041942] text-white' : 'hover:bg-gray-200'
            }`}
          >
            {page}
          </button>
        ))}

        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50"
        >
          {">"}
        </button>
      </div>
    </div>
  );
};
export const Badge = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode, 
  className?: string 
}) => (
  <span className={`px-1 py-1 rounded text-[11px] font-medium whitespace-nowrap ${className}`}>
    {children}
  </span>
);
interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface InteractionTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  activeColor?: string; // Untuk custom warna saat aktif
}

export const InteractionTabs = ({ 
  tabs, 
  activeTab, 
  onChange, 
  activeColor = "bg-[#0D1B3E] text-white border-[#0D1B3E]" 
}: InteractionTabsProps) => (
  <div className="flex gap-2 items-center overflow-x-auto pb-1 no-scrollbar">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-2 py-2 rounded-[4px] text-xs 2xl:text-sm font-bold transition-all border whitespace-nowrap ${
            isActive 
              ? activeColor 
              : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {tab.icon && tab.icon}
          {tab.label}
        </button>
      );
    })}
  </div>
);
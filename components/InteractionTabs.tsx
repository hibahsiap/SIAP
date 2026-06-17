interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

interface InteractionTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  activeColor?: string; // Untuk custom warna saat aktif
  containerClassName?: string;
  tabClassName?: string;
}

export const InteractionTabs = ({
  tabs,
  activeTab,
  onChange,
  activeColor = "bg-[#0D1B3E] text-white border-[#0D1B3E]",
  containerClassName = "flex flex-wrap gap-2 items-center pb-1",
  tabClassName = ""
}: InteractionTabsProps) => (
  <div className={containerClassName}>
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center justify-center gap-1 px-1 md:px-2 py-2 rounded-[4px] text-[10px] xl:text-xs 2xl:text-sm font-semibold transition-all border whitespace-nowrap ${isActive
            ? activeColor
            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            } ${tab.className || tabClassName}`}
        >
          {tab.icon && tab.icon}
          <span>{tab.label}</span>
        </button>
      );
    })}
  </div>
);
interface TabOption {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const InteractionTabs = ({ tabs, activeTab, onChange }: TabsProps) => (
  <div className="flex gap-2">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-4 py-1.5 rounded text-sm font-medium capitalize transition-colors ${
          activeTab === tab.id 
            ? 'bg-gray-200 text-gray-800' 
            : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
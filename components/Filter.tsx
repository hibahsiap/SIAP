"use client";

import React, { useState, useMemo } from "react";
import { X, Plus, Minus, Search, ChevronLeft, ChevronRight } from "lucide-react";

export type FilterState = {
  opds: string[];
  classifications: string[];
  issues: string[];
  priorities: string[];
  rangeTime: string;
};

type FilterSidebarProps = {
  admin?: boolean;
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState; 
  onApply: (filters: FilterState) => void;
};

// Data Dummy untuk Search
const OPD_LIST = [
  "Dinas Sosial",
  "Dinas Komunikasi dan Informatika",
  "Dinas Kearsipan dan Perpustakaan",
  "Dinas Kesehatan",
  "Dinas Pendidikan",
  "Dinas Perhubungan",
  "Dinas Pekerjaan Umum",
];

const ISSUE_LIST = [
  "Social",
  "Health",
  "Traffic",
  "Infrastructure",
  "Public Service",
  "Environment",
];

const CLASSIFICATIONS = ["To Do", "In Progress", "Done", "On Hold", "Canceled"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function FilterSidebar({ admin, isOpen, onClose, filterState, onApply }: FilterSidebarProps) {
  // 1. State untuk Accordion (Default False / Tertutup semua)
  const [isOpdOpen, setIsOpdOpen] = useState(false);
  const [isClassificationOpen, setIsClassificationOpen] = useState(false);
  const [isIssueTypeOpen, setIsIssueTypeOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isRangeTimeOpen, setIsRangeTimeOpen] = useState(false);

  // 2. State untuk Search Input
  const [opdQuery, setOpdQuery] = useState("");
  const [issueQuery, setIssueQuery] = useState("");

  // 3. State untuk Pilihan yang Aktif (Selected)
  // const [selectedOpds, setSelectedOpds] = useState<string[]>([]);

  const [localFilters, setLocalFilters] = useState<FilterState>(filterState);

  React.useEffect(() => {
    if (isOpen) setLocalFilters(filterState);
  }, [isOpen, filterState]);

  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<string[]>(["Canceled"]); // Default contoh
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(["Medium"]); // Default contoh
  const [selectedRange, setSelectedRange] = useState<string>("");

  // Helper function untuk toggle pilihan (Multi-select)
  // const toggleSelection = (item: string, state: string[], setState: React.Dispatch<React.SetStateAction<string[]>>) => {
  //   if (state.includes(item)) {
  //     setState(state.filter((i) => i !== item));
  //   } else {
  //     setState([...state, item]);
  //   }
  // };

  const toggleSelection = (item: string, key: keyof Pick<FilterState, 'opds' | 'classifications' | 'issues' | 'priorities'>) => {
    setLocalFilters(prev => {
      const current = prev[key] as string[];
      return {
        ...prev,
        [key]: current.includes(item) ? current.filter(i => i !== item) : [...current, item],
      };
    });
  };

  // Helper untuk membersihkan semua filter
  // const handleClear = () => {
  //   setSelectedOpds([]);
  //   setSelectedIssues([]);
  //   setSelectedClassifications([]);
  //   setSelectedPriorities([]);
  //   setSelectedRange("");
  //   setOpdQuery("");
  //   setIssueQuery("");
  // };

  const handleClear = () => {
    setLocalFilters({ opds: [], classifications: [], issues: [], priorities: [], rangeTime: "" });
    setOpdQuery("");
    setIssueQuery("");
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  // Filter List berdasarkan Search Query
  const filteredOpds = useMemo(() => 
    OPD_LIST.filter(opd => opd.toLowerCase().includes(opdQuery.toLowerCase())),
  [opdQuery]);

  const filteredIssues = useMemo(() => 
    ISSUE_LIST.filter(issue => issue.toLowerCase().includes(issueQuery.toLowerCase())),
  [issueQuery]);

  return (
    <>
      {/* Background Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#eef0f4] border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Filters</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-white">
          
          {/* --- Section OPD --- */}
          {admin && (
            <div>
              <button
                onClick={() => setIsOpdOpen(!isOpdOpen)}
                className="w-full flex justify-between items-center px-6 py-4 bg-[#f4f5f7] border-b border-white hover:bg-slate-200 transition"
              >
                <span className="font-bold text-sm text-slate-800">OPD</span>
                {isOpdOpen ? <Minus className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
              </button>
              {isOpdOpen && (
                <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search OPD..."
                      value={opdQuery}
                      onChange={(e) => setOpdQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col text-sm text-slate-700 max-h-40 overflow-y-auto">
                    {filteredOpds.length > 0 ? (
                      filteredOpds.map((opd) => (
                        <button
                          key={opd}
                          onClick={() => toggleSelection(opd, 'opds')}
                          className={`text-left px-3 py-2 rounded transition ${
                            localFilters.opds.includes(opd) ? "bg-[#0b1736] text-white font-medium" : "hover:bg-slate-50"
                          }`}
                        >
                          {opd}
                        </button>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic px-2 py-2">OPD tidak ditemukan</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Section Classification --- */}
          <div>
            <button
              onClick={() => setIsClassificationOpen(!isClassificationOpen)}
              className="w-full flex justify-between items-center px-6 py-4 bg-[#f4f5f7] border-b border-white hover:bg-slate-200 transition"
            >
              <span className="font-bold text-sm text-slate-800">Clasification</span>
              {isClassificationOpen ? <Minus className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
            </button>
            {isClassificationOpen && (
              <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 bg-white">
                {CLASSIFICATIONS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleSelection(item, 'classifications')}
                    className={`px-4 py-1.5 rounded text-sm transition ${
                      localFilters.classifications.includes(item)
                        ? "bg-[#0b1736] text-white border border-[#0b1736]"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- Section Issue Type --- */}
          <div>
            <button
              onClick={() => setIsIssueTypeOpen(!isIssueTypeOpen)}
              className="w-full flex justify-between items-center px-6 py-4 bg-[#f4f5f7] border-b border-white hover:bg-slate-200 transition"
            >
              <span className="font-bold text-sm text-slate-800">Issue Type</span>
              {isIssueTypeOpen ? <Minus className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
            </button>
            {isIssueTypeOpen && (
              <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Issue..."
                    value={issueQuery}
                    onChange={(e) => setIssueQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col text-sm text-slate-700 max-h-40 overflow-y-auto">
                  {filteredIssues.length > 0 ? (
                    filteredIssues.map((issue) => (
                      <button
                        key={issue}
                        onClick={() => toggleSelection(issue, 'issues')}
                        className={`text-left px-3 py-2 rounded transition ${
                          localFilters.issues.includes(issue) ? "bg-[#0b1736] text-white font-medium" : "hover:bg-slate-50"
                        }`}
                      >
                        {issue}
                      </button>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic px-2 py-2">Issue tidak ditemukan</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* --- Section Priority --- */}
          <div>
            <button
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              className="w-full flex justify-between items-center px-6 py-4 bg-[#f4f5f7] border-b border-white hover:bg-slate-200 transition"
            >
              <span className="font-bold text-sm text-slate-800">Priority</span>
              {isPriorityOpen ? <Minus className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
            </button>
            {isPriorityOpen && (
              <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 bg-white">
                {PRIORITIES.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleSelection(item, 'priorities')}
                    className={`px-5 py-1.5 rounded text-sm transition ${
                      localFilters.priorities.includes(item)
                        ? "bg-[#0b1736] text-white border border-[#0b1736]"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- Section Range Time --- */}
          <div>
            <button
              onClick={() => setIsRangeTimeOpen(!isRangeTimeOpen)}
              className="w-full flex justify-between items-center px-6 py-4 bg-[#f4f5f7] border-b border-white hover:bg-slate-200 transition"
            >
              <span className="font-bold text-sm text-slate-800">Range Time</span>
              {isRangeTimeOpen ? <Minus className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
            </button>
            {isRangeTimeOpen && (
              <div className="flex flex-col text-sm text-slate-700 bg-white">
                {["Today", "This Week", "This Month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setLocalFilters(prev => ({ ...prev, rangeTime: prev.rangeTime === range ? "" : range }))}
                    className={`text-left px-6 py-3 border-b border-slate-100 transition ${
                      localFilters.rangeTime === range ? "bg-[#0b1736] text-white" : "hover:bg-slate-50"
                    }`}
                  >
                    {range}
                  </button>
                ))}
                
                {/* Custom Range with Calendar Mockup */}
                {/* <div className="p-6 border-b border-slate-100">
                  <p className="font-bold text-slate-800 mb-3">Custom Range</p>
                  <div className="border border-slate-200 rounded-xl p-4 w-64 shadow-sm bg-white">
                    <div className="flex justify-between items-center mb-4 text-xs font-semibold">
                      <ChevronLeft className="w-4 h-4 cursor-pointer text-slate-500" />
                      <div className="flex gap-2">
                        <select className="border border-slate-200 rounded px-2 py-1 outline-none bg-white text-slate-700 cursor-pointer">
                          <option>Sep</option>
                        </select>
                        <select className="border border-slate-200 rounded px-2 py-1 outline-none bg-white text-slate-700 cursor-pointer">
                          <option>2025</option>
                        </select>
                      </div>
                      <ChevronRight className="w-4 h-4 cursor-pointer text-slate-500" />
                    </div>
                    <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 font-medium mb-3">
                      <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs gap-y-2">
                      <div className="text-transparent">0</div><div className="text-transparent">0</div>
                      {[1,2,3,4,5,6,7,8].map(d => <div key={d} className="cursor-pointer hover:bg-slate-100 rounded-full py-1">{d}</div>)}
                      <div className="cursor-pointer bg-[#0b1736] text-white rounded-full py-1">9</div>
                      {[10,11,12].map(d => <div key={d} className="cursor-pointer hover:bg-slate-100 rounded-full py-1">{d}</div>)}
                      <div className="cursor-pointer bg-[#0b1736] text-white rounded-full py-1">13</div>
                      {[14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(d => <div key={d} className="cursor-pointer hover:bg-slate-100 rounded-full py-1">{d}</div>)}
                      <div className="text-slate-300 py-1">1</div><div className="text-slate-300 py-1">2</div><div className="text-slate-300 py-1">3</div><div className="text-slate-300 py-1">4</div>
                    </div>
                  </div>
                </div> */}

                
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 flex justify-center gap-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleClear}
            className="px-8 py-2.5 bg-[#e2e8f0] text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-300 transition"
          >
            CLEAR
          </button>
          <button 
            onClick={handleApply}
            className="px-8 py-2.5 bg-[#0b1736] text-white font-bold rounded-lg text-sm hover:bg-[#152754] transition"
          >
            APPLY
          </button>
        </div>
      </div>
    </>
  );
}
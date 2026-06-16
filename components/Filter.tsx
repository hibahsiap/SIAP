"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Plus, Minus, Search } from "lucide-react";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  TYPE_OPTIONS,
} from "@/utils/ticketFilters";

export type FilterState = {
  opds: string[];        // OPD names
  statuses: string[];    // status enums (TO_DO, IN_PROGRESS, ...)
  types: string[];       // type enums (COMPLAINT, QUESTION, FEEDBACK)
  priorities: string[];  // urgency enums (LOW, MEDIUM, HIGH, CRITICAL)
  categories: string[];  // category names
  rangeTime: string;
};

type FilterSidebarProps = {
  admin?: boolean;
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onApply: (filters: FilterState) => void;
};

export default function FilterSidebar({ admin, isOpen, onClose, filterState, onApply }: FilterSidebarProps) {
  // Accordion open/close
  const [isOpdOpen, setIsOpdOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isRangeTimeOpen, setIsRangeTimeOpen] = useState(false);

  // Search inputs for the long lists
  const [opdQuery, setOpdQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

  // Options sourced from the database (no more hardcoded lists)
  const [opdList, setOpdList] = useState<string[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([]);

  const [localFilters, setLocalFilters] = useState<FilterState>(filterState);

  useEffect(() => {
    if (isOpen) setLocalFilters(filterState);
  }, [isOpen, filterState]);

  // Load category options (and OPD options for admin) once.
  useEffect(() => {
    fetch("/api/category")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const list = Array.isArray(data) ? data : data.data ?? [];
        setCategoryList(list.map((c: { name: string }) => c.name).filter(Boolean));
      })
      .catch(() => setCategoryList([]));

    if (admin) {
      fetch("/api/opd")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          const list = Array.isArray(data) ? data : data.data ?? [];
          setOpdList(list.map((o: { name: string }) => o.name).filter(Boolean));
        })
        .catch(() => setOpdList([]));
    }
  }, [admin]);

  // OPD users never see ON_HOLD tickets, so hide that status option for them.
  const statusOptions = useMemo(
    () => (admin ? STATUS_OPTIONS : STATUS_OPTIONS.filter((s) => s.value !== "ON_HOLD")),
    [admin]
  );

  const toggleValue = (
    item: string,
    key: keyof Pick<FilterState, "opds" | "statuses" | "types" | "priorities" | "categories">
  ) => {
    setLocalFilters((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(item) ? current.filter((i) => i !== item) : [...current, item],
      };
    });
  };

  const handleClear = () => {
    setLocalFilters({ opds: [], statuses: [], types: [], priorities: [], categories: [], rangeTime: "" });
    setOpdQuery("");
    setCategoryQuery("");
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const filteredOpds = useMemo(
    () => opdList.filter((opd) => opd.toLowerCase().includes(opdQuery.toLowerCase())),
    [opdQuery, opdList]
  );

  const filteredCategories = useMemo(
    () => categoryList.filter((cat) => cat.toLowerCase().includes(categoryQuery.toLowerCase())),
    [categoryQuery, categoryList]
  );

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

          {/* --- Section OPD (admin only) --- */}
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
                          onClick={() => toggleValue(opd, "opds")}
                          className={`text-left px-3 py-2 rounded transition ${
                            localFilters.opds.includes(opd) ? "bg-[#0b1736] text-white font-medium" : "hover:bg-slate-50"
                          }`}
                        >
                          {opd}
                        </button>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic px-2 py-2">No OPD found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- Section Status --- */}
          <div>
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="w-full flex justify-between items-center px-6 py-4 bg-[#f4f5f7] border-b border-white hover:bg-slate-200 transition"
            >
              <span className="font-bold text-sm text-slate-800">Status</span>
              {isStatusOpen ? <Minus className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
            </button>
            {isStatusOpen && (
              <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 bg-white">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleValue(opt.value, "statuses")}
                    className={`px-4 py-1.5 rounded text-sm transition ${
                      localFilters.statuses.includes(opt.value)
                        ? "bg-[#0b1736] text-white border border-[#0b1736]"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- Section Type --- */}
          <div>
            <button
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className="w-full flex justify-between items-center px-6 py-4 bg-[#f4f5f7] border-b border-white hover:bg-slate-200 transition"
            >
              <span className="font-bold text-sm text-slate-800">Type</span>
              {isTypeOpen ? <Minus className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
            </button>
            {isTypeOpen && (
              <div className="p-4 border-b border-slate-100 flex flex-wrap gap-2 bg-white">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleValue(opt.value, "types")}
                    className={`px-4 py-1.5 rounded text-sm transition ${
                      localFilters.types.includes(opt.value)
                        ? "bg-[#0b1736] text-white border border-[#0b1736]"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- Section Category --- */}
          <div>
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex justify-between items-center px-6 py-4 bg-[#f4f5f7] border-b border-white hover:bg-slate-200 transition"
            >
              <span className="font-bold text-sm text-slate-800">Category</span>
              {isCategoryOpen ? <Minus className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
            </button>
            {isCategoryOpen && (
              <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Category..."
                    value={categoryQuery}
                    onChange={(e) => setCategoryQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col text-sm text-slate-700 max-h-40 overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleValue(cat, "categories")}
                        className={`text-left px-3 py-2 rounded transition ${
                          localFilters.categories.includes(cat) ? "bg-[#0b1736] text-white font-medium" : "hover:bg-slate-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))
                  ) : (
                    <p className="text-slate-400 text-xs italic px-2 py-2">No category found</p>
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
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleValue(opt.value, "priorities")}
                    className={`px-5 py-1.5 rounded text-sm transition ${
                      localFilters.priorities.includes(opt.value)
                        ? "bg-[#0b1736] text-white border border-[#0b1736]"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
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
                    onClick={() => setLocalFilters((prev) => ({ ...prev, rangeTime: prev.rangeTime === range ? "" : range }))}
                    className={`text-left px-6 py-3 border-b border-slate-100 transition ${
                      localFilters.rangeTime === range ? "bg-[#0b1736] text-white" : "hover:bg-slate-50"
                    }`}
                  >
                    {range}
                  </button>
                ))}
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

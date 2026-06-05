"use client";

import React from 'react';
import SearchField from '@/components/SearchField';
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onFilterClick?: () => void;
  sortOrder: 'newest' | 'oldest';
  onSortChange: (val: 'newest' | 'oldest') => void;     
}

export default function Header({ searchQuery, setSearchQuery, onFilterClick, sortOrder, onSortChange}: HeaderProps) { // <-- 2. Panggil di sini
  return (
    <div className="flex flex-row justify-end items-center gap-3 font-sans">
      <div className="w-full md:w-64">
        <SearchField 
          placeholder="Search tickets" 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* 3. Masukkan event onClick ke Button Filter */}
      <Button 
        variant="outline" 
        onClick={onFilterClick} 
        className="flex items-center gap-2 border-[#D2D2D2] text-[#6B7280] h-[40px] 2xl:h-12 min-h-[40px] rounded-[12px] hover:bg-gray-50"
      >
        <Filter className="h-4 w-4" />
        Filter
      </Button>

      <Select 
        value={sortOrder}
        onValueChange={(val) => onSortChange(val as 'newest' | 'oldest')}
      >
        <SelectTrigger className="w-[180px] bg-white border-[#D2D2D2] text-[#6B7280] h-[40px] min-h-[40px]  2xl:h-12 2xl:min-h-12 flex justify-between items-center px-4 focus:ring-0 rounded-[12px]">
          <div className="flex items-center gap-1">
            <span className="text-[#6B7280]">Sorted by:</span>
            <span className="font-semibold text-gray-900"><SelectValue placeholder="Sort" /></span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          {/* <SelectItem value="priority">Priority</SelectItem> */}
        </SelectContent>
      </Select>
      
    </div>
  );
}
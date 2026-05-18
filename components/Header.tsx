"use client";

import React from 'react';
import SearchField from '@/components/SearchField';
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <div className="flex flex-row justify-end items-center gap-3 font-sans">
      <div className="w-full md:w-64">
        <SearchField 
          placeholder="Search tickets" 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <Button variant="outline" className="flex items-center gap-2 border-[#D2D2D2] text-[#6B7280] h-[40px] min-h-[40px] rounded-lg hover:bg-gray-50">
        <Filter className="h-4 w-4" />
        Filter
      </Button>

      <Select defaultValue="newest">
        {/* Tambahkan h-[40px] dan min-h-[40px] di sini buat override bawaan Shadcn */}
        <SelectTrigger className="w-[180px] border-[#D2D2D2] text-[#6B7280] h-[40px] min-h-[40px] flex justify-between items-center px-4 focus:ring-0 rounded-lg">
          <div className="flex items-center gap-1">
            <span className="text-[#6B7280]">Sorted by:</span>
            <span className="font-semibold text-gray-900"><SelectValue placeholder="Sort" /></span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
        </SelectContent>
      </Select>
      
    </div>
  );
}
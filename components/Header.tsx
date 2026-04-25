"use client";

import React from 'react';
import SearchField from '@/components/SearchField';
import ButtonClick from '@/components/Button';
import { Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTaskStore } from "@/store/useTaskStore";

export default function Header() {
  const { openAddTaskModal } = useTaskStore();

  return (
    <div className="flex flex-col md:flex-row justify-end items-center gap-3 mb-6 font-sans">
      <div className="w-full md:w-64">
        <SearchField placeholder="Search tasks" />
      </div>

      <Button variant="outline" className="flex items-center gap-2 border-[#D2D2D2] text-[#6B7280] h-10">
        <Filter className="h-4 w-4" />
        Filter
      </Button>

      <Select defaultValue="newest">
        <SelectTrigger className="w-[180px] border-[#D2D2D2] text-[#6B7280] h-10 flex justify-between items-center px-4">
          <div className="flex gap-1">
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

      <div className="w-full md:w-48">
        <ButtonClick 
          name="ADD NEW TASK" 
          icon={<Plus className="h-5 w-5" />} 
          onClick={openAddTaskModal}
          className="bg-[#1D2F58] hover:bg-[#041942] text-white !text-[14px] !font-bold h-10"
        />
      </div>
    </div>
  );
}
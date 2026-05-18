"use client"

import { BarChartData } from "@/components/BarChartData";
import CardStats from "@/components/CardStats";
import EmptyState from "@/components/EmptyState";
import { GroupChart } from "@/components/GroupChart";
import { PieChartData } from "@/components/PieChartData";
import SearchEmptyState from "@/components/SearchEmpty";
import SearchField from "@/components/SearchField";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { TimeRange } from "@/components/TimeRange";
import { Input } from "@/components/ui/input";
import { formatNameCell, TableRowData } from "@/constants/tableFormats";
import { useUserStore } from "@/store/useUserStore";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const stats = [
    {
        title: "total tickets",
        number: 16709,
        trend: true,
        numberTrend: 3,
    },
    {
        title: "solved this month",
        number: 789,
        trend: false,
        numberTrend: 9,
    },
    {
        title: "total tickets refused",
        number: 25,
        trend: false,
        numberTrend: 2,
    },
    {
        title: "success rate",
        number: 4.5,
        trend: true,
        numberTrend: 15,
    },
]

export default function Reports() {
    const [selectedRange, setSelectedRange] = useState('all');
    
    const {
        isLoading,
    } = useUserStore()

    const categoryColumns: ColumnDefinition[] = [
        { 
        header: "CATEGORIES", key: "category", className: "text-left font-medium"},
        { header: "TOTAL TICKETS", key: "totalTickets" },
        { header: "SOLVED TICKETS", key: "solvedTickets" },
        { header: "AVERAGE SOLVING TIME", key: "averageSolvingTime" },
    ];

     // contoh
    const categoryData: TableRowData[] = [
        { id: "1", category: "Dana Hibah dan Bansos", totalTickets: 187, solvedTickets: 112, averageSolvingTime: "1d 4h 11m"},
        { id: "2", category: "Kebencanaan", totalTickets: 152, solvedTickets: 75, averageSolvingTime: "1d 2h 11m"},
        { id: "3", category: "Jalan Raya dan Penerangan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
        { id: "4", category: "Jalan Raya dan Penerangan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
        { id: "5", category: "Jalan Raya dan Penerangan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
        { id: "6", category: "Jalan Raya dan Penerangan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
        { id: "7", category: "Jalan Raya dan Penerangan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
    ];

    const [searchQuery, setSearchQuery] = useState("")

    const filteredCategories = useMemo(() => {
        return categoryData.filter((item) =>
            (item.category || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, categoryData]);

    const timeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'custom', label: 'Custom Range' },
    ];

    return (
        <div className="flex flex-col gap-5 px-4 py-2">
            <div className="flex flex-row items-center justify-between py-1">
                <h1 className="font-bold text-3xl text-[#041942]">Report</h1>
                <TimeRange
                    options={timeOptions}
                    value={selectedRange}
                    onChange={setSelectedRange}
                />
            </div>
            <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    return (
                        <CardStats 
                            key={index}
                            title={stat.title}
                            number={stat.number}
                            trend={stat.trend}
                            numberTrend={stat.numberTrend}
                        />
                    )
                })}
            </div>
            <div className="grid grid-cols-[1fr_245px_245px] gap-4">
                <GroupChart/>
                <PieChartData/>
                <BarChartData/>
            </div>
            <div className="border border-[#D2D2D2] p-4 rounded-[15px] flex flex-col items-end gap-4 bg-white">
                {/* <SearchField placeholder="search" className="w-60" value={""} onChange={function (val: string): void {
                    throw new Error("Function not implemented.");
                } }/> */}
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full md:w-70 bg-gray-100 border-transparent focus:bg-white focus:border-[#1D2F58] rounded-md h-10 text-sm transition-all"
                    />
                </div>

                {/* <div className="w-full">
                    <TableTemplate columns={categoryColumns} data={filteredCategories as any} position="text-center"/>
                </div> */}

                <div className="w-full">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
                    ) : filteredCategories.length > 0 ? (
                        <TableTemplate columns={categoryColumns} data={filteredCategories as any} position="text-center"/>
                    ) : searchQuery !== "" ? (
                        <SearchEmptyState type="category" searchQuery={searchQuery} />
                    ) : (
                        <EmptyState
                        title="No OPD found"
                        description={<>There is currently no data available. <br /> Please add new data to see it displayed here.</>}
                        // actionButton={
                        //     <Button onClick={openAddModal} className="bg-[#172033] hover:bg-[#172033]/90 text-white font-medium px-5 py-5 flex items-center gap-2 rounded-md">
                        //         <Plus className="w-4 h-4" /> NEW USER
                        //     </Button>
                        // }
                        />
                    )}
                </div>

            </div>
        </div>
    )
}
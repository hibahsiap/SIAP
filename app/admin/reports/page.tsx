"use client"

import { BarChartData } from "@/components/BarChartData";
import Button from "@/components/Button";
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
import { Plus, Search } from "lucide-react";
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

    const userColumns: ColumnDefinition[] = [
        { 
            header: "NAME OPD", 
            key: "name", 
            cell: (_, rowData) => formatNameCell(rowData as TableRowData) ,
            className: "text-left pl-4 w-[400px] 2xl:w-[500px]"
        },
        { header: "TOTAL TICKETS", key: "totalTickets" },
        { header: "SOLVED TICKETS", key: "solvedTickets" },
        { header: "AVERAGE SOLVING TIME", key: "averageSolvingTime" },
    ];

     // contoh
    const userData: TableRowData[] = [
        { id: "1", name: "Sekretaris Daerah", totalTickets: 187, solvedTickets: 112, averageSolvingTime: "1d 4h 11m"},
        { id: "2", name: "Dinas Sosial", totalTickets: 152, solvedTickets: 75, averageSolvingTime: "1d 2h 11m"},
        { id: "3", name: "Dinas Kependudukan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
        { id: "4", name: "Badan Penanggulangan Bencana Daerah", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
        { id: "5", name: "Dinas Lingkungan Hidup", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
        { id: "6", name: "Dinas Kesehatan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
        { id: "7", name: "Dinas Pendidikan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
    ];

    const [searchQuery, setSearchQuery] = useState("")

    const filteredUsers = useMemo(() => {
        return userData.filter((item) =>
            (item.name || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, userData]);

    const timeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'custom', label: 'Custom Range' },
    ];

    return (
        <div className="flex flex-col gap-5 pr-6 pl-4 py-2">
            <div className="flex flex-row items-center justify-between py-1">
                <h1 className="font-bold text-3xl 2xl:text-4xl text-[#041942]">Report</h1>
                {/* <TimeRange
                    options={timeOptions}
                    value={selectedRange}
                    onChange={setSelectedRange}
                /> */}
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
                {/* <SearchField placeholder="search" className="w-60" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/> */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 2xl:h-6 text-gray-500" />
                    <Input
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full md:w-70 2xl:w-80 bg-gray-100 border-transparent focus:bg-white focus:border-[#1D2F58] rounded-md h-10 2xl:h-12 text-sm 2xl:text-base transition-all"
                    />
                </div>


                <div className="w-full">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
                    ) : filteredUsers.length > 0 ? (
                        <TableTemplate columns={userColumns} data={filteredUsers as any} position="text-center"/>
                    ) : searchQuery !== "" ? (
                        <SearchEmptyState type="opd" searchQuery={searchQuery} />
                    ) : (
                        <EmptyState
                        title="No OPD found"
                        description={<>There is currently no data available. <br /> Please add new data to see it displayed here.</>}
                        />
                    )}
                </div>

            </div>
        </div>
    )
}
"use client"

import { BarChartData } from "@/components/BarChartData";
import CardStats from "@/components/CardStats";
import { GroupChart } from "@/components/GroupChart";
import { PieChartData } from "@/components/PieChartData";
import SearchField from "@/components/SearchField";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { TimeRange } from "@/components/TimeRange";
import { formatNameCell, TableRowData } from "@/constants/tableFormats";
import { useState } from "react";

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

    const userColumns: ColumnDefinition[] = [
        { 
        header: "NAME OPD", 
        key: "name", 
        cell: (_, rowData) => formatNameCell(rowData as TableRowData) ,
        className: "text-left"
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
    ];

    const timeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'custom', label: 'Custom Range' },
    ];

    return (
        <div className="flex flex-col gap-5 px-2">
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
                <SearchField placeholder="search" className="w-60" value={""} onChange={function (val: string): void {
                    throw new Error("Function not implemented.");
                } }/>
                <div className="w-full">
                    <TableTemplate columns={userColumns} data={userData} position="text-center"/>
                </div>
            </div>
        </div>
    )
}
"use client"

import { BarChartData, type BarChartDatum } from "@/components/BarChartData";
import CardStats from "@/components/CardStats";
import EmptyState from "@/components/EmptyState";
import { GroupChart, type GroupChartDatum } from "@/components/GroupChart";
import { PieChartData, type PieChartDatum } from "@/components/PieChartData";
import SearchEmptyState from "@/components/SearchEmpty";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { Input } from "@/components/ui/input";
import { TableRowData } from "@/constants/tableFormats";
import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StatTrend = { number: number; up: boolean; value: number };

type ReportData = {
    role: string;
    stats: {
        totalTickets: StatTrend;
        solvedThisMonth: StatTrend;
        refused: StatTrend;
        successRate: StatTrend;
    };
    messagesDistribution: PieChartDatum[];
    ticketsByChannel: BarChartDatum[];
    responseTime: GroupChartDatum[];
    table: TableRowData[];
};

export default function Reports() {
    const [data, setData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        let active = true;
        fetch("/api/reports")
            .then((res) => (res.ok ? res.json() : Promise.reject(res)))
            .then((json: ReportData) => {
                if (active) setData(json);
            })
            .catch((err) => console.error("[Reports] failed to load", err))
            .finally(() => {
                if (active) setIsLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);

    const stats = useMemo(() => {
        if (!data) return [];
        const s = data.stats;
        return [
            { title: "total tickets", number: s.totalTickets.number, trend: s.totalTickets.up, numberTrend: s.totalTickets.value },
            { title: "solved this month", number: s.solvedThisMonth.number, trend: s.solvedThisMonth.up, numberTrend: s.solvedThisMonth.value },
            { title: "total tickets refused", number: s.refused.number, trend: s.refused.up, numberTrend: s.refused.value },
            { title: "success rate", number: s.successRate.number, trend: s.successRate.up, numberTrend: s.successRate.value },
        ];
    }, [data]);

    const categoryColumns: ColumnDefinition[] = [
        {
            header: "CATEGORIES",
            key: "category",
            className: "text-left pl-4 w-[400px] 2xl:w-[500px]"
        },
        { header: "TOTAL TICKETS", key: "totalTickets" },
        { header: "SOLVED TICKETS", key: "solvedTickets" },
        { header: "AVERAGE SOLVING TIME", key: "averageSolvingTime" },
    ];

    const filteredCategories = useMemo(() => {
        const rows = data?.table ?? [];
        return rows.filter((item) =>
            (item.category || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, data]);

    return (
        <div className="flex flex-col gap-5 pl-4 pr-6 py-2">
            <div className="flex flex-row items-center justify-between py-1">
                <h1 className="font-bold text-2xl 2xl:text-3xl text-[#041942]">Report</h1>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1D2F58]" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <CardStats
                                key={index}
                                title={stat.title}
                                number={stat.number}
                                trend={stat.trend}
                                numberTrend={stat.numberTrend}
                            />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_245px_245px] gap-4">
                        <GroupChart data={data?.responseTime} />
                        <PieChartData data={data?.messagesDistribution} />
                        <BarChartData data={data?.ticketsByChannel} />
                    </div>
                    <div className="border border-[#D2D2D2] p-4 rounded-[15px] flex flex-col items-end gap-4 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 2xl:h-6 text-gray-500" />
                            <Input
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-full md:w-70 2xl:w-80 bg-gray-100 border-transparent focus:bg-white focus:border-[#1D2F58] rounded-md h-10 2xl:h-12 text-sm 2xl:text-base transition-all"
                            />
                        </div>

                        <div className="w-full overflow-x-auto custom-scrollbar">
                            {filteredCategories.length > 0 ? (
                                <TableTemplate columns={categoryColumns} data={filteredCategories as any} position="text-center" />
                            ) : searchQuery !== "" ? (
                                <SearchEmptyState type="category" searchQuery={searchQuery} />
                            ) : (
                                <EmptyState
                                    title="No Category found"
                                    description={<>There is currently no data available. <br /> Please add new data to see it displayed here.</>}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Clock1 } from "@boxicons/react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

export type GroupChartDatum = { day: string; week: string; avg: number | null; color?: string };

const fallbackData: GroupChartDatum[] = [
  // First Week
  { day: "Mon", week: "First Week", avg: 3, color: "#F4D254" },
  { day: "Tue", week: "First Week", avg: 5, color: "#F4D254" },
  { day: "Wed", week: "First Week", avg: 6, color: "#F4D254" },
  { day: "Thu", week: "First Week", avg: 4, color: "#F4D254" },
  { day: "Fri", week: "First Week", avg: 3.5, color: "#F4D254" },
  { day: "", avg: null, week: "" },
  // Second Week
  { day: "Mon ", week: "Second Week", avg: 2, color: "#7BADFF" },
  { day: "Tue ", week: "Second Week", avg: 3.5, color: "#7BADFF" },
  { day: "Wed ", week: "Second Week", avg: 7, color: "#7BADFF" },
  { day: "Thu ", week: "Second Week", avg: 4, color: "#7BADFF" },
  { day: "Fri ", week: "Second Week", avg: 1.5, color: "#7BADFF" },
  { day: "", avg: null, week: "" },
   // Third Week
  { day: "Mon", week: "Third Week", avg: 3, color: "#B9D336" },
  { day: "Tue", week: "Third Week", avg: 5, color: "#B9D336" },
  { day: "Wed", week: "Third Week", avg: 6, color: "#B9D336" },
  { day: "Thu", week: "Third Week", avg: 4, color: "#B9D336" },
  { day: "Fri", week: "Third Week", avg: 3.5, color: "#B9D336" },
  { day: "", avg: null, week: "" },
   // Fourth Week
  { day: "Mon", week: "Fourth Week", avg: 3, color: "#CCA7F3" },
  { day: "Tue", week: "Fourth Week", avg: 5, color: "#CCA7F3" },
  { day: "Wed", week: "Fourth Week", avg: 8, color: "#CCA7F3" },
  { day: "Thu", week: "Fourth Week", avg: 2, color: "#CCA7F3" },
  { day: "Fri", week: "Fourth Week", avg: 3.5, color: "#CCA7F3" },
];

const chartConfig = {
  avg: { label: "avg response", color: "#F4D75D"},
} satisfies ChartConfig;

export function GroupChart({ data }: { data?: GroupChartDatum[] }) {
  const chartData = data && data.length > 0 ? data : fallbackData;
  return (
    <div className="bg-white flex flex-col border border-[#D2D2D2] rounded-[15px] p-3">
      <h3 className="text-[#546064] tracking-wide font-medium 2xl:text-lg">Average Response Time</h3>
      
      <ChartContainer config={chartConfig} className="h-52 w-full [&_svg]:overflow-visible">
        <BarChart 
            data={chartData} 
            margin={{ top: 4, left: -46 }}    
            barGap={10}
        >
          {/* Garis bantu horizontal (dotted) */}
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
          
          <XAxis 
            dataKey="day"
            orientation="top" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#041942', fontSize: 8, fontWeight: 400 }}
            // dy={-160}
            interval={0}
          />

          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#041942', fontSize: 10, fontWeight: 600 }}
            domain={[0, 'auto']}
            allowDataOverflow={false}
            // tickFormatter={(value) => value === 8 ? "Avg" : value === 4 ? "4 h" : "0"}
          />

          <Bar dataKey="avg" radius={[8, 8, 8, 8]} barSize={10}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {/* Tooltip */}
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideIndicator />} />

          {/* Label Minggu di Bawah */}
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            interval={6}
            xAxisId="week"
            padding={{ left: 32, right: 20}}
            // underlinePosition={"bottom"}
            // position="bottom"
            tick={{ fill: '#041942', fontSize: 10, fontWeight: 500 }}
            // height={50}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
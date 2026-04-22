"use client"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Cell, Pie, PieChart } from "recharts"

const chartData = [
    { category: "aduan", total: 80 },
    { category: "aspirasi", total: 24 },
    { category: "pertanyaan", total: 16 },
]

const chartConfig = {
//   total: {
//     label: "Kategori",
//   },
  aduan: {
    label: "Aduan",
  },
  aspirasi: {
    label: "Aspirasi",
  },
  pertanyaan: {
    label: "Pertanyaan",
  },
} satisfies ChartConfig

const COLORS = ['#5998FE', '#7BADFF', '#C9DDFF']

export function PieChartData() {
    return (
        <div className="bg-white flex flex-col items-center border border-[#D2D2D2] rounded-[15px] p-3">
            <h3 className="text-[#546064] tracking-wide font-medium">Messages Distribution</h3>
            <ChartContainer config={chartConfig} className="w-full h-52">
                <PieChart>
                    <Pie
                        data={chartData}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="category"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />}/>
                    <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
            </ChartContainer>
        </div>
    )
}

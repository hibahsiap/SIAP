"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Facebook, Instagram, TwitterX, Whatsapp } from "@boxicons/react"
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts"

export type BarChartDatum = { channel: string; total: number }

const fallbackData: BarChartDatum[] = [
    { channel: "x", total: 40 },
    { channel: "whatsapp", total: 200 },
    { channel: "facebook", total: 12 },
    { channel: "instagram", total: 55 },
]

const chartConfig = {
    x: { label: "Twitter X", icon: TwitterX, color: "#000000" },
    whatsapp: { label: "Whatsapp", icon: Whatsapp, color: "#00B815" },
    facebook: { label: "Facebook", icon: Facebook, color: "#1877F2" },
    instagram: { label: "Instagram", icon: Instagram, color: "#FF0091" },
} satisfies ChartConfig

export function BarChartData({ data }: { data?: BarChartDatum[] }) {
    const chartData = data && data.length > 0 ? data : fallbackData
    return (
        <div className="bg-white flex flex-col gap-1 items-center border border-[#D2D2D2] rounded-[15px] p-3">
            <h3 className="text-[#546064] tracking-wide font-medium 2xl:text-lg">Tickets by Channel</h3>
            
            <ChartContainer config={chartConfig} className="h-52 w-full">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}> 
                    <YAxis 
                        hide 
                        domain={[0, 'dataMax + 20']} 
                    />
                    <XAxis 
                        dataKey="channel" 
                        hide 
                    />
                    <Bar dataKey="total" radius={[8, 8, 8, 8]}>
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={chartConfig[entry.channel as keyof typeof chartConfig]?.color} 
                            />
                        ))}

                        <LabelList
                            dataKey="channel"
                            content={(props) => {
                                const { x, y, width, value } = props;
                                const config = chartConfig[value as keyof typeof chartConfig];
                                if (!config || !config.icon) return null;
                                
                                const Icon = config.icon;
                                const iconSize = 24;

                                return (
                                    <foreignObject
                                        x={(x as number) + (width as number) / 2 - iconSize / 2}
                                        y={(y as number) - iconSize - 8}
                                        width={iconSize}
                                        height={iconSize}
                                        style={{ overflow: 'visible' }}
                                    >
                                        <div style={{ color: config.color }}>
                                            <Icon />
                                        </div>
                                    </foreignObject>
                                );
                            }}
                        />

                        
                    </Bar>
                    <ChartTooltip 
                        cursor={false}
                        content={<ChartTooltipContent hideLabel nameKey="channel" />} 
                    />
                </BarChart>
            </ChartContainer>
        </div>
    )
}
import { TrendingDown, TrendingUp } from "lucide-react";

interface CardStatsProps {
    title: string,
    number: number,
    trend?: boolean,
    numberTrend?: number,
}

const CardStats = ({title, number, trend, numberTrend}: CardStatsProps) => {
    let isTrend = false
    if (trend != undefined) {
        isTrend = true
    }

    return (
        <div className="bg-white px-5 py-4 rounded-[15px] border border-[#D2D2D2] flex flex-col gap-1.5">
            <h4 className="text-[#626262] uppercase font-medium text-xs 2xl:text-sm tracking-wide">{title}</h4>
            <h3 className="text-black font-semibold text-3xl 2xl:text-4xl tracking-wide">{number}</h3>

            {/* tampilkan trend */}
            {isTrend && <>
                {trend ? 
                <p className="text-green-500 flex items-center gap-1 text-sm 2xl:text-base">
                    <TrendingUp size={14}/> +{numberTrend}% from last month
                </p> : 
                <p className="text-red-500 flex items-center gap-1 text-sm 2xl:text-base">
                    <TrendingDown size={14}/> -{numberTrend}% from last month
                </p>}
            </>}
        </div>
    )
}

export default CardStats;
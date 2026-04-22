import CardStats from "@/components/CardStats";
import SearchField from "@/components/SearchField";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { formatNameCell, TableRowData } from "@/constants/tableFormats";

const stats = [
    {
        title: "total tickets",
        number: 16709,
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
    },
    {
        title: "success rate",
        number: 4.5,
        trend: true,
        numberTrend: 15,
    },
]

export default function Reports() {

    // Definisi Kolom khusus untuk halaman issue category
    const userColumns: ColumnDefinition[] = [
        { 
        header: "NAME OPD", 
        key: "name", 
        cell: (_, rowData) => formatNameCell(rowData) 
        },
        { header: "TOTAL TICKETS", key: "totalTickets" },
        { header: "SOLVED TICKETS", key: "solvedTickets" },
        { header: "AVERAGE SOLVING TIME", key: "averageSolvingTime" },
        // // { 
        // // header: "ROLE", 
        // // key: "role", 
        // // cell: (value) => formatRoleCell(value) 
        // // },
        // { 
        // header: "ACTIONS", 
        // key: "actions", 
        // className: "text-right",
        // cell: (_, rowData) => formatActionCell(rowData, handleEdit, handleDelete)
        // },
    ];

     // contoh
    const userData: TableRowData[] = [
        { id: "1", name: "Sekretaris Daerah", totalTickets: 187, solvedTickets: 112, averageSolvingTime: "1d 4h 11m"},
        { id: "2", name: "Dinas Sosial", totalTickets: 152, solvedTickets: 75, averageSolvingTime: "1d 2h 11m"},
        { id: "3", name: "Dinas Kependudukan", totalTickets: 101, solvedTickets: 98, averageSolvingTime: "0d 20h 42m"},
    ];

    return (
        <div className="bg-red-500 flex flex-col gap-3 px-2">
            <div className="bg-green-400 flex flex-row items-center justify-between py-1">
                <h1 className="font-bold text-3xl text-[#041942]">Report</h1>
                <SearchField placeholder="search" className="w-60"/>
            </div>
            <div className="bg-blue-400 grid grid-cols-4 gap-4">
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
            <div className="border border-[#D2D2D2] p-4 rounded-[15px] flex flex-col items-end gap-4 bg-white">
                <SearchField placeholder="search" className="w-60"/>
                <div className="w-full">
                    <TableTemplate columns={userColumns} data={userData} position="text-center"/>
                </div>
            </div>
        </div>
    )
}
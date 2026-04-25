import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TableRowData } from "@/constants/tableFormats";

export interface ColumnDefinition {
    header: ReactNode;
    key: string;
    cell?: (value: any, rowData: TableRowData) => ReactNode; 
    className?: string;
}

interface TableTemplateProps {
    columns: ColumnDefinition[];
    data: TableRowData[];
}

const TableTemplate = ({columns, data}: TableTemplateProps) => {
    return (
        <div className="font-sans w-full">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-[#e7e6e6] hover:bg-transparent">
                        {columns.map((col, idx) => (
                            <TableHead 
                                key={col.key} 
                                className={`capitalize text-[#1D2F58] font-normal tracking-wide h-12 text-center align-middle ${idx !== columns.length - 1 ? 'border-r border-[#e7e6e6]' : ''}`}
                            >
                                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                    {col.header}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="border-b border-[#e7e6e6] last:border-0 h-16 transition-colors hover:bg-gray-50/50">
                                {columns.map((col, idx) => (
                                    <TableCell 
                                        key={col.key}
                                        className={`text-[#1D2F58] font-bold text-[14px] text-center align-middle p-4 ${idx !== columns.length - 1 ? 'border-r border-[#e7e6e6]' : ''}`}
                                    >
                                        {col.cell ? col.cell(row[col.key as keyof TableRowData], row) : row[col.key as keyof TableRowData]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="px-6 py-10 text-center text-gray-400 text-xs">
                                Data tidak ditemukan.
                            </TableCell>
                        </TableRow>
                    )
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default TableTemplate;
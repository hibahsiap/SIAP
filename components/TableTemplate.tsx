import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TableRowData } from "@/constants/tableFormats";

// define struktur kolom
export interface ColumnDefinition {
    header: string;
    key: string;
    cell?: (value: any, rowData: TableRowData) => ReactNode; 
    className?: string;
}

// interface Column {
//     label: string,
//     key: string
// }

interface TableTemplateProps {
    // header: string[],
    columns: ColumnDefinition[],
    // data: any[],
    data: TableRowData[];
    // renderCell: (item: any, columnKey: string) => ReactNode;
}

const TableTemplate = ({columns, data}: TableTemplateProps) => {
    return (
        <div>
            <Table>
                <TableHeader className="bg-[#F3F3F3]">
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.key} className="uppercase text-[#546064] font-semibold tracking-wide h-12">{col.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="border-b border-[#546064] text-[#041942] capitalize text-[14px] h-16">
                                {columns.map((col) => (
                                    <TableCell key={col.key}>
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
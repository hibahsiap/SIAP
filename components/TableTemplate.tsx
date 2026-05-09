import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export interface ColumnDefinition<T = Record<string, any>> {
    header: string;
    key: string;
    cell?: (value: any, rowData: T) => ReactNode; 
    className?: string; 
}

interface TableTemplateProps<T = Record<string, any>> {
    columns: ColumnDefinition<T>[],
    data: T[];
    position?: string;
}

const TableTemplate = <T extends Record<string, any>>({columns, data, position}: TableTemplateProps<T>) => {
    return (
        <div>
            <Table>
                <TableHeader className="bg-[#F3F3F3]">
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead 
                                key={col.key} 
                                className={`uppercase text-[#546064] font-semibold tracking-wide h-12 ${position || ""} ${col.className || ""}`}
                            >
                                {col.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className={`border-b border-[#e7e6e6] text-[#041942] capitalize text-[14px] h-16 ${position || ""}`}>
                                {columns.map((col) => (
                                    <TableCell key={col.key} className={col.className}>
                                        {col.cell ? col.cell(row[col.key], row) : row[col.key]}
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
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default TableTemplate;
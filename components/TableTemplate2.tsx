import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export interface ColumnDefinition<T = Record<string, unknown>> {
    header: ReactNode;
    key: string;
    // Method-signature (bivariant) so call sites can type `value`/`rowData` concretely.
    cell?(value: unknown, rowData: T): ReactNode;
    className?: string;
}

interface TableTemplateProps<T> {
    columns: ColumnDefinition<T>[];
    data: T[];
}

const TableTemplate = <T,>({columns, data}: TableTemplateProps<T>) => {
    return (

        <div className="font-sans w-full">
            <div className="w-full">
                <Table className="w-full">
                    <TableHeader>
                        <TableRow className="border-b border-[#e7e6e6] hover:bg-transparent">
                            {columns.map((col, idx) => (
                                <TableHead
                                    key={col.key}
                                    className={`capitalize text-[#1D2F58] text-[13px] 2xl:text-[15px] font-bold tracking-wide h-12 align-middle ${col.className || 'text-center'} ${idx !== columns.length - 1 ? 'border-r border-[#e7e6e6]' : ''}`}
                                >
                                    <div className={`flex items-center gap-1.5 whitespace-nowrap ${col.className?.includes('text-left') ? 'justify-start' : 'justify-center'}`}>
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
                                    {columns.map((col, idx) => {
                                        const value = (row as Record<string, unknown>)[col.key];
                                        return (
                                            <TableCell
                                                key={col.key}
                                                className={`text-[#1D2F58] font-bold text-[13px] 2xl:text-[15px] align-middle p-4 ${col.className || 'text-center'} ${idx !== columns.length - 1 ? 'border-r border-[#e7e6e6]' : ''}`}
                                            >
                                                {col.cell ? col.cell(value, row) : (value as ReactNode)}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="px-6 py-10 text-center text-gray-400 text-xs 2xl:text-sm">
                                    Data tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        )
                        }
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default TableTemplate;
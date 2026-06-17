import { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export interface ColumnDefinition<T = Record<string, unknown>> {
    header: string;
    key: string;
    // Method-signature (bivariant) so call sites can type `value` to the concrete
    // cell type without TypeScript rejecting the assignment.
    cell?(value: unknown, rowData: T): ReactNode;
    className?: string;
    sortable?: boolean;
}

export type SortConfig = { key: string; direction: "asc" | "desc" } | null;

interface TableTemplateProps<T> {
    columns: ColumnDefinition<T>[],
    data: T[];
    position?: string;
    containerClassName?: string;
    sortConfig?: SortConfig;
    onSort?: (key: string) => void;
}

const TableTemplate = <T,>({columns, data, position, containerClassName, sortConfig, onSort}: TableTemplateProps<T>) => {
    return (
        <div className={`w-full overflow-y-auto relative custom-scrollbar ${containerClassName ?? "max-h-[450px] 2xl:max-h-[600px]"}`}>
            <Table>
                <TableHeader className="bg-[#F3F3F3]">
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead
                                key={col.key}
                                className={`uppercase sticky top-0 z-20 bg-[#F3F3F3] text-[#546064] 2xl:text-lg font-semibold tracking-wide h-12 ${position || ""} ${col.className || ""}`}
                            >
                                {col.sortable && onSort ? (
                                    <button
                                        type="button"
                                        onClick={() => onSort(col.key)}
                                        className="inline-flex items-center gap-1.5 uppercase hover:text-[#041942] transition-colors cursor-pointer"
                                    >
                                        {col.header}
                                        {sortConfig?.key === col.key ? (
                                            sortConfig.direction === "asc"
                                                ? <ArrowUp className="w-3.5 h-3.5" />
                                                : <ArrowDown className="w-3.5 h-3.5" />
                                        ) : (
                                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                                        )}
                                    </button>
                                ) : (
                                    col.header
                                )}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className={`border-b border-[#e7e6e6] text-[#041942] text-[14px] 2xl:text-base h-16 ${position || ""}`}>
                                {columns.map((col) => {
                                    const value = (row as Record<string, unknown>)[col.key];
                                    return (
                                        <TableCell key={col.key} className={col.className}>
                                            {col.cell ? col.cell(value, row) : (value as ReactNode)}
                                        </TableCell>
                                    );
                                })}
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
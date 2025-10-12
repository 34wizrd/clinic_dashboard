// src/features/patients/components/PatientDataTable.tsx

"use client"

import * as React from "react"
import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { Patient } from "./patientSlice"

// Define the columns for the Patient data
const getColumns = (
    onEdit: (patient: Patient) => void,
    onDelete: (patient: Patient) => void
): ColumnDef<Patient>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "first_name",
        header: "Full Name",
        cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
    },
    {
        accessorKey: "dob",
        header: "Date of Birth",
    },
    {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => <span className="capitalize">{row.original.gender}</span>,
    },
    {
        accessorKey: "emergency_contact",
        header: "Emergency Contact",
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
    },
]

// Define the props our DataTable will accept
interface PatientDataTableProps {
    data: Patient[];
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onEdit: (patient: Patient) => void;
    onDelete: (patient: Patient) => void;
}

export function PatientDataTable({
                                     data,
                                     pageCount,
                                     pageIndex,
                                     pageSize,
                                     onPageChange,
                                     onPageSizeChange,
                                     onEdit,
                                     onDelete,
                                 }: PatientDataTableProps) {
    const [rowSelection, setRowSelection] = React.useState({});
    const columns = React.useMemo(() => getColumns(onEdit, onDelete), [onEdit, onDelete]);

    const table = useReactTable({
        data,
        columns,
        state: {
            rowSelection,
            pagination: { pageIndex, pageSize },
        },
        pageCount,
        manualPagination: true,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2"><p className="text-sm font-medium">Rows per page</p>
                        <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
                            <SelectTrigger className="h-8 w-[70px]"><SelectValue placeholder={pageSize} /></SelectTrigger>
                            <SelectContent side="top">{[10, 20, 30, 40, 50].map((size) => <SelectItem key={size} value={`${size}`}>{size}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">Page {pageIndex + 1} of {pageCount}</div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => onPageChange(0)} disabled={pageIndex === 0}><span className="sr-only">First</span><ChevronsLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onPageChange(pageIndex - 1)} disabled={pageIndex === 0}><span className="sr-only">Prev</span><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onPageChange(pageIndex + 1)} disabled={pageIndex + 1 >= pageCount}><span className="sr-only">Next</span><ChevronRight className="h-4 w-4" /></Button>
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => onPageChange(pageCount - 1)} disabled={pageIndex + 1 >= pageCount}><span className="sr-only">Last</span><ChevronsRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
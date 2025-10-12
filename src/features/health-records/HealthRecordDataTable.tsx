// src/features/health-records/HealthRecordDataTable.tsx

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
import type { HealthRecord } from "./healthRecordSlice"
import { useAppSelector } from "@/hooks/hooks"
import { format } from "date-fns"

// Define the columns for the Health Record data
const getColumns = (
    patientNameMap: Map<number, string>,
    doctorNameMap: Map<number, string>,
    onEdit: (record: HealthRecord) => void,
    onDelete: (record: HealthRecord) => void
): ColumnDef<HealthRecord>[] => [
    {
        id: "select",
        header: ({ table }) => (<Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />),
        cell: ({ row }) => (<Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "patient_id",
        header: "Patient",
        cell: ({ row }) => patientNameMap.get(row.original.patient_id) || `ID: ${row.original.patient_id}`,
    },
    {
        accessorKey: "doctor_id",
        header: "Doctor",
        cell: ({ row }) => doctorNameMap.get(row.original.doctor_id) || `ID: ${row.original.doctor_id}`,
    },
    {
        accessorKey: "record_date",
        header: "Record Date",
        cell: ({ row }) => format(new Date(row.original.record_date), "PP"),
    },
    {
        accessorKey: "diagnosis",
        header: "Diagnosis",
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
    },
]

interface HealthRecordDataTableProps {
    data: HealthRecord[];
    pageCount: number;
    pageIndex: number;
    pageSize: number;
    onPageChange: (pageIndex: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onEdit: (record: HealthRecord) => void;
    onDelete: (record: HealthRecord) => void;
}

export function HealthRecordDataTable({
                                          data,
                                          pageCount,
                                          pageIndex,
                                          pageSize,
                                          onPageChange,
                                          onPageSizeChange,
                                          onEdit,
                                          onDelete,
                                      }: HealthRecordDataTableProps) {
    const [rowSelection, setRowSelection] = React.useState({});

    const { allPatients } = useAppSelector((state) => state.patients);
    const { allDoctors } = useAppSelector((state) => state.doctors);

    const patientNameMap = React.useMemo(() => new Map(allPatients.map(p => [p.id, `${p.first_name} ${p.last_name}`])), [allPatients]);
    const doctorNameMap = React.useMemo(() => new Map(allDoctors.map(d => [d.id, `Dr. ${d.first_name} ${d.last_name}`])), [allDoctors]);

    const columns = React.useMemo(() => getColumns(patientNameMap, doctorNameMap, onEdit, onDelete), [patientNameMap, doctorNameMap, onEdit, onDelete]);

    const table = useReactTable({
        data,
        columns,
        state: { rowSelection, pagination: { pageIndex, pageSize } },
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
                                {headerGroup.headers.map((header) => <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>)}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.</div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2"><p className="text-sm font-medium">Rows per page</p>
                        <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
                            <SelectTrigger className="h-8 w-[70px]"><SelectValue placeholder={pageSize} /></SelectTrigger>
                            <SelectContent side="top">{[10, 20, 30, 40, 50].map((size) => <SelectItem key={size} value={`${size}`}>{size}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">Page {pageIndex + 1} of {pageCount}</div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => onPageChange(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onPageChange(pageIndex - 1)} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
                        <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onPageChange(pageIndex + 1)} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
                        <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => onPageChange(pageCount - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
import React, { useState } from "react";
import {
    Search,
    FileText,
    Eye,
    Upload,
    Trash2,
    User,
    FileSearch,
    X,
} from "lucide-react";
import { can } from "../../utils/auth";
import { useAuth } from "../../context/AuthProvider";
import { ActionIcon, TextInput } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useDebouncedValue } from "@mantine/hooks";
import { Link } from "react-router-dom";

const mockRecords = [
    {
        id: 1,
        person: "John Doe",
        type: "Birth Certificate",
        uploadedAt: "2026-01-10",
    },
    {
        id: 2,
        person: "Jane Smith",
        type: "National ID",
        uploadedAt: "2026-01-12",
    },
];

export default function Records() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const PAGE_SIZES = [5, 10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [debouncedQuery] = useDebouncedValue(search, 500);
    const [columnFilters, setColumnFilters] = useState({
        id: "",
    });
    const [debouncedcolumnFilters] = useDebouncedValue(columnFilters, 1000);
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: "created_at",
        direction: "desc",
    });

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearch(value);
        setPage(1);
    };

    const handleColumnSearchChange = (column, value) => {
        setColumnFilters((prevFilters) => ({
            ...prevFilters,
            [column]: value,
        }));
        setPage(1);
    };

    const handleRecordsPerPageChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1);

        getJobs(1, newPageSize, debouncedQuery, sortStatus);
    };

    const cols = [
        {
            key: "sn",
            accessor: "sn",
            title: "SN",
            sortable: false,
            thProps: {
                style: { whiteSpace: "normal", wordBreak: "break-word" },
            },
            render: (row, index) => (page - 1) * pageSize + index + 1,
        },
        {
            key: "person",
            accessor: "person",
            title: "Person",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="person name"
                    placeholder="Search item..."
                    leftSection={<FileSearch size={16} />}
                    rightSection={
                        <ActionIcon
                            size="sm"
                            variant="transparent"
                            c="dimmed"
                            onClick={() =>
                                setColumnFilters((prevFilters) => ({
                                    ...prevFilters,
                                    person: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["person"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("person", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["person"],
        },
        {
            key: "type",
            accessor: "type",
            title: "Type",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="Type"
                    description="Show Type whose type include the specified text"
                    placeholder="Search item..."
                    leftSection={<FileSearch size={16} />}
                    rightSection={
                        <ActionIcon
                            size="sm"
                            variant="transparent"
                            c="dimmed"
                            onClick={() =>
                                setColumnFilters((prevFilters) => ({
                                    ...prevFilters,
                                    type: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["type"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("type", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["type"],
        },
        {
            key: "uploadedAt",
            accessor: "uploadedAt",
            title: "UploadedAt",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="UploadedAt"
                    placeholder="Search item..."
                    leftSection={<FileSearch size={16} />}
                    rightSection={
                        <ActionIcon
                            size="sm"
                            variant="transparent"
                            c="dimmed"
                            onClick={() =>
                                setColumnFilters((prevFilters) => ({
                                    ...prevFilters,
                                    uploadedAt: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["uploadedAt"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("uploadedAt", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["uploadedAt"],
        },

        {
            key: "action",
            accessor: "action",
            title: "Action",
            sortable: false,
            thProps: {
                style: { whiteSpace: "normal", wordBreak: "break-word" },
            },
            render: (row) => (
                <div className="my-1 w-fit">
                    <Link to="">
                        <button className="w-fit py-1 px-3 bg-slate-600 text-white rounded-md text-lg font-semibold hover:bg-slate-700 cursor-pointer">
                            view
                        </button>
                    </Link>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Records
                    </h1>
                </div>

                {can(user, "upload_document") && (
                    <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
                        <Upload size={18} />
                        Upload Record
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                />
                <input
                    type="text"
                    placeholder="Search by person or document type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
                <div className="datatables">
                    {loading ? (
                        <Loading />
                    ) : (
                        <DataTable
                            fetching={loading}
                            noRecordsText="No records found"
                            borderRadius="md"
                            minHeight={170}
                            verticalAlign="center"
                            withTableBorder
                            withColumnBorders
                            striped
                            highlightOnHover
                            records={mockRecords}
                            columns={cols}
                            totalRecords={totalRecords}
                            page={page}
                            onPageChange={setPage}
                            recordsPerPage={pageSize}
                            recordsPerPageOptions={PAGE_SIZES}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            onRecordsPerPageChange={handleRecordsPerPageChange}
                            paginationText={({ from, to, totalRecords }) =>
                                `Showing ${from} to ${to} of ${totalRecords} entries`
                            }
                            paginationSize="md"
                            paginationActiveBackgroundColor="gray"
                            paginationActiveTextColor="#e6e348"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

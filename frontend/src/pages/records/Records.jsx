import React, { useCallback, useEffect, useState } from "react";
import {
    Search,
    Upload,
    FileSearch,
    X,
} from "lucide-react";
import { can } from "../../utils/auth";
import { useAuth } from "../../context/AuthProvider";
import { ActionIcon, TextInput } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useDebouncedValue } from "@mantine/hooks";
import { Link, useNavigate } from "react-router-dom";
import { showTopErrorAlert } from "../../utils/sweetAlert";
import axiosClient from "../../assets/js/axios-client";
import Loading from '../../components/Loading'
import RecordForm from "./RecordForm";
import { useModal } from "../../context/ModalContext";

export default function Records() {
    const { user } = useAuth();
    const { openModal } = useModal();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [records, setRecords] = useState([]);
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

        getRecords(1, newPageSize, debouncedQuery, sortStatus);
    };

    const getRecords = useCallback(
        async (page, perPage, search, sort) => {
            try {
                setLoading(true);
                const response = await axiosClient.get("/records", {
                    params: {
                        page,
                        per_page: perPage,
                        search,
                        sort_by: sort.columnAccessor,
                        sort_order: sort.direction,
                        ...debouncedcolumnFilters,
                    },
                    timeout: 30000,
                })
                setRecords(response.data.records.data);
                setTotalRecords(response.data.records.total);
            } catch (err) {
                console.log(err);
                showTopErrorAlert(err);
            } finally {
                setLoading(false);
            }
        },
        [debouncedcolumnFilters]
    );

    useEffect(() => {
        getRecords(page, pageSize, debouncedQuery, sortStatus);
    }, [page, pageSize, debouncedQuery, sortStatus, debouncedcolumnFilters]);

    const navigateTo = (route) => {
        navigate(route)
    }

    let cols = [
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
            key: "record_number",
            accessor: "record_number",
            title: "Record Number",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="record number"
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
                                    record_number: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["record_number"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("record_number", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["record_number"],
        },
        {
            key: "first_name",
            accessor: "personal_records.0.first_name",
            title: "First Name",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="first name"
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
                                    first_name: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["first_name"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("first_name", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["first_name"],
        },
        {
            key: "middle_name",
            accessor: "personal_records.0.middle_name",
            title: "Middle Name",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="middle name"
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
                                    middle_name: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["middle_name"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("middle_name", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["middle_name"],
        },
        {
            key: "last_name",
            accessor: "personal_records.0.last_name",
            title: "Last Name",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="last name"
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
                                    last_name: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["last_name"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("last_name", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["last_name"],
        },
        {
            key: "email",
            accessor: "email",
            title: "Email",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="Email"
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
                                    email: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["email"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("email", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["email"],
        },
        {
            key: "phone",
            accessor: "personal_records.0.phone",
            title: "Phone Number",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="phone Number"
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
                                    phone: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["phone"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("phone", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["phone"],
        }
    ];

    if (can(user, "manage_classified_records")) {
        cols.push({
            accessor: "is_classified",
            title: "Classified",
            sortable: true,
            render: (row) => (row.personal_records?.[0]?.is_classified ? <div className="w-fit py-1 px-3 bg-red-600 text-white rounded-md text-lg font-semibold hover:bg-red-700 cursor-pointer">Classified</div> : <div className="w-fit py-1 px-3 bg-green-600 text-white rounded-md text-lg font-semibold hover:bg-green-700 cursor-pointer">Unclassified</div>),
        });
    }

    cols.push({
        key: "action",
        accessor: "action",
        title: "Action",
        sortable: false,
        thProps: {
            style: { whiteSpace: "normal", wordBreak: "break-word" },
        },
        render: (row) => (
            <div className="my-1 w-fit">
                <Link to={`/records/personal/${row.id}`}>
                    <button className="w-fit py-1 px-3 bg-slate-600 text-white rounded-md text-lg font-semibold hover:bg-slate-700 cursor-pointer">
                        view
                    </button>
                </Link>
            </div>
        ),
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Personal Records
                    </h1>
                </div>

                {can(user, "upload_document") && (
                    <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                        onClick={() =>
                            openModal(
                                <RecordForm
                                    navigateTo={navigateTo}
                                />,
                                "xl7",
                                "Create New Record Profile"
                            )
                        }
                    >
                        <Upload size={18} />
                        New Record  Profile
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
                    onChange={handleSearchChange}
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
                            records={records}
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

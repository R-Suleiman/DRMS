import React, { useCallback, useEffect, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
} from "lucide-react";
import { can } from "../../utils/auth";
import { useAuth } from "../../context/AuthProvider";
import { DataTable } from "mantine-datatable";
import { useDebouncedValue } from "@mantine/hooks";
import { showConfirmAlert, showTopErrorAlert, showTopSuccessAlert } from "../../utils/sweetAlert";
import axiosClient from "../../assets/js/axios-client";
import Loading from '../../components/Loading'
import { useModal } from "../../context/ModalContext";
import DepartmentForm from "./DepartmentForm";

export default function Departments() {
    const { user } = useAuth();
    const { openModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [departments, setDepartments] = useState([]);
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

        getDepartments(1, newPageSize, debouncedQuery, sortStatus);
    };

    const getDepartments = useCallback(
        async (page, perPage, search, sort) => {
            try {
                setLoading(true);
                const response = await axiosClient.get("/departments", {
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
                setDepartments(response.data.departments.data);
                setTotalRecords(response.data.departments.total);
            } catch (err) {
                console.log(err);
                showTopErrorAlert(err);
            } finally {
                setLoading(false);
            }
        },
        [debouncedcolumnFilters]
    );

    const deleteDepartment = (departmentId) => {
        showConfirmAlert(
            "Delete Department",
            "Are you sure you want to delete this department?",
            () => deleteDepartmentCallback(departmentId)
        );
    };

    const deleteDepartmentCallback = async (departmentId) => {
        try {
            const response = await axiosClient.delete(
                `/departments/${departmentId}`
            );
            if (response.data && response.data.success) {
                showTopSuccessAlert(response.data.message);
                getDepartments(page, pageSize, debouncedQuery, sortStatus);
            }
        } catch (error) {
            const response = error.response;
            if (response && response.data && response.data.message) {
                showTopErrorAlert(response.data.message);
            } else {
                showTopErrorAlert("Failed to delete department");
            }
        }
    };

    const openEditModal = (department) => {
        openModal(<DepartmentForm department={department} reload={() => getDepartments(page, pageSize, debouncedQuery, sortStatus)} />);
    };

    const openAddModal = () => {
        openModal(<DepartmentForm reload={() => getDepartments(page, pageSize, debouncedQuery, sortStatus)} />);
    };

    useEffect(() => {
        getDepartments(page, pageSize, debouncedQuery, sortStatus);
    }, [page, pageSize, debouncedQuery, sortStatus, getDepartments]);

    const cols = [
        {
            accessor: "id",
            title: "ID",
            sortable: true,
            thProps: {
                style: { whiteSpace: "normal", wordBreak: "break-word" },
            },
            render: (row, index) => (page - 1) * pageSize + index + 1,
        },
        {
            accessor: "name",
            title: "Department Name",
            sortable: true,
            render: (department) => (
                <span className="text-sm font-medium text-slate-800">
                    {department.name}
                </span>
            ),
        },
        {
            accessor: "short_name",
            title: "Short Name",
            sortable: true,
            render: (department) => (
                <span className="text-sm text-slate-600">{department.short_name}</span>
            ),
        },
        {
            accessor: "actions",
            title: "Actions",
            render: (department) => (
                <div className="flex gap-2">
                    {can(user, "manage_departments") && (
                        <>
                            <button
                                onClick={() => openEditModal(department)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => deleteDepartment(department.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Manage departments in the system
                    </p>
                </div>
                {can(user, "manage_departments") && (
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                    >
                        <Plus size={18} />
                        Add Department
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-white p-4 rounded-lg border border-slate-200">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Search departments..."
                    value={search}
                    onChange={handleSearchChange}
                    className="flex-1 outline-none text-slate-700"
                />
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {loading ? (
                    <Loading />
                ) : (
                    <DataTable
                            noRecordsText="No records found"
                            borderRadius="md"
                            minHeight={170}
                            verticalAlign="center"
                            withTableBorder
                            withColumnBorders
                            striped
                            highlightOnHover
                            records={departments}
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
    );
}

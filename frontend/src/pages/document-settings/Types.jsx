import React, { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import axiosClient from "../../assets/js/axios-client";
import { DataTable } from "mantine-datatable";
import { useDebouncedValue } from "@mantine/hooks";
import Loading from "../../components/Loading";
import { useModal } from "../../context/ModalContext";
import TypeForm from "./TypeForm";
import {
    showConfirmAlert,
    showTopErrorAlert,
    showTopSuccessAlert,
} from "../../utils/sweetAlert";
import { useAuth } from "../../context/AuthProvider";
import { can } from "../../utils/auth";

export default function Types() {
    const { user } = useAuth();
    const { openModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [types, setTypes] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const PAGE_SIZES = [5, 10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [debouncedQuery] = useDebouncedValue(search, 500);
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: "created_at",
        direction: "desc",
    });

    const getTypes = useCallback(async (page, perPage, search, sort) => {
        try {
            setLoading(true);
            const response = await axiosClient.get("/document-types", {
                params: {
                    page,
                    per_page: perPage,
                    search,
                    sort_by: sort.columnAccessor,
                    sort_order: sort.direction,
                },
                timeout: 30000,
            });
            setTypes(response.data.types.data);
            setTotalRecords(response.data.types.total);
        } catch (err) {
            console.log(err);
            showTopErrorAlert(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getTypes(page, pageSize, debouncedQuery, sortStatus);
    }, [page, pageSize, debouncedQuery, sortStatus, getTypes]);

    const openAddModal = () =>
        openModal(
            <TypeForm
                reload={() =>
                    getTypes(page, pageSize, debouncedQuery, sortStatus)
                }
            />,
        );
    const openEditModal = (type) =>
        openModal(
            <TypeForm
                type={type}
                reload={() =>
                    getTypes(page, pageSize, debouncedQuery, sortStatus)
                }
            />,
        );

    const deleteType = (id) => {
        showConfirmAlert(
            "Delete Type",
            "Are you sure you want to delete this type?",
            () => deleteTypeCallback(id),
        );
    };

    const deleteTypeCallback = async (id) => {
        try {
            const response = await axiosClient.delete(`/document-types/${id}`);
            if (response.data && response.data.success) {
                showTopSuccessAlert(response.data.message);
                getTypes(page, pageSize, debouncedQuery, sortStatus);
            }
        } catch (err) {
            showTopErrorAlert(
                err?.response?.data?.message || "Failed to delete type",
            );
        }
    };

    const columns = [
        { accessor: "id", title: "ID", sortable: true },
        {
            accessor: "name",
            title: "Type Name",
            sortable: true,
            render: (t) => t.name,
        },
        {
            accessor: "category_name",
            title: "Category",
            sortable: true,
            render: (t) => t.category?.category_name,
        },
        {
            accessor: "actions",
            title: "Actions",
            render: (t) => (
                <div className="flex gap-2">
                    {can(user, "manage_document_settings") && (
                        <>
                            <button
                                onClick={() => openEditModal(t)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                <Pencil size={16} />
                            </button>
                            <button
                                onClick={() => deleteType(t.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Search size={18} className="text-slate-400" />
                    <input
                        placeholder="Search types..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="outline-none text-slate-700"
                    />
                </div>
                {can(user, "manage_document_settings") && (
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                    >
                        <Plus size={16} /> Add Type
                    </button>
                )}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                {loading ? (
                    <Loading />
                ) : (
                    <DataTable
                        columns={columns}
                        records={types}
                        totalRecords={totalRecords}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={setPage}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={(n) => {
                            setPageSize(n);
                            setPage(1);
                            getTypes(1, n, debouncedQuery, sortStatus);
                        }}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        paginationSize="md"
                        paginationActiveBackgroundColor="gray"
                        paginationActiveTextColor="#e6e348"
                    />
                )}
            </div>
        </div>
    );
}

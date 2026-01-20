import React, { useCallback, useEffect, useState } from 'react'
import axiosClient from '../../assets/js/axios-client'
import { useModal } from '../../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { showConfirmAlert, showTopErrorAlert, showTopSuccessAlert } from '../../utils/sweetAlert';
import { Search, Upload } from 'lucide-react';
import Loading from '../../components/Loading';
import { ActionIcon, TextInput } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useDebouncedValue } from "@mantine/hooks";
import RoleForm from './RoleForm';
import RolePermissionsForm from './RolePermissionsForm';

function Roles() {
    const [roles, setRoles] = useState([])
    const { openModal } = useModal();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const PAGE_SIZES = [5, 10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState("");
    const [debouncedQuery] = useDebouncedValue(search, 500);
    const [sortStatus, setSortStatus] = useState({
        columnAccessor: "created_at",
        direction: "asc",
    });

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearch(value);
        setPage(1);
    };

    const handleRecordsPerPageChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1);

        getRecords(1, newPageSize, debouncedQuery, sortStatus);
    };

    const getRoles = useCallback(
        async (page, perPage, search, sort) => {
            try {
                setLoading(true);
                const response = await axiosClient.get("/roles", {
                    params: {
                        page,
                        per_page: perPage,
                        search,
                        sort_by: sort.columnAccessor,
                        sort_order: sort.direction,
                    },
                    timeout: 30000,
                })
                setRoles(response.data.roles.data);
                setTotalRecords(response.data.roles.total);
            } catch (err) {
                console.log(err);
                showTopErrorAlert(err);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        getRoles(page, pageSize, debouncedQuery, sortStatus);
    }, [page, pageSize, debouncedQuery, sortStatus]);

    const reload = () => {
        getRoles(page, pageSize, debouncedQuery, sortStatus);
    }

    const deleteRole = (roleId) => {
        showConfirmAlert(
            "Delete Role",
            "Are you sure you want to delete this role? User with this role will lose the role and it's permissions",
            () => deleteRoleCallback(roleId)
        );
    };

    const deleteRoleCallback = async (roleId) => {
        try {
            const response = await axiosClient.delete(
                `/roles/${roleId}`
            );
            showTopSuccessAlert(response.data.message);
            reload()
        } catch (error) {
            const response = error.response;
            showTopErrorAlert(response.data.message);
        }
    };

    const cols = [
        {
            key: "sn",
            accessor: "sn",
            title: "SN",
            sortable: false,
            width: 50,
            thProps: {
                style: { whiteSpace: "normal", wordBreak: "break-word" },
            },
            render: (row, index) => (page - 1) * pageSize + index + 1,
        },
        {
            key: "name",
            accessor: "name",
            title: "Role Name",
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
        },
        {
            key: "action",
            accessor: "action",
            title: "Action",
            sortable: false,
            width: 300,
            thProps: {
                style: { whiteSpace: "normal", wordBreak: "break-word" },
            },
            render: (row) => (
                <div className="my-1 w-fit flex items-center space-x-2">
                    <button className="w-fit py-1 px-3 bg-slate-600 text-white rounded-md text-lg font-semibold hover:bg-slate-700 cursor-pointer"
                    onClick={() =>
                        openModal(
                            <RolePermissionsForm
                                roleId={row.id}
                                reload={reload}
                            />,
                            "xl2",
                            `${row.name} Permissions`
                        )
                    }
                    >
                        Permissions
                    </button>
                    <button className="w-fit py-1 px-3 bg-green-600 text-white rounded-md text-lg font-semibold hover:bg-green-700 cursor-pointer"
                        onClick={() =>
                            openModal(
                                <RoleForm
                                    reload={reload}
                                    role={row}
                                />,
                                "lg",
                                "Edit Role"
                            )
                        }
                    >

                        Edit
                    </button>
                    <button className="w-fit py-1 px-3 bg-red-600 text-white rounded-md text-lg font-semibold hover:bg-red-700 cursor-pointer"
                    onClick={() => deleteRole(row.id)}
                    >
                        Delete
                    </button>
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
                        Roles & Permissions
                    </h1>
                </div>
                <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                    onClick={() =>
                        openModal(
                            <RoleForm
                                reload={reload}
                            />,
                            "lg",
                            "Create New Role"
                        )
                    }
                >
                    <Upload size={18} />
                    New Role
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search
                    className="absolute left-3 top-3 text-slate-400"
                    size={18}
                />
                <input
                    type="text"
                    placeholder="Search by role name..."
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
                            records={roles}
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

    )
}

export default Roles

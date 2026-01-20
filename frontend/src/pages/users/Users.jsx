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
import { showConfirmAlert, showTopErrorAlert, showTopSuccessAlert } from "../../utils/sweetAlert";
import axiosClient from "../../assets/js/axios-client";
import Loading from '../../components/Loading'
import { useModal } from "../../context/ModalContext";
import UserForm from "./UserForm";
import UserRolesForm from "./UserRolesForm";

export default function Users() {
    const { user } = useAuth();
    const { openModal } = useModal();
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [users, setUsers] = useState([]);
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

        getUsers(1, newPageSize, debouncedQuery, sortStatus);
    };

    const getUsers = useCallback(
        async (page, perPage, search, sort) => {
            try {
                setLoading(true);
                const response = await axiosClient.get("/users", {
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
                setUsers(response.data.users.data);
                setTotalRecords(response.data.users.total);
            } catch (err) {
                console.log(err);
                showTopErrorAlert(err);
            } finally {
                setLoading(false);
            }
        },
        [debouncedcolumnFilters]
    );

    const deleteUser = (userId) => {
        showConfirmAlert(
            "Delete User",
            "Are you sure you want to delete this user?",
            () => deleteUserCallback(userId)
        );
    };

    const deleteUserCallback = async (userId) => {
        try {
            const response = await axiosClient.delete(
                `/users/${userId}`
            );
            showTopSuccessAlert(response.data.message);
            getUsers(page, pageSize, debouncedQuery, sortStatus);
        } catch (error) {
            const response = error.response
            showTopErrorAlert(response.data.message);
        }
    };

    const resetPassword = (userId) => {
        showConfirmAlert(
            "Reset User Password",
            "The password will be reset to the user's last name in lowercase",
            () => resetPasswordCallback(userId)
        );
    };

    const resetPasswordCallback = async (userId) => {
        try {
            const response = await axiosClient.post(
                `/users/${userId}/reset-password`
            );
            showTopSuccessAlert(response.data.message);
            getUsers(page, pageSize, debouncedQuery, sortStatus);
        } catch (error) {
            const response = error.response
            showTopErrorAlert(response.data.message);
        }
    };

    useEffect(() => {
        getUsers(page, pageSize, debouncedQuery, sortStatus);
    }, [page, pageSize, debouncedQuery, sortStatus, debouncedcolumnFilters]);

    const reload = () => {
        getUsers(page, pageSize, debouncedQuery, sortStatus);
    }

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
            key: "first_name",
            accessor: "first_name",
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
            accessor: "middle_name",
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
            accessor: "last_name",
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
            key: "role",
            accessor: "roles",
            title: "Role",
            render: (row) => `${row.roles.map((r) => ' ' + r)}`,
            sortable: true,
            style: {
                whiteSpace: "normal",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            filter: (
                <TextInput
                    label="role"
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
                                    role: "",
                                }))
                            }
                        >
                            <X size={14} />
                        </ActionIcon>
                    }
                    value={columnFilters["role"] || ""}
                    onChange={(e) =>
                        handleColumnSearchChange("role", e.target.value)
                    }
                />
            ),
            filtering: !!columnFilters["role"],
        },
        {
            key: "action",
            accessor: "action",
            title: "Action",
            sortable: false,
            width: 350,
            thProps: {
                style: { whiteSpace: "normal", wordBreak: "break-word" },
            },
            render: (row) => (
                <div className="my-1 w-fit flex items-center space-x-2">
                    <button className="w-fit py-1 px-3 bg-slate-600 text-white rounded-md text-lg font-semibold hover:bg-slate-700 cursor-pointer"
                        onClick={() =>
                            openModal(
                                <UserRolesForm
                                    userId={row.id}
                                    reload={reload}
                                />,
                                "xl",
                                "Manage User Roles"
                            )
                        }
                    >
                        Roles
                    </button>
                    {can(user, "update_user") && (
                        <button className="w-fit py-1 px-3 bg-green-600 text-white rounded-md text-lg font-semibold hover:bg-green-700 cursor-pointer"
                            onClick={() =>
                                openModal(
                                    <UserForm
                                        reload={reload}
                                        user={row}
                                    />,
                                    "xl",
                                    "Edit User Details"
                                )
                            }
                        >
                            Edit
                        </button>
                    )}
                    {can(user, "reset_user_password") && (
                        <button className="w-fit py-1 px-3 bg-orange-600 text-white rounded-md text-lg font-semibold hover:bg-orange-700 cursor-pointer"
                            onClick={() => resetPassword(row.id)}
                        >
                            Reset Pass
                        </button>
                    )}
                    {can(user, "delete_user") && (
                        <button className="w-fit py-1 px-3 bg-red-600 text-white rounded-md text-lg font-semibold hover:bg-red-700 cursor-pointer"
                            onClick={() => deleteUser(row.id)}
                        >
                            Delete
                        </button>
                    )}
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
                        Users
                    </h1>
                </div>

                {can(user, "create_user") && (
                    <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                        onClick={() =>
                            openModal(
                                <UserForm
                                    reload={reload}
                                />,
                                "xl",
                                "Create New User"
                            )
                        }
                    >
                        <Upload size={18} />
                        Create User
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
                    placeholder="Search by name, email..."
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
                            records={users}
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

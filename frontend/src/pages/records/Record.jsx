import React, { useEffect, useMemo, useState } from "react";
import {
    User,
    Mail,
    Phone,
    Calendar,
    FileText,
    Upload,
    Eye,
    Trash2,
    Edit3,
    Shield,
    Search,
    ArrowLeft,
    Trash,
    Folder,
} from "lucide-react";
import { can } from "../../utils/auth";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { showConfirmAlert, showTopErrorAlert, showTopSuccessAlert } from "../../utils/sweetAlert";
import axiosClient from "../../assets/js/axios-client";
import Loading from "../../components/Loading";
import { DataTable } from "mantine-datatable";
import { useDebouncedValue } from "@mantine/hooks";
import { useModal } from "../../context/ModalContext";
import DocumentForm from "./DocumentForm";
import DocumentViewer from "../../components/DocumentViewer";
import RecordForm from "./RecordForm";

const records = [
    {
        id: 1,
        type: "Birth Certificate",
        uploaded_at: "2026-01-10",
    },
    {
        id: 2,
        type: "National ID",
        uploaded_at: "2026-01-15",
    },
];

export default function Record() {
    const { user } = useAuth();
    const { id } = useParams();
    const [record, setRecord] = useState({});
    const [loading, setLoading] = useState(true);
    const { openModal } = useModal();
    const navigate = useNavigate()

    const [page, setPage] = useState(1);
    const [documents, setDocuments] = useState([]);
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

    const handleRecordsPerPageChange = (newPageSize) => {
        setPageSize(newPageSize);
        setPage(1);
    };

    // normalize nested data
    const normalizedDocuments = useMemo(() => {
        return documents?.map(doc => ({
            ...doc,
            volume_name: doc.volume?.volume_name ?? '',
            category_name: doc.category?.category_name ?? '',
            type_name: doc.type?.name ?? '',
        }));
    }, [documents]);


    const filtered = useMemo(() => {
        return normalizedDocuments?.filter((item) =>
            Object.values(item).some((value) =>
                String(value)
                    .toLowerCase()
                    .includes(debouncedQuery.toLowerCase())
            )
        );
    }, [normalizedDocuments, debouncedQuery]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const aVal = a[sortStatus.columnAccessor];
            const bVal = b[sortStatus.columnAccessor];

            if (aVal === bVal) return 0;

            return sortStatus.direction === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [filtered, sortStatus]);

    const paginated = useMemo(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return sorted.slice(from, to);
    }, [sorted, page, pageSize]);

    const getRecord = async () => {
        try {
            const response = await axiosClient.get(`/records/${id}`);
            setRecord(response.data.record);
            setDocuments(response.data.record.documents);
            setLoading(false);
        } catch (error) {
            showTopErrorAlert(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getRecord();
    }, []);

    const deleteDocument = (documentId) => {
        showConfirmAlert(
            "Delete Document",
            "Are you sure you want to delete this document?",
            () => deleteDocumentCallback(documentId)
        );
    };

    const deleteDocumentCallback = async (documentId) => {
        try {
            const response = await axiosClient.delete(
                `/records/documents/${documentId}`
            );
            showTopSuccessAlert(response.data.message);
            getRecord();
        } catch (error) {
            showTopErrorAlert(error);
        }
    };

    const deleteRecord = (recordId) => {
        showConfirmAlert(
            "Delete Record",
            "Are you sure you want to delete this Profile? All the documents for this profile will be deleted too",
            () => deleteRecordCallback(recordId)
        );
    };

    const deleteRecordCallback = async (recordId) => {
        try {
            const response = await axiosClient.delete(
                `/records/${recordId}`
            );
            showTopSuccessAlert(response.data.message);
            navigate('/records/personal')
        } catch (error) {
            showTopErrorAlert(error);
        }
    };

    const viewDocument = (documentId) => {
        const url = `${import.meta.env.VITE_API_BASE_URL}/records/documents/${documentId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const navigateTo = (route) => {
        getRecord();
    }

    console.log(record)

    const cols = [
        {
            accessor: "sn",
            title: "SN",
            width: 50,
            sortable: false,
            render: (row, index) => {
                return (page - 1) * pageSize + (index ?? 0) + 1;
            },
        },
        {
            accessor: "category.category_name",
            title: "Record Category",
            sortable: true,
        },
        {
            accessor: "type.name",
            title: "Record Name",
            sortable: true,
        },
        {
            accessor: "volume.volume_name",
            title: "Volume Number",
            sortable: true,
        },
        {
            accessor: "size",
            title: "Size",
            render: (row) => <span>{(row.size / 1000000).toFixed(2)} MB</span>,
            sortable: true,
        },
        {
            accessor: "mime_type",
            title: "File Type",
            sortable: true,
        },
        {
            accessor: "actions",
            title: "Action",
            width: 100,
            render: (row) => (
                <div className="flex items-center justify-end gap-2">
                    {can(user, "view_document") && (
                        <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group/btn"
                            onClick={() => viewDocument(row.id)}
                        >
                            <Eye
                                size={18}
                                className="group-hover/btn:scale-110 transition-transform"
                            />
                        </button>
                    )}

                    {can(user, "delete_document") && (
                        <button className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group/btn"
                            onClick={() => deleteDocument(row.id)}
                        >
                            <Trash2
                                size={18}
                                className="group-hover/btn:scale-110 transition-transform"
                            />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-2 sm:px-6 lg:px-8">
            <div className="max-w-11/12 mx-auto space-y-8">
                <Link to="/records/personal">
                    <div className="bg-slate-600 py-1 px-2 w-fit rounded-md m-2">
                        <ArrowLeft className=" text-white text-2xl" />{" "}
                    </div>
                </Link>
                {/* Profile Card */}
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transition-all duration-300 hover:shadow-2xl">
                    {/* Decorative linear overlay */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative flex flex-col md:flex-row gap-8">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <div className="relative">
                                <div className="absolute inset-0 bg-linear-to-br from-slate-500 via-slate-600 to-slate-800 rounded-full blur-md opacity-50 animate-pulse" />
                                <div className="relative w-32 h-32 rounded-full bg-linear-to-br from-slate-500 via-slate-600 to-slate-800 p-1">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                        {
                                            record.personal_records?.[0]?.photo_url ? <img
                                                src={record.personal_records?.[0]?.photo_url}
                                                alt="Profile photo"
                                                className="h-full rounded-full object-cover"
                                            /> :
                                                <User
                                                    className="text-slate-600"
                                                    size={48}
                                                />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-linear-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent flex items-center gap-2">
                                    {record.personal_records?.[0]?.first_name}{" "}
                                    {record.personal_records?.[0]?.middle_name &&
                                        record.personal_records?.[0]?.middle_name + " "}
                                    {record.personal_records?.[0]?.last_name}
                                    {record.personal_records?.[0]?.is_classified ? <span className="text-sm font-medium capitalize bg-red-500 text-white px-2 py-1 rounded-md">Classified</span> : <span className="text-sm font-medium capitalize bg-green-500 text-white px-2 py-1 rounded-md">Unclassified</span>}
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <Shield
                                        className="text-slate-500"
                                        size={16}
                                    />
                                    <p className="text-sm font-medium text-slate-600 capitalize">
                                        {record.personal_records?.[0]?.gender === "F"
                                            ? "Female"
                                            : "Male"}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="group flex items-center gap-3 p-3 rounded-xl bg-linear-to-br from-slate-50 to-slate-50 border border-slate-100/50 hover:shadow-md transition-all duration-200">
                                    <div className="p-2 rounded-lg bg-slate-500/10 group-hover:bg-slate-500/20 transition-colors">
                                        <Folder
                                            className="text-slate-600"
                                            size={18}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Record Number
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {record?.record_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="group flex items-center gap-3 p-3 rounded-xl bg-linear-to-br from-slate-50 to-slate-50 border border-slate-100/50 hover:shadow-md transition-all duration-200">
                                    <div className="p-2 rounded-lg bg-slate-500/10 group-hover:bg-slate-500/20 transition-colors">
                                        <Calendar
                                            className="text-slate-600"
                                            size={18}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Date of Birth
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {formatDate(record.personal_records?.[0]?.dob)}
                                        </p>
                                    </div>
                                </div>

                                <div className="group flex items-center gap-3 p-3 rounded-xl bg-linear-to-br from-slate-50 to-slate-50 border border-slate-100/50 hover:shadow-md transition-all duration-200">
                                    <div className="p-2 rounded-lg bg-slate-500/10 group-hover:bg-slate-500/20 transition-colors">
                                        <Phone
                                            className="text-slate-600"
                                            size={18}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Phone
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {record.personal_records?.[0]?.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="group flex items-center gap-3 p-3 rounded-xl bg-linear-to-br from-slate-50 to-slate-50 border border-slate-100/50 hover:shadow-md transition-all duration-200">
                                    <div className="p-2 rounded-lg bg-slate-500/10 group-hover:bg-slate-500/20 transition-colors">
                                        <Mail
                                            className="text-slate-600"
                                            size={18}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Email
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700 truncate">
                                            {record.personal_records?.[0]?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="group flex items-center gap-3 p-3 rounded-xl bg-linear-to-br from-slate-50 to-slate-50 border border-slate-100/50 hover:shadow-md transition-all duration-200">
                                    <div className="p-2 rounded-lg bg-slate-500/10 group-hover:bg-slate-500/20 transition-colors">
                                        <User
                                            className="text-slate-600"
                                            size={18}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            NIDA
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700 truncate">
                                            {record.personal_records?.[0]?.nida}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm font-medium text-slate-600 capitalize">
                                Records Metadata
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {record?.metadata?.length > 0 ? (
                                    record?.metadata?.map((data, index) => {
                                        return (
                                            <div key={index} className="group flex items-center gap-3 p-3 rounded-xl bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200/50 hover:shadow-md transition-all duration-200">
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        {data.meta_key}
                                                    </p>
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {data.meta_value}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <tr className="bg-linear-to-r from-slate-100 to-slate-200/50 border-b border-slate-200">
                                        <td className="text-sm text-center text-slate-500">No metadata found</td>
                                    </tr>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            {can(user, "update_record") && (
                                <button className="group px-6 py-3 text-sm font-medium rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                    onClick={() =>
                                        openModal(
                                            <RecordForm
                                                record={record}
                                                navigateTo={navigateTo}
                                            />,
                                            "xl7",
                                            "Edit Record"
                                        )
                                    }
                                >
                                    <Edit3
                                        size={16}
                                        className="group-hover:rotate-12 transition-transform"
                                    />
                                    Edit Profile
                                </button>
                            )}

                            {can(user, "delete_record") && (
                                <button
                                    className="group px-6 py-3 text-sm font-medium rounded-xl bg-linear-to-r from-red-600 to-red-600 text-white hover:from-red-700 hover:to-red-700 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    onClick={() => deleteRecord(id)}
                                >
                                    <Trash
                                        size={16}
                                        className="group-hover:translate-y-[-2px] transition-transform"
                                    />
                                    Delete Profile
                                </button>
                            )}

                            {can(user, "upload_document") && (
                                <button
                                    className="group px-6 py-3 text-sm font-medium rounded-xl bg-linear-to-r from-slate-600 to-slate-600 text-white hover:from-slate-700 hover:to-slate-700 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                                    onClick={() =>
                                        openModal(
                                            <DocumentForm
                                                recordId={id}
                                                reload={getRecord}
                                                nature='personal'
                                            />,
                                            "xl5",
                                            "Upload Record Documents"
                                        )
                                    }
                                >
                                    <Upload
                                        size={16}
                                        className="group-hover:translate-y-[-2px] transition-transform"
                                    />
                                    Upload Document
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Records Section */}
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 transition-all duration-300 hover:shadow-2xl">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />

                    <div className="relative">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-200/50 bg-linear-to-r from-slate-50/50 to-white/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    Records
                                </h2>
                            </div>
                            <div className="px-4 py-2 rounded-full bg-linear-to-r from-slate-100 to-blue-100 border border-slate-200/50">
                                <span className="text-sm font-semibold text-slate-700">
                                    {record.documents?.length}{" "}
                                    {record.documents?.length === 1
                                        ? "document"
                                        : "documents"}
                                </span>
                            </div>
                        </div>

                        <div className="relative max-w-md m-2">
                            <Search
                                className="absolute left-3 top-3 text-slate-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by document name, type..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-md border border-slate-200 overflow-hidden m-2">
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
                                        className="whitespace-nowrap table-hover"
                                        withTableBorder
                                        withColumnBorders
                                        striped
                                        highlightOnHover
                                        records={paginated}
                                        columns={cols}
                                        totalRecords={totalRecords}
                                        page={page}
                                        onPageChange={setPage}
                                        recordsPerPage={pageSize}
                                        recordsPerPageOptions={PAGE_SIZES}
                                        sortStatus={sortStatus}
                                        onSortStatusChange={setSortStatus}
                                        onRecordsPerPageChange={
                                            handleRecordsPerPageChange
                                        }
                                        idAccessor="id"
                                        loadingText="Loading....."
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

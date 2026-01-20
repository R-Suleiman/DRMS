import React, { useEffect, useState } from "react";
import {
    Activity,
    Users,
    FileText,
    ShieldCheck,
    Upload,
    Bell,
    AlertTriangle,
    Clock3,
    ArrowRight,
} from "lucide-react";
import { can } from "../utils/auth";
import axiosClient from "../assets/js/axios-client";
import { Link, useNavigate } from "react-router-dom";
import RecordForm from "./records/RecordForm";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthProvider";

function Dashboard() {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState([])
    const [stats, setStats] = useState([])
    const navigate = useNavigate()
    const { openModal } = useModal()

    useEffect(() => {
        const getStats = async () => {
            const response = await axiosClient.get('/stats')
            if (response.data && response.data.success) {
                setStatsData(response.data.stats)
            }
        }

        getStats()
    }, [])

    useEffect(() => {
        setStats([
            {
                title: "Total Records",
                value: statsData.totalRecords,
                icon: FileText,
            },
            {
                title: "Documents Uploaded",
                value: statsData.totalDocuments,
                icon: Upload,
            },
            {
                title: "System Users",
                value: statsData.users,
                icon: Users,
            },
        ]);
    }, [statsData])

    const navigateTo = (route) => {
        navigate(route)
    }

    const activities = [
        {
            title: "New record added",
            description: "Jane Doe (Record ID: 4932)",
            time: "2m ago",
            icon: Activity,
        },
        {
            title: "Document uploaded",
            description: "Birth Certificate - John Smith",
            time: "18m ago",
            icon: Upload,
        },
        {
            title: "Role updated",
            description: "Admin role permissions adjusted",
            time: "1h ago",
            icon: ShieldCheck,
        },
        {
            title: "Security warning",
            description: "2 failed login attempts",
            time: "2h ago",
            icon: AlertTriangle,
        },
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 p-3 sm:p-6 lg:py-8 lg:px-2">
            <div className="max-w-11/12 mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">
                            Welcome back,
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                            Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Monitor records, documents, and security at a glance.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                            <Bell size={16} />
                            Notifications
                        </button>
                        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-lg transition">
                            <Upload size={16} />
                            Quick Upload
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {stats.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition p-5"
                            >
                                <div
                                    className="absolute inset-0 opacity-80 bg-linear-to-br from-slate-500/20 to-slate-600/15"
                                />
                                <div className="relative flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                                            {item.title}
                                        </p>
                                        <h3 className="text-2xl font-bold text-slate-900">
                                            {item.value}
                                        </h3>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/80 text-slate-700 shadow-sm">
                                        <Icon size={22} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent activity */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Recent Activity
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Latest updates across records and documents.
                                </p>
                            </div>
                            <button className="text-sm font-semibold text-slate-600 hover:text-slate-800 inline-flex items-center gap-1">
                                View all
                                <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {activities.map((activity, index) => {
                                const Icon = activity.icon;
                                return (
                                    <div
                                        key={index}
                                        className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition"
                                    >
                                        <div
                                            className="p-3 rounded-xl text-slate-600 bg-slate-50 flex items-center justify-center"
                                        >
                                            <Icon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {activity.title}
                                            </p>
                                            <p className="text-sm text-slate-500 truncate">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Clock3 size={14} />
                                            {activity.time}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick actions & alerts */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Quick Actions
                                </h3>
                                <span className="text-xs text-slate-500">
                                    Stay productive
                                </span>
                            </div>
                            <div className="space-y-3">
                                {can(user, "upload_document") && (
                                    <button
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-slate-700 to-slate-800 hover:shadow-lg transition cursor-pointer`}
                                    >
                                        <button className="flex items-center gap-3"
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
                                            <span className="p-2 rounded-lg bg-white/15">
                                                <Upload size={18} />
                                            </span>
                                            New Record Profile
                                        </button>
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                                {can(user, "manage_roles") && (
                                <Link to='/roles'>
                                    <button
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-slate-700 to-slate-800 hover:shadow-lg transition cursor-pointer`}
                                    >
                                        <button className="flex items-center gap-3"
                                        >
                                            <span className="p-2 rounded-lg bg-white/15">
                                                <ShieldCheck size={18} />
                                            </span>
                                            Manage Roles & Permissions
                                        </button>
                                        <ArrowRight size={16} />
                                    </button>
                                </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

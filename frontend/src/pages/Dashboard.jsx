import React, { useEffect, useState } from "react";
import {
    Users,
    FileText,
    ShieldCheck,
    Upload,
    Bell,
    ArrowRight,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { can } from "../utils/auth";
import axiosClient from "../assets/js/axios-client";
import { Link, useNavigate } from "react-router-dom";
import RecordForm from "./records/RecordForm";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthProvider";
import ServiceRecordForm from "./records/ServiceRecords/ServiceRecordForm";

function Dashboard() {
    const { user } = useAuth();
    const [statsData, setStatsData] = useState({});
    const [stats, setStats] = useState([]);
    const navigate = useNavigate();
    const { openModal } = useModal();

    useEffect(() => {
        const getStats = async () => {
            const response = await axiosClient.get('/stats');
            if (response.data && response.data.success) {
                setStatsData(response.data.stats);
            }
        };

        getStats();
    }, []);

    useEffect(() => {
        setStats([
            {
                title: "Total Personal Records",
                value: statsData.totalPersonalRecords ?? 0,
                icon: FileText,
            },
            {
                title: "Total Service Records",
                value: statsData.totalServiceRecords ?? 0,
                icon: FileText,
            },
            {
                title: "Documents Uploaded",
                value: statsData.totalDocuments ?? 0,
                icon: Upload,
            },
            {
                title: "System Users",
                value: statsData.users ?? 0,
                icon: Users,
            },
            {
                title: "Document Categories",
                value: statsData.categories ?? 0,
                icon: ShieldCheck,
            },
            {
                title: "Document Types",
                value: statsData.types ?? 0,
                icon: FileText,
            },
            {
                title: "Document Volumes",
                value: statsData.volumes ?? 0,
                icon: Upload,
            },
        ]);
    }, [statsData]);

    const navigateTo = (route) => {
        navigate(route);
    };

    const categoryData = statsData.documentsByCategory ?? [];
    const volumeData = statsData.documentsByVolume ?? [];
    const roleData = statsData.usersByRole ?? [];
    const recordsPeriod = statsData.recordsByMonth ?? [];

    const donutColors = [
        '#0f172a',
        '#334155',
        '#475569',
        '#64748b',
        '#1e293b',
        '#0ea5e9',
    ];

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 p-3 sm:p-6 lg:py-8 lg:px-2">
            <div className="max-w-11/12 mx-auto space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-500">Welcome back,</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Dashboard</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Monitor records, documents, staff trends, and system health at a glance.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {stats.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.title} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition p-5">
                                <div className="absolute inset-0 opacity-80 bg-linear-to-br from-slate-500/20 to-slate-600/15" />
                                <div className="relative flex items-start justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{item.title}</p>
                                        <h3 className="text-2xl font-bold text-slate-900">{item.value}</h3>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white/80 text-slate-700 shadow-sm">
                                        <Icon size={22} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2 grid gap-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">Record Growth</h3>
                                    <p className="text-sm text-slate-500">Last 6 months of record creation</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    Trend
                                </span>
                            </div>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={recordsPeriod} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="recordGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#0f172a" stopOpacity={0.08} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip wrapperStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                                        <Area type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} fill="url(#recordGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">Documents by Category</h3>
                                    <p className="text-sm text-slate-500">Top categories this month</p>
                                </div>
                                <div className="h-[260px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis dataKey="category_name" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={60} />
                                            <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                                            <Tooltip wrapperStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                                            <Bar dataKey="total" fill="#0f172a" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800">Documents by Volume</h3>
                                    <p className="text-sm text-slate-500">Most used volumes</p>
                                </div>
                                <div className="h-[260px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={volumeData}
                                                dataKey="total"
                                                nameKey="volume_name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                                            >
                                                {volumeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip wrapperStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">Staff Overview</h3>
                                    <p className="text-sm text-slate-500">Users grouped by assigned role</p>
                                </div>
                            </div>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={roleData}
                                            dataKey="total"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={48}
                                            outerRadius={96}
                                            paddingAngle={4}
                                            label={({ name, percent }) => `${name}: ${Math.round(percent * 100)}%`}
                                        >
                                            {roleData.map((entry, index) => (
                                                <Cell key={`cell-role-${index}`} fill={donutColors[index % donutColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip wrapperStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800">Quick Actions</h3>
                                    <p className="text-sm text-slate-500">Launch key workflows</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {can(user, "upload_document") && (
                                    <button
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition"
                                        onClick={() =>
                                            openModal(
                                                <RecordForm navigateTo={navigateTo} />,
                                                "xl7",
                                                "Create New Personal Record Profile"
                                            )
                                        }
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="p-2 rounded-lg bg-white/15">
                                                <Upload size={18} />
                                            </span>
                                            New Personal Record Profile
                                        </span>
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                                 {can(user, "upload_document") && (
                                    <button
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition"
                                        onClick={() =>
                                            openModal(
                                                <ServiceRecordForm navigateTo={navigateTo} />,
                                                "xl7",
                                                "Create New Service Record Profile"
                                            )
                                        }
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="p-2 rounded-lg bg-white/15">
                                                <Upload size={18} />
                                            </span>
                                            New Service Record Profile
                                        </span>
                                        <ArrowRight size={16} />
                                    </button>
                                )}
                                {can(user, "manage_roles") && (
                                    <Link to='/roles'>
                                        <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 transition">
                                            <span className="flex items-center gap-3">
                                                <span className="p-2 rounded-lg bg-white/15">
                                                    <ShieldCheck size={18} />
                                                </span>
                                                Manage Roles & Permissions
                                            </span>
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

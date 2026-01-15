import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileText,
    Shield,
    LogOut,
    User,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { can } from "../utils/auth";

const menuItems = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        permission: "view_dashboard",
    },
    {
        name: "Users",
        path: "/users",
        icon: Users,
        permission: "manage_users",
    },
    {
        name: "Records",
        path: "/records",
        icon: FileText,
        permission: "view_records",
    },
    {
        name: "Roles & Permissions",
        path: "/roles",
        icon: Shield,
        permission: "manage_roles",
    },
];

function AdminLayout() {
    const { user, logout } = useAuth();
const [profileDropdown, setProfileDropdown] = useState(false);

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-wide">DRMS</h1>
                    <p className="text-xs text-slate-400">
                        Admin Panel
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {menuItems.map((item) => {
                        if (!can(user, item.permission)) return null;

                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
                                    ${
                                        isActive
                                            ? "bg-slate-800 text-white"
                                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`
                                }
                            >
                                <Icon size={18} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Admin Dashboard
                    </h2>

                      {/* Profile & Logout Dropdown */}
                      <div className="relative">
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => setProfileDropdown(!profileDropdown)}
                        >
                            <User />
                            <span className="ml-2 font-medium text-gray-700 hidden md:block">
                                {user.name}
                            </span>
                        </div>
                        {profileDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-20">
                                <div
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                                    onClick={logout}
                                >
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;

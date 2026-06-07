import React, { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileText,
    Shield,
    LogOut,
    User,
    Menu,
    X,
    Key,
    Cog,
    House,
    ChevronDown,
    ChevronRight,
    Building,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { can } from "../utils/auth";

const menuItems = [
    {
        border: "Home",
        borderIcon: House,
        mt: 0,
        name: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        permission: "view_dashboard",
    },
    {
        name: "Records",
        path: "/records",
        icon: FileText,
        permission: "view_records",
        submenu: [
            {
                name: "Personal Records",
                path: "/records/personal",
                permission: "view_records",
            },
            {
                name: "Service Records",
                path: "/records/service",
                permission: "view_records",
            },
        ],
    },
    {
        border: "Settings",
        borderIcon: Cog,
        mt: 8,
        name: "Users",
        path: "/users",
        icon: Users,
        permission: "manage_users",
    },
    {
        name: "Departments",
        path: "/departments",
        icon: Building,
        permission: "manage_departments",
    },
    {
        name: "Document Settings",
        path: "/document_settings",
        icon: FileText,
        permission: "manage_document_settings",
    },
    {
        name: "Roles & Permissions",
        path: "/roles",
        icon: Shield,
        permission: "manage_roles",
    },
    {
        name: "Change Password",
        path: "/change_password",
        icon: Key,
        permission: "change_password",
    },
];

function AdminLayout() {
    const { user, logout } = useAuth();
    const [profileDropdown, setProfileDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarOpen &&
                window.innerWidth < 1024 &&
                !event.target.closest("aside") &&
                !event.target.closest("button[aria-label='Toggle sidebar']")
            ) {
                setSidebarOpen(false);
            }
        };

        if (sidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [sidebarOpen]);

    // Close sidebar on route change (mobile)
    const handleNavClick = () => {
        if (window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    };

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileDropdown &&
                !event.target.closest(".profile-dropdown")
            ) {
                setProfileDropdown(false);
            }
        };

        if (profileDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileDropdown]);

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    w-64 bg-slate-900 text-slate-100 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }
                `}
            >
                {/* Logo with Close Button */}
                <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-wide">DRMS</h1>
                        <p className="text-xs text-slate-400">Admin Panel</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        if (!can(user, item.permission)) return null;

                        const Icon = item.icon;
                        const BorderIcon = item.borderIcon ?? null;
                        const hasSubmenu = item.submenu && item.submenu.length > 0;
                        const isExpanded = expandedMenus[item.name] || false;

                        return (
                            <div key={item.name}>
                                {item.border && (
                                    <p className={`mt-${item.mt} px-4 py-3 flex items-center justify-between bg-slate-800/30 rounded-md`}>
                                        <span>{item.border}</span> <BorderIcon size={18}/>
                                    </p>
                                )}

                                {hasSubmenu ? (
                                    <div>
                                        <button
                                            onClick={() => setExpandedMenus(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition w-full text-left text-slate-300 hover:bg-slate-800 hover:text-white"
                                        >
                                            <Icon size={18} />
                                            {item.name}
                                            {isExpanded ? <ChevronDown size={16} className="ml-auto" /> : <ChevronRight size={16} className="ml-auto" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="ml-6 mt-1 space-y-1">
                                                {item.submenu.map((subItem) => {
                                                    if (!can(user, subItem.permission)) return null;

                                                    return (
                                                        <NavLink
                                                            key={subItem.name}
                                                            to={subItem.path}
                                                            onClick={handleNavClick}
                                                            className={({ isActive }) =>
                                                                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition
                                                                ${
                                                                    isActive
                                                                        ? "bg-slate-700 text-white"
                                                                        : "text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                                                }`
                                                            }
                                                        >
                                                            {subItem.name}
                                                        </NavLink>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        onClick={handleNavClick}
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
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-slate-800">
                    <button
                        onClick={() => {
                            logout();
                            handleNavClick();
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition"
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                            Admin Dashboard
                        </h2>
                    </div>

                    {/* Profile & Logout Dropdown */}
                    <div className="relative profile-dropdown">
                        <div
                            className="flex items-center cursor-pointer gap-2"
                            onClick={() => setProfileDropdown(!profileDropdown)}
                        >
                            <div className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition">
                                <User size={18} className="text-slate-700" />
                            </div>
                            <span className="font-medium text-gray-700 hidden sm:block">
                            {user.first_name}{" "}
                                    {user.middle_name &&
                                        user.middle_name + " "}
                                    {user.last_name}
                            </span>
                        </div>
                        {profileDropdown && (
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-2 z-20 border border-slate-200">
                                <div
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 flex items-center gap-2 transition"
                                    onClick={logout}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page */}
                <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;

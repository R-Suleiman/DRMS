import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/records/Records";
import Record from "./pages/records/Record";
import Roles from "./pages/roles/Roles";
import Users from "./pages/users/Users";
import Departments from "./pages/departments/Departments";
import DocumentSettings from "./pages/document-settings/DocumentSettings";
import Unauthorized from "./pages/Unauthorized";
import ChangePassword from "./pages/ChangePassword";
import ServiceRecords from "./pages/records/ServiceRecords/ServiceRecords";
import ServiceRecord from "./pages/records/ServiceRecords/ServiceRecord";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <Home /> },
            // { path: Unauthorized, element: <Unauthorized />}
        ],
    },
    {
        path: "/",
        element: (
            <ProtectedRoute allowedRoles={['root admin', 'admin', 'registrar']}>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "dashboard",
                element: <Dashboard />,
            },
            {
                path: "records/personal",
                element: (
                    <ProtectedRoute requiredPermissions={['view_records']}>
                        <Records />
                    </ProtectedRoute>
                ),
            },
            {
                path: "records/service",
                element: (
                    <ProtectedRoute requiredPermissions={['view_records']}>
                        <ServiceRecords />
                    </ProtectedRoute>
                ),
            },
            {
                path: "records/personal/:id",
                element: (
                    <ProtectedRoute requiredPermissions={['view_records']}>
                        <Record />
                    </ProtectedRoute>
                ),
            },
            {
                path: "records/service/:id",
                element: (
                    <ProtectedRoute requiredPermissions={['view_records']}>
                        <ServiceRecord />
                    </ProtectedRoute>
                ),
            },
            {
                path: "roles",
                element: (
                    <ProtectedRoute requiredPermissions={['manage_roles']}>
                        <Roles />
                    </ProtectedRoute>
                ),
            },
            {
                path: "users",
                element: (
                    <ProtectedRoute requiredPermissions={['manage_users']}>
                        <Users />
                    </ProtectedRoute>
                ),
            },
            {
                path: "departments",
                element: (
                    <ProtectedRoute requiredPermissions={['manage_departments']}>
                        <Departments />
                    </ProtectedRoute>
                ),
            },
            {
                path: "document_settings",
                element: (
                    <ProtectedRoute requiredPermissions={['manage_document_settings']}>
                        <DocumentSettings />
                    </ProtectedRoute>
                ),
            },
            {
                path: "change_password",
                element: (
                    <ProtectedRoute requiredPermissions={['change_password']}>
                    <ChangePassword />
                    </ProtectedRoute>
                ),
            },
            {
                path: "unauthorized",
                element: (
                    <Unauthorized />
                ),
            },
        ],
    },
]);

export default router;

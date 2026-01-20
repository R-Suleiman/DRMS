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
import Unauthorized from "./pages/Unauthorized";
import ChangePassword from "./pages/ChangePassword";

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
                path: "records",
                element: (
                    <ProtectedRoute requiredPermissions={['view_records']}>
                        <Records />
                    </ProtectedRoute>
                ),
            },
            {
                path: "records/:id",
                element: (
                    <ProtectedRoute requiredPermissions={['view_records']}>
                        <Record />
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

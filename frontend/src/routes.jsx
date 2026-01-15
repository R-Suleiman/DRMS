import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/records/Records";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            { index: true, element: <Home /> },
            // { path: about, element: <About />}
        ],
    },
    {
        path: "/",
        element: (
            <ProtectedRoute allowedRoles={['admin', 'registrar']}>
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
            //   {
            //     path: "roles",
            //     element: (
            //       <ProtectedRoute requiredPermissions={['manage_roles']}>
            //         <Roles />
            //       </ProtectedRoute>
            //     ),
            //   },
        ],
    },
]);

export default router;

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function ProtectedRoute({ children, allowedRoles = [], requiredPermissions = [] }) {
    const { token, user } = useAuth();

    if (!token) return <Navigate to="/" replace />;

    // check roles
    if (allowedRoles.length > 0) {
        const hasRole = user.roles?.some(r => allowedRoles.includes(r.name));
        if (!hasRole) return <Navigate to="/unauthorized" replace />;
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
        const hasPermission = user.permissions?.some(p => requiredPermissions.includes(p.name));
        if (!hasPermission) return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

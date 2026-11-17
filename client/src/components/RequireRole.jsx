import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Loader = () => (
    <div className="grid min-h-[70vh] place-items-center px-4 text-sm text-muted-foreground">
        Checking your session…
    </div>
);

export const RequireAuth = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <Loader />;
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    return children;
};

export const RequireRole = ({ roles, children }) => {
    const { user, loading } = useAuth();

    if (loading) return <Loader />;
    if (!user) return <Navigate to="/login" replace />;
    if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
};

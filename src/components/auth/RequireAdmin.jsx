import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../../features/commerces/services/editUserProfileApi";

export function RequireAdmin({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const session = await getSession();
        const user = session?.user;
        if (!active) return;
        if (!user?.id_user) { setStatus("unauthorized"); return; }
        setStatus(user.role === "ADMIN" ? "authorized" : "forbidden");
      } catch (err) {
        if (!active) return;
        const code = err?.response?.status;
        setStatus(code === 401 || code === 403 ? "unauthorized" : "error");
      }
    };

    load();
    return () => { active = false; };
  }, []);

  if (status === "loading") return null;
  if (status === "unauthorized") return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (status === "forbidden") return <Navigate to="/error/403" replace />;
  if (status === "error") return <Navigate to="/error/500" replace />;
  return children;
}

RequireAdmin.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RequireAdmin;

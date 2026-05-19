import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../../features/commerces/services/editUserProfileApi";

export function RequireAuth({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const session = await getSession();
        const user = session?.user;
        if (active) setStatus(user?.id_user ? "authorized" : "unauthorized");
      } catch {
        if (active) setStatus("unauthorized");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") return null;

  if (status === "unauthorized") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RequireAuth;

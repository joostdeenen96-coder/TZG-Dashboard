import { useEffect, useState } from "react";
import { AdminPage } from "./pages/AdminPage";
import { DashboardPage } from "./pages/DashboardPage";

function isAdminRoute() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return path === "/admin";
}

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute);

  useEffect(() => {
    const sync = () => setAdmin(isAdminRoute());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return admin ? <AdminPage /> : <DashboardPage />;
}

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Store1Dashboard from "../pages/Store1Dashboard";
import Store2Dashboard from "../pages/Store2Dashboard";
import Store3Dashboard from "../pages/Store3Dashboard";
import Store4Dashboard from "../pages/Store4Dashboard";
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const routeMap = {
      store1: "/store1-dashboard",
      store2: "/store2-dashboard",
      store3: "/store3-dashboard",
    };

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`http://localhost:3002${routeMap[user.role]}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (res.status === 403) {
          setMessage("Access Denied");
          return;
        }

        const data = await res.json();
        setMessage(data.message);
      } catch (err) {
        console.error(err);
        setMessage("Error fetching dashboard");
      }
    };

    fetchDashboard();
  }, [user]);

  if (!user) return <p>Please login first</p>;

  return (
    <div>
      {/* <button onClick={logout}>Logout</button> */}

      {/* Role-based dashboard */}
      {user.role === "store1" && <Store1Dashboard />}
      {user.role === "store2" && <Store2Dashboard />}
      {user.role === "store3" && <Store3Dashboard />}
      {user.role === "store4" && <Store4Dashboard />}
    </div>
  );
}
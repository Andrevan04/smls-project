import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";

function Dashboard({ user }) {
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          setError("No user document found");
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchRole();
  }, [user]);

  if (error) return <p>{error}</p>;
  if (!role) return <p>Loading...</p>;

  return <div>{role === "admin" ? <AdminDashboard /> : <StudentDashboard user={user} />}</div>;
}

export default Dashboard;
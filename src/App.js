// src/App.js
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Login from "./Login";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch role from Firebase Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role); // always use role from database
        } else {
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Callback after login
  const handleLoginSuccess = async (user) => {
    setUser(user);

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      setRole(userDoc.data().role);
    } else {
      setRole(null);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  if (loading) return <h2>Loading...</h2>;
  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  if (role === "admin") return <AdminDashboard logout={handleLogout} />;
  if (role === "student") return <StudentDashboard user={user} logout={handleLogout} />;

  return <h2>No role found for this user</h2>;
}

export default App;
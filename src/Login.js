// src/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import logo from "./assets/logo.png"; // <-- make sure this path is correct

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user, role);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ✅ LOGO */}
        <img src={logo} alt="Logo" style={styles.logo} />

        <h2 style={styles.title}>Smart Library Management System</h2>

        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button style={styles.loginButton} onClick={handleLogin}>
          LOGIN
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.orContainer}>
          <div style={styles.orLine} />
          <div style={styles.orText}>or</div>
          <div style={styles.orLine} />
        </div>

        <button style={styles.qrButton} disabled>
          Scan QR Code
        </button>

      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "#f0f0f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    background: "#fff",
    padding: 30,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    width: 320,
    textAlign: "center",
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
    marginBottom: 10,
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
    boxSizing: "border-box",
  },
  loginButton: {
    width: "100%",
    padding: 10,
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 15,
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 13,
  },
  orContainer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    fontSize: 12,
    color: "#777",
    textTransform: "uppercase",
  },
  qrButton: {
    width: "100%",
    padding: 10,
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "not-allowed",
    fontWeight: "bold",
  },
};

export default Login;
import React, { useEffect, useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import "./App.css";

function App() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [userId, setUserId] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPin, setNewPin] = useState("");

  const API_BASE = "https://glowpoints-backend.onrender.com";

  useEffect(() => {
    const savedLogin = sessionStorage.getItem("loggedIn") === "true";
    const savedUserId = sessionStorage.getItem("userId");
    const savedUsername = sessionStorage.getItem("username");

    if (savedLogin && savedUserId && savedUsername) {
      setLoggedIn(true);
      setUserId(savedUserId);
      setUsername(savedUsername);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/api/customers?userId=${userId}`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      alert("Error fetching customers");
    }
  }, [userId]);

  useEffect(() => {
    if (loggedIn) fetchCustomers();
  }, [loggedIn, fetchCustomers]);

  const addCustomer = async () => {
    if (!name || !phone) return alert("Please enter name and phone number");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, userId }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error adding customer");
      } else {
        setName("");
        setPhone("");
        fetchCustomers();
      }
    } catch {
      alert("Error adding customer");
    }
    setLoading(false);
  };

  const logVisit = async (phone) => {
    try {
      await fetch(`${API_BASE}/api/customers/${phone}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      fetchCustomers();
    } catch {
      alert("Failed to log visit");
    }
  };

  const handleScanQRCode = async (phone) => {
    await logVisit(phone);
    alert("Visit logged successfully via QR!");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("GlowPoints Customer Report", 20, 10);
    autoTable(doc, {
      head: [["Name", "Phone", "Visits"]],
      body: customers.map((c) => [c.name, c.phone, c.visits]),
    });
    doc.save("glowpoints_customers.pdf");
  };

  const handleLogin = async () => {
    if (!username || !pin) return alert("Enter both username and PIN");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
      } else {
        setLoggedIn(true);
        setUserId(data.userId);
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("username", username);
      }
    } catch {
      alert("Error logging in");
    }
  };

  const handleSignUp = async () => {
    if (!newUsername || !newPin) return alert("Enter username and PIN");
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, pin: newPin }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Signup failed");
      } else {
        alert("Account created! You can now login.");
        setShowSignUp(false);
        setUsername(newUsername);
        setPin(newPin);
      }
    } catch {
      alert("Error signing up");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserId("");
    setUsername("");
    setPin("");
    setCustomers([]);
    sessionStorage.clear();
  };

  const csvHeaders = [
    { label: "Name", key: "name" },
    { label: "Phone", key: "phone" },
    { label: "Visits", key: "visits" },
  ];

  const filteredCustomers = customers.filter((cust) => {
    const match =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.includes(searchTerm);
    const eligible = !showEligibleOnly || cust.visits >= 5;
    return match && eligible;
  });

  const totalVisits = customers.reduce((sum, c) => sum + c.visits, 0);
  const eligibleCount = customers.filter((c) => c.visits >= 5).length;

  const themeClass = darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-900";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const inputBg = darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300";
  const buttonBase = darkMode ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-700";

  if (!loggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClass}`}>
        <motion.div
          className={`${cardBg} shadow-md rounded-lg p-8 max-w-sm w-full`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {showSignUp ? (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up for GlowPoints</h2>
              <input
                type="text"
                placeholder="New Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={`border rounded px-4 py-2 w-full mb-2 ${inputBg}`}
              />
              <input
                type="password"
                placeholder="Create PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className={`border rounded px-4 py-2 w-full mb-4 ${inputBg}`}
              />
              <button
                onClick={handleSignUp}
                className={`${buttonBase} text-white px-4 py-2 w-full rounded mb-2`}
              >
                Create Account
              </button>
              <button
                onClick={() => setShowSignUp(false)}
                className="text-blue-400 underline w-full"
              >
                Already have an account? Login
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-center">Login to GlowPoints</h2>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`border rounded px-4 py-2 w-full mb-2 ${inputBg}`}
              />
              <input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className={`border rounded px-4 py-2 w-full mb-4 ${inputBg}`}
              />
              <button
                onClick={handleLogin}
                className={`${buttonBase} text-white px-4 py-2 w-full rounded mb-2`}
              >
                Login
              </button>
              <button
                onClick={() => setShowSignUp(true)}
                className="text-blue-400 underline w-full"
              >
                New here? Create an account
              </button>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClass} p-4 sm:p-6 relative`}>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 rounded bg-gray-300 text-black hover:bg-gray-400"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.h1
          className="text-4xl font-bold text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          GlowPoints
        </motion.h1>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`${cardBg} rounded-lg shadow p-4 text-center`}>
            <p className="text-gray-400">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </div>
          <div className={`${cardBg} rounded-lg shadow p-4 text-center`}>
            <p className="text-gray-400">Total Visits</p>
            <p className="text-2xl font-bold">{totalVisits}</p>
          </div>
          <div className={`${cardBg} rounded-lg shadow p-4 text-center`}>
            <p className="text-gray-400">Eligible for Reward</p>
            <p className="text-2xl font-bold">{eligibleCount}</p>
          </div>
        </motion.div>

        <motion.div
          className={`${cardBg} shadow-md rounded-lg p-4 sm:p-6 mb-8`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              placeholder="Customer Name"
              className={`border rounded px-4 py-2 w-full ${inputBg}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              className={`border rounded px-4 py-2 w-full ${inputBg}`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={addCustomer}
              disabled={loading}
              className={`${buttonBase} text-white px-6 py-2 rounded`}
            >
              {loading ? "Adding..." : "Add Customer"}
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between items-center">
            <input
              type="text"
              placeholder="Search by name or phone"
              className={`border rounded px-4 py-2 w-full sm:max-w-sm ${inputBg}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showEligibleOnly}
                onChange={() => setShowEligibleOnly(!showEligibleOnly)}
              />
              Show only eligible customers
            </label>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <CSVLink
                data={customers}
                headers={csvHeaders}
                filename="glowpoints_customers.csv"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                ⬇️ Export CSV
              </CSVLink>
              <button
                onClick={exportPDF}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                🧾 Export PDF
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((cust, idx) => (
            <motion.div
              key={cust.phone}
              className={`${cardBg} shadow rounded-lg p-4`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <h3 className="text-lg font-semibold">{cust.name}</h3>
              <p className="text-sm">📞 {cust.phone}</p>
              <p className="text-sm mb-1">Visits: {cust.visits}</p>
              {cust.lastVisit && (
                <p className="text-sm mb-1">Last Visit: {new Date(cust.lastVisit).toLocaleDateString()}</p>
              )}
              {cust.visits >= 5 && (
                <p className="text-green-400 font-medium">🎉 Eligible for Reward!</p>
              )}
              <button
                onClick={() => logVisit(cust.phone)}
                className="mt-2 w-full bg-green-500 text-white py-1 rounded hover:bg-green-600"
              >
                Log Visit
              </button>
              <div className="mt-4">
                <p className="text-sm mb-1">📱 Scan to Log Visit</p>
                <QRCodeCanvas
                  value={cust.phone}
                  size={100}
                  className="cursor-pointer mx-auto"
                  onClick={() => handleScanQRCode(cust.phone)}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

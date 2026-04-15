// src/StudentDashboard.js
import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import QRScanner from "./QRScanner";
import { QRCodeSVG } from "qrcode.react";
import "./StudentDashboard.css";

function StudentDashboard({ user, logout }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [myBooks, setMyBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  const [overdueAlerts, setOverdueAlerts] = useState([]);

  useEffect(() => {
    fetchBooks();
    fetchMyBooks();
  }, []);

  const fetchBooks = async () => {
    const snap = await getDocs(collection(db, "books"));
    setBooks(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchMyBooks = async () => {
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const txs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMyBooks(txs);

    const now = new Date();
    const overdue = txs.filter(
      (t) => t.dueDate?.seconds && new Date(t.dueDate.seconds * 1000) < now
    );
    setOverdueAlerts(overdue);
  };

  const borrowBook = async (book) => {
    const due = new Date();
    due.setDate(due.getDate() + 7);

    await addDoc(collection(db, "transactions"), {
      userId: user.uid,
      userName: user.displayName || "Student",
      userEmail: user.email,
      bookId: book.id,
      title: book.title,
      dueDate: due,
    });

    await updateDoc(doc(db, "books", book.id), {
      status: "borrowed",
      borrowCount: (book.borrowCount || 0) + 1,
    });

    fetchBooks();
    fetchMyBooks();
  };

  const returnBook = async (t) => {
    await deleteDoc(doc(db, "transactions", t.id));

    const book = books.find((b) => b.id === t.bookId);
    if (book) {
      await updateDoc(doc(db, "books", book.id), {
        status: "available",
      });
    }

    fetchBooks();
    fetchMyBooks();
  };

  const handleAI = () => {
    const words = aiQuery.toLowerCase().split(" ");
    const results = books.filter((b) => {
      const text = (b.title + " " + b.author + " " + (b.genre || "") + " " + (b.description || "")).toLowerCase();
      return words.every((w) => text.includes(w));
    });
    setAiResults(results);
  };

  const handleQRScan = (bookId) => {
    const tx = myBooks.find((t) => t.bookId === bookId);
    if (tx) {
      returnBook(tx);
      alert(`Returned: ${tx.title}`);
    } else {
      const book = books.find((b) => b.id === bookId);
      if (book && book.status === "available") {
        borrowBook(book);
        alert(`Borrowed: ${book.title}`);
      } else {
        alert("Book not available or does not exist.");
      }
    }
  };

  const openModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedBook(null);
    setShowModal(false);
  };

  const filteredBooks = books.filter((b) => b.title.toLowerCase().includes(search.toLowerCase()));
  const indexOfLast = currentPage * booksPerPage;
  const indexOfFirst = indexOfLast - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <h2>📚 SMLS</h2>
        <ul>
          <li onClick={() => setActiveTab("dashboard")}>Dashboard</li>
          <li onClick={() => setActiveTab("search")}>Search Books</li>
          <li onClick={() => setActiveTab("mybooks")}>My Books</li>
          <li onClick={() => setActiveTab("qr")}>QR Scan</li>
        </ul>
      </div>

      <div className="main">
        {/* MOBILE SIDEBAR TOGGLE */}
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰ Menu
        </button>

        <div className="topbar">
          <h2>Student Dashboard</h2>
          <button onClick={logout}>Logout</button>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            <div className="cards">
              <div className="card">
                <h3>{books.length}</h3>
                <p>Total Books</p>
              </div>
              <div className="card">
                <h3>{myBooks.length}</h3>
                <p>Borrowed</p>
              </div>
            </div>

            <div className="table-container">
              <h3>AI Search</h3>
              <input
                className="search-bar"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
              />
              <button className="borrow-btn" onClick={handleAI}>
                Search
              </button>
              {aiResults.map((b) => (
                <p key={b.id}>{b.title} - {b.author}</p>
              ))}
            </div>

            {overdueAlerts.length > 0 && (
              <div className="table-container">
                <h3>Overdue Books</h3>
                {overdueAlerts.map((t) => (
                  <p key={t.id}>
                    {t.title} is overdue! Due date: {new Date(t.dueDate.seconds * 1000).toLocaleDateString()}
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        {/* SEARCH TAB */}
        {activeTab === "search" && (
          <>
            <input
              className="search-bar"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBooks.map((b) => (
                    <tr key={b.id} onClick={() => openModal(b)}>
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td className={`status ${b.status}`}>{b.status}</td>
                      <td>
                        {b.status === "available" ? (
                          <button className="borrow-btn" onClick={(e) => { e.stopPropagation(); borrowBook(b); }}>
                            Borrow
                          </button>
                        ) : (
                          <button className="disabled-btn">Borrow</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                {Array.from({ length: totalPages || 1 }, (_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={currentPage === i + 1 ? "active-page" : ""}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* MY BOOKS */}
        {activeTab === "mybooks" && (
          <div className="table-container">
            <table>
              <tbody>
                {myBooks.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.dueDate?.seconds ? new Date(t.dueDate.seconds * 1000).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <button className="return-btn" onClick={() => returnBook(t)}>Return</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* QR SCAN */}
        {activeTab === "qr" && (
          <div className="table-container">
            <h3>QR Scan to Borrow/Return</h3>
            <QRScanner onScan={handleQRScan} />
          </div>
        )}

        {/* BOOK DETAILS MODAL */}
        {showModal && selectedBook && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <h3>Book Details</h3>
              <p><b>Book ID:</b> {selectedBook.id}</p>
              <p><b>Title:</b> {selectedBook.title}</p>
              <p><b>Author:</b> {selectedBook.author}</p>
              <p><b>Genre:</b> {selectedBook.genre || "N/A"}</p>
              <p><b>Description:</b> {selectedBook.description || "N/A"}</p>
              <QRCodeSVG value={selectedBook.id} size={128} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
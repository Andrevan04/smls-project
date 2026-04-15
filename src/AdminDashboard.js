import React, { useEffect, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import "./AdminDashboard.css";

function AdminDashboard({ logout }) {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // BOOK FIELDS
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [bookId, setBookId] = useState("");
  const [publicationYear, setPublicationYear] = useState("");

  // USER
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [activeTab, setActiveTab] = useState("dashboard");

  // MODAL
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // FILTER + PAGINATION
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const booksPerPage = 5;

  useEffect(() => {
    fetchBooks();
    fetchUsers();
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showModal]);

  const fetchBooks = async () => {
    const snap = await getDocs(collection(db, "books"));
    setBooks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchTransactions = async () => {
    const snap = await getDocs(collection(db, "transactions"));
    setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const addBook = async () => {
    if (!title || !author || !bookId) return;

    await addDoc(collection(db, "books"), {
      title,
      author,
      genre,
      description,
      bookId,
      publicationYear,
      status: "available",
      borrowCount: 0
    });

    setTitle("");
    setAuthor("");
    setGenre("");
    setDescription("");
    setBookId("");
    setPublicationYear("");
    fetchBooks();
  };

  const deleteBook = async (book) => {
    if (book.status === "borrowed") {
      alert("Cannot delete a borrowed book!");
      return;
    }
    if (!window.confirm("Delete this book?")) return;
    await deleteDoc(doc(db, "books", book.id));
    fetchBooks();
  };

  const updateBook = async () => {
    if (!selectedBook) return;

    await setDoc(doc(db, "books", selectedBook.id), {
      title: selectedBook.title,
      author: selectedBook.author,
      genre: selectedBook.genre,
      description: selectedBook.description,
      bookId: selectedBook.bookId,
      publicationYear: selectedBook.publicationYear,
      status: selectedBook.status,
      borrowCount: selectedBook.borrowCount || 0
    });

    fetchBooks();
    setShowModal(false);
  };

  const createUser = async () => {
    if (!email || !password) return alert("Enter email and password");

    try {
      const adminEmail = auth.currentUser.email;
      const adminPassword = prompt("Enter admin password:");

      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        role: "student"
      });

      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      alert("Student created!");
      setEmail("");
      setPassword("");
      fetchUsers();

    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm("Delete user?")) return;
    await deleteDoc(doc(db, "users", user.id));
    fetchUsers();
  };

  const getUserEmail = (uid) => {
    const u = users.find(x => x.id === uid);
    return u ? u.email : uid;
  };

  // FILTER + PAGINATION
  const filteredBooks = books.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || b.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const indexOfLast = currentPage * booksPerPage;
  const indexOfFirst = indexOfLast - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>📚 SMLS</h2>
        <ul>
          <li onClick={() => setActiveTab("dashboard")}>Dashboard</li>
          <li onClick={() => setActiveTab("books")}>Books</li>
          <li onClick={() => setActiveTab("users")}>Users</li>
          <li onClick={() => setActiveTab("transactions")}>Transactions</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <h2>Admin Dashboard</h2>
          <button onClick={logout}>Logout</button>
        </div>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="cards">
            <div className="card"><h3>{books.length}</h3><p>Total Books</p></div>
            <div className="card"><h3>{users.length}</h3><p>Users</p></div>
            <div className="card"><h3>{books.filter(b => b.status === "borrowed").length}</h3><p>Borrowed</p></div>
            <div className="card"><h3>{transactions.length}</h3><p>Transactions</p></div>
          </div>
        )}

        {/* BOOKS */}
        {activeTab === "books" && (
          <>
            <div className="add-book">
              <h3>Add Book</h3>

              <div className="form-row">
                <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
                <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} />
              </div>

              <div className="form-row">
                <input placeholder="Book ID" value={bookId} onChange={e => setBookId(e.target.value)} />
                <input placeholder="Genre" value={genre} onChange={e => setGenre(e.target.value)} />
              </div>

              <div className="form-row">
                <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <input placeholder="Year" value={publicationYear} onChange={e => setPublicationYear(e.target.value)} />
              </div>
              <div className="form-row">
                <button onClick={addBook}>Add Book</button>
              </div>
            </div>

            {/* FILTER */}
            <div className="form-row">
              <input
                placeholder="Search books..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
              </select>
            </div>

            {/* TABLE */}
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
                  {currentBooks.map(b => (
                    <tr
                      key={b.id}
                      className={selectedBook?.id === b.id ? "selected-row" : ""}
                      onClick={() => {
                        setSelectedBook(b);
                        setShowModal(true);
                      }}
                    >
                      <td>{b.title}</td>
                      <td>{b.author}</td>
                      <td>{b.status}</td>
                      <td>
                        <button
                          className="delete-btn"
                          disabled={b.status === "borrowed"}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBook(b);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="pagination">
              {Array.from({ length: totalPages || 1 }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "active-page" : ""}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <div className="table-container">
            <h3>Users</h3>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role === "student").map(u => (
                  <tr key={u.id}>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <button className="delete-btn" onClick={() => deleteUser(u)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div className="table-container">
            <h3>Transactions</h3>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>User</th>
                  <th>Book ID</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{getUserEmail(t.userId)}</td>
                    <td>{t.bookId}</td>
                    <td>
                      {t.dueDate?.seconds
                        ? new Date(t.dueDate.seconds * 1000).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MODAL FOR EDIT */}
        {showModal && selectedBook && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📘 Book Details</h2>
                <span className="close-x" onClick={() => setShowModal(false)}>×</span>
              </div>

              <div className="form-row">
                <label>Title:</label>
                <input
                  value={selectedBook.title}
                  onChange={(e) =>
                    setSelectedBook({ ...selectedBook, title: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Author:</label>
                <input
                  value={selectedBook.author}
                  onChange={(e) =>
                    setSelectedBook({ ...selectedBook, author: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Book ID:</label>
                <input
                  value={selectedBook.bookId}
                  onChange={(e) =>
                    setSelectedBook({ ...selectedBook, bookId: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Genre:</label>
                <input
                  value={selectedBook.genre}
                  onChange={(e) =>
                    setSelectedBook({ ...selectedBook, genre: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Description:</label>
                <textarea
                  value={selectedBook.description}
                  onChange={(e) =>
                    setSelectedBook({ ...selectedBook, description: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Publication Year:</label>
                <input
                  value={selectedBook.publicationYear}
                  onChange={(e) =>
                    setSelectedBook({ ...selectedBook, publicationYear: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Status:</label>
                <select
                  value={selectedBook.status}
                  onChange={(e) =>
                    setSelectedBook({ ...selectedBook, status: e.target.value })
                  }
                >
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                </select>
              </div>

              <div className="form-row">
                <button onClick={updateBook}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
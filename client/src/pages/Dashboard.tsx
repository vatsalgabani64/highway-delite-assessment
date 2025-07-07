import { useEffect, useState } from "react";
import api from "../api.ts";
import logoImage from "../images/logo.png";
import deleteSvg from "../images/delete.svg";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

interface Note {
  _id: string;
  title: string;
  content: string;
}

const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  const navigate = useNavigate();
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUser();
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await api.get("/notes");
    setNotes(res.data);
  };

  const fetchUser = async () => {
    const res = await api.get("/auth/me");
    setUserEmail(res.data.email);
    setUserName(res.data.name);
  };

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;

    await api.post("/notes", { title, content });

    setTitle("");
    setContent("");
    setShowForm(false);
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    await api.delete(`/notes/${id}`);
    fetchNotes();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="logo-section">
          <img src={logoImage} alt="Logo" className="logo-img" />
          <span className="dashboard-title">Dashboard</span>
        </div>
        <button onClick={logout} className="signout-link">
          Sign Out
        </button>
      </div>

      {/* Welcome */}
      <div className="welcome-box">
        <h2 className="welcome-title">Welcome, {userName}!</h2>
        <p className="welcome-email">Email: {userEmail}</p>
      </div>

      {/* Create Note */}
      {!showForm && (
        <button onClick={handleCreateClick} className="create-note-btn">
          Create Note
        </button>
      )}

      {showForm && (
        <div className="note-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="note-input"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="note-textarea"
          />
          <button onClick={handleAddNote} className="add-note-btn">
            Add
          </button>
        </div>
      )}

      {/* Notes */}
      <h3 className="notes-title">Notes</h3>
      <div className="notes-list">
        {notes.map((note) => (
          <div
            key={note._id}
            className="note-item"
            onClick={() =>
              setOpenNoteId(openNoteId === note._id ? null : note._id)
            }
          >
            <div>
              <h4 className="note-title">{note.title}</h4>
              {openNoteId === note._id && (
                <p className="note-content">{note.content}</p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevents toggling note open
                deleteNote(note._id);
              }}
              className="note-delete"
            >
              <img src={deleteSvg} alt="Delete" className="delete-icon" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

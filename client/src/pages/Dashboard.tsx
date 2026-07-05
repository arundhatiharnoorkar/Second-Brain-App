import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Logout from "./Logout";
const API = import.meta.env.VITE_API_URL;


function Dashboard() {
  const [notes, setNotes] =
    useState<any[]>([]);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [tags, setTags] =
  useState("");

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editTitle, setEditTitle] =
    useState("");

  const [editContent, setEditContent] =
    useState("");

  const [editCategory, setEditCategory] =
    useState("");
  const [editTag, setEditTag] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [category, setCategory] =
    useState("");

  const [filterCategory, setFilterCategory] =
    useState("");

  const [darkMode, setDarkMode] =
  useState(
    localStorage.getItem("darkMode")
      === "true"
  );

  useEffect(() => {
  fetchNotes();
}, []);

const [summary, setSummary] = useState("");


  useEffect(() => {
  localStorage.setItem(
    "darkMode",
    String(darkMode)
  );
}, [darkMode]);

  
 

  const fetchNotes = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API}/api/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotes(response.data);

    } catch (error:any) {

      
      if (
    error.response?.status === 401
  ) {
    localStorage.removeItem(
      "token"
    );

    window.location.href =
      "/signin";

    return;
  }

  toast.error("Unauthorized");

      toast.error(
        "Failed to fetch notes"
      );

      console.log(error);

    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {


     if (!title.trim()) {
  toast.error("Title is required");
  return;
}

if (!content.trim()) {
  toast.error("Content is required");
  return;
}
    try {
      const token =
        localStorage.getItem("token");

       

      await axios.post(
        `${API}/api/notes`,
        {
          title,
          content,
          category,
          tags,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

     

      toast.success("Note created");

      setTitle("");
      setContent("");
      setCategory("");
      setTags("");

      fetchNotes();

    } catch (error) {

      if (
    error.response?.status === 401
  ) {
    localStorage.removeItem(
      "token"
    );

    window.location.href =
      "/signin";

    return;
  }

  toast.error("Unauthorized");

      toast.error(
        "Failed to create note"
      );

      console.log(error);
    }
  };

  const summarizeNote = async (id: number) => {

  try {

    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API}/api/ai/summarize/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setSummary(res.data.summary);

  } catch (error) {

    console.error(error);
    alert("Failed to summarize note");

  }

};

  const deleteNote = async (
    id: number
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      await axios.delete(
        `${API}/api/notes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Note deleted");

      fetchNotes();

    } catch (error) {

      if (
    error.response?.status === 401
  ) {
    localStorage.removeItem(
      "token"
    );

    window.location.href =
      "/signin";

    return;
  }

  toast.error("Unauthorized");

      toast.error(
        "Failed to delete note"
      );

      console.log(error);
    }
  };

  const togglePin = async (
    id: number
  ) => {
    try {
      const token =
        localStorage.getItem("token");

      await axios.patch(
        `${API}/api/notes/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Pin status updated");

      fetchNotes();

    } catch (error) {

      if (
    error.response?.status === 401
  ) {
    localStorage.removeItem(
      "token"
    );

    window.location.href =
      "/signin";

    return;
  }

  toast.error("Unauthorized");

      toast.error(
        "Failed to Pin note"
      );

      console.log(error);
    }
  };

  const startEdit = (note: any) => {
    setEditingId(note.id);

    setEditTitle(note.title);

    setEditContent(note.content);
    setEditCategory(note.category);
    setEditTag(note.tags);
  };

  const updateNote = async () => {
    try {
      const token =
        localStorage.getItem("token");

      await axios.put(
        `${API}/api/notes/${editingId}`,
        {
          title: editTitle,
          content: editContent,
          category: editCategory,
          tags: editTag,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Note updated");

      setEditingId(null);

      fetchNotes();

    } catch (error) {

      if (
    error.response?.status === 401
  ) {
    localStorage.removeItem(
      "token"
    );

    window.location.href =
      "/signin";

    return;
  }

  toast.error("Unauthorized");

      toast.error(
        "Failed to update note"
      );

      console.log(error);
    }
  };

  
 

  const filteredNotes = notes.filter(
  (note) => {

    const searchValue =
      search.toLowerCase().trim();


    const matchesCategory =
      filterCategory === "" ||
      filterCategory === "All" ||
      (note.category || "")
        .toLowerCase()
        .includes(
          filterCategory.toLowerCase()
        );


    const matchesSearch =
      searchValue === "" ||

      (note.title || "")
        .toLowerCase()
        .includes(searchValue) ||

      (note.content || "")
        .toLowerCase()
        .includes(searchValue) ||

      (note.tags || "")
        .toLowerCase()
        .includes(searchValue);


    return (
      matchesCategory &&
      matchesSearch
    );
  }
);

  const sortedNotes =
  [...filteredNotes].sort(
    (a, b) =>
      Number(b.isPinned) -
      Number(a.isPinned)
  );

  

  const inputClass = darkMode
    ? "bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-xl p-3 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
    : "bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl p-3 w-full mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition";

  return (
    <div className={darkMode
      ? "min-h-screen bg-gray-950 text-white p-6 max-w-3xl mx-auto"
      : "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-900 p-6 max-w-3xl mx-auto"}>
   
      <h1 className="text-4xl font-bold italic text-center mb-1">
        🧠 Capture ideas. ✨ Organize thoughts.
      </h1>

      <div className="flex justify-end mt-4 mb-5">
        <button
          onClick={() =>
            setDarkMode((prev)=>!prev)
          }
          className={darkMode
            ? "bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2"
          }
        >
          {darkMode
            ? "☀️ Light Mode"
            : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Search notes"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className={inputClass}
        />

        <input
          type="text"
          placeholder="🔍 Search Category"
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value)
          }
          className={inputClass}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 gap-3 text-indigo-400 font-semibold">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Loading...
        </div>
      )}

      <div className={darkMode
        ? "bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6 shadow-xl"
        : "bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-md"}>

        <h2 className="text-lg font-bold mb-4 text-indigo-500">➕ New Note</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className={inputClass}
        />

        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          className={inputClass + " min-h-[100px] resize-y"}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="🏷️ Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className={inputClass}
          />

          <input
            type="text"
            placeholder="🏷️ Tags (comma separated)"
            value={tags}
            onChange={(e) =>
              setTags(e.target.value)
            }
            className={inputClass}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <button onClick={createNote}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2.5 font-semibold rounded-xl transition shadow-md shadow-indigo-200"
          >
            ➕ Create Note
          </button>

          <div>
            <Logout />
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        All your notes 📚
      </h1>

      {summary && (
  <div
    className={
      darkMode
        ? "bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500 rounded-2xl p-5 mb-6 shadow-lg"
        : "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-5 mb-6 shadow-md"
    }
  >
    <h3
      className={
        darkMode
          ? "text-xl font-bold text-indigo-300 mb-4"
          : "text-xl font-bold text-indigo-700 mb-4"
      }
    >
      🤖 AI Summary
    </h3>

    <ul
      className={
        darkMode
          ? "list-disc pl-6 text-gray-200 space-y-2"
          : "list-disc pl-6 text-gray-700 space-y-2"
      }
    >
      {summary.split("\n").map(
        (line, index) =>
          line.trim() && (
            <li key={index}>
              {line.replace(/^\*\s*/, "")}
            </li>
          )
      )}
    </ul>
  </div>
)}

      <hr className={darkMode ? "border-gray-700 mb-6" : "border-gray-200 mb-6"} />

      {sortedNotes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <h2 className={darkMode ? "text-gray-400 font-semibold" : "text-gray-400 font-semibold"}>No notes found</h2>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedNotes.map((note: any) => (
            <div
              key={note.id}
              className={darkMode
                ? `bg-gray-900 border ${note.isPinned ? "border-amber-500/60" : "border-gray-700"} rounded-2xl p-5 shadow-lg transition hover:shadow-indigo-900/20`
                : `bg-white border ${note.isPinned ? "border-amber-400" : "border-gray-100"} rounded-2xl p-5 shadow-sm hover:shadow-md transition`}
            >
              {editingId === note.id ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) =>
                      setEditTitle(
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />

                  <textarea
                    value={editContent}
                    onChange={(e) =>
                      setEditContent(
                        e.target.value
                      )
                    }
                    className={inputClass + " min-h-[100px] resize-y"}
                  />

                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />

                  <input
                    type="text"
                    value={editTag}
                    onChange={(e) =>
                      setEditTag(
                        e.target.value
                      )
                    }
                    className={inputClass}
                  />

                  <button
                    onClick={updateNote}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 font-semibold rounded-xl transition"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">
                      {note.title}
                    </h3>
                    {note.isPinned && (
                      <span className="text-amber-500 text-sm font-semibold ml-2">📌 Pinned</span>
                    )}
                  </div>

                  <p className={darkMode ? "text-gray-300 text-sm mb-3 leading-relaxed" : "text-gray-600 text-sm mb-3 leading-relaxed"}>
                    {note.content}
                  </p>

                  <div className="flex flex-wrap gap-x-4 text-xs mb-3">
                    {note.category && (
                      <span className={darkMode
                        ? "bg-indigo-900/50 text-indigo-300 px-2.5 py-1 rounded-full font-medium"
                        : "bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium"}>
                        📁 {note.category}
                      </span>
                    )}
                    <span className={darkMode ? "text-gray-500 self-center" : "text-gray-400 self-center"}>
                      Created: {new Date(note.createdAt).toLocaleString()}
                    </span>
                    <span className={darkMode ? "text-gray-500 self-center" : "text-gray-400 self-center"}>
                      Updated: {new Date(note.updatedAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(note.tags || "")
                      .split(",")
                      .filter((tag: string) => tag.trim())
                      .map((tag: string) => (
                        <span
                          key={tag}
                          className={darkMode
                            ? "bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-full border border-gray-600"
                            : "bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full border border-gray-200"}
                        >
                          {tag.trim()}
                        </span>
                      ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        startEdit(note)
                      }
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-sm font-semibold rounded-lg transition"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteNote(
                          note.id
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 text-sm font-semibold rounded-lg transition"
                    >
                      🗑️ Delete
                    </button>

                    <button
  onClick={() => summarizeNote(note.id)}
  className="
    bg-purple-600
    hover:bg-red-600 text-white px-4 py-1.5 text-sm font-semibold rounded-lg transition"
  
>
  🤖 Summarize
</button>

                    <button
                      onClick={() =>
                        togglePin(note.id)
                      }
                      className={note.isPinned
                        ? "bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 text-sm font-semibold rounded-lg transition"
                        : "bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 text-sm font-semibold rounded-lg transition"}
                    >
                      {note.isPinned
                        ? "📌 Unpin"
                        : "📌 Pin"}
                    </button>

                    
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;

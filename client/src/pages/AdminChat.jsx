import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import socket from "../socket";
import axios from "axios";

export default function AdminChat() {
  const { user: admin } = useAuth();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Admin socket join + listen user messages
  useEffect(() => {
    if (!admin) return;

    socket.emit("join", {
      role: "admin",
      userId: admin.id,
    });

    socket.on("newUserMessage", (data) => {
      if (selectedUser && data.userId === selectedUser.id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("newUserMessage");
    };
  }, [admin, selectedUser]);

  // Load users list
  useEffect(() => {
    if (!admin) return;

    axios
      .get("http://localhost:3002/chat/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error loading users:", err));
  }, [admin]);

  // Select user
  const selectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);

    try {
      const res = await axios.get(
        `http://localhost:3002/chat/messages/${user.id}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Error loading chat:", err);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!msg.trim() || !selectedUser) return;

    socket.emit("adminMessage", {
      userId: selectedUser.id,
      message: msg,
    });

    setMessages((prev) => [
      ...prev,
      { message: msg, sender: "admin" },
    ]);

    setMsg("");
  };

  if (!admin) return <p>Loading admin...</p>;

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        fontFamily: "Arial, sans-serif",
        background: "#f3f4f6",
      }}
    >
      {/* USERS LIST */}
      <div
        style={{
          width: "25%",
          background: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          padding: "12px",
          overflowY: "auto",
        }}
      >
        <h3 style={{ marginBottom: "16px", color: "#111827" }}>
          Users
        </h3>

        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => selectUser(u)}
            style={{
              cursor: "pointer",
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "10px",
              background:
                selectedUser?.id === u.id
                  ? "#16a34a"
                  : "#f9fafb",
              color:
                selectedUser?.id === u.id
                  ? "#ffffff"
                  : "#111827",
              fontWeight: "500",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              transition: "all 0.2s ease",
            }}
          >
            {u.name}
          </div>
        ))}
      </div>

      {/* CHAT WINDOW */}
      <div
        style={{
          width: "75%",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          background: "#f9fafb",
        }}
      >
        <h3 style={{ marginBottom: "14px", color: "#111827" }}>
          Chat with:{" "}
          {selectedUser ? selectedUser.name : "Select a user"}
        </h3>

        {/* MESSAGES */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            padding: "16px",
            borderRadius: "12px",
            background: "#ffffff",
            marginBottom: "12px",
            boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: "12px",
                display: "flex",
                justifyContent:
                  m.sender === "admin"
                    ? "flex-end"
                    : "flex-start",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "18px",
                  background:
                    m.sender === "admin"
                      ? "#16a34a"
                      : "#e5e7eb",
                  color:
                    m.sender === "admin"
                      ? "#ffffff"
                      : "#111827",
                  maxWidth: "65%",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  boxShadow:
                    "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                {m.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        {selectedUser && (
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                outline: "none",
                fontSize: "14px",
              }}
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
            />

            <button
              onClick={sendMessage}
              style={{
                padding: "12px 22px",
                borderRadius: "999px",
                border: "none",
                background: "#16a34a",
                color: "#ffffff",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow:
                  "0 3px 6px rgba(0,0,0,0.15)",
              }}
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

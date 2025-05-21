import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  created_at: string;
}

function GroupChat({ groupId }: { groupId: string }) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/groups/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/groups/${groupId}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socketRef.current?.emit("newMessage", res.data);
      setNewMessage("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  useEffect(() => {
    if (token && groupId) {
      fetchMessages();

      socketRef.current = io("http://localhost:3000", {
        auth: { token },
        query: { groupId },
      });

      socketRef.current.on("newMessage", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [token, groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="bg-[#1b1b1d] border border-white/10 rounded-xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="text-blue-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-white">Chat del equipo</h2>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#121212] rounded-md p-4 space-y-4 text-sm max-h-[400px]">
        {loading ? (
          <p className="text-gray-400">Cargando mensajes...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-400">No hay mensajes aún.</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.id === user?.id;

            return (
              <motion.div
                key={msg.id}
                className={`max-w-[80%] px-4 py-3 rounded-xl shadow-md ${isMine
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-700 text-white mr-auto"
                  }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xs text-gray-300 mb-1">
                  <span className="font-semibold">{msg.sender.name}</span>
                </p>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex mt-4 gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-md bg-[#2b2b2b] text-white text-sm outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md font-medium cursor-pointer"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

export default GroupChat;

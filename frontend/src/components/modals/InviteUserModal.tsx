import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";

function InviteUserModal({
  open,
  onClose,
  groupId,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
}) {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMessage("");

    try {
      await axios.post(
        `http://localhost:3000/api/groups/${groupId}/invite`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInviteMessage("Usuario invitado correctamente.");
      setEmail("");
    } catch (err: any) {
      setInviteMessage(err.response?.data?.error || "Error al invitar usuario");
    }

  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-[#1c1c1c] text-white w-full max-w-md p-6 rounded-xl shadow-xl relative"
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Invitar usuario al grupo</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300">Correo del usuario</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-600 placeholder-gray-400"
                />
              </div>

              {inviteMessage && (
                <p className="text-sm text-center text-gray-300">{inviteMessage}</p>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-semibold"
              >
                Invitar
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InviteUserModal;

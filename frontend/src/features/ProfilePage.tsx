import { useEffect, useState } from "react";
import axios from "axios";
import * as Icons from "lucide-react";
import { useAuth } from "../context/AuthContext";

function UserProfile() {
  const { token } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:3000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setName(res.data.name);
      })
      .catch((err) => console.error("Error al cargar perfil", err));
  }, [token]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:3000/api/users/me",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data.user);
      login(res.data.user, token!);
    } catch (err) {
      console.error("Error al actualizar el perfil", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-white">Cargando...</p>;

  const getColorFromName = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-red-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-orange-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-4">Perfil de Usuario</h1>

      <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-white/10">
        <div className="flex items-center gap-6 mb-6">
          <div className={`w-24 h-24 flex items-center justify-center rounded-full text-white text-4xl font-bold ${getColorFromName(user.name)}`}>
            {user.name[0].toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-zinc-700 border border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 rounded-lg bg-zinc-700 border border-gray-600 text-gray-400"
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mt-4"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

<div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-white/10">
  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
    <Icons.Users size={20} /> Tus grupos
  </h2>
  {!Array.isArray(user.groups) || user.groups.length === 0 ? (
    <p className="text-gray-400">No estás asignado a ningún grupo.</p>
  ) : (
    <ul className="space-y-2">
      {user.groups.map((group: any) => (
        <li
          key={group.id}
          className="p-3 rounded-lg bg-zinc-700 text-white border border-zinc-600"
        >
          <span className="font-semibold">{group.name}</span>
          <span className="ml-2 text-sm text-gray-400">({group.slug})</span>
        </li>
      ))}
    </ul>
  )}
</div>

    </div>
  );
}

export default UserProfile;

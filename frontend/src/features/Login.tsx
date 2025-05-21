import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/AuthService";
import { motion } from "framer-motion";
import ParallaxBackground from "../components/ui/ParallaxBackground";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const data = await loginUser(email, password);
            login(data.user, data.token);
            navigate("/dashboard");
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setError(err.response.data.errors[0].msg);
            } else if (err.response?.data?.msg) {
                setError(err.response.data.msg);
            } else {
                setError("Error al iniciar sesión");
            }
        }
    };

    return (
        <>

            <div className="relative min-h-screen">
                <ParallaxBackground />

                <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="relative z-10 min-h-screen flex items-center justify-center text-white"
                >

                    <div className="flex flex-col md:flex-row gap-12 px-6 py-10 max-w-6xl w-full items-center justify-center">
                        {/* Info izquierda */}
                        <div className="flex-1 max-w-lg space-y-6">
                            <h1 className="text-4xl font-bold leading-tight text-white">
                                Organiza tus tareas como un pro
                            </h1>
                            <p className="text-md text-gray-300">
                                Bienvenido a <span className="text-blue-400 font-semibold">CatStats</span>, donde productividad y estilo se combinan.
                            </p>
                            <p className="text-sm text-gray-400">
                                Colaborá, organizá, y dominá tus días con ayuda de un gato con estilo.
                            </p>
                        </div>

                        {/* Login derecha */}
                        <div className="flex-1 max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-10">
                            <h2 className="text-2xl font-bold text-center mb-2">Iniciar sesión</h2>
                            <p className="text-center text-sm text-gray-400 mb-6">
                                Ingresá tus credenciales para continuar
                            </p>

                            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition"
                                >
                                    Entrar
                                </button>
                            </form>

                            <p className="text-sm text-center mt-6 text-gray-400">
                                ¿No tenés cuenta?{" "}
                                <Link to="/register" className="underline font-semibold text-blue-400">
                                    Registrate aquí
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

export default Login;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff, AlertCircle, User, Lock } from "lucide-react";

interface DecodedToken {
    role: string;
    user_id: number;
    username: string;
}

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login/", { username, password });

            // Stockage du token JWT
            localStorage.setItem("token", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            // Décoder le token pour récupérer les informations utilisateur
            const decoded: DecodedToken = jwtDecode(response.data.access);
            localStorage.setItem("role", decoded.role);

            console.log("Connexion réussie:", {
                username: decoded.username,
                role: decoded.role,
                user_id: decoded.user_id
            });

            // Redirection vers le dashboard
            window.location.href = "/dashboard";
                } catch (err) {
            console.error("Erreur de connexion:", err);
            setError("Identifiants incorrects. Veuillez vérifier votre nom d'utilisateur et mot de passe.");
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4 min-h-screen">
            {/* Logo et navigation */}
            <div className="top-4 left-4 z-10 absolute">
                <Link to="/" className="flex items-center font-bold text-emerald-600 text-xl">
                    ESMT TaskFlow
                </Link>
            </div>

            <div className="w-full max-w-md">
                {/* Carte principale */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    {/* Entête */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8 text-white text-center">
                        <h1 className="mb-2 font-bold text-2xl">Bienvenue !</h1>
                        <p className="text-emerald-100">Connectez-vous pour accéder à votre espace</p>
                    </div>

                    {/* Formulaire */}
                    <div className="p-6">
                        {error && (
                            <div className="flex items-start bg-red-50 mb-4 p-3 border-red-500 border-l-4 text-red-700">
                                <AlertCircle className="flex-shrink-0 mt-0.5 mr-2 w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label htmlFor="username" className="block mb-2 font-medium text-gray-700 text-sm">
                                    Nom d'utilisateur
                                </label>
                                <div className="relative">
                                    <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                        <User className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="bg-gray-50 p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                        placeholder="Votre nom d'utilisateur"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-gray-50 p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                        placeholder="Votre mot de passe"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="right-0 absolute inset-y-0 flex items-center pr-3"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                    className="border-gray-300 rounded focus:ring-emerald-500 w-4 h-4 text-emerald-600"
                                    />
                                    <label htmlFor="remember" className="block ml-2 text-gray-600 text-sm">
                                        Se souvenir de moi
                                    </label>
                                </div>
                                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500 text-sm">
                                    Mot de passe oublié?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${loading ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex justify-center items-center">
                                        <svg className="mr-3 -ml-1 w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Connexion en cours...
                                    </div>
                                ) : (
                                    "Se connecter"
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Pied de page */}
                    <div className="bg-gray-50 px-6 py-4 border-gray-100 border-t text-center">
                        <p className="text-gray-600 text-sm">
                            Vous n'avez pas de compte?{" "}
                            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
                                Inscrivez-vous
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Information additionnelle */}
                <div className="mt-6 text-gray-500 text-sm text-center">
                    <p>En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.</p>
                    <p className="mt-4">
                        &copy; {new Date().getFullYear()} ESMT TaskFlow. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
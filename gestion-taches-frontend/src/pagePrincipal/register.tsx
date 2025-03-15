import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axiosConfig";
import { User, Mail, Lock, AlertCircle, Eye, EyeOff, Check, UserCircle } from "lucide-react";

interface RegisterData {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
    nom: string;
    prenom: string;
    role: string;
    avatar: File | null;
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterData>({
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
        nom: "",
        prenom: "",
        role: "etudiant", // Par défaut
        avatar: null
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [step, setStep] = useState(1); // Pour le formulaire en plusieurs étapes
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                avatar: file
            }));

            // Créer un aperçu de l'image
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    setPreviewAvatar(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const validateFirstStep = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.passwordConfirm) {
            setError("Veuillez remplir tous les champs obligatoires.");
            return false;
        }

        if (formData.password !== formData.passwordConfirm) {
            setError("Les mots de passe ne correspondent pas.");
            return false;
        }

        if (formData.password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return false;
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Veuillez entrer une adresse email valide.");
            return false;
        }

        setError("");
        return true;
    };

    const handleNextStep = () => {
        if (validateFirstStep()) {
            setStep(2);
        }
    };

    const handlePrevStep = () => {
        setStep(1);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Valider le formulaire
        if (!formData.nom || !formData.prenom) {
            setError("Veuillez remplir tous les champs obligatoires.");
            setLoading(false);
            return;
        }

        try {
            // Préparer les données pour l'API
            const apiData = new FormData();
            apiData.append("username", formData.username);
            apiData.append("email", formData.email);
            apiData.append("password", formData.password);
            apiData.append("nom", formData.nom);
            apiData.append("prenom", formData.prenom);
            apiData.append("role", formData.role);

            if (formData.avatar) {
                apiData.append("avatar", formData.avatar);
            }

            // Envoyer la requête d'inscription
            const response = await api.post("/auth/register/", apiData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log("Inscription réussie:", response.data);
            setSuccess(
                formData.role === "etudiant"
                    ? "Votre compte a été créé avec succès! Vous pouvez maintenant vous connecter."
                    : "Votre compte a été créé avec succès! Un administrateur doit approuver votre compte avant que vous puissiez vous connecter."
            );

            // Rediriger vers la page de connexion après un délai
            setTimeout(() => {
                navigate("/login");
            }, 3000);

        } catch (err: any) {
            console.error("Erreur d'inscription:", err);

            if (err.response && err.response.data) {
                // Erreurs spécifiques de l'API
                const errorData = err.response.data;
                if (errorData.username) {
                    setError(`Nom d'utilisateur: ${errorData.username[0]}`);
                } else if (errorData.email) {
                    setError(`Email: ${errorData.email[0]}`);
                } else if (errorData.password) {
                    setError(`Mot de passe: ${errorData.password[0]}`);
                } else {
                    setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
                }
            } else {
                setError("Une erreur de connexion est survenue. Veuillez vérifier votre connexion internet et réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4 min-h-screen">
            {/* Logo et navigation */}
            <div className="top-4 left-4 z-10 absolute">
                <Link to="/" className="flex items-center font-bold text-emerald-600 text-xl">
                    ESMT TaskFlow
                </Link>
            </div>

            <div className="w-full max-w-2xl">
                {/* Carte principale */}
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    {/* Entête */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-8 text-white text-center">
                        <h1 className="mb-2 font-bold text-2xl">Créer un compte</h1>
                        <p className="text-emerald-100">Rejoignez ESMT TaskFlow pour collaborer sur vos projets</p>
                    </div>

                    {/* Étapes */}
                    <div className="px-6 pt-6">
                        <div className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                1
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                2
                            </div>
                        </div>
                        <div className="flex justify-between mt-1 px-1 text-gray-500 text-xs">
                            <span>Informations de connexion</span>
                            <span>Profil</span>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div className="p-6">
                        {error && (
                            <div className="flex items-start bg-red-50 mb-4 p-3 border-red-500 border-l-4 text-red-700">
                                <AlertCircle className="flex-shrink-0 mt-0.5 mr-2 w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="flex items-start bg-green-50 mb-4 p-3 border-green-500 border-l-4 text-green-700">
                                <Check className="flex-shrink-0 mt-0.5 mr-2 w-5 h-5" />
                                <span>{success}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="username" className="block mb-2 font-medium text-gray-700 text-sm">
                                            Nom d'utilisateur*
                                        </label>
                                        <div className="relative">
                                            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                value={formData.username}
                                                onChange={handleChange}
                                                className="bg-gray-50 p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                                placeholder="Votre nom d'utilisateur"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
                                            Adresse email*
                                        </label>
                                        <div className="relative">
                                            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="bg-gray-50 p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                                placeholder="votre.email@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                                            Mot de passe*
                                        </label>
                                        <div className="relative">
                                            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="bg-gray-50 p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                                placeholder="Votre mot de passe"
                                                required
                                                minLength={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="right-0 absolute inset-y-0 flex items-center pr-3"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="mt-1 text-gray-500 text-xs">
                                            Au moins 8 caractères
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="passwordConfirm" className="block mb-2 font-medium text-gray-700 text-sm">
                                            Confirmer le mot de passe*
                                        </label>
                                        <div className="relative">
                                            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                                <Lock className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="passwordConfirm"
                                                name="passwordConfirm"
                                                type={showPasswordConfirm ? "text" : "password"}
                                                value={formData.passwordConfirm}
                                                onChange={handleChange}
                                                className="bg-gray-50 p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                                placeholder="Confirmez votre mot de passe"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                                className="right-0 absolute inset-y-0 flex items-center pr-3"
                                            >
                                                {showPasswordConfirm ? (
                                                    <EyeOff className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 w-full font-medium text-white transition-colors"
                                        >
                                            Continuer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                        <div>
                                            <label htmlFor="prenom" className="block mb-2 font-medium text-gray-700 text-sm">
                                                Prénom*
                                            </label>
                                            <input
                                                id="prenom"
                                                name="prenom"
                                                type="text"
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                className="bg-gray-50 p-3 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                                placeholder="Votre prénom"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="nom" className="block mb-2 font-medium text-gray-700 text-sm">
                                                Nom*
                                            </label>
                                            <input
                                                id="nom"
                                                name="nom"
                                                type="text"
                                                value={formData.nom}
                                                onChange={handleChange}
                                                className="bg-gray-50 p-3 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                                placeholder="Votre nom"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block mb-2 font-medium text-gray-700 text-sm">
                                            Rôle*
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="bg-gray-50 p-3 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                            required
                                        >
                                            <option value="etudiant">Étudiant</option>
                                            <option value="enseignant">Enseignant</option>
                                        </select>
                                        {formData.role === "enseignant" && (
                                            <p className="mt-1 text-gray-500 text-xs">
                                                Note: Les comptes enseignants nécessitent une approbation par un administrateur avant l'activation.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium text-gray-700 text-sm">
                                            Photo de profil (optionnelle)
                                        </label>
                                        <div className="flex items-center space-x-6">
                                            <div className="shrink-0">
                                                <div className="flex justify-center items-center bg-gray-100 rounded-full w-16 h-16 overflow-hidden">
                                                    {previewAvatar ? (
                                                        <img
                                                            src={previewAvatar}
                                                            alt="Avatar preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <UserCircle className="w-12 h-12 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                            <label className="block">
                                                <span className="sr-only">Choisir une photo de profil</span>
                                                <input
                                                    type="file"
                                                    name="avatar"
                                                    onChange={handleFileChange}
                                                    className="block hover:file:bg-emerald-100 file:bg-emerald-50 file:mr-4 file:px-4 file:py-2 file:border-0 file:rounded-md w-full file:font-medium text-gray-500 file:text-emerald-700 text-sm file:text-sm"
                                                    accept="image/*"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <button
                                            type="button"
                                            onClick={handlePrevStep}
                                            className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium text-gray-800 transition-colors"
                                        >
                                            Retour
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${loading ? "opacity-70 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {loading ? (
                                                <div className="flex items-center">
                                                    <svg className="mr-3 -ml-1 w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Inscription...
                                                </div>
                                            ) : (
                                                "S'inscrire"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Pied de page */}
                    <div className="bg-gray-50 px-6 py-4 border-gray-100 border-t text-center">
                        <p className="text-gray-600 text-sm">
                            Vous avez déjà un compte?{" "}
                            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                                Connectez-vous
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Information additionnelle */}
                <div className="mt-6 text-gray-500 text-sm text-center">
                    <p>
                        En vous inscrivant, vous acceptez nos{" "}
                        <a href="#" className="text-emerald-600 hover:text-emerald-500">
                            conditions d'utilisation
                        </a>{" "}
                        et notre{" "}
                        <a href="#" className="text-emerald-600 hover:text-emerald-500">
                            politique de confidentialité
                        </a>
                        .
                    </p>
                    <p className="mt-4">
                        &copy; {new Date().getFullYear()} ESMT TaskFlow. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
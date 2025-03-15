import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../axiosConfig';
import { User, Camera, Save, X, CheckCircle, AlertTriangle, Mail, UserCircle, ExternalLink, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Définir les types des données du profil
interface ProfileData {
    nom: string;
    prenom: string;
    email: string;
    username: string;
    role: string;
    avatar: File | string | null;
}

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [showTooltip, setShowTooltip] = useState<boolean>(false);

    const [profile, setProfile] = useState<ProfileData>({
        nom: '',
        prenom: '',
        email: '',
        username: '',
        role: '',
        avatar: null
    });

    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarRef = useRef<HTMLDivElement>(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24
            }
        }
    };

    const alertVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 500,
                damping: 30
            }
        },
        exit: { 
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.2
            }
        }
    };

    // Récupérer les données du profil
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get('/auth/profile/');
                setProfile(response.data);

                if (response.data.avatar) {
                    setPreviewAvatar(response.data.avatar as string);
                }

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la récupération du profil:', error);
                setError("Impossible de charger votre profil. Veuillez réessayer plus tard.");
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Gérer le changement d'input
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Gérer le changement d'avatar
    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            setProfile(prev => ({
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

    // Ouvrir le sélecteur de fichier
    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Soumettre le formulaire
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSuccess(false);
        setError("");
        setSaving(true);

        try {
            // Créer un objet FormData pour envoyer les fichiers
            const formData = new FormData();
            formData.append('nom', profile.nom);
            formData.append('prenom', profile.prenom);
            formData.append('email', profile.email);

            // Si un nouvel avatar a été sélectionné, l'ajouter
            if (profile.avatar instanceof File) {
                formData.append('avatar', profile.avatar);
            }

            // Envoyer les données
            const response = await api.patch('/auth/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setProfile(response.data);
            setSuccess(true);
            setSaving(false);

            // Faire disparaître le message de succès après 3 secondes
            setTimeout(() => {
                setSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            setError("Une erreur est survenue. Veuillez vérifier vos informations et réessayer.");
            setSaving(false);
        }
    };

    // Afficher le spinner de chargement
    if (loading) {
        return (
            <div className="flex justify-center items-center bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
                <div className="flex flex-col items-center">
                    <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="border-emerald-500 border-t-4 border-b-4 rounded-full w-16 h-16"
                    ></motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 font-medium text-emerald-600"
                    >
                        Chargement de votre profil...
                    </motion.p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-10 min-h-screen">
            <motion.div 
                className="bg-white shadow-lg mx-auto rounded-xl max-w-4xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                }}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-10 overflow-hidden text-white">
                    {/* Formes décoratives */}
                    <div className="top-0 right-0 absolute bg-white opacity-5 -mt-20 -mr-20 rounded-full w-64 h-64"></div>
                    <div className="bottom-0 left-0 absolute bg-white opacity-5 -mb-20 -ml-20 rounded-full w-40 h-40"></div>
                    
                    <div className="z-10 relative flex md:flex-row flex-col md:items-center gap-6">
                        <div className="group relative">
                            <motion.div 
                                ref={avatarRef}
                                className="bg-white/20 shadow-xl border-4 border-white/30 rounded-full w-28 h-28 overflow-hidden"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {previewAvatar ? (
                                    <motion.img
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        src={previewAvatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex justify-center items-center h-full">
                                        <User className="w-14 h-14 text-white" />
                                    </div>
                                )}
                            </motion.div>
                            <motion.button
                                type="button"
                                onClick={triggerFileInput}
                                className="right-0 bottom-0 absolute bg-white hover:bg-emerald-50 shadow-md p-2 rounded-full text-emerald-600 transition-colors"
                                title="Changer d'avatar"
                                whileHover={{ 
                                    scale: 1.1,
                                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)"
                                }}
                                whileTap={{ scale: 0.9 }}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                <Camera size={18} />
                            </motion.button>
                            <AnimatePresence>
                                {showTooltip && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="-bottom-10 left-1/2 absolute bg-gray-800 px-2 py-1 rounded text-white text-xs whitespace-nowrap -translate-x-1/2 transform"
                                    >
                                        Changer d'avatar
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        <div className="space-y-2">
                            <motion.h1 
                                className="font-bold text-3xl"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {profile.prenom} {profile.nom}
                            </motion.h1>
                            <motion.div
                                className="flex items-center text-emerald-100"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <UserCircle size={16} className="mr-2" />
                                <span>@{profile.username}</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <span className="inline-flex items-center bg-white/20 backdrop-blur-sm mt-2 px-3 py-1.5 rounded-full font-medium text-sm">
                                    {profile.role === 'etudiant' ? '👨‍🎓 Étudiant' :
                                     profile.role === 'enseignant' ? '👨‍🏫 Enseignant' : '👨‍💼 Administrateur'}
                                </span>
                            </motion.div>
                        </div>
                        
                        <div className="flex space-x-3 md:ml-auto">
                            <motion.button
                                className="flex items-center bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-sm transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.open('/dashboard', '_blank')}
                            >
                                <ExternalLink size={16} className="mr-2" />
                                Tableau de bord
                            </motion.button>
                            <motion.button
                                className="flex items-center bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-medium text-sm transition-all"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={logout}
                            >
                                <LogOut size={16} className="mr-2" />
                                Déconnexion
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <motion.form 
                    onSubmit={handleSubmit} 
                    className="p-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="space-y-6">
                        {/* Messages d'alerte */}
                        <AnimatePresence>
                            {success && (
                                <motion.div 
                                    className="flex items-center bg-emerald-50 p-4 border border-emerald-200 rounded-lg text-emerald-700"
                                    variants={alertVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <CheckCircle className="mr-3 w-5 h-5" />
                                    <span className="font-medium">Vos informations ont été mises à jour avec succès !</span>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div 
                                    className="flex items-center bg-red-50 p-4 border border-red-200 rounded-lg text-red-700"
                                    variants={alertVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <AlertTriangle className="mr-3 w-5 h-5" />
                                    <span className="font-medium">{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Informations personnelles */}
                        <motion.div 
                            className="bg-gray-50 p-6 border border-gray-100 rounded-xl"
                            variants={itemVariants}
                        >
                            <h2 className="mb-4 font-semibold text-gray-800 text-lg">
                                Informations personnelles
                            </h2>
                            
                            {/* Nom et prénom */}
                            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                <div className="group">
                                    <label htmlFor="prenom" className="group-focus-within:text-emerald-600 block mb-2 font-medium text-gray-700 text-sm transition-colors">
                                        Prénom
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="prenom"
                                            name="prenom"
                                            value={profile.prenom}
                                            onChange={handleChange}
                                            className="p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500/20 w-full transition-all duration-200"
                                            required
                                        />
                                        <div className="group-focus-within:text-emerald-500 top-1/2 left-3 absolute text-gray-400 transition-colors -translate-y-1/2 transform">
                                            <User size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="group">
                                    <label htmlFor="nom" className="group-focus-within:text-emerald-600 block mb-2 font-medium text-gray-700 text-sm transition-colors">
                                        Nom
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="nom"
                                            name="nom"
                                            value={profile.nom}
                                            onChange={handleChange}
                                            className="p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500/20 w-full transition-all duration-200"
                                            required
                                        />
                                        <div className="group-focus-within:text-emerald-500 top-1/2 left-3 absolute text-gray-400 transition-colors -translate-y-1/2 transform">
                                            <User size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Informations de contact */}
                        <motion.div 
                            className="bg-gray-50 p-6 border border-gray-100 rounded-xl"
                            variants={itemVariants}
                        >
                            <h2 className="mb-4 font-semibold text-gray-800 text-lg">
                                Coordonnées
                            </h2>
                            
                            {/* Email et nom d'utilisateur */}
                            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                <div className="group">
                                    <label htmlFor="email" className="group-focus-within:text-emerald-600 block mb-2 font-medium text-gray-700 text-sm transition-colors">
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleChange}
                                            className="p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500/20 w-full transition-all duration-200"
                                            required
                                        />
                                        <div className="group-focus-within:text-emerald-500 top-1/2 left-3 absolute text-gray-400 transition-colors -translate-y-1/2 transform">
                                            <Mail size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="username" className="block mb-2 font-medium text-gray-700 text-sm">
                                        Nom d'utilisateur
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={profile.username}
                                            className="bg-gray-100 p-3 pl-10 border border-gray-200 rounded-lg w-full cursor-not-allowed"
                                            disabled
                                            readOnly
                                        />
                                        <div className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform">
                                            <UserCircle size={18} />
                                        </div>
                                    </div>
                                    <p className="mt-1 text-gray-500 text-xs">Le nom d'utilisateur ne peut pas être modifié.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Boutons */}
                        <motion.div 
                            className="flex justify-end space-x-3 pt-4"
                            variants={itemVariants}
                        >
                            <motion.button
                                type="button"
                                onClick={() => window.history.back()}
                                className="hover:bg-gray-50 shadow-sm px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                                whileHover={{ scale: 1.02, boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.05)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center">
                                    <X size={16} className="mr-2" />
                                    <span>Annuler</span>
                                </div>
                            </motion.button>

                            <motion.button
                                type="submit"
                                disabled={saving}
                                className={`px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:shadow-lg transition-all ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                whileHover={{ scale: 1.02, boxShadow: "0px 4px 12px rgba(5, 150, 105, 0.3)" }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center">
                                    {saving ? (
                                        <>
                                            <motion.div 
                                                className="mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            ></motion.div>
                                            <span>Enregistrement...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} className="mr-2" />
                                            <span>Enregistrer</span>
                                        </>
                                    )}
                                </div>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.form>
            </motion.div>
            
            {/* Section d'aide */}
            <motion.div 
                className="mx-auto mt-6 max-w-4xl text-gray-500 text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <p>Besoin d'aide pour mettre à jour votre profil ? <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">Consultez notre centre d'aide</a></p>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
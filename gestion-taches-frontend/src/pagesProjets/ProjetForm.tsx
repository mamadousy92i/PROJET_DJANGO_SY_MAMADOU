import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getUserRole, getUserId } from "../axiosConfig"; 
import { Calendar, FileText, UserPlus, Clock, ArrowLeft, Save } from "lucide-react";

interface User {
    id: number;
    username: string;
    role: string;
}

const ProjetForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: "",
        description: "",
        date_fin: "",
        etat: "EN_ATTENTE",
        membres: [] as number[],
    });

    useEffect(() => {
        setLoading(true);
        const userRole = getUserRole();
        setRole(userRole);

        api.get("/users/")
            .then(response => {
                let filteredUsers = response.data;

                if (userRole === "etudiant") {
                    filteredUsers = filteredUsers.filter((user: User) => user.role === "etudiant");
                } else if (userRole === "enseignant") {
                    filteredUsers = filteredUsers.filter((user: User) =>
                        user.role === "etudiant" || user.role === "enseignant"
                    );
                } else if (userRole === "admin") {
                    filteredUsers = [];
                }

                setUsers(filteredUsers);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur de chargement des utilisateurs :", error);
                setLoading(false);
            });

        if (id) {
            setLoading(true);
            api.get(`/projets/${id}/`)
                .then(response => {
                    const projet = response.data;
                    let membresIds = projet.membres_details
                        ? projet.membres_details.map((m: { id: any }) => m.id)
                        : Array.isArray(projet.membres)
                        ? projet.membres.map((m: any) => (typeof m === 'object' ? m.id : m))
                        : [];

                    setFormData({
                        ...projet,
                        membres: membresIds,
                    });
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Erreur de chargement du projet :", error);
                    setLoading(false);
                });
        }
    }, [id]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (userId: number) => {
        setFormData((prev) => {
            const isSelected = prev.membres.includes(userId);
            const updatedMembres = isSelected
                ? prev.membres.filter((id) => id !== userId)
                : [...prev.membres, userId];
            return { ...prev, membres: updatedMembres };
        });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const currentUserId = getUserId(); // n'oublie pas demain ga verifier fonction getUserId bi dans le fichier axiosConfig.ts
        let dataToSend = { ...formData };

        // Si c'est une création (pas d'id), ajouter l'utilisateur connecté aux membres
        if (!id && currentUserId && !dataToSend.membres.includes(currentUserId)) {
            dataToSend.membres = [...dataToSend.membres, currentUserId];
        }

        const request = id
            ? api.put(`/projets/${id}/`, dataToSend)
            : api.post("/projets/", dataToSend);

        request
            .then(() => navigate("/projets"))
            .catch(error => {
                console.error("Erreur de sauvegarde :", error);
                if (error.response) {
                    console.log("Détails de l'erreur :", error.response.data);
                }
                setLoading(false);
            });
    };

    const getEtatLabel = (etat: string) => {
        switch (etat) {
            case "EN_ATTENTE": return "En attente";
            case "EN_COURS": return "En cours";
            case "TERMINE": return "Terminé";
            default: return etat;
        }
    };

    const getEtatColor = (etat: string) => {
        switch (etat) {
            case "EN_ATTENTE": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "EN_COURS": return "bg-blue-100 text-blue-800 border-blue-300";
            case "TERMINE": return "bg-green-100 text-green-800 border-green-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    return (
        <div className="bg-gray-50 pb-10 min-h-screen">
            <div className="mx-auto px-4 container">
                <button
                    onClick={() => navigate('/projets')}
                    className="flex items-center mb-4 text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                    <ArrowLeft size={18} className="mr-1" /> Retour aux projets
                </button>

                <div className="bg-white shadow-sm mb-6 p-6 border-emerald-500 border-l-4 rounded-lg">
                    <h2 className="flex items-center font-bold text-gray-800 text-2xl">
                        <FileText className="mr-2" size={24} />
                        {id ? "Modifier le projet" : "Créer un nouveau projet"}
                    </h2>
                    <p className="mt-2 text-gray-600">
                        {id
                            ? "Modifiez les détails du projet et assignez des membres"
                            : "Remplissez les informations pour créer un nouveau projet collaboratif"}
                    </p>
                </div>

                <div className="bg-white shadow-sm p-6 rounded-lg">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="border-emerald-500 border-t-2 border-b-2 rounded-full w-10 h-10 animate-spin"></div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="nom" className="block mb-1 font-medium text-gray-700 text-sm">
                                            Nom du projet
                                        </label>
                                        <input
                                            id="nom"
                                            type="text"
                                            name="nom"
                                            placeholder="Ex: Développement application mobile"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            className="p-3 border border-gray-300 focus:border-emerald-500 rounded-md focus:ring-2 focus:ring-emerald-500 w-full transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="date_fin" className="block mb-1 font-medium text-gray-700 text-sm">
                                            Date d'échéance
                                        </label>
                                        <div className="relative">
                                            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                                <Calendar size={18} className="text-gray-400" />
                                            </div>
                                            <input
                                                id="date_fin"
                                                type="date"
                                                name="date_fin"
                                                value={formData.date_fin}
                                                onChange={handleChange}
                                                className="p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-md focus:ring-2 focus:ring-emerald-500 w-full transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="etat" className="block mb-1 font-medium text-gray-700 text-sm">
                                            État du projet
                                        </label>
                                        <div className="relative">
                                            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                                <Clock size={18} className="text-gray-400" />
                                            </div>
                                            <select
                                                id="etat"
                                                name="etat"
                                                value={formData.etat}
                                                onChange={handleChange}
                                                className="p-3 pl-10 border border-gray-300 focus:border-emerald-500 rounded-md focus:ring-2 focus:ring-emerald-500 w-full transition-all appearance-none"
                                            >
                                                <option value="EN_ATTENTE">En attente</option>
                                                <option value="EN_COURS">En cours</option>
                                                <option value="TERMINE">Terminé</option>
                                            </select>
                                            <div className="right-0 absolute inset-y-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(formData.etat)}`}>
                                            {getEtatLabel(formData.etat)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="description" className="block mb-1 font-medium text-gray-700 text-sm">
                                            Description du projet
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={5}
                                            placeholder="Décrivez l'objectif et les détails du projet..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="p-3 border border-gray-300 focus:border-emerald-500 rounded-md focus:ring-2 focus:ring-emerald-500 w-full transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block flex items-center mb-2 font-medium text-gray-700 text-sm">
                                            <UserPlus size={18} className="mr-1" />
                                            Membres du projet
                                        </label>
                                        {users.length > 0 ? (
                                            <div className="p-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                                                <div className="gap-2 grid grid-cols-1 md:grid-cols-2">
                                                    {users.map(user => (
                                                        <div
                                                            key={user.id}
                                                            className={`flex items-center p-2 rounded-md border transition-all ${
                                                                formData.membres.includes(user.id)
                                                                    ? 'border-emerald-500 bg-emerald-50'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                id={`user-${user.id}`}
                                                                checked={formData.membres.includes(user.id)}
                                                                onChange={() => handleCheckboxChange(user.id)}
                                                                className="border-gray-300 rounded focus:ring-emerald-500 w-4 h-4 text-emerald-600"
                                                            />
                                                            <label
                                                                htmlFor={`user-${user.id}`}
                                                                className="block ml-2 w-full text-gray-700 text-sm cursor-pointer"
                                                            >
                                                                <span className="font-medium">{user.username}</span>
                                                                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                                                    user.role === 'enseignant'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                }`}>
                                                                    {user.role}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 italic">
                                                {role === 'admin'
                                                    ? "Les administrateurs ne peuvent pas ajouter de membres"
                                                    : "Aucun utilisateur disponible"}
                                            </div>
                                        )}
                                        <div className="mt-2 text-gray-500 text-xs">
                                            {formData.membres.length} membre(s) sélectionné(s)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => navigate('/projets')}
                                    className="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md text-gray-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white transition-colors"
                                    disabled={loading}
                                >
                                    <Save size={18} className="mr-1" />
                                    {id ? "Enregistrer les modifications" : "Créer le projet"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjetForm;
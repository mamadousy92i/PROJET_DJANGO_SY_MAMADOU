import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { getUserId } from "../axiosConfig";
import {
    Loader, Edit, Trash2, Plus, AlertTriangle, CheckCircle,
    Clock, Calendar, List, User, Users, Info
} from "lucide-react";

interface Projet {
    id: number;
    nom: string;
    description: string;
    etat: string;
    date_fin?: string;
    proprietaire?: {
        id: number;
        username: string;
    };
    membres?: number[]; // IDs des membres
    membres_details?: { id: number; username: string; role?: string; avatar?: string }[]; // Détails des membres
}

interface Tache {
    id: number;
    titre: string;
    description: string;
    statut: string; 
    date_limite?: string;
    assigne_a?: any; 
    assigne_a_detail?: { id: number; username: string }[];
}

// Interface pour les statistiques des tâches
interface TacheStats {
    total: number;
    a_faire: number;
    en_cours: number;
    termine: number;
    progression: number;
}

const ProjetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [projet, setProjet] = useState<Projet | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [taches, setTaches] = useState<Tache[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [utilisateurs, setUtilisateurs] = useState<{ id: number; username: string; role: string }[]>([]);
    const estProprietaire = projet?.proprietaire?.id === userId;

    // Fonction  vérifier si l'utilisateur est assigné à une tâche
    const estAssigne = (tache: Tache) => {
        if (Array.isArray(tache.assigne_a_detail)) {
            return tache.assigne_a_detail.some(user => user.id === userId);
        } else if (Array.isArray(tache.assigne_a)) {
            return tache.assigne_a.some(user => user.id === userId);
        } else if (tache.assigne_a && typeof tache.assigne_a === 'object') {
            return tache.assigne_a.id === userId;
        }
        return false;
    };

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // État pour les statistiques
    const [tacheStats, setTacheStats] = useState<TacheStats>({
        total: 0,
        a_faire: 0,
        en_cours: 0,
        termine: 0,
        progression: 0
    });

    const [newTask, setNewTask] = useState({
        titre: "",
        description: "",
        statut: "A_FAIRE",
        date_limite: "",
        assigne_a: [] as number[]
    });

    // Fonction pour mettre à jour les statistiques
    const updateTaskStats = () => {
        api.get(`/tache-stats/?projet=${id}`)
            .then(response => {
                console.log("✅ Statistiques des tâches mises à jour :", response.data);
                setTacheStats(response.data);
            })
            .catch(error => {
                console.error("❌ Erreur lors de la mise à jour des statistiques :", error);
            });
    };

    useEffect(() => {
        setUserId(Number(getUserId()));
        setLoading(true);

        api.get(`/projets/${id}/`)
            .then(response => {
                console.log("✅ Détails du projet :", response.data);
                setProjet(response.data);

                return api.get(`/taches/?projet=${id}`);
            })
            .then(response => {
                console.log("✅ Tâches du projet :", response.data);
                setTaches(response.data);

                // Appel à l'API de statistiques
                return api.get(`/tache-stats/?projet=${id}`);
            })
            .then(response => {
                console.log("✅ Statistiques des tâches :", response.data);
                setTacheStats(response.data);

                return api.get(`/users/`);
            })
            .then(response => {
                console.log("✅ Liste des utilisateurs :", response.data);

                const userRole = userId
                    ? response.data.find((u: { id: number; username: string; role: string }) => u.id === userId)?.role
                    : undefined;

                console.log("✅ Rôle utilisateur :", userRole);

                let filteredUsers = [];
                if (userRole) {
                    if (userRole === "etudiant") {
                        filteredUsers = response.data.filter(
                            (u: { id: number; username: string; role: string }) => u.role === "etudiant"
                        );
                    } else if (userRole === "enseignant") {
                        filteredUsers = response.data.filter(
                            (u: { id: number; username: string; role: string }) => u.role === "etudiant" || u.role === "enseignant"
                        );
                    }
                } else {
                    filteredUsers = response.data;
                }

                console.log("✅ Utilisateurs filtrés :", filteredUsers);
                setUtilisateurs(filteredUsers);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur de chargement :", error);
                setLoading(false);
            });
    }, [id, userId]);

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
            case "EN_ATTENTE": return "bg-amber-100 text-amber-800";
            case "EN_COURS": return "bg-blue-100 text-blue-800";
            case "TERMINE": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getTacheStatutLabel = (statut: string) => {
        switch (statut) {
            case "A_FAIRE": return "À faire";
            case "EN_COURS": return "En cours";
            case "TERMINE": return "Terminée";
            default: return statut;
        }
    };

    const getTacheStatutColor = (statut: string) => {
        switch (statut) {
            case "A_FAIRE": return "bg-gray-100 text-gray-800";
            case "EN_COURS": return "bg-blue-100 text-blue-800";
            case "TERMINE": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Fonction pour supprimer le projet
    const handleDeleteProjet = () => {
        api.delete(`/projets/${id}/`)
            .then(() => {
                navigate('/projets');
            })
            .catch(error => {
                console.error("Erreur lors de la suppression:", error);
                setShowConfirmDelete(false);
            });
    };

    const handleCheckboxChange = (userId: number) => {
        setNewTask((prev) => {
            if (prev.assigne_a.includes(userId)) {
                return {
                    ...prev,
                    assigne_a: prev.assigne_a.filter((id) => id !== userId)
                };
            } else {
                return {
                    ...prev,
                    assigne_a: [...prev.assigne_a, userId]
                };
            }
        });
    };

    const handleSubmitTask = (e: React.FormEvent) => {
        e.preventDefault();

        const taskData = {
            ...newTask,
            projet: id,
            assigne_a: Array.isArray(newTask.assigne_a)
                ? newTask.assigne_a.filter(id => id !== null && id !== undefined)
                : [],
            description: newTask.description || "",
        };

        console.log("🔎 Données envoyées :", taskData);

        if (isEditing) {
            if (!editingTaskId) return;

            api.put(`/taches/${editingTaskId}/`, taskData)
                .then(response => {
                    console.log("✅ Tâche modifiée :", response.data);
                    setTaches(taches.map(t => t.id === editingTaskId ? response.data : t));
                    updateTaskStats(); 
                    resetTaskForm();
                })
                .catch(error => {
                    console.error("❌ Erreur lors de la modification de la tâche :", error);
                    if (error.response) {
                        console.log("Détails de l'erreur :", error.response.data);
                    }
                });
        } else {
            api.post(`/projets/${id}/taches/`, taskData)
                .then(response => {
                    console.log("✅ Tâche ajoutée :", response.data);
                    setTaches([...taches, response.data]);
                    updateTaskStats(); 
                    resetTaskForm();
                })
                .catch(error => {
                    console.error("❌ Erreur lors de l'ajout de la tâche :", error);
                    if (error.response) {
                        console.log("Détails de l'erreur :", error.response.data);
                    }
                });
        }
    };

    const [key,] = useState(0);

    const handleOpenEditForm = (tache: Tache) => {
        setNewTask({
            titre: tache.titre,
            description: tache.description,
            statut: tache.statut, 
            date_limite: tache.date_limite || "",
            assigne_a: tache.assigne_a_detail
                ? tache.assigne_a_detail.map(user => user.id)
                : []
        });

        setEditingTaskId(tache.id);
        setIsEditing(true);
        setShowAddTask(true);
    };

    useEffect(() => {
        if (isEditing && newTask.assigne_a.length > 0) {
            setNewTask(prev => ({
                ...prev,
                assigne_a: [...newTask.assigne_a]
            }));
        }
    }, [key]);

    // Fonction pour réinitialiser le formulaire après ajout/modification
    const resetTaskForm = () => {
        setNewTask({
            titre: "",
            description: "",
            statut: "A_FAIRE",
            date_limite: "",
            assigne_a: []
        });
        setIsEditing(false);
        setEditingTaskId(null);
        setShowAddTask(false);
    };

    const userRole = userId
        ? utilisateurs.find((u) => u.id === userId)?.role
        : undefined;

    // Fonction pour supprimer la tâche - mise à jour pour actualiser les statistiques
    const handleDeleteTache = (idTache: number) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
            api.delete(`/taches/${idTache}/`)
                .then(() => {
                    setTaches(taches.filter(t => t.id !== idTache));
                    updateTaskStats(); 
                })
                .catch((error) => {
                    console.error("❌ Erreur lors de la suppression de la tâche :", error);
                });
        }
    };

    // ici vu que j'avait des probleme jai mis un Calcul des statistiques locales (au cas où l'API ne fonctionne pas encore)
    const statsProjet = {
        totalTasks: taches.length,
        tasksToDo: taches.filter(t => t.statut === "A_FAIRE").length,
        tasksInProgress: taches.filter(t => t.statut === "EN_COURS").length,
        tasksDone: taches.filter(t => t.statut === "TERMINE").length,
        progress: taches.length > 0
            ? Math.round((taches.filter(t => t.statut === "TERMINE").length / taches.length) * 100)
            : 0
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center bg-gray-50 h-screen">
                <Loader className="mb-4 w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-gray-500">Chargement du projet...</p>
            </div>
        );
    }

    if (!projet) {
        return (
            <div className="flex flex-col justify-center items-center bg-gray-50 h-screen">
                <div className="bg-white shadow-sm p-8 border border-gray-100 rounded-xl max-w-md text-center">
                    <div className="flex justify-center items-center bg-red-100 mx-auto mb-4 rounded-full w-16 h-16">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="mb-2 font-bold text-gray-800 text-xl">Projet introuvable</h2>
                    <p className="mb-4 text-gray-600">Le projet que vous cherchez n'existe pas ou a été supprimé.</p>
                    <Link to="/projets" className="inline-block bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium text-white transition-colors">
                        Retour aux projets
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 pb-10 min-h-screen">
            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-md mb-6 text-white">
                <div className="mx-auto px-4 py-4 container">
                    <div className="flex justify-between items-center">
                        <Link to="/projets" className="flex items-center gap-2 text-white hover:text-emerald-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m12 19-7-7 7-7" />
                                <path d="M19 12H5" />
                            </svg>
                            Retour aux projets
                        </Link>
                        <h1 className="flex items-center gap-2 font-bold text-2xl">
                            <CheckCircle className="w-6 h-6" />
                            ESMT TaskFlow
                        </h1>
                    </div>
                </div>
            </header>

            <div className="mx-auto px-4 container">
                {/* Stats du projet - Utilisation des statistiques de l'API */}
                <div className="bg-white shadow-sm mb-6 p-4 border border-gray-100 rounded-xl">
                    <h2 className="flex items-center gap-2 mb-4 font-bold text-gray-700">
                        <Info className="w-5 h-5 text-emerald-600" />
                        Avancement du projet
                    </h2>

                    <div className="gap-4 grid grid-cols-1 md:grid-cols-4 mb-4">
                        <div className="bg-emerald-50 p-4 border border-emerald-100 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-emerald-700 text-sm">Total</h3>
                                <span className="bg-emerald-100 px-2 py-1 rounded-full font-medium text-emerald-800 text-xs">{tacheStats.total}</span>
                            </div>
                            <p className="mt-2 font-bold text-emerald-800 text-2xl">{tacheStats.total} tâches</p>
                        </div>

                        <div className="bg-gray-50 p-4 border border-gray-100 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-gray-700 text-sm">À faire</h3>
                                <span className="bg-gray-100 px-2 py-1 rounded-full font-medium text-gray-800 text-xs">{tacheStats.a_faire}</span>
                            </div>
                            <p className="mt-2 font-bold text-gray-800 text-2xl">{tacheStats.a_faire} tâches</p>
                        </div>

                        <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-blue-700 text-sm">En cours</h3>
                                <span className="bg-blue-100 px-2 py-1 rounded-full font-medium text-blue-800 text-xs">{tacheStats.en_cours}</span>
                            </div>
                            <p className="mt-2 font-bold text-blue-800 text-2xl">{tacheStats.en_cours} tâches</p>
                        </div>

                        <div className="bg-green-50 p-4 border border-green-100 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-green-700 text-sm">Terminées</h3>
                                <span className="bg-green-100 px-2 py-1 rounded-full font-medium text-green-800 text-xs">{tacheStats.termine}</span>
                            </div>
                            <p className="mt-2 font-bold text-green-800 text-2xl">{tacheStats.termine} tâches</p>
                        </div>
                    </div>

                    <div className="relative pt-1">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <span className="inline-block font-semibold text-emerald-600 text-xs">
                                    Progression globale
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="inline-block font-semibold text-emerald-600 text-xs">
                                    {tacheStats.progression}%
                                </span>
                            </div>
                        </div>
                        <div className="flex bg-emerald-200 mb-4 rounded h-2 overflow-hidden text-xs">
                            <div style={{ width: `${tacheStats.progression}%` }} className="flex flex-col justify-center bg-emerald-500 shadow-none text-white text-center whitespace-nowrap transition-all duration-500"></div>
                        </div>
                    </div>
                </div>

                {/* Section principale du projet */}
                <div className="bg-white shadow-sm mb-6 p-6 border border-gray-100 rounded-xl">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="font-bold text-gray-800 text-2xl">{projet.nom}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEtatColor(projet.etat)}`}>
                                    {getEtatLabel(projet.etat)}
                                </span>
                            </div>
                            {projet.proprietaire && (
                                <p className="flex items-center gap-1 text-gray-600">
                                    <User className="w-4 h-4" />
                                    Créé par <span className="font-medium">{projet.proprietaire.username}</span>
                                </p>
                            )}
                        </div>

                        {estProprietaire && (
                            <div className="flex gap-2">
                                {/* Bouton Modifier */}
                                <Link
                                    to={`/projets/${id}/modifier`}
                                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Modifier
                                </Link>

                                {/* Bouton Supprimer */}
                                <button
                                    onClick={() => setShowConfirmDelete(true)}
                                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Supprimer
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mb-6 pb-6 border-gray-100 border-b">
                        <h2 className="flex items-center gap-2 mb-3 font-bold text-gray-700">
                            <List className="w-5 h-5 text-emerald-600" />
                            Description
                        </h2>
                        <p className="bg-gray-50 p-3 border border-gray-100 rounded-lg text-gray-600 whitespace-pre-line">
                            {projet.description || "Aucune description disponible."}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        {projet.date_fin && (
                            <div className="flex-grow bg-gray-50 p-4 border border-gray-100 rounded-lg">
                                <h3 className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                    Date de fin
                                </h3>
                                <p className="font-medium text-gray-600">
                                    {new Date(projet.date_fin).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}

                        {projet.membres_details && projet.membres_details.length > 0 && (
                            <div className="flex-grow bg-gray-50 p-4 border border-gray-100 rounded-lg">
                                <h3 className="flex items-center gap-2 mb-3 font-medium text-gray-700">
                                    <Users className="w-4 h-4 text-emerald-600" />
                                    Membres du projet
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {projet.membres_details.map((membre) => (
                                        <div key={membre.id} className="inline-flex items-center bg-white px-2.5 py-1.5 border border-gray-200 rounded-full font-medium text-gray-700 text-sm">
                                            <div className="flex justify-center items-center bg-emerald-100 mr-2 rounded-full w-6 h-6 text-emerald-700">
                                                {membre.username ? membre.username.charAt(0).toUpperCase() : "?"}
                                            </div>
                                            {membre.username || "Utilisateur inconnu"}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section des tâches */}
                <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="flex items-center gap-2 font-bold text-gray-800 text-xl">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            Tâches du projet
                        </h2>
                        {estProprietaire && (
                            <button
                                onClick={() => { setIsEditing(false); setEditingTaskId(null); setShowAddTask(true); }}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter une tâche
                            </button>
                        )}
                    </div>

                    {taches.length === 0 ? (
                        <div className="bg-gray-50 py-10 rounded-lg text-center">
                            <div className="flex justify-center items-center bg-gray-100 mx-auto mb-4 rounded-full w-16 h-16">
                                <Clock className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 font-medium text-gray-800 text-lg">Aucune tâche</h3>
                            <p className="mb-6 text-gray-500">Commencez par ajouter une tâche à ce projet.</p>
                            {estProprietaire && (
                                <button
                                    onClick={() => { setIsEditing(false); setEditingTaskId(null); setShowAddTask(true); }}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 mx-auto px-6 py-2 rounded-lg font-medium text-white transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter une tâche
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {taches.map((tache) => (
                                <div key={tache.id} className="bg-white hover:shadow-md p-4 border border-gray-200 rounded-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-medium text-gray-800 text-lg">{tache.titre}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTacheStatutColor(tache.statut)}`}>
                                            {getTacheStatutLabel(tache.statut)}
                                        </span>
                                    </div>

                                    <div className="bg-gray-50 mb-3 p-3 border border-gray-100 rounded-lg">
                                        <p className="text-gray-600 text-sm">
                                            {tache.description || "Aucune description"}
                                        </p>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <p className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Calendar className="w-4 h-4 text-emerald-500" />
                                            {tache.date_limite
                                                ? new Date(tache.date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                                                : "Date non définie"}
                                        </p>

                                        <p className="flex items-start gap-2 text-gray-500 text-sm">
                                            <Users className="mt-0.5 w-4 h-4 text-emerald-500" />
                                            <span>
                                                {tache.assigne_a_detail && tache.assigne_a_detail.length > 0
                                                    ? tache.assigne_a_detail.map(user => user.username).join(", ")
                                                    : "Non assignée"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        {(estProprietaire || estAssigne(tache)) && (
                                            <button
                                                onClick={() => handleOpenEditForm(tache)}
                                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg font-medium text-white text-sm transition-colors"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                                Modifier
                                            </button>
                                        )}

                                        {estProprietaire && (
                                            <button
                                                onClick={() => handleDeleteTache(tache.id)}
                                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg font-medium text-white text-sm transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showConfirmDelete && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white shadow-lg p-6 rounded-xl w-full max-w-md">
                        <div className="flex justify-center items-center bg-red-100 mx-auto mb-4 rounded-full w-16 h-16">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="mb-2 font-bold text-gray-800 text-lg text-center">Confirmer la suppression</h3>
                        <p className="mb-6 text-gray-600 text-center">
                            Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteProjet}
                                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Modal d'ajout de tâche */}
            {showAddTask && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
                        <h3 className="mb-4 font-bold text-gray-800 text-lg">
                            {isEditing ? "Modifier la tâche" : "Ajouter une nouvelle tâche"}
                        </h3>
                        <form onSubmit={handleSubmitTask}>

                            <div className="mb-4">
                                <label htmlFor="titre" className="block mb-1 font-medium text-gray-700 text-sm">
                                    Titre*
                                </label>
                                <input
                                    id="titre"
                                    type="text"
                                    className="p-2 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                    value={newTask.titre}
                                    onChange={(e) => setNewTask({ ...newTask, titre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block mb-1 font-medium text-gray-700 text-sm">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    className="p-2 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                    rows={3}
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mb-6">
                                <div>
                                    <label htmlFor="date_limite" className="block mb-1 font-medium text-gray-700 text-sm">
                                        Date limite
                                    </label>
                                    <input
                                        id="date_limite"
                                        type="date"
                                        className="p-2 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                        value={newTask.date_limite}
                                        onChange={(e) => setNewTask({ ...newTask, date_limite: e.target.value })}
                                        required
                                    />
                                </div>


                                <div>
                                    <label htmlFor="statut" className="block mb-1 font-medium text-gray-700 text-sm">
                                        État
                                    </label>
                                    <select
                                        id="statut"
                                        className="p-2 border border-gray-300 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                        value={newTask.statut}
                                        onChange={(e) => setNewTask({ ...newTask, statut: e.target.value })}
                                    >
                                        <option value="A_FAIRE">À faire</option>
                                        <option value="EN_COURS">En cours</option>
                                        <option value="TERMINE">Terminée</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium text-gray-700 text-sm">
                                        Assigner à
                                    </label>
                                    <div className="space-y-2">
                                        {utilisateurs
                                            .filter(user => {
                                                // Vérifier si l'utilisateur est membre du projet
                                                const estMembreProjet = projet.membres_details?.some(membre => membre.id === user.id) || false;

                                                // Filtrer selon le rôle ET l'appartenance au projet
                                                if (userRole === "etudiant") {
                                                    return user.role === "etudiant" && estMembreProjet;
                                                } else if (userRole === "enseignant") {
                                                    return (user.role === "etudiant" || user.role === "enseignant") && estMembreProjet;
                                                }
                                                return estMembreProjet;
                                            })
                                            .map(user => (
                                                <div key={user.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`user-${user.id}`}
                                                        checked={newTask.assigne_a.includes(user.id)}
                                                        onChange={() => handleCheckboxChange(user.id)}
                                                        className="form-checkbox w-5 h-5 text-emerald-600"
                                                    />
                                                    <label htmlFor={`user-${user.id}`} className="text-gray-700">
                                                        {user.username} ({user.role})
                                                    </label>
                                                </div>
                                            ))}
                                        {utilisateurs.filter(user =>
                                            projet.membres_details?.some(membre => membre.id === user.id)
                                        ).length === 0 && (
                                                <p className="text-gray-500 italic">Aucun membre disponible pour l'assignation.</p>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddTask(false)}
                                    className="hover:bg-gray-50 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium text-white"
                                >
                                    {isEditing ? "Modifier" : "Ajouter"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjetDetails;
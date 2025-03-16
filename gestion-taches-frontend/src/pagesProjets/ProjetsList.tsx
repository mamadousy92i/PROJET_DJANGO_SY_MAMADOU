import { useEffect, useState } from "react";
import api, { getUserId } from "../axiosConfig";
import { Link } from "react-router-dom";
import { Loader, Plus, Search, Filter, Tag, Clock, Grid, List as ListIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface Projet {
    id: number;
    nom: string;
    description: string;
    etat: string;
    date_fin?: string;
    proprietaire: {
        id: number;
        username: string;
    };
    membres?: { id: number; username: string }[];
    membres_details?: { id: number; username: string; role?: string; avatar?: string }[];
}

interface Proprietaire {
    id: number;
    username: string;
}

interface ProjetApi {
    id: number;
    nom: string;
    description: string;
    etat: string;
    date_fin?: string;
    proprietaire: Proprietaire;
    membres?: number[];
    membres_details?: { id: number; username: string; role?: string; avatar?: string }[];
}

type ViewMode = "grid" | "list";

const ProjetsList = () => {
    const [projets, setProjets] = useState<Projet[]>([]);
    const [mesProjets, setMesProjets] = useState<Projet[]>([]);
    const [projetsParticipant, setProjetsParticipant] = useState<Projet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("TOUS");
    const [userId, setUserId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    
    // État pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Nombre d'éléments par page

    // Récupérer l'ID de l'utilisateur connecté directement depuis le token
    useEffect(() => {
        const id = getUserId();
        setUserId(id);
    }, []);

    // Fonction pour transformer les données reçues depuis le backend
    const transformerProjets = (data: ProjetApi[]): Projet[] => {
        return data.map((projet) => ({
            id: projet.id,
            nom: projet.nom,
            description: projet.description,
            etat: projet.etat,
            date_fin: projet.date_fin,
            proprietaire: {
                id: projet.proprietaire.id,
                username: projet.proprietaire.username
            },
            membres: projet.membres_details || projet.membres?.map((id: number) => ({
                id,
                username: `Utilisateur ${id}`
            })) || [],
            membres_details: projet.membres_details
        }));
    };
    
    // Charger tous les projets
    useEffect(() => {
        setLoading(true);
        api.get("/projets/")
            .then(response => {
                console.log("✅ Projets reçus :", response.data);
                const projetsTransformes = transformerProjets(response.data);
                setProjets(projetsTransformes);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur de chargement :", error);
                setLoading(false);
            });
    }, []);

    // ici je separe les projets en "mes projets" et "projets participants"
    useEffect(() => {
        if (userId && projets.length > 0) {
            // Projets dont je suis propriétaire
            const owned = projets.filter(projet => projet.proprietaire && projet.proprietaire.id === userId);
            setMesProjets(owned);

            // Projets auxquels je participe mais ne suis pas propriétaire
            const participating = projets.filter(projet => {
                const membreIds = projet.membres_details 
                    ? projet.membres_details.map(m => m.id)
                    : projet.membres?.map(m => m.id) || [];
                
                return membreIds.includes(userId as number) && projet.proprietaire.id !== userId;
            });
            setProjetsParticipant(participating);
        }
    }, [projets, userId]);

    // Fonction pour filtrer les projets
    const filtrerProjets = (projetsAFiltrer: Projet[]) => {
        let result = projetsAFiltrer;
        
        // Filtre par état
        if (filter !== "TOUS") {
            result = result.filter(projet => projet.etat === filter);
        }
        
        // Filtre par recherche
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(projet => 
                projet.nom.toLowerCase().includes(query) || 
                projet.description.toLowerCase().includes(query)
            );
        }
        
        return result;
    };

    // Filtrer mes projets et projets participants
    const mesProjetsFiltered = filtrerProjets(mesProjets);
    const projetsParticipantFiltered = filtrerProjets(projetsParticipant);

    // Fonction de pagination
    const paginate = (projets: Projet[], page: number, itemsPerPage: number) => {
        const startIndex = (page - 1) * itemsPerPage;
        return projets.slice(startIndex, startIndex + itemsPerPage);
    };

    // Nombre total de pages pour les projets filtrés
    const totalPages = (projets: Projet[]) => Math.ceil(projets.length / itemsPerPage);

    const getEtatLabel = (etat: string) => {
        switch(etat) {
            case "EN_ATTENTE": return "En attente";
            case "EN_COURS": return "En cours";
            case "TERMINE": return "Terminé";
            default: return "Tous";
        }
    };

    // Fonction pour obtenir la couleur de badge selon l'état
    const getEtatColor = (etat: string) => {
        switch(etat) {
            case "EN_ATTENTE": return "bg-amber-100 text-amber-800";
            case "EN_COURS": return "bg-blue-100 text-blue-800";
            case "TERMINE": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const currentMesProjets = paginate(mesProjetsFiltered, currentPage, itemsPerPage);
    const currentProjetsParticipant = paginate(projetsParticipantFiltered, currentPage, itemsPerPage);
    const totalPagesMesProjets = totalPages(mesProjetsFiltered);
    const totalPagesProjetsParticipant = totalPages(projetsParticipantFiltered);

    // Composant de pagination
    const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
        if (totalPages <= 1) return null;
        
        // Fonction pour limiter les boutons de pagination affichés
        const getPaginationButtons = () => {
            let buttons = [];
            const maxButtons = 5; 
            
            if (totalPages <= maxButtons) {
                buttons = Array.from({ length: totalPages }, (_, i) => i + 1);
            } else {
                if (currentPage <= 3) {
                    buttons = [1, 2, 3, 4, '...', totalPages];
                } else if (currentPage >= totalPages - 2) {
                    buttons = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                } else {
                    buttons = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                }
            }
            
            return buttons;
        };
        
        return (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-6">
                <button 
                    onClick={() => onPageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center h-10 px-3 rounded-lg ${
                        currentPage === 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                    } border border-gray-200 transition-colors`}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                {getPaginationButtons().map((page, index) => (
                    typeof page === 'number' ? (
                        <button
                            key={index}
                            onClick={() => onPageChange(page)}
                            className={`flex items-center justify-center w-10 h-10 rounded-lg font-medium ${
                                currentPage === page
                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-600'
                            } border transition-all`}
                        >
                            {page}
                        </button>
                    ) : (
                        <span key={index} className="flex justify-center items-end h-10 text-gray-500">
                            •••
                        </span>
                    )
                ))}
                
                <button 
                    onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center h-10 px-3 rounded-lg ${
                        currentPage === totalPages 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                    } border border-gray-200 transition-colors`}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        );
    };

    // la liste des projets en mode grille
    const renderProjetsGrid = (projets: Projet[]) => {
        return (
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {projets.map((projet) => {
                    const membres = projet.membres_details || projet.membres || [];
                    
                    // la c'est la  couleur de fond de la carte en fonction de l'état
                    const getBgGradient = (etat: string) => {
                        switch(etat) {
                            case "EN_ATTENTE": return "from-amber-50 to-white";
                            case "EN_COURS": return "from-blue-50 to-white";
                            case "TERMINE": return "from-green-50 to-white";
                            default: return "from-gray-50 to-white";
                        }
                    };
                    
                    return (
                        <div key={projet.id} className="group flex flex-col bg-white shadow-sm hover:shadow-lg border border-gray-100 rounded-xl overflow-hidden transition-all hover:-translate-y-1 duration-300">
                            <div className={`p-6 bg-gradient-to-b ${getBgGradient(projet.etat)}`}>
                                {/* En-tête avec état */}
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="group-hover:text-emerald-600 font-bold text-gray-800 text-xl truncate transition-colors">{projet.nom}</h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEtatColor(projet.etat)}`}>
                                        {getEtatLabel(projet.etat)}
                                    </span>
                                </div>
                                
                                {/* Description */}
                                <div className="bg-white bg-opacity-60 mb-5 p-3 border border-gray-100 rounded-lg">
                                    <p className="text-gray-600 text-sm line-clamp-2">
                                        {projet.description || "Aucune description disponible."}
                                    </p>
                                </div>
                                
                                {/* Informations du projet */}
                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <div className="flex justify-center items-center bg-white mr-3 p-1.5 border border-gray-200 rounded-lg">
                                            <Tag className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span>Propriétaire: <span className="font-medium">{projet.proprietaire.username}</span></span>
                                    </div>
                                    
                                    {projet.date_fin && (
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <div className="flex justify-center items-center bg-white mr-3 p-1.5 border border-gray-200 rounded-lg">
                                                <Clock className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <span>
                                                Date de fin: <span className="font-medium">
                                                    {new Date(projet.date_fin).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Membres du projet */}
                                <div className="flex justify-between items-center mt-5 pt-5 border-gray-100 border-t">
                                    <div className="flex items-center">
                                        <span className="mr-2 font-medium text-gray-500 text-xs">Membres:</span>
                                        {membres && membres.length > 0 ? (
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {membres.slice(0, 3).map((membre, index) => (
                                                    <div key={index} className="inline-flex justify-center items-center bg-emerald-100 shadow-sm border-2 border-white rounded-full w-8 h-8 font-medium text-emerald-700 text-xs">
                                                        {membre.username ? membre.username.charAt(0).toUpperCase() : "?"}
                                                    </div>
                                                ))}
                                                {membres.length > 3 && (
                                                    <div className="inline-flex justify-center items-center bg-gray-100 shadow-sm border-2 border-white rounded-full w-8 h-8 font-medium text-gray-600 text-xs">
                                                        +{membres.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Aucun membre</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto border-gray-100 border-t">
                                <Link 
                                    to={`/projets/${projet.id}`} 
                                    className="group-hover:bg-emerald-600 group-hover:text-white flex justify-center items-center gap-2 bg-white py-3.5 font-medium text-emerald-600 transition-all"
                                >
                                    <span>Voir le détail</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    //  la liste des projets en mode liste
    const renderProjetsList = (projets: Projet[]) => {
        return (
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <table className="divide-y divide-gray-200 min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                                Projet
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                                État
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                                Propriétaire
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                                Date de fin
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                                Membres
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-right uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projets.map((projet) => {
                            const membres = projet.membres_details || projet.membres || [];
                            
                            return (
                                <tr key={projet.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{projet.nom}</div>
                                                <div className="text-gray-500 text-sm line-clamp-1">{projet.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEtatColor(projet.etat)}`}>
                                            {getEtatLabel(projet.etat)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                        {projet.proprietaire.username}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                        {projet.date_fin ? new Date(projet.date_fin).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {membres && membres.length > 0 ? (
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {membres.slice(0, 3).map((membre, index) => (
                                                    <div key={index} className="inline-block bg-emerald-100 border-2 border-white rounded-full w-8 h-8 font-medium text-emerald-700 text-xs text-center leading-7">
                                                        {membre.username ? membre.username.charAt(0).toUpperCase() : "?"}
                                                    </div>
                                                ))}
                                                {membres.length > 3 && (
                                                    <div className="inline-block bg-gray-100 border-2 border-white rounded-full w-8 h-8 font-medium text-gray-500 text-xs text-center leading-7">
                                                        +{membres.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-sm text-right whitespace-nowrap">
                                        <Link to={`/projets/${projet.id}`} className="text-emerald-600 hover:text-emerald-900">
                                            Voir
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // la section des projets avec titre
    const renderProjetsSection = (projets: Projet[], titre: string, icon: React.ReactNode, totalPages: number, currentPage: number, onPageChange: (page: number) => void) => {
        if (projets.length === 0) {
            return (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        {icon}
                        <h3 className="font-bold text-gray-800 text-lg">{titre}</h3>
                    </div>
                    <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl text-center">
                        <p className="text-gray-500">Aucun projet disponible dans cette catégorie.</p>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h3 className="font-bold text-gray-800 text-lg">{titre}</h3>
                        <span className="bg-gray-100 ml-2 px-2 py-0.5 rounded-full font-medium text-gray-700 text-xs">
                            {mesProjetsFiltered.length}
                        </span>
                    </div>
                </div>
                {viewMode === "grid" ? renderProjetsGrid(projets) : renderProjetsList(projets)}
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={onPageChange} 
                />
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto px-4 pb-10 container">
                {/* Filtres, recherche et sélecteur de vue */}
                <div className="bg-white shadow-sm mb-6 p-4 border border-gray-100 rounded-xl">
                    <div className="flex md:flex-row flex-col items-center gap-4">
                        <div className="relative flex-grow">
                            <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block py-2 pr-3 pl-10 border border-gray-200 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full"
                                placeholder="Rechercher un projet..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                    <Filter className="w-5 h-5 text-gray-400" />
                                </div>
                                <select
                                    className="block py-2 pr-8 pl-10 border border-gray-200 focus:border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-500 w-full appearance-none"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                >
                                    <option value="TOUS">Tous les états</option>
                                    <option value="EN_ATTENTE">En attente</option>
                                    <option value="EN_COURS">En cours</option>
                                    <option value="TERMINE">Terminé</option>
                                </select>
                                <div className="right-0 absolute inset-y-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            {/* Toggle boutons pour changer de vue */}
                            <div className="flex border border-gray-200 rounded-lg">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`py-2 px-3 rounded-l-lg ${viewMode === "grid" ? 'bg-emerald-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                    title="Vue en grille"
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`py-2 px-3 rounded-r-lg ${viewMode === "list" ? 'bg-emerald-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                                    title="Vue en liste"
                                >
                                    <ListIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <Link to="/projets/nouveau" className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium text-white transition-colors">
                                <Plus className="w-4 h-4" />
                                Nouveau projet
                            </Link>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center py-16">
                        <Loader className="mb-4 w-12 h-12 text-emerald-500 animate-spin" />
                        <p className="text-gray-500">Chargement des projets...</p>
                    </div>
                ) : mesProjetsFiltered.length === 0 && projetsParticipantFiltered.length === 0 ? (
                    <div className="bg-white shadow-sm py-16 rounded-xl text-center">
                        <div className="flex justify-center items-center bg-gray-100 mx-auto mb-4 rounded-full w-16 h-16">
                            <Filter className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 font-medium text-gray-800 text-lg">Aucun projet trouvé</h3>
                        <p className="mb-4 text-gray-500">Essayez de modifier vos filtres ou de créer un nouveau projet.</p>
                        <Link to="/projets/nouveau" className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 shadow-sm px-4 py-2 border border-transparent rounded-md font-medium text-white text-sm">
                            <Plus className="mr-2 w-4 h-4" />
                            Créer un projet
                        </Link>
                    </div>
                ) : (
                    <>
                        {renderProjetsSection(
                            currentMesProjets, 
                            "Mes Projets", 
                            <div className="flex justify-center items-center bg-blue-100 rounded-lg w-8 h-8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>,
                            totalPagesMesProjets,
                            currentPage,
                            setCurrentPage
                        )}
                        {renderProjetsSection(
                            currentProjetsParticipant, 
                            "Projets auxquels je participe", 
                            <div className="flex justify-center items-center bg-purple-100 rounded-lg w-8 h-8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>,
                            totalPagesProjetsParticipant,
                            currentPage,
                            setCurrentPage
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProjetsList;
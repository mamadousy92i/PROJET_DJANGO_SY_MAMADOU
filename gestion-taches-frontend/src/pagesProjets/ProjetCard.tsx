import { Link } from "react-router-dom";
import { Calendar, Users, Clock, ArrowRight, Edit, Trash2 } from "lucide-react";

interface Projet {
    id: number;
    nom: string;
    description: string;
    etat: string;
    date_fin?: string;
    membres?: { id: number; username: string }[];
}

interface ProjetCardProps {
    projet: Projet;
    onDelete?: (id: number) => void;
}

const ProjetCard = ({ projet, onDelete }: ProjetCardProps) => {
    // Traduction des états pour l'affichage
    const getEtatLabel = (etat: string) => {
        switch(etat) {
            case "EN_ATTENTE": return "En attente";
            case "EN_COURS": return "En cours";
            case "TERMINE": return "Terminé";
            default: return etat;
        }
    };

    // Couleurs selon l'état
    const getEtatColor = (etat: string) => {
        switch(etat) {
            case "EN_ATTENTE": return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "EN_COURS": return "bg-blue-100 text-blue-800 border-blue-300";
            case "TERMINE": return "bg-green-100 text-green-800 border-green-300";
            default: return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    // Formater la date pour l'affichage
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Non définie";
        
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    // Calculer le statut de la date d'échéance
    const getDateStatus = (dateString?: string) => {
        if (!dateString) return "";
        
        const today = new Date();
        const dueDate = new Date(dateString);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return "text-red-600 font-medium";
        } else if (diffDays <= 7) {
            return "text-yellow-600 font-medium";
        }
        return "text-gray-700";
    };

    // Fonction pour tronquer la description
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <div className="bg-white shadow-sm hover:shadow-md border border-gray-100 rounded-lg overflow-hidden transition-all">
            {/* En-tête de la carte */}
            <div className="p-4 border-gray-100 border-b">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{projet.nom}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getEtatColor(projet.etat)}`}>
                        {getEtatLabel(projet.etat)}
                    </span>
                </div>
                <p className="mt-2 text-gray-600 line-clamp-2">
                    {truncateText(projet.description, 120)}
                </p>
            </div>
            
            {/* Détails du projet */}
            <div className="bg-gray-50 p-4">
                <div className="space-y-2">
                    {/* Date d'échéance */}
                    <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span className="text-gray-500 text-sm">Échéance:</span>
                        <span className={`ml-1 text-sm ${getDateStatus(projet.date_fin)}`}>
                            {formatDate(projet.date_fin)}
                        </span>
                    </div>
                    
                    {/* Membres du projet (si disponible) */}
                    {projet.membres && (
                        <div className="flex items-center">
                            <Users size={16} className="mr-2 text-gray-400" />
                            <span className="text-gray-500 text-sm">Membres:</span>
                            <span className="ml-1 text-gray-700 text-sm">
                                {projet.membres.length}
                            </span>
                        </div>
                    )}
                    
                    {/* Statut du projet */}
                    <div className="flex items-center">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        <span className="text-gray-500 text-sm">Statut:</span>
                        <span className="ml-1 text-gray-700 text-sm">
                            {getEtatLabel(projet.etat)}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between p-4 border-gray-100 border-t">
                <div className="space-x-2">
                    <Link 
                        to={`/projets/${projet.id}/modifier`}
                        className="inline-flex items-center bg-white hover:bg-gray-50 px-2.5 py-1.5 border border-gray-300 rounded font-medium text-gray-700 text-xs transition-colors"
                    >
                        <Edit size={14} className="mr-1" />
                        Modifier
                    </Link>
                    
                    {onDelete && (
                        <button 
                            onClick={() => onDelete(projet.id)}
                            className="inline-flex items-center bg-white hover:bg-red-50 px-2.5 py-1.5 border border-red-300 rounded font-medium text-red-700 text-xs transition-colors"
                        >
                            <Trash2 size={14} className="mr-1" />
                            Supprimer
                        </button>
                    )}
                </div>
                
                <Link 
                    to={`/projets/${projet.id}`}
                    className="inline-flex items-center bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 border border-transparent rounded font-medium text-emerald-700 text-xs transition-colors"
                >
                    Détails
                    <ArrowRight size={14} className="ml-1" />
                </Link>
            </div>
        </div>
    );
};

export default ProjetCard;
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Loader, Info, Calendar as CalendarIcon, Filter, RefreshCw, ChevronLeft,  X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { getUserId } from '../axiosConfig';

// Configurer moment pour le français
moment.locale('fr');
const localizer = momentLocalizer(moment);

interface Tache {
    id: number;
    titre: string;
    description: string;
    statut: string;
    date_limite: string;
    projet: number;
    projet_detail?: {
        id: number;
        nom: string;
        description: string;
    };
    assigne_a?: number[];
    assigne_a_detail?: { id: number; username: string }[];
}

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    resource: Tache;
}

const Calendrier: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedEvent, setSelectedEvent] = useState<Tache | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [projets, setProjets] = useState<{[key: number]: {id: number, nom: string, description: string}}>({}); 
    const [view, setView] = useState('month');
    const [date, setDate] = useState(new Date());
    const [filter, setFilter] = useState('TOUS');

    // Fonction pour charger les données
    const loadData = () => {
        setLoading(true);
        
        // 1. Récupérer tous les projets
        api.get('/projets/')
            .then((projetResponse: { data: { id: string | number; nom: any; description: any; }[]; }) => {
                // Créer un dictionnaire avec ID du projet comme clé
                const projetsMap: { [key: number]: { id: number; nom: string; description: string } } = {};
                projetResponse.data.forEach((projet: { id: string | number; nom: any; description: any; }) => {
                    projetsMap[Number(projet.id)] = {
                        id: Number(projet.id),
                        nom: projet.nom,
                        description: projet.description
                    };
                });
                setProjets(projetsMap);
                
                // 2. Récupérer les tâches
                return api.get('/taches/');
            })
            .then((tacheResponse: { data: any; }) => {
                console.log("✅ Tâches récupérées:", tacheResponse.data);
                const taches = tacheResponse.data;
                
                // Filtrer les tâches pertinentes pour l'utilisateur
                const userTaches = taches.filter((tache: Tache) => {
                    // Vérifier si l'utilisateur est assigné à cette tâche
                    const isAssigned = tache.assigne_a_detail 
                        ? tache.assigne_a_detail.some((user: any) => user.id === userId)
                        : Array.isArray(tache.assigne_a)
                            ? userId !== null && tache.assigne_a.includes(userId)
                            : false;
                    
                    // Appliquer le filtre de statut
                    if (filter !== 'TOUS' && tache.statut !== filter) {
                        return false;
                    }
                    
                    return isAssigned;
                });
                
                // Ajouter les informations du projet à chaque tâche
                userTaches.forEach((tache: { projet: string | number; projet_detail: { id: number; nom: string; description: string; }; }) => {
                    if (projets[Number(tache.projet)]) {
                        tache.projet_detail = projets[Number(tache.projet)];
                    }
                });
                
                console.log("✅ Tâches filtrées pour l'utilisateur:", userTaches);
                
                // Transformer les tâches en événements de calendrier
                const calendarEvents = userTaches.map((tache: Tache) => {
                    const date = new Date(tache.date_limite);
                    return {
                        id: tache.id,
                        title: tache.titre,
                        start: date,
                        end: new Date(date.getTime() + 60 * 60 * 1000), // Ajoute 1 heure pour la durée
                        resource: tache
                    };
                });

                setEvents(calendarEvents);
            })
            .catch((error: { response: { data: any; status: any; }; }) => {
                console.error('Erreur lors du chargement des données:', error);
                if (error.response) {
                    console.error('Détails de l\'erreur:', error.response.data);
                    console.error('Status:', error.response.status);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        // Récupérer l'ID de l'utilisateur connecté
        const id = Number(getUserId());
        setUserId(id);
    }, []);

    // Charger les données lorsque l'ID utilisateur ou le filtre change
    useEffect(() => {
        if (userId) {
            loadData();
        }
    }, [userId, filter]);

    const getEventStyle = (event: any) => {
        const tache = event.resource;
        let backgroundColor;
        let borderColor;

        switch (tache.statut) {
            case 'A_FAIRE':
                backgroundColor = 'rgba(249, 115, 22, 0.85)'; // Orange avec transparence
                borderColor = '#f97316';
                break;
            case 'EN_COURS':
                backgroundColor = 'rgba(59, 130, 246, 0.85)'; // Bleu avec transparence
                borderColor = '#3b82f6';
                break;
            case 'TERMINE':
                backgroundColor = 'rgba(16, 185, 129, 0.85)'; // Vert avec transparence
                borderColor = '#10b981';
                break;
            default:
                backgroundColor = 'rgba(107, 114, 128, 0.85)'; // Gris avec transparence
                borderColor = '#6b7280';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                border: `2px solid ${borderColor}`,
                color: 'white',
                padding: '4px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.1s, box-shadow 0.1s',
                cursor: 'pointer',
                display: 'block'
            }
        };
    };

    // Style pour l'événement sélectionné
    const eventStyleGetter = (event: any, start: any, end: any, isSelected: any) => {
        const baseStyle = getEventStyle(event).style;
        if (isSelected) {
            return {
                style: {
                    ...baseStyle,
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 10
                }
            };
        }
        return { style: baseStyle };
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event.resource);
    };

    const getTacheStatutLabel = (statut: string) => {
        switch (statut) {
            case "A_FAIRE": return "À faire";
            case "EN_COURS": return "En cours";
            case "TERMINE": return "Terminée";
            default: return statut;
        }
    };

    const handleRefresh = () => {
        loadData();
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center bg-gray-50 h-screen">
                <Loader className="mb-4 w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-gray-500">Chargement du calendrier...</p>
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
                            <ChevronLeft className="w-5 h-5" />
                            Retour aux projets
                        </Link>
                        <h1 className="flex items-center gap-2 font-bold text-2xl">
                            <CalendarIcon className="w-6 h-6" />
                            Calendrier des tâches
                        </h1>
                    </div>
                </div>
            </header>

            <div className="mx-auto px-4 container">
                {/* Contrôles du calendrier */}
                <div className="bg-white shadow-sm mb-6 p-4 border border-gray-100 rounded-xl">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setView('month')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    view === 'month' 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Mois
                            </button>
                            <button 
                                onClick={() => setView('week')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    view === 'week' 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Semaine
                            </button>
                            <button 
                                onClick={() => setView('day')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    view === 'day' 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Jour
                            </button>
                            <button 
                                onClick={() => setView('agenda')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    view === 'agenda' 
                                        ? 'bg-emerald-500 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Agenda
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="left-0 absolute inset-y-0 flex items-center pl-3 pointer-events-none">
                                    <Filter className="w-5 h-5 text-gray-400" />
                                </div>
                                <select 
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="py-2 pr-8 pl-10 border border-gray-200 focus:border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                                >
                                    <option value="TOUS">Toutes les tâches</option>
                                    <option value="A_FAIRE">À faire</option>
                                    <option value="EN_COURS">En cours</option>
                                    <option value="TERMINE">Terminées</option>
                                </select>
                                <div className="right-0 absolute inset-y-0 flex items-center pr-2 pointer-events-none">
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleRefresh}
                                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-700 transition-colors"
                                title="Rafraîchir"
                            >
                                <RefreshCw className="w-5 h-5" />
                                <span className="hidden sm:inline">Rafraîchir</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
                    {/* Calendrier */}
                    <div className="lg:col-span-2 bg-white shadow-sm p-6 border border-gray-100 rounded-xl">
                        <div style={{ height: 700 }} className="calendar-container">
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: '100%' }}
                                eventPropGetter={eventStyleGetter}
                                onSelectEvent={handleSelectEvent}
                                view={view}
                                onView={(newView) => setView(newView)}
                                date={date}
                                onNavigate={(newDate) => setDate(newDate)}
                                messages={{
                                    next: "Suivant",
                                    previous: "Précédent",
                                    today: "Aujourd'hui",
                                    month: "Mois",
                                    week: "Semaine",
                                    day: "Jour",
                                    agenda: "Agenda",
                                    date: "Date",
                                    time: "Heure",
                                    event: "Événement",
                                    noEventsInRange: "Aucune tâche durant cette période"
                                }}
                                formats={{
                                    dayHeaderFormat: (date) => moment(date).format('dddd D MMMM'),
                                    dayRangeHeaderFormat: ({ start, end }) => 
                                        `${moment(start).format('D MMMM')} - ${moment(end).format('D MMMM YYYY')}`
                                }}
                                popup
                                popupOffset={10}
                            />
                        </div>
                    </div>

                    {/* Panel d'information */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-sm p-6 border border-gray-100 rounded-xl transition-all">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="flex items-center gap-2 font-bold text-gray-700 text-xl">
                                    <Info className="w-5 h-5 text-emerald-600" />
                                    Détails de la tâche
                                </h2>
                                {selectedEvent && (
                                    <button 
                                        onClick={() => setSelectedEvent(null)}
                                        className="hover:bg-gray-100 p-1.5 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {selectedEvent ? (
                                <div className="animate-fadeIn">
                                    <div className="mb-4">
                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                            selectedEvent.statut === 'A_FAIRE' 
                                                ? 'bg-orange-100 text-orange-800' 
                                                : selectedEvent.statut === 'EN_COURS' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-green-100 text-green-800'
                                        }`}>
                                            {getTacheStatutLabel(selectedEvent.statut)}
                                        </span>
                                    </div>

                                    <h3 className="mb-2 font-medium text-gray-800 text-lg">{selectedEvent.titre}</h3>

                                    <p className="mb-4 text-gray-600 whitespace-pre-line">
                                        {selectedEvent.description || 'Aucune description disponible.'}
                                    </p>

                                    <div className="bg-gray-50 hover:bg-gray-100 mb-4 p-4 rounded-lg transition-colors">
                                        <p className="mb-2 text-gray-600 text-sm">
                                            <span className="font-medium">Date limite:</span> {' '}
                                            {new Date(selectedEvent.date_limite).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </p>

                                        {selectedEvent.projet_detail && (
                                            <p className="text-gray-600 text-sm">
                                                <span className="font-medium">Projet:</span> {' '}
                                                <Link 
                                                    to={`/projets/${selectedEvent.projet_detail.id}`} 
                                                    className="text-emerald-600 hover:underline"
                                                >
                                                    {selectedEvent.projet_detail.nom}
                                                </Link>
                                            </p>
                                        )}
                                    </div>

                                    {selectedEvent.assigne_a_detail && selectedEvent.assigne_a_detail.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="mb-2 font-medium text-gray-700 text-sm">Personnes assignées:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedEvent.assigne_a_detail.map(user => (
                                                    <div key={user.id} className="inline-flex items-center bg-white px-2.5 py-1.5 border border-gray-200 rounded-full font-medium text-gray-700 text-sm">
                                                        <div className="flex justify-center items-center bg-emerald-100 mr-2 rounded-full w-6 h-6 text-emerald-700">
                                                            {user.username ? user.username.charAt(0).toUpperCase() : "?"}
                                                        </div>
                                                        {user.username}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        {selectedEvent.projet_detail && (
                                            <Link 
                                                to={`/projets/${selectedEvent.projet_detail.id}`} 
                                                className="inline-block bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md px-4 py-2 rounded-lg font-medium text-white transition-colors"
                                            >
                                                Voir le projet
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 text-center">
                                    <div className="flex justify-center items-center bg-gray-100 mx-auto mb-4 rounded-full w-16 h-16">
                                        <CalendarIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">
                                        Sélectionnez une tâche dans le calendrier pour afficher ses détails
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white shadow-sm mt-6 p-6 border border-gray-100 rounded-xl">
                            <h2 className="flex items-center gap-2 mb-4 font-bold text-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Légende
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <span className="bg-orange-500 shadow-sm rounded-md w-5 h-5"></span>
                                    <span className="text-gray-600 text-sm">À faire</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <span className="bg-blue-500 shadow-sm rounded-md w-5 h-5"></span>
                                    <span className="text-gray-600 text-sm">En cours</span>
                                </div>
                                <div className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <span className="bg-green-500 shadow-sm rounded-md w-5 h-5"></span>
                                    <span className="text-gray-600 text-sm">Terminée</span>
                                </div>
                            </div>
                            
                            {events.length === 0 && (
                                <div className="bg-amber-50 mt-4 p-3 rounded-lg text-amber-800 text-sm">
                                    <p>Aucune tâche à afficher. Vérifiez vos filtres ou assurez-vous que des tâches vous sont assignées.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* CSS pour personnaliser les transitions et l'aspect visuel */}
            <style>{`
                .calendar-container .rbc-event {
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .calendar-container .rbc-event:hover {
                    transform: translateY(-2px) scale(1.01);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                    z-index: 5;
                }
                
                .calendar-container .rbc-toolbar button {
                    border-radius: 0.5rem;
                    padding: 0.5rem 1rem;
                    color: #374151;
                    background-color: white;
                    border: 1px solid #e5e7eb;
                    transition: all 0.2s;
                }
                
                .calendar-container .rbc-toolbar button:hover {
                    background-color: #f3f4f6;
                }
                
                .calendar-container .rbc-toolbar button.rbc-active {
                    background-color: #10b981;
                    color: white;
                    border-color: #10b981;
                }
                
                .calendar-container .rbc-toolbar button.rbc-active:hover {
                    background-color: #059669;
                }
                
                .calendar-container .rbc-header {
                    padding: 0.75rem 0;
                    font-weight: 500;
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .calendar-container .rbc-today {
                    background-color: rgba(16, 185, 129, 0.05);
                }
                
                .calendar-container .rbc-off-range-bg {
                    background-color: #f9fafb;
                }
                
                .calendar-container .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
                    padding: 0.75rem;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-in-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

// Composant ChevronDown pour l'icône de sélection
const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default Calendrier;
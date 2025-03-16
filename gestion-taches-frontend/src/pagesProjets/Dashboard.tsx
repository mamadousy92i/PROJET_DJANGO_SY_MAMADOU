import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { PieChart, Calendar, Users, CheckSquare, Award, BarChart2 } from "lucide-react";
import api from "../axiosConfig";
import { Link, useNavigate } from "react-router-dom";

// Interface pour les projets
interface Projet {
    id: number;
    nom: string;
    description: string;
    date_creation: string;
    date_fin: string;
    etat: string;
    proprietaire: {
        id: number;
        username: string;
    };
    membres: number[];
}

// Interface pour les tâches
interface Tache {
    id: number;
    titre: string;
    description: string;
    date_limite: string;
    statut: string;
    projet: number;
    assigne_a: number[];
}

// Interface pour les statistiques
interface UserStat {
    utilisateur: string;
    role: string;
    taches_totales: number;
    taches_terminees: number;
    taux_completion: number;
    prime: string;
    badge: string;
}

const Dashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        teamMembers: 0
    });

    const [recentProjects, setRecentProjects] = useState<{
        id: number;
        nom: string;
        progression: number;
        dateEcheance: string;
        membres: number;
    }[]>([]);

    const [userPerformance, setUserPerformance] = useState<{
        taux_completion: number;
        prime: string;
        badge: string;
    }>({
        taux_completion: 0,
        prime: '0',
        badge: 'En progrès'
    });

useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            // Récupérer les projets
            const projectsResponse = await api.get('/projets/');
            const projects: Projet[] = projectsResponse.data;

            const tasksResponse = await api.get('/taches/');
            const allTasks: Tache[] = tasksResponse.data;

            // Récupérer les statistiques utilisateur en premier
            try {
                const statsResponse = await api.get('/statistiques/');
                const userStat = statsResponse.data.find(
                    (stat: UserStat) => stat.utilisateur === user?.username
                );
                
                if (userStat) {
                    setUserPerformance({
                        taux_completion: userStat.taux_completion,
                        prime: userStat.prime,
                        badge: userStat.badge
                    });
                    
                    setStats(prevStats => ({
                        ...prevStats,
                        totalTasks: userStat.taches_totales,
                        completedTasks: userStat.taches_terminees,
                        pendingTasks: userStat.taches_totales - userStat.taches_terminees
                    }));
                } else {
                    throw new Error("Statistiques utilisateur non trouvées");
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques :", error);
                
                // a c'est le  un calcul de secours si l'api ne marche pas 
                // Mais seulement pour les tâches de l'utilisateur
                
                // Filtrer pour n'obtenir que les tâches assignées à l'utilisateur actuel
                const userTasks = allTasks.filter(task => 
                    Array.isArray(task.assigne_a) && 
                    user?.id !== undefined && task.assigne_a.includes(user.id)
                );
                
                const completedUserTasks = userTasks.filter(task => task.statut === 'TERMINE').length;
                const taux_completion = userTasks.length > 0 
                    ? Math.round((completedUserTasks / userTasks.length) * 100)
                    : 0;
                
                // Déterminer le badge en fonction du taux de complétion
                let badge = "En progrès";
                if (taux_completion >= 100) badge = "Top Performer";
                else if (taux_completion >= 90) badge = "Très bon";
                else if (taux_completion >= 70) badge = "Bon";
                
                // Déterminer la prime (seulement pour les enseignants)
                let prime = "0$";
                if (user?.role === "enseignant") {
                    if (taux_completion === 100) prime = "100000$";
                    else if (taux_completion >= 90) prime = "30000$";
                } else {
                    prime = "Non concerné";
                }
                
                // Mettre à jour les deux états avec les mêmes données
                setUserPerformance({
                    taux_completion: taux_completion,
                    prime: prime,
                    badge: badge
                });
                
                setStats(prevStats => ({
                    ...prevStats,
                    totalTasks: userTasks.length,
                    completedTasks: completedUserTasks,
                    pendingTasks: userTasks.length - completedUserTasks
                }));
            }
            
            // Mettre à jour le nombre de projets
            setStats(prevStats => ({
                ...prevStats,
                totalProjects: projects.length,
                teamMembers: projects.length
            }));

            // Filtrer les projets auxquels l'utilisateur participe ou dont il est propriétaire
            const userProjects = projects.filter(project =>
                project.proprietaire.username === user?.username ||
                user?.id !== undefined && project.membres.includes(user.id)
            );

            // Préparer les projets récents
            const formattedProjects = userProjects
                .slice(0, 5) // Limiter aux 5 projets les plus récents
                .map(project => {
                    // Calculer la progression du projet
                    const projectTasks = allTasks.filter(task => task.projet === project.id);
                    const projectCompletedTasks = projectTasks.filter(task => task.statut === 'TERMINE').length;
                    const progress = projectTasks.length > 0
                        ? Math.round((projectCompletedTasks / projectTasks.length) * 100)
                        : 0;

                    return {
                        id: project.id,
                        nom: project.nom,
                        progression: progress,
                        dateEcheance: project.date_fin
                            ? new Date(project.date_fin).toLocaleDateString('fr-FR')
                            : 'Non définie',
                        membres: Array.isArray(project.membres) ? project.membres.length : 0
                    };
                });

            setRecentProjects(formattedProjects);
            setLoading(false);

        } catch (error) {
            console.error("Erreur lors du chargement des données :", error);
            setLoading(false);
        }
    };

    if (user) {
        fetchData();
    }
}, [user]);
    if (loading) {
        return (
            <div className="flex justify-center items-center bg-gray-50 h-screen">
                <div className="border-emerald-500 border-t-2 border-b-2 rounded-full w-32 h-32 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            

            {/* Contenu principal */}
            <main className="mx-auto px-4 py-6 container">
                {/* Bannière de bienvenue */}
                <div className="bg-white shadow-sm mb-6 p-6 border-emerald-500 border-l-4 rounded-lg">
                    <h2 className="font-bold text-gray-800 text-2xl">Bienvenue sur votre espace de travail ESMT</h2>
                    <p className="mt-2 text-gray-600">
                        Gérez vos projets académiques, collaborez avec les enseignants et étudiants, et suivez la progression de toutes vos tâches.
                    </p>
                </div>

                {/* Statistiques */}
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <div className="bg-white shadow-sm p-4 border-emerald-500 border-t-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-emerald-100 mr-4 p-3 rounded-full text-emerald-600">
                                <CheckSquare size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Tâches complétées</p>
                                <p className="font-bold text-gray-800 text-xl">{stats.completedTasks}/{stats.totalTasks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm p-4 border-emerald-500 border-t-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-emerald-100 mr-4 p-3 rounded-full text-emerald-600">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Projets actifs</p>
                                <p className="font-bold text-gray-800 text-xl">{stats.totalProjects}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm p-4 border-emerald-500 border-t-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-emerald-100 mr-4 p-3 rounded-full text-emerald-600">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Membres d'équipe</p>
                                <p className="font-bold text-gray-800 text-xl">{stats.teamMembers}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm p-4 border-emerald-500 border-t-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-emerald-100 mr-4 p-3 rounded-full text-emerald-600">
                                <Award size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">Performance</p>
                                <p className="font-bold text-gray-800 text-xl">{userPerformance.taux_completion}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions rapides */}
                <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mb-6">
                    <Link
                        to="/projets/nouveau"
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-sm p-5 rounded-lg text-white transition cursor-pointer"
                    >
                        <h3 className="mb-2 font-bold text-lg">Créer un nouveau projet</h3>
                        <p className="text-emerald-100 text-sm">Définissez un nouveau projet et invitez des collaborateurs</p>
                    </Link>

                    <div
                        onClick={() => {
                            if (stats.totalProjects > 0) {
                                navigate('/projets');
                            } else {
                                alert('Créez d\'abord un projet pour ajouter des tâches');
                            }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-sm p-5 rounded-lg text-white transition cursor-pointer"
                    >
                        <h3 className="mb-2 font-bold text-lg">Ajouter une tâche</h3>
                        <p className="text-emerald-100 text-sm">Créez une nouvelle tâche et assignez-la à un membre</p>
                    </div>

                    <Link
                        to="/statistiques"
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-sm p-5 rounded-lg text-white transition cursor-pointer"
                    >
                        <h3 className="mb-2 font-bold text-lg">Voir les statistiques</h3>
                        <p className="text-emerald-100 text-sm">Analysez la performance trimestrielle et annuelle</p>
                    </Link>
                </div>

                {/* Projets récents */}
                <div className="bg-white shadow-sm mb-6 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">Projets récents</h3>
                        <Link to="/projets" className="text-emerald-600 hover:text-emerald-800 text-sm">
                            Voir tous les projets
                        </Link>
                    </div>

                    {recentProjects.length === 0 ? (
                        <div className="bg-gray-50 p-8 rounded-lg text-center">
                            <p className="text-gray-500">Aucun projet disponible. Créez votre premier projet !</p>
                            <Link
                                to="/projets/creer"
                                className="inline-block bg-emerald-600 hover:bg-emerald-700 mt-4 px-4 py-2 rounded-lg text-white transition"
                            >
                                Créer un projet
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="divide-y divide-gray-200 min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Nom du projet</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Progression</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Échéance</th>
                                        <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">Membres</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentProjects.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => navigate(`/projets/${project.id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{project.nom}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="bg-gray-200 rounded-full w-full h-2.5">
                                                    <div
                                                        className="bg-emerald-600 rounded-full h-2.5"
                                                        style={{ width: `${project.progression}%` }}
                                                    ></div>
                                                </div>
                                                <span className="mt-1 text-gray-500 text-xs">{project.progression}%</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                                {project.dateEcheance}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                                                {project.membres} collaborateurs
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Aperçu des statistiques et évaluations */}
                {/* Aperçu des statistiques et évaluations */}
<div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-6">
    <div className="bg-white shadow-sm hover:shadow-md p-6 rounded-lg transition-shadow">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Votre performance</h3>
            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                <BarChart2 size={20} />
            </div>
        </div>
        <p className="mb-4 text-gray-600">Visualisez votre performance actuelle</p>
        <div className="bg-gray-100 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <p className="text-gray-700">Taux de complétion</p>
                <p className="font-bold text-emerald-700">{userPerformance.taux_completion}%</p>
            </div>
            <div className="bg-gray-200 mb-6 rounded-full h-4 overflow-hidden">
                <div
                    className={`rounded-full h-4 transition-all duration-1000 ease-out ${
                        userPerformance.taux_completion >= 90 
                            ? 'bg-green-600' 
                            : userPerformance.taux_completion >= 70 
                                ? 'bg-emerald-600' 
                                : userPerformance.taux_completion >= 50 
                                    ? 'bg-blue-600' 
                                    : 'bg-amber-500'
                    }`}
                    style={{ width: `${userPerformance.taux_completion}%` }}
                ></div>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-gray-700">Badge de performance</p>
                <span className={`px-3 py-1 rounded-full text-sm ${
                    userPerformance.badge.includes("Top") 
                        ? 'bg-green-100 text-green-700' 
                        : userPerformance.badge.includes("Très bon") 
                            ? 'bg-emerald-100 text-emerald-700'
                            : userPerformance.badge.includes("Bon")
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                }`}>
                    {userPerformance.badge || "En progrès"}
                </span>
            </div>
        </div>
        <Link
            to="/statistiques"
            className="block bg-emerald-100 hover:bg-emerald-200 mt-4 py-2 rounded-md w-full font-medium text-emerald-700 text-center transition"
        >
            Rapport détaillé
        </Link>
    </div>

    {/* Afficher la section Prime uniquement pour les enseignants */}
    {user?.role !== "etudiant" && (
        <div className="bg-white shadow-sm hover:shadow-md p-6 rounded-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Prime potentielle</h3>
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <PieChart size={20} />
                </div>
            </div>
            <p className="mb-4 text-gray-600">Éligibilité aux primes basée sur performance</p>
            <div className="bg-gray-100 p-6 rounded-lg">
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className={`flex justify-center items-center p-4 rounded-full w-32 h-32 ${
                        userPerformance.prime.includes("100") 
                            ? 'bg-green-100 text-green-700' 
                            : userPerformance.prime.includes("30") 
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-200 text-gray-500'
                    }`}>
                        <span className="font-bold text-2xl">
                            {userPerformance.prime || "0$"}
                        </span>
                    </div>
                    <p className="text-gray-700 text-center">
                        {userPerformance.taux_completion >= 90
                            ? "Félicitations ! Vous êtes éligible à une prime basée sur votre performance."
                            : "Continuez à améliorer votre performance pour être éligible à une prime."}
                    </p>
                </div>
            </div>
            <Link
                to="/statistiques"
                className="block bg-emerald-100 hover:bg-emerald-200 mt-4 py-2 rounded-md w-full font-medium text-emerald-700 text-center transition"
            >
                Voir les détails
            </Link>
        </div>
    )}
    
    {/* Afficher un composant alternatif pour les étudiants */}
    {user?.role === "etudiant" && (
        <div className="bg-white shadow-sm hover:shadow-md p-6 rounded-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Activité récente</h3>
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <Calendar size={20} />
                </div>
            </div>
            <p className="mb-4 text-gray-600">Consultez vos tâches à venir</p>
            <div className="bg-gray-100 p-6 rounded-lg">
                <ul className="space-y-3">
                    {stats.totalTasks > 0 ? (
                        <>
                            <li className="flex justify-between items-center">
                                <span className="text-gray-700">Tâches en attente</span>
                                <span className="bg-amber-100 px-3 py-1 rounded-full text-amber-700 text-sm">{stats.pendingTasks}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-gray-700">Tâches terminées</span>
                                <span className="bg-green-100 px-3 py-1 rounded-full text-green-700 text-sm">{stats.completedTasks}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-gray-700">Progression globale</span>
                                <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 text-sm">
                                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                                </span>
                            </li>
                        </>
                    ) : (
                        <li className="py-2 text-gray-500 text-center">Aucune tâche en cours</li>
                    )}
                </ul>
            </div>
            <Link
                to="/calendrier"
                className="block bg-emerald-100 hover:bg-emerald-200 mt-4 py-2 rounded-md w-full font-medium text-emerald-700 text-center transition"
            >
                Voir le calendrier
            </Link>
        </div>
    )}
</div>
            </main>

            {/* Pied de page */}
            <footer className="bg-white py-4 border-gray-200 border-t">
                <div className="mx-auto px-4 text-gray-500 text-sm text-center container">
                    <p>© 2025 ESMT TaskFlow - Plateforme de gestion de tâches collaboratives</p>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
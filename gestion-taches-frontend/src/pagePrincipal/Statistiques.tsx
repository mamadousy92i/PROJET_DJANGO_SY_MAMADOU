import React, { useEffect, useState } from 'react';
import { getStatistiques } from '../axiosConfig';
import { User } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { ArrowDown, ArrowUp, Filter, Users, CheckCircle, Award, Clock } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Statistiques: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('taux_completion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getStatistiques();
        // Filtrer les admins dans les données récupérées
        const filteredData = data.filter(user => user.role !== 'admin');
        setUsers(filteredData);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const filteredUsers = users
    .filter(user => filterRole ? user.role === filterRole : true)
    .sort((a, b) => {
      const aValue = a[sortBy as keyof User];
      const bValue = b[sortBy as keyof User];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'desc' 
          ? bValue.localeCompare(aValue) 
          : aValue.localeCompare(bValue);
      }
      
      return 0;
    });

  const roles = [...new Set(users.map(user => user.role))];
  
  // Données pour le graphique de performance par rôle
  const performanceByRole = roles.map(role => {
    const usersWithRole = users.filter(u => u.role === role);
    const averageCompletion = usersWithRole.reduce((acc, user) => acc + user.taux_completion, 0) / usersWithRole.length;
    
    return {
      role,
      performance: Math.round(averageCompletion),
      count: usersWithRole.length
    };
  });
  
  // Données pour le graphique des primes
  const primeDistribution = users.reduce((acc, user) => {
    const primeAmount = user.prime.replace(/[^0-9]/g, '');
    const primeCategory = primeAmount === '100000' 
      ? '100 000 $' 
      : primeAmount === '30000' 
        ? '30 000 $' 
        : '0 $';
        
    const existingCategory = acc.find(item => item.name === primeCategory);
    
    if (existingCategory) {
      existingCategory.value += 1;
    } else {
      acc.push({ name: primeCategory, value: 1 });
    }
    
    return acc;
  }, [] as { name: string, value: number }[]);
  
  // Données pour le graphique de tendance des tâches terminées
  const topPerformers = [...users]
    .sort((a, b) => b.taux_completion - a.taux_completion)
    .slice(0, 5);
    
  // Données pour le graphique d'efficacité
  const efficiencyData = filteredUsers.map(user => ({
    name: user.utilisateur,
    efficacité: Math.round((user.taches_terminees / user.taches_totales) * 100) || 0,
    tâches_totales: user.taches_totales,
    rôle: user.role
  }));

  // Statistiques globales (sans les admins)
  const globalStats = {
    totalUsers: users.length,
    totalTasks: users.reduce((acc, user) => acc + user.taches_totales, 0),
    completedTasks: users.reduce((acc, user) => acc + user.taches_terminees, 0),
    averageCompletion: Math.round(users.reduce((acc, user) => acc + user.taux_completion, 0) / (users.length || 1)) || 0
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto px-6 py-8 container">
        {/* En-tête avec design moderne */}
        <div className="mb-8">
          <h1 className="font-bold text-gray-800 text-3xl">Tableau de bord des statistiques</h1>
          <p className="mt-2 text-gray-500">
            Analyse des performances, tâches et primes des utilisateurs (hors administrateurs)
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 shadow-sm mb-6 px-4 py-3 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center">
              <svg className="mr-3 w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Navigation par onglets */}
        <div className="flex flex-wrap bg-white mb-8 border-b">
          <button 
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'overview' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-emerald-600'}`}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'performance' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-emerald-600'}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button 
            className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${activeTab === 'users' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent hover:text-emerald-600'}`}
            onClick={() => setActiveTab('users')}
          >
            Utilisateurs
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="border-4 border-gray-200 border-t-emerald-600 rounded-full w-16 h-16 animate-spin"></div>
              <div className="mt-4 font-medium text-gray-600 text-center">Chargement...</div>
            </div>
          </div>
        ) : (
          <>
            {/* Contenu de l'onglet Vue d'ensemble */}
            {activeTab === 'overview' && (
              <>
                {/* Statistiques globales */}
                <div className="gap-4 grid grid-cols-1 md:grid-cols-4 mb-8">
                  <div className="bg-white shadow-sm p-6 border rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-emerald-100 mr-4 p-2 rounded-lg text-emerald-600">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Utilisateurs</p>
                        <p className="font-bold text-gray-800 text-2xl">{globalStats.totalUsers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-sm p-6 border rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-blue-100 mr-4 p-2 rounded-lg text-blue-600">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Tâches terminées</p>
                        <p className="font-bold text-gray-800 text-2xl">{globalStats.completedTasks}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-sm p-6 border rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-amber-100 mr-4 p-2 rounded-lg text-amber-600">
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Tâches totales</p>
                        <p className="font-bold text-gray-800 text-2xl">{globalStats.totalTasks}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white shadow-sm p-6 border rounded-lg">
                    <div className="flex items-start">
                      <div className="bg-purple-100 mr-4 p-2 rounded-lg text-purple-600">
                        <Award size={24} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Taux moyen</p>
                        <p className="font-bold text-gray-800 text-2xl">{globalStats.averageCompletion}%</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Graphiques de la vue d'ensemble */}
                <div className="gap-6 grid grid-cols-1 lg:grid-cols-2 mb-8">
                  {/* Graphique de performance par rôle */}
                  <div className="bg-white shadow-sm p-6 border rounded-lg">
                    <h3 className="mb-6 font-bold text-gray-800">Performance par rôle</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={performanceByRole}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="role" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="performance" name="Taux de complétion (%)" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Graphique de distribution des primes */}
                  <div className="bg-white shadow-sm p-6 border rounded-lg">
                    <h3 className="mb-6 font-bold text-gray-800">Distribution des primes</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={primeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {primeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Graphique des meilleurs performers */}
                <div className="bg-white shadow-sm mb-8 p-6 border rounded-lg">
                  <h3 className="mb-6 font-bold text-gray-800">Top 5 des utilisateurs performants</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topPerformers}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="utilisateur" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="taux_completion" name="Taux de complétion (%)" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
            
            {/* Contenu de l'onglet Performance */}
            {activeTab === 'performance' && (
              <>
                {/* Contrôles de filtre avec style élégant */}
                <div className="bg-white shadow-sm mb-8 p-6 border rounded-lg">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center text-gray-500">
                      <Filter size={18} className="mr-2" />
                      <span className="font-medium text-sm">Filtres:</span>
                    </div>
                    
                    <select
                      className="bg-white px-4 py-2 border focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="">Tous les rôles</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    
                    <select
                      className="bg-white px-4 py-2 border focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="taux_completion">Taux de complétion</option>
                      <option value="taches_totales">Tâches totales</option>
                      <option value="taches_terminees">Tâches terminées</option>
                      <option value="utilisateur">Nom d'utilisateur</option>
                    </select>
                    
                    <button
                      className="flex items-center bg-white hover:bg-gray-50 px-4 py-2 border rounded-lg text-sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <ArrowUp size={16} className="mr-2" /> : <ArrowDown size={16} className="mr-2" />}
                      {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                    </button>
                    
                    <div className="bg-gray-100 ml-auto px-3 py-1 rounded-full text-gray-700 text-sm">
                      {filteredUsers.length} utilisateur(s)
                    </div>
                  </div>
                </div>
                
                {/* Graphique d'efficacité */}
                <div className="bg-white shadow-sm mb-8 p-6 border rounded-lg">
                  <h3 className="mb-6 font-bold text-gray-800">Efficacité des utilisateurs</h3>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={efficiencyData.slice(0, 10)} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="efficacité" name="Efficacité (%)" fill="#10b981" />
                        <Bar dataKey="tâches_totales" name="Tâches totales" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Graphique de tendance */}
                <div className="bg-white shadow-sm mb-8 p-6 border rounded-lg">
                  <h3 className="mb-6 font-bold text-gray-800">Tendance des tâches terminées vs totales</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={filteredUsers.slice(0, 10)} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="utilisateur" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="taches_totales" name="Tâches totales" stroke="#3b82f6" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="taches_terminees" name="Tâches terminées" stroke="#10b981" />
                        <Line type="monotone" dataKey="taches_terminees_recent" name="Tâches terminées récemment" stroke="#f59e0b" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
            
            {/* Contenu de l'onglet Utilisateurs */}
            {activeTab === 'users' && (
              <>
                {/* Contrôles de filtre pour les utilisateurs */}
                <div className="bg-white shadow-sm mb-8 p-6 border rounded-lg">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center text-gray-500">
                      <Filter size={18} className="mr-2" />
                      <span className="font-medium text-sm">Filtres:</span>
                    </div>
                    
                    <select
                      className="bg-white px-4 py-2 border focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="">Tous les rôles</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    
                    <select
                      className="bg-white px-4 py-2 border focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="taux_completion">Taux de complétion</option>
                      <option value="taches_totales">Tâches totales</option>
                      <option value="taches_terminees">Tâches terminées</option>
                      <option value="utilisateur">Nom d'utilisateur</option>
                    </select>
                    
                    <button
                      className="flex items-center bg-white hover:bg-gray-50 px-4 py-2 border rounded-lg text-sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <ArrowUp size={16} className="mr-2" /> : <ArrowDown size={16} className="mr-2" />}
                      {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
                    </button>
                  </div>
                </div>
                
                {/* Tableau des utilisateurs avec design moderne */}
                <div className="bg-white shadow-sm p-6 border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="divide-y divide-gray-200 min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                            Rôle
                          </th>
                          <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                            Tâches
                          </th>
                          <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                            Taux de complétion
                          </th>
                          <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                            Badge
                          </th>
                          <th scope="col" className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                            Prime
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.utilisateur} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex flex-shrink-0 justify-center items-center bg-emerald-100 rounded-full w-10 h-10 font-bold text-emerald-600">
                                  {user.utilisateur.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="font-medium text-gray-900 text-sm">{user.utilisateur}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex bg-emerald-100 px-2 rounded-full font-semibold text-emerald-800 text-xs leading-5">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                              {user.taches_terminees} / {user.taches_totales}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="mr-2 font-medium text-gray-900 text-sm">{user.taux_completion}%</div>
                                <div className="relative bg-gray-200 rounded w-24 h-2">
                                  <div 
                                    className="top-0 left-0 absolute bg-emerald-500 rounded h-2" 
                                    style={{ width: `${user.taux_completion}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              <span className="inline-flex bg-blue-100 px-2 py-1 rounded-full font-semibold text-blue-800 text-xs leading-5">
                                {user.badge}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.prime === '100000$' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : user.prime === '30000$' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.prime}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredUsers.length === 0 && (
                    <div className="py-12 text-center">
                      <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 font-medium text-gray-900 text-sm">Aucun utilisateur trouvé</h3>
                      <p className="mt-1 text-gray-500 text-sm">Essayez d'ajuster vos filtres pour voir plus de résultats.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Statistiques;
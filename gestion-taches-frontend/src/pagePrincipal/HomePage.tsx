import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Calendar, BarChart2, Clock, Shield } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <nav className="bg-white shadow-sm py-4">
                <div className="flex justify-between items-center mx-auto px-4 md:px-6 container">
                <div className="flex items-center">
                            <svg className="w-40 h-10" viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#059669', stopOpacity: 0.1 }} />
                                        <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0.1 }} />
                                    </linearGradient>
                                </defs>

                                <g transform="translate(10, 15)">
                                    <circle cx="15" cy="15" r="12" fill="#10b981" opacity="0.9" />
                                    <circle cx="25" cy="15" r="8" fill="#059669" opacity="0.7" />

                                    <path d="M12 15 L16 19 L22 11"
                                        stroke="white"
                                        stroke-width="2.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        fill="none" />
                                </g>

                                <g transform="translate(45, 0)">
                                    <text x="0" y="22"
                                        font-family="Arial"
                                        font-size="18"
                                        font-weight="bold"
                                        fill="#10b981">
                                        ESMT
                                    </text>

                                    <text x="0" y="45"
                                        font-family="Arial"
                                        font-size="28"
                                        font-weight="900"
                                        fill="#10b981"
                                        letter-spacing="0.5">
                                        TaskFlow
                                    </text>
                                </g>

                                <line x1="45" y1="25" x2="85" y2="25"
                                    stroke="#10b981"
                                    stroke-width="1.5" />
                            </svg>
                        </div>
                    <div className="hidden md:flex items-center space-x-6">
                        <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors">Fonctionnalités</a>
                        <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors">Comment ça marche</a>
                        <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-colors">Témoignages</a>
                        <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">Connexion</Link>
                        <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white transition-colors">Inscription</Link>
                    </div>
                    <div className="md:hidden">
                        {/* Mobile menu button - in a real app, you'd add a state and toggle here */}
                        <button className="text-gray-500 hover:text-emerald-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                <div className="mx-auto px-4 md:px-6 py-20 md:py-32 container">
                    <div className="items-center gap-12 grid grid-cols-1 md:grid-cols-2">
                        <div>
                            <h1 className="mb-6 font-bold text-4xl md:text-5xl">Gestion des tâches collaborative pour l'ESMT</h1>
                            <p className="mb-8 text-emerald-50 text-lg">
                                Optimisez la collaboration entre enseignants et étudiants, suivez l'avancement des projets et améliorez la productivité académique.
                            </p>
                            <div className="flex sm:flex-row flex-col sm:space-x-4 space-y-4 sm:space-y-0">
                                <Link to="/register" className="bg-white hover:bg-emerald-50 px-6 py-3 rounded-md font-semibold text-emerald-600 text-center transition-colors">
                                    Commencer gratuitement
                                </Link>
                                <Link to="/login" className="hover:bg-emerald-600 px-6 py-3 border border-white rounded-md font-semibold text-white text-center transition-colors">
                                    Se connecter
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <img src="/api/placeholder/600/400" alt="Illustration de TaskFlow" className="shadow-xl rounded-lg" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-tl-[80px] w-full h-16"></div>
            </section>

            {/* Features */}
            <section id="features" className="bg-white py-20">
                <div className="mx-auto px-4 md:px-6 container">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 font-bold text-gray-800 text-3xl">Fonctionnalités principales</h2>
                        <p className="mx-auto max-w-2xl text-gray-600">
                            Notre plateforme offre tout ce dont vous avez besoin pour gérer efficacement les projets académiques et favoriser la collaboration.
                        </p>
                    </div>

                    <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-100 rounded-xl transition-shadow">
                            <div className="flex justify-center items-center bg-emerald-100 mb-4 rounded-lg w-12 h-12">
                                <CheckCircle className="text-emerald-600" size={24} />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-800 text-xl">Gestion des tâches</h3>
                            <p className="text-gray-600">
                                Créez, assignez et suivez les tâches avec des délais, des priorités et des notifications automatiques.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-100 rounded-xl transition-shadow">
                            <div className="flex justify-center items-center bg-blue-100 mb-4 rounded-lg w-12 h-12">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-800 text-xl">Collaboration</h3>
                            <p className="text-gray-600">
                                Travaillez efficacement en équipe avec des outils de communication et de partage intégrés.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-100 rounded-xl transition-shadow">
                            <div className="flex justify-center items-center bg-purple-100 mb-4 rounded-lg w-12 h-12">
                                <Calendar className="text-purple-600" size={24} />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-800 text-xl">Planification</h3>
                            <p className="text-gray-600">
                                Organisez votre calendrier académique et fixez des échéances pour les projets importants.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-100 rounded-xl transition-shadow">
                            <div className="flex justify-center items-center bg-amber-100 mb-4 rounded-lg w-12 h-12">
                                <BarChart2 className="text-amber-600" size={24} />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-800 text-xl">Statistiques</h3>
                            <p className="text-gray-600">
                                Analysez les performances et suivez la progression avec des graphiques et des rapports détaillés.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-100 rounded-xl transition-shadow">
                            <div className="flex justify-center items-center bg-red-100 mb-4 rounded-lg w-12 h-12">
                                <Clock className="text-red-600" size={24} />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-800 text-xl">Suivi du temps</h3>
                            <p className="text-gray-600">
                                Mesurez le temps passé sur chaque projet pour optimiser votre efficacité et respecter les délais.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-100 rounded-xl transition-shadow">
                            <div className="flex justify-center items-center bg-indigo-100 mb-4 rounded-lg w-12 h-12">
                                <Shield className="text-indigo-600" size={24} />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-800 text-xl">Gestion des rôles</h3>
                            <p className="text-gray-600">
                                Attribuez des rôles spécifiques aux enseignants et aux étudiants avec des permissions adaptées.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="bg-gray-50 py-20">
                <div className="mx-auto px-4 md:px-6 container">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 font-bold text-gray-800 text-3xl">Comment ça marche</h2>
                        <p className="mx-auto max-w-2xl text-gray-600">
                            Découvrez comment TaskFlow simplifie la gestion des projets académiques en quelques étapes simples.
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl">
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="left-0 md:left-1/2 absolute bg-emerald-200 w-0.5 h-full -translate-x-1/2 transform"></div>

                            {/* Step 1 */}
                            <div className="relative mb-12 md:mb-20">
                                <div className="flex md:flex-row flex-col items-center">
                                    <div className="hidden md:block mb-6 md:mb-0 md:pr-10 md:w-1/2 text-right">
                                        <h3 className="mb-2 font-bold text-gray-800 text-xl">Créez votre compte</h3>
                                        <p className="text-gray-600">
                                            Inscrivez-vous en quelques secondes en tant qu'enseignant ou étudiant pour accéder à toutes les fonctionnalités.
                                        </p>
                                    </div>
                                    <div className="md:left-1/2 z-10 md:absolute relative flex justify-center items-center bg-emerald-500 mx-auto md:mx-0 rounded-full w-10 h-10 md:-translate-x-1/2 md:transform">
                                        <span className="font-bold text-white">1</span>
                                    </div>
                                    <div className="md:hidden md:pl-10 md:w-1/2">
                                        <h3 className="mb-2 font-bold text-gray-800 text-xl text-center">Créez votre compte</h3>
                                        <p className="text-gray-600">
                                            Inscrivez-vous en quelques secondes en tant qu'enseignant ou étudiant pour accéder à toutes les fonctionnalités.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative mb-12 md:mb-20">
                                <div className="flex md:flex-row flex-col items-center">
                                    <div className="md:hidden block mb-6 md:mb-0 md:pr-10 md:w-1/2">
                                        <h3 className="mb-2 font-bold text-gray-800 text-xl text-center">Créez des projets</h3>
                                        <p className="text-gray-600">
                                            Définissez vos projets, ajoutez des descriptions détaillées et fixez des échéances claires.
                                        </p>
                                    </div>
                                    <div className="md:left-1/2 z-10 md:absolute relative flex justify-center items-center bg-emerald-500 mx-auto md:mx-0 rounded-full w-10 h-10 md:-translate-x-1/2 md:transform">
                                        <span className="font-bold text-white">2</span>
                                    </div>
                                    <div className="hidden md:block md:pl-10 md:w-1/2">
                                        <h3 className="mb-2 font-bold text-gray-800 text-xl">Créez des projets</h3>
                                        <p className="text-gray-600">
                                            Définissez vos projets, ajoutez des descriptions détaillées et fixez des échéances claires.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative mb-12 md:mb-20">
                                <div className="flex md:flex-row flex-col items-center">
                                    <div className="hidden md:block mb-6 md:mb-0 md:pr-10 md:w-1/2 text-right">
                                        <h3 className="mb-2 font-bold text-gray-800 text-xl">Ajoutez des tâches</h3>
                                        <p className="text-gray-600">
                                            Décomposez vos projets en tâches spécifiques et assignez-les aux membres de votre équipe.
                                        </p>
                                    </div>
                                    <div className="md:left-1/2 z-10 md:absolute relative flex justify-center items-center bg-emerald-500 mx-auto md:mx-0 rounded-full w-10 h-10 md:-translate-x-1/2 md:transform">
                                        <span className="font-bold text-white">3</span>
                                    </div>
                                    <div className="md:hidden md:pl-10 md:w-1/2">
                                        <h3 className="mb-2 font-bold text-gray-800 text-xl text-center">Ajoutez des tâches</h3>
                                        <p className="text-gray-600">
                                            Décomposez vos projets en tâches spécifiques et assignez-les aux membres de votre équipe.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="relative">
                                <div className="flex md:flex-row flex-col items-center">
                                    <div className="md:hidden block mb-6 md:mb-0 md:pr-10 md:w-1/2">
                                        <h3 className="mb-2 font-bold text-gray-800 text-xl text-center">Suivez les progrès</h3>
                                        <p className="text-gray-600">
                                            Visualisez l'avancement des projets, respectez les délais et analysez les performances.
                                        </p>
                                    </div>
                                    <div className="md:left-1/2 z-10 md:absolute relative flex justify-center items-center bg-emerald-500 mx-auto md:mx-0 rounded-full w-10 h-10 md:-translate-x-1/2 md:transform">
                                        <span className="font-bold text-white">4</span>
                                    </div>
                                    <div className="hidden md:block md:pl-10 md:w-1/2">
                                        <h3 className="mb-2 font-bold text-gray-800 text-xl">Suivez les progrès</h3>
                                        <p className="text-gray-600">
                                            Visualisez l'avancement des projets, respectez les délais et analysez les performances.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="bg-white py-20">
                <div className="mx-auto px-4 md:px-6 container">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 font-bold text-gray-800 text-3xl">Ce que disent nos utilisateurs</h2>
                        <p className="mx-auto max-w-2xl text-gray-600">
                            Découvrez pourquoi les enseignants et les étudiants apprécient TaskFlow pour la gestion de leurs projets académiques.
                        </p>
                    </div>

                    <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {/* Testimonial 1 */}
                        <div className="bg-gray-50 p-6 border border-gray-100 rounded-xl">
                            <div className="flex items-center mb-4">
                                <div className="flex justify-center items-center bg-emerald-200 mr-4 rounded-full w-12 h-12">
                                    <span className="font-semibold text-emerald-700">PS</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Pr. Samba Diop</h4>
                                    <p className="text-gray-500 text-sm">Enseignant en Informatique</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">
                                "TaskFlow a transformé la façon dont je gère mes cours et mes projets avec les étudiants. La plateforme est intuitive et permet un suivi rigoureux des travaux."
                            </p>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-gray-50 p-6 border border-gray-100 rounded-xl">
                            <div className="flex items-center mb-4">
                                <div className="flex justify-center items-center bg-blue-200 mr-4 rounded-full w-12 h-12">
                                    <span className="font-semibold text-blue-700">AF</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Awa Fall</h4>
                                    <p className="text-gray-500 text-sm">Étudiante en Master</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">
                                "Grâce à TaskFlow, je peux facilement suivre mes projets académiques et collaborer efficacement avec mes camarades et professeurs."
                            </p>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="bg-gray-50 p-6 border border-gray-100 rounded-xl">
                            <div className="flex items-center mb-4">
                                <div className="flex justify-center items-center bg-purple-200 mr-4 rounded-full w-12 h-12">
                                    <span className="font-semibold text-purple-700">MT</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Dr. Malick Touré</h4>
                                    <p className="text-gray-500 text-sm">Directeur de département</p>
                                </div>
                            </div>
                            <p className="text-gray-600 italic">
                                "La gestion des projets académiques et la supervision des travaux des étudiants n'ont jamais été aussi efficaces. TaskFlow est devenu un outil indispensable."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-emerald-600 py-20 text-white">
                <div className="mx-auto px-4 md:px-6 text-center container">
                    <h2 className="mb-6 font-bold text-3xl">Prêt à optimiser votre gestion de projets académiques ?</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-emerald-50">
                        Rejoignez ESMT TaskFlow dès aujourd'hui et découvrez comment notre plateforme peut transformer votre approche de la gestion de projets académiques.
                    </p>
                    <div className="flex sm:flex-row flex-col justify-center sm:space-x-4 space-y-4 sm:space-y-0">
                        <Link to="/register" className="bg-white hover:bg-emerald-50 px-6 py-3 rounded-md font-semibold text-emerald-600 transition-colors">
                            Créer un compte
                        </Link>
                        <Link to="/login" className="hover:bg-emerald-700 px-6 py-3 border border-white rounded-md font-semibold text-white transition-colors">
                            Se connecter
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 py-12 text-gray-300">
                <div className="mx-auto px-4 md:px-6 container">
                    <div className="gap-8 grid grid-cols-1 md:grid-cols-4">
                        <div>
                            <h3 className="mb-4 font-bold text-white text-lg">ESMT TaskFlow</h3>
                            <p className="mb-4 text-gray-400">
                                La plateforme de gestion de tâches collaboratives conçue pour les établissements d'enseignement supérieur.
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold text-white">Liens rapides</h4>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">Comment ça marche</a></li>
                                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">Témoignages</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold text-white">Ressources</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Centre d'aide</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutoriels</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 font-semibold text-white">Contact</h4>
                            <ul className="space-y-2">
                                <li className="text-gray-400">contact@esmt-taskflow.com</li>
                                <li className="text-gray-400">+221 77 000 00 00</li>
                                <li className="text-gray-400">ESMT, Dakar, Sénégal</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-gray-700 border-t text-gray-400 text-center">
                        <p>&copy; {new Date().getFullYear()} ESMT TaskFlow. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
    LayoutDashboard,
    ClipboardList,
    PlusCircle,
    BarChart2,
    Menu,
    X,
    LogOut,
    User,
    Calendar 
} from "lucide-react";

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    return (
        <>
            {/* Navbar pour desktop */}
            <nav className="hidden md:block bg-emerald-700 text-white">
                <div className="mx-auto px-4 container">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo et liens principaux */}
                        <div className="flex items-center space-x-6">
                            <Link to="/dashboard" className="flex items-center space-x-2 font-bold text-xl">
                                <span>ESMT TaskFlow</span>
                            </Link>

                            <div className="flex space-x-2">
                                <Link
                                    to="/dashboard"
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive('/dashboard') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                                >
                                    <LayoutDashboard className="mr-2 w-5 h-5" />
                                    <span>Dashboard</span>
                                </Link>

                                <Link
                                    to="/projets"
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive('/projets') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                                >
                                    <ClipboardList className="mr-2 w-5 h-5" />
                                    <span>Mes Projets</span>
                                </Link>

                                <Link
                                    to="/projets/nouveau"
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive('/projets/nouveau') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                                >
                                    <PlusCircle className="mr-2 w-5 h-5" />
                                    <span>Nouveau Projet</span>
                                </Link>

                                {/* lien vers le calendrier */}
                                <Link
                                    to="/calendrier"
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive('/calendrier') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                                >
                                    <Calendar className="mr-2 w-5 h-5" />
                                    <span>Calendrier</span>
                                </Link>

                                <Link
                                    to="/statistiques"
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive('/statistiques') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                                >
                                    <BarChart2 className="mr-2 w-5 h-5" />
                                    <span>Statistiques</span>
                                </Link>
                            </div>
                        </div>

                        {/* Utilisateur et déconnexion */}
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/profil"
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                ${isActive('/profil') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                            >
                                <User className="mr-2 w-4 h-4" />
                                <span>{user?.username || "Profil"}</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md font-medium text-sm"
                            >
                                <LogOut className="mr-2 w-4 h-4" />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Navbar pour mobile */}
            <nav className="md:hidden bg-emerald-700 text-white">
                <div className="mx-auto px-4 container">
                    <div className="flex justify-between items-center h-14">
                        <Link to="/dashboard" className="flex items-center space-x-2 font-bold text-lg">
                            <span>ESMT TaskFlow</span>
                        </Link>

                        <button
                            onClick={toggleMenu}
                            className="flex justify-center items-center hover:bg-emerald-600 p-2 rounded-md text-emerald-50"
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Menu mobile déroulant */}
                {isOpen && (
                    <div className="space-y-1 bg-emerald-700 shadow-lg px-2 pt-2 pb-3">
                        <Link
                            to="/dashboard"
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
              ${isActive('/dashboard') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <LayoutDashboard className="mr-2 w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>

                        <Link
                            to="/projets"
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
              ${isActive('/projets') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <ClipboardList className="mr-2 w-5 h-5" />
                            <span>Mes Projets</span>
                        </Link>

                        <Link
                            to="/projets/nouveau"
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
              ${isActive('/projets/nouveau') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <PlusCircle className="mr-2 w-5 h-5" />
                            <span>Nouveau Projet</span>
                        </Link>

                        {/*  lien vers le calendrier pour mobile */}
                        <Link
                            to="/calendrier"
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
              ${isActive('/calendrier') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <Calendar className="mr-2 w-5 h-5" />
                            <span>Calendrier</span>
                        </Link>

                        <Link
                            to="/statistiques"
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
              ${isActive('/statistiques') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <BarChart2 className="mr-2 w-5 h-5" />
                            <span>Statistiques</span>
                        </Link>

                        <Link
                            to="/profil"
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
              ${isActive('/profil') ? 'bg-emerald-800 text-white' : 'text-emerald-50 hover:bg-emerald-600'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="mr-2 w-5 h-5" />
                            <span>Profil</span>
                        </Link>

                        <div className="mt-2 pt-2 border-emerald-600 border-t">
                            <button
                                onClick={handleLogout}
                                className="flex items-center bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-md w-full font-medium text-sm"
                            >
                                <LogOut className="mr-2 w-4 h-4" />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;
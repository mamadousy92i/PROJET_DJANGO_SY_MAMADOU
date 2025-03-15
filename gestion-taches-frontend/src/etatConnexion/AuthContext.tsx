import { createContext, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Assurez-vous d'avoir cette bibliothèque installée

// Interface pour représenter un utilisateur
interface User {
    id: number;
    username: string;
    role?: string;
    // Ajoutez d'autres propriétés au besoin
}

// Interface AuthContextType mise à jour
interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null; // Ajout de la propriété user
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Décoder le token JWT pour obtenir les informations de l'utilisateur
                const decodedToken: any = jwtDecode(token);
                
                // Créer un objet user à partir des infos du token
                const userData: User = {
                    id: decodedToken.user_id,
                    username: decodedToken.username,
                    role: decodedToken.role
                };
                
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Erreur lors du décodage du token :", error);
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem("token");
                localStorage.removeItem("refresh");
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        setUser(null);
        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
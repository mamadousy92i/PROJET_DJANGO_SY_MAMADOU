import axios from "axios";

// Configuration Axios
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api", // Backend Django
    headers: { "Content-Type": "application/json" },
});

// Fonction pour extraire le rôle depuis le token JWT
export const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.role;
    }
    return null;
};

// Fonction pour extraire l'ID de l'utilisateur depuis le token JWT
export const getUserId = () => {
    const token = localStorage.getItem("token");
    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.user_id; // Vérifie que `user_id` est bien inclus dans le token
    }
    return null;
};



// Intercepteur pour ajouter le token dans les requêtes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        console.log("Envoi de requête à:", config.url);
        console.log("Token utilisé:", token ? `${token.substring(0, 15)}...` : "Aucun");
        
        if (token) {
            // IMPORTANT: Assurez-vous que ce format correspond à ce que votre backend attend
            config.headers.Authorization = `Bearer ${token}`;
            console.log("En-tête Authorization défini:", config.headers.Authorization);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Ajoutez cette fonction à votre fichier existant
import { User } from './types';

export const getStatistiques = async (): Promise<User[]> => {
  const response = await api.get('/statistiques/');
  return response.data;
};

// Intercepteur pour gérer le rafraîchissement du token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.log("🔄 Token expiré, tentative de rafraîchissement...");
            try {
                const refresh = localStorage.getItem("refresh");
                if (!refresh) throw new Error("Aucun refresh token trouvé");
                
                const response = await axios.post("http://127.0.0.1:8000/api/auth/refresh/", {
                    refresh,
                });
                
                // Sauvegarde le nouveau token
                localStorage.setItem("token", response.data.access);
                error.config.headers.Authorization = `Bearer ${response.data.access}`;
                
                // Relance la requête avec le nouveau token
                return axios(error.config);
            } catch {
                console.log("🚨 Impossible de rafraîchir le token, déconnexion...");
                localStorage.removeItem("token");
                localStorage.removeItem("refresh");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
import axios from "axios";

// Configuration Axios avec URLs conditionnelles
const baseURL = process.env.NODE_ENV === 'production' 
  ? "https://lucifer92i.pythonanywhere.com/api"  // URL de production
  : "http://127.0.0.1:8000/api";                 // URL de développement

console.log("Environment:", process.env.NODE_ENV);
console.log("API Base URL:", baseURL);

const api = axios.create({
    baseURL: baseURL,
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
        return payload.user_id; 
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
            config.headers.Authorization = `Bearer ${token}`;
            console.log("En-tête Authorization défini:", config.headers.Authorization);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getStatistiques = async () => {
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
                
                // URL de rafraîchissement conditionnelle
                const refreshURL = process.env.NODE_ENV === 'production'
                    ? "https://lucifer92i.pythonanywhere.com/api/auth/refresh/"
                    : "http://127.0.0.1:8000/api/auth/refresh/";
                
                // Utiliser axios.create pour une instance unique sans baseURL pour cette requête spécifique
                const refreshResponse = await axios.create({
                    headers: { "Content-Type": "application/json" }
                }).post(refreshURL, {
                    refresh,
                });
                
                // Sauvegarde le nouveau token
                localStorage.setItem("token", refreshResponse.data.access);
                error.config.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
                
                // Relance la requête avec le nouveau token en utilisant l'instance API
                // Mais comme error.config contient déjà l'URL complète, on utilise axios directement
                // avec la configuration mise à jour
                return axios(error.config);
            } catch (refreshError) {
                console.log("🚨 Impossible de rafraîchir le token, déconnexion...", refreshError);
                localStorage.removeItem("token");
                localStorage.removeItem("refresh");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
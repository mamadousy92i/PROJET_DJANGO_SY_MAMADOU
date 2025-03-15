import { useContext } from "react";
import { AuthContext } from "../etatConnexion/AuthContext"; // Ajustez le chemin d'importation selon votre structure

export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (context === undefined) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    
    return context;
};
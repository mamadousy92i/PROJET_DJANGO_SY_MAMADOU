import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pagesProjets/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./etatConnexion/AuthContext";
import Login from "./pagePrincipal/login";
import Register from "./pagePrincipal/register";
import ProjetsList from "./pagesProjets/ProjetsList";
import ProjetForm from "./pagesProjets/ProjetForm";
import ProjetDetails from "./pagesProjets/ProjetDetails";
import Statistiques from "./pagePrincipal/Statistiques";
import ProfilePage from "../src/pagePrincipal/ProfilePage"; // Importez la nouvelle page de profil
import Layout from "./pagePrincipal/Layout";
import HomePage from "./pagePrincipal/HomePage";
import Calendrier from "./pagePrincipal/Calendrier";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes protégées  */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/statistiques" element={<Statistiques />} />
              <Route path="/calendrier" element={<Calendrier />} />
              <Route path="/profil" element={<ProfilePage />} /> 
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/projets" element={<ProjetsList />} />
              <Route path="/projets/nouveau" element={<ProjetForm />} />
              <Route path="/projets/:id" element={<ProjetDetails />} />
              <Route path="/projets/:id/modifier" element={<ProjetForm />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
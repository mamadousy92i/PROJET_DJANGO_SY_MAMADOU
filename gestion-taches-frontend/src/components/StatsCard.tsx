import React from 'react';
import { User } from '../types';
import StatsBadge from './StatsBadge';
import CompletionRate from './CompletionRate';

interface StatsCardProps {
  user: User;
}

const StatsCard: React.FC<StatsCardProps> = ({ user }) => {
  return (
    <div className="bg-white shadow-md hover:shadow-lg p-6 border-emerald-500 border-t-4 rounded-xl transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-emerald-800 text-lg">{user.utilisateur}</h3>
        <StatsBadge badge={user.badge} />
      </div>
      
      <div className="mb-4">
        <span className="bg-emerald-100 px-2 py-1 rounded-full text-emerald-800 text-xs">{user.role}</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2 font-medium text-emerald-700 text-sm">Taux de complétion</p>
          <CompletionRate rate={user.taux_completion} />
        </div>
        
        <div className="gap-4 grid grid-cols-2 mt-4">
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="font-medium text-emerald-700 text-xs">Tâches totales</p>
            <p className="font-bold text-emerald-900 text-lg">{user.taches_totales}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="font-medium text-emerald-700 text-xs">Tâches terminées</p>
            <p className="font-bold text-emerald-900 text-lg">{user.taches_terminees}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="font-medium text-emerald-700 text-xs">3 derniers mois</p>
            <p className="font-bold text-emerald-900 text-lg">{user.taches_terminees_recent}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg">
            <p className="font-medium text-emerald-700 text-xs">Annuel</p>
            <p className="font-bold text-emerald-900 text-lg">{user.taches_terminees_annuelles}</p>
          </div>
        </div>
      </div>
      
      {user.role === "enseignant" && (
        <div className="mt-6 pt-4 border-emerald-100 border-t">
          <div className="flex justify-between items-center">
            <p className="font-medium text-emerald-700 text-sm">Prime</p>
            <p className="bg-emerald-50 px-3 py-1 rounded-lg font-bold text-emerald-600 text-lg">{user.prime}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
import React from 'react';
import { useProspection } from '../context/ProspectionContext';
import { ProspectAnalytics } from '../components/ProspectAnalytics';
import { GptCostCounter } from '../components/GptCostCounter';
import { Users, MessageCircle, UserCheck, AlertCircle } from 'lucide-react';

function Dashboard() {
  const { prospects } = useProspection();

  const stats = {
    total: prospects.length,
    contacted: prospects.filter(p => p.status === 'contacted').length,
    converted: prospects.filter(p => p.status === 'converted').length,
    pending: prospects.filter(p => p.status === 'pending').length,
  };

  const recentProspects = prospects
    .sort((a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prospects</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contactés</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.contacted}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Convertis</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.converted}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>
      
      <GptCostCounter />
      
      <ProspectAnalytics prospects={prospects} />

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Derniers prospects</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentProspects.map((prospect) => (
                  <tr key={prospect.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{prospect.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prospect.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        prospect.status === 'converted' ? 'bg-green-100 text-green-800' :
                        prospect.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {prospect.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              prospect.score >= 70 ? 'bg-green-500' :
                              prospect.score >= 40 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${prospect.score}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{prospect.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prospect.lastContact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
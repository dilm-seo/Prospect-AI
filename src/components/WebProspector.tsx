import React, { useState } from 'react';
import { useProspection } from '../context/ProspectionContext';
import { searchWebForProspects } from '../utils/webProspector';
import { Loader, Search, AlertCircle, Filter } from 'lucide-react';
import { ProspectSuggestions } from './ProspectSuggestions';
import { Prospect } from '../types/prospect';

interface WebProspectorProps {
  onClose: () => void;
}

export function WebProspector({ onClose }: WebProspectorProps) {
  const { apiKey, addProspect } = useProspection();
  const [industry, setIndustry] = useState('');
  const [position, setPosition] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [prospects, setProspects] = useState<Partial<Prospect>[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      setError('Veuillez configurer votre clé API dans les réglages');
      return;
    }

    if (!industry.trim() || !position.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuccess(null);
    setProspects([]);

    try {
      const foundProspects = await searchWebForProspects(
        industry.trim(),
        position.trim(),
        apiKey
      );

      if (!foundProspects?.length) {
        throw new Error('Aucun prospect trouvé. Essayez de modifier vos critères.');
      }

      setProspects(foundProspects);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche de prospects');
      setProspects([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddProspect = (prospect: Partial<Prospect>) => {
    if (!prospect.name || !prospect.company) {
      setError('Données de prospect invalides');
      return;
    }

    try {
      addProspect({
        ...prospect,
        email: '',
        status: 'pending',
        lastContact: new Date().toISOString().split('T')[0],
        interactions: [],
        tags: prospect.tags || [],
        score: prospect.score || 50,
        language: 'fr'
      });
      setSuccess(`${prospect.name} ajouté avec succès`);
      setError(null);

      // Remove the added prospect from the suggestions
      setProspects(prospects.filter(p => p.name !== prospect.name));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du prospect');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recherche de prospects</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Fermer</span>
            ×
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secteur d'activité
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ex: Tech, Finance, Marketing..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Poste recherché
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ex: CTO, Marketing Manager..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSearching ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Génération en cours...
                </>
              ) : (
                'Rechercher des prospects'
              )}
            </button>
          </div>
        </form>

        {prospects.length > 0 && (
          <div className="mt-6">
            <ProspectSuggestions
              suggestions={prospects}
              onAddSuggestion={handleAddProspect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
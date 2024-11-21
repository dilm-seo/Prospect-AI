import React, { useState } from 'react';
import { Loader, AlertCircle, Linkedin, Building, MapPin, Mail, Search } from 'lucide-react';
import { useProspection } from '../context/ProspectionContext';
import { Prospect } from '../types/prospect';
import { searchPeopleInCompany } from '../utils/peopleFinder';
import { findEmail } from '../utils/emailFinder';
import { verifyEmailFormat } from '../utils/emailValidator';

interface LinkedInSearchProps {
  onClose: () => void;
  initialCompany?: string;
}

export function LinkedInSearch({ onClose, initialCompany }: LinkedInSearchProps) {
  const { addProspect } = useProspection();
  const [company, setCompany] = useState(initialCompany || '');
  const [position, setPosition] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prospects, setProspects] = useState<Partial<Prospect>[]>([]);
  const [searchStatus, setSearchStatus] = useState<string>('');
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company.trim()) {
      setError('Veuillez entrer un nom d\'entreprise');
      return;
    }

    setIsSearching(true);
    setError(null);
    setProspects([]);
    setSearchStatus('Recherche des profils LinkedIn...');
    
    try {
      const initialResults = await searchPeopleInCompany(company, position);
      
      if (initialResults.length === 0) {
        setError('Aucun prospect trouvé pour cette entreprise');
        setIsSearching(false);
        return;
      }

      setSearchStatus('Vérification des emails...');
      setProgress({ current: 0, total: initialResults.length });

      const verifiedProspects = [];
      for (let i = 0; i < initialResults.length; i++) {
        const prospect = initialResults[i];
        setProgress({ current: i + 1, total: initialResults.length });

        if (prospect.name) {
          const [firstName, ...lastNames] = prospect.name.split(' ');
          const lastName = lastNames.join(' ');
          
          setSearchStatus(`Recherche de l'email pour ${prospect.name}...`);
          const email = await findEmail(firstName, lastName, company);
          
          // Vérification stricte de l'email
          if (email && await verifyEmailFormat(email)) {
            verifiedProspects.push({
              ...prospect,
              email
            });
            // Mise à jour immédiate des résultats trouvés
            setProspects([...verifiedProspects]);
          }
        }
      }

      if (verifiedProspects.length === 0) {
        setError('Aucun prospect avec email valide trouvé');
      } else {
        setSearchStatus(`${verifiedProspects.length} prospects trouvés avec emails valides`);
      }
    } catch (err) {
      console.error('LinkedIn search error:', err);
      setError('Erreur lors de la recherche des prospects');
    } finally {
      setIsSearching(false);
      setProgress(null);
    }
  };

  const handleAddProspect = (prospect: Partial<Prospect>) => {
    try {
      addProspect({
        ...prospect,
        status: 'pending',
        lastContact: new Date().toISOString().split('T')[0],
        interactions: [],
        tags: prospect.tags || [],
        language: 'fr'
      });
      
      // Retirer le prospect ajouté de la liste
      setProspects(current => current.filter(p => p !== prospect));
    } catch (err) {
      setError('Erreur lors de l\'ajout du prospect');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recherche LinkedIn</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Entreprise</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nom de l'entreprise"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Poste recherché (optionnel)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
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
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {isSearching && (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex items-center">
                <Loader className="animate-spin h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-blue-700">{searchStatus}</p>
                  {progress && (
                    <div className="mt-2">
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(progress.current / progress.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {progress.current} / {progress.total}
                      </p>
                    </div>
                  )}
                </div>
              </div>
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {isSearching ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Recherche en cours...
                </>
              ) : (
                <>
                  <Linkedin className="h-5 w-5 mr-2" />
                  Rechercher
                </>
              )}
            </button>
          </div>
        </form>

        {prospects.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {prospects.map((prospect, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-5 w-5 text-blue-500" />
                      <p className="font-medium text-gray-900">{prospect.name}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{prospect.position}</p>
                    </div>

                    {prospect.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-500">{prospect.location}</p>
                      </div>
                    )}

                    {prospect.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-green-600">{prospect.email}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddProspect(prospect)}
                    className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
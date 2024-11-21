import React, { useState, useCallback } from 'react';
import { Search, Building, Loader, AlertCircle, Globe, Users } from 'lucide-react';
import { searchCompanies } from '../utils/companySearch';
import { Company } from '../types/company';
import debounce from 'lodash.debounce';

interface CompanySearchProps {
  onClose: () => void;
  onSelect: (company: Company) => void;
}

const SECTORS = [
  { id: '62', name: 'Technologies & IT' },
  { id: '64', name: 'Finance & Assurance' },
  { id: '47', name: 'Commerce & Distribution' },
  { id: '25', name: 'Industrie & Manufacturing' },
  { id: '86', name: 'Santé & Médical' },
  { id: '85', name: 'Education & Formation' },
  { id: '70', name: 'Services aux entreprises' },
  { id: '73', name: 'Marketing & Communication' },
  { id: '41', name: 'Construction & BTP' },
  { id: '49', name: 'Transport & Logistique' }
];

export function CompanySearch({ onClose, onSelect }: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [sector, setSector] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setCompanies([]);
        if (searchQuery) {
          setError('Entrez au moins 2 caractères');
        } else {
          setError(null);
        }
        return;
      }
      
      setIsSearching(true);
      setError(null);

      try {
        const results = await searchCompanies(searchQuery, sector);
        setCompanies(results);
        
        if (results.length === 0) {
          setError('Aucune entreprise trouvée. Essayez de modifier vos critères.');
        }
      } catch (err) {
        setError('Erreur lors de la recherche. Veuillez réessayer.');
        setCompanies([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [sector]
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (!value) {
      setError(null);
      setCompanies([]);
    } else {
      debouncedSearch(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Rechercher une entreprise</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Secteur d'activité</label>
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                if (query) debouncedSearch(query);
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="">Tous les secteurs</option>
              {SECTORS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom de l'entreprise
              <span className="text-gray-500 text-xs ml-1">(min. 2 caractères)</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                className="block w-full pl-10 pr-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nom, SIREN ou mot-clé..."
              />
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
            <div className="flex justify-center py-4">
              <Loader className="animate-spin h-6 w-6 text-indigo-600" />
            </div>
          )}

          {companies.length > 0 && !isSearching && (
            <div className="space-y-4">
              {companies.map((company, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelect(company)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{company.name}</p>
                      {company.activity && (
                        <p className="text-sm text-gray-600 mt-1">{company.activity}</p>
                      )}
                      {company.address && (
                        <p className="text-sm text-gray-500 mt-1">{company.address}</p>
                      )}
                      {company.size && (
                        <p className="text-sm text-gray-500 mt-1">Effectif: {company.size}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-indigo-600" />
                      {company.siren && (
                        <a
                          href={`https://www.societe.com/societe/${company.siren}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                          onClick={e => e.stopPropagation()}
                        >
                          <Globe className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
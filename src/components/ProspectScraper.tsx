import React, { useState } from 'react';
import { useProspection } from '../context/ProspectionContext';
import { scrapeWebsite, enrichScrapedData } from '../utils/scraper';
import { Loader, Search, AlertCircle, Globe, Linkedin } from 'lucide-react';

interface ProspectScraperProps {
  onClose: () => void;
}

export function ProspectScraper({ onClose }: ProspectScraperProps) {
  const { apiKey, addProspect } = useProspection();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [linkedinApiKey, setLinkedinApiKey] = useState('');

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Veuillez configurer votre clé API dans les réglages');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPreview(null);

    try {
      // Première étape : Scraping
      const scrapedData = await scrapeWebsite(url, linkedinApiKey);
      
      // Deuxième étape : Enrichissement avec l'IA
      const enrichedData = await enrichScrapedData(scrapedData, apiKey);
      
      // Afficher un aperçu avant d'ajouter
      setPreview(enrichedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'analyse de la page');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      addProspect({
        ...preview,
        email: '', // À remplir manuellement
        status: 'pending',
        lastContact: new Date().toISOString().split('T')[0],
        interactions: [],
        tags: preview.tags || [],
        language: 'fr'
      });
      onClose();
    }
  };

  const isLinkedInUrl = url.includes('linkedin.com');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Scanner une page web</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Fermer</span>
            ×
          </button>
        </div>

        <form onSubmit={handleScrape} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              URL de la page
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLinkedInUrl ? (
                  <Linkedin className="h-5 w-5 text-blue-400" />
                ) : (
                  <Globe className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
                required
              />
            </div>
          </div>

          {isLinkedInUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Clé API LinkedIn (optionnelle)
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  value={linkedinApiKey}
                  onChange={(e) => setLinkedinApiKey(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Entrez votre clé API LinkedIn pour de meilleurs résultats"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Le scraping fonctionnera même sans clé API, mais les résultats seront limités aux données publiques.
                </p>
              </div>
            </div>
          )}

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
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Analyse en cours...
                </>
              ) : (
                'Analyser la page'
              )}
            </button>
          </div>
        </form>

        {preview && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu des données</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="mt-1">{preview.name || 'Non détecté'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Entreprise</p>
                  <p className="mt-1">{preview.company || 'Non détecté'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Poste</p>
                  <p className="mt-1">{preview.position || 'Non détecté'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Secteur</p>
                  <p className="mt-1">{preview.industry || 'Non détecté'}</p>
                </div>
              </div>

              {preview.linkedinUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                  <a
                    href={preview.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Linkedin className="h-4 w-4 mr-1" />
                    Voir le profil
                  </a>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-500">Tags</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {preview.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Analyse</p>
                <p className="mt-1 text-sm text-gray-600">{preview.notes}</p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleConfirm}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Ajouter ce prospect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Prospect } from '../types/prospect';
import { PlusCircle, X, Loader, AlertCircle } from 'lucide-react';
import { useProspection } from '../context/ProspectionContext';
import { enrichProspectData } from '../utils/prospectAI';

interface ProspectFormProps {
  onSubmit: (prospect: Omit<Prospect, 'id' | 'score'>) => void;
  onCancel: () => void;
}

const LANGUAGES = [
  { code: 'fr', name: '🇫🇷 Français' },
  { code: 'en', name: '🇬🇧 English' },
  { code: 'es', name: '🇪🇸 Español' },
  { code: 'de', name: '🇩🇪 Deutsch' },
  { code: 'it', name: '🇮🇹 Italiano' },
  { code: 'pt', name: '🇵🇹 Português' },
  { code: 'nl', name: '🇳🇱 Nederlands' },
];

export function ProspectForm({ onSubmit, onCancel }: ProspectFormProps) {
  const { apiKey } = useProspection();
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: '',
    position: '',
    notes: '',
    language: 'fr'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsEnriching(true);

    if (!formData.name || !formData.company) {
      setError('Le nom et l\'entreprise sont requis');
      setIsEnriching(false);
      return;
    }

    try {
      let enrichedData = { ...formData, tags };

      if (apiKey) {
        try {
          const aiEnrichedData = await enrichProspectData(enrichedData, apiKey);
          enrichedData = { ...enrichedData, ...aiEnrichedData };
        } catch (enrichError) {
          console.error('Enrichment error:', enrichError);
          // Continue with manual data if enrichment fails
        }
      }

      onSubmit({
        ...enrichedData,
        status: 'pending',
        lastContact: new Date().toISOString().split('T')[0],
        interactions: []
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'ajout du prospect');
    } finally {
      setIsEnriching(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Ajouter un prospect</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Entreprise</label>
            <input
              type="text"
              value={formData.company}
              onChange={e => setFormData({...formData, company: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Langue</label>
            <select
              value={formData.language}
              onChange={e => setFormData({...formData, language: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Poste</label>
            <input
              type="text"
              value={formData.position}
              onChange={e => setFormData({...formData, position: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Secteur</label>
            <input
              type="text"
              value={formData.industry}
              onChange={e => setFormData({...formData, industry: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ajouter un tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isEnriching}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isEnriching ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Analyse en cours...
              </>
            ) : (
              'Ajouter le prospect'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
import React from 'react';
import { PlusCircle, Users } from 'lucide-react';
import { Prospect } from '../types/prospect';

interface ProspectSuggestionsProps {
  suggestions: Array<Partial<Prospect>>;
  onAddSuggestion: (prospect: Partial<Prospect>) => void;
}

export function ProspectSuggestions({ suggestions, onAddSuggestion }: ProspectSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-indigo-600" />
        Prospects similaires suggérés
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                <p className="text-sm text-gray-600">{suggestion.position}</p>
                <p className="text-sm text-gray-600">{suggestion.company}</p>
              </div>
              <button
                onClick={() => onAddSuggestion(suggestion)}
                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-full"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">{suggestion.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
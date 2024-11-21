import React, { useState, useCallback, useRef } from 'react';
import { Search, Loader } from 'lucide-react';
import { useProspection } from '../context/ProspectionContext';
import { Prospect } from '../types/prospect';
import { estimateTokenCount, addUsage } from '../utils/gptCostCalculator';
import debounce from 'lodash.debounce';

interface SmartFilterProps {
  prospects: Prospect[];
  onFilteredResults: (results: Prospect[]) => void;
}

interface CacheEntry {
  query: string;
  results: string[];
  timestamp: number;
}

const CACHE_DURATION = 1000 * 60 * 60; // 1 heure
const MIN_QUERY_LENGTH = 3;

export function SmartFilter({ prospects, onFilteredResults }: SmartFilterProps) {
  const { apiKey } = useProspection();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<CacheEntry[]>([]);

  const searchCache = (query: string): string[] | null => {
    const now = Date.now();
    const cached = cacheRef.current.find(
      entry => 
        entry.query.toLowerCase() === query.toLowerCase() && 
        now - entry.timestamp < CACHE_DURATION
    );
    return cached ? cached.results : null;
  };

  const addToCache = (query: string, results: string[]) => {
    cacheRef.current = [
      { query, results, timestamp: Date.now() },
      ...cacheRef.current.slice(0, 49) // Garder max 50 entrées
    ];
  };

  const smartSearch = async (searchQuery: string) => {
    if (!apiKey || searchQuery.length < MIN_QUERY_LENGTH) {
      onFilteredResults(prospects);
      return;
    }

    const cachedResults = searchCache(searchQuery);
    if (cachedResults) {
      const filteredProspects = prospects.filter(p => 
        cachedResults.includes(p.id)
      );
      onFilteredResults(filteredProspects);
      return;
    }

    try {
      setIsLoading(true);
      
      const prompt = `Analyze this search query for finding prospects: "${searchQuery}"
      Return only a JSON array of true/false values indicating if each prospect matches.
      Consider name, company, position, industry, and notes.
      Prospects: ${prospects.map(p => ({
        name: p.name,
        company: p.company,
        position: p.position,
        industry: p.industry,
        notes: p.notes
      })).map(JSON.stringify)}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'You are a search assistant. Respond only with a JSON array of boolean values.'
          }, {
            role: 'user',
            content: prompt
          }],
          temperature: 0.3,
          max_tokens: 100
        }),
      });

      const data = await response.json();
      const matches = JSON.parse(data.choices[0].message.content);
      
      const matchedProspects = prospects.filter((_, index) => matches[index]);
      const matchedIds = matchedProspects.map(p => p.id);
      
      addToCache(searchQuery, matchedIds);
      addUsage({
        promptTokens: estimateTokenCount(prompt),
        completionTokens: estimateTokenCount(data.choices[0].message.content),
        model: 'gpt-3.5-turbo',
        timestamp: Date.now()
      });

      onFilteredResults(matchedProspects);
    } catch (error) {
      console.error('Smart search error:', error);
      // Fallback to basic search
      const filteredProspects = prospects.filter(p => 
        Object.values(p).some(val => 
          typeof val === 'string' && 
          val.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      onFilteredResults(filteredProspects);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q: string) => smartSearch(q), 500),
    [prospects]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.length < MIN_QUERY_LENGTH) {
      onFilteredResults(prospects);
      return;
    }
    
    debouncedSearch(newQuery);
  };

  return (
    <div className="relative mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Recherche intelligente (ex: 'décideurs tech intéressés par l'IA')"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      {query.length > 0 && query.length < MIN_QUERY_LENGTH && (
        <p className="mt-1 text-sm text-gray-500">
          Entrez au moins {MIN_QUERY_LENGTH} caractères pour la recherche intelligente
        </p>
      )}
    </div>
  );
}
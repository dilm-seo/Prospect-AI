import { estimateTokenCount, addUsage } from './gptCostCalculator';

export async function getSectorSuggestions(sector: string, apiKey: string): Promise<string[]> {
  if (!apiKey) {
    console.warn('API key not provided for suggestions');
    return getDefaultSuggestions(sector);
  }

  try {
    const prompt = `Suggérer 5 entreprises françaises leaders dans le secteur: ${sector}.
    Format: renvoyer uniquement un tableau JSON de noms d'entreprises, sans commentaires.
    Exemple: ["Entreprise 1", "Entreprise 2", "Entreprise 3", "Entreprise 4", "Entreprise 5"]`;

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
          content: 'Vous êtes un expert en entreprises françaises. Répondez uniquement avec un tableau JSON.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération des suggestions');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Format de réponse invalide');
    }

    let suggestions: string[];
    try {
      suggestions = JSON.parse(data.choices[0].message.content);
      if (!Array.isArray(suggestions)) {
        throw new Error('Format invalide');
      }
    } catch (e) {
      console.warn('Erreur de parsing JSON:', e);
      return getDefaultSuggestions(sector);
    }

    // Enregistrer l'utilisation de l'API
    addUsage({
      promptTokens: estimateTokenCount(prompt),
      completionTokens: estimateTokenCount(data.choices[0].message.content),
      model: 'gpt-3.5-turbo',
      timestamp: Date.now()
    });

    return suggestions;
  } catch (error) {
    console.warn('Erreur suggestions:', error);
    return getDefaultSuggestions(sector);
  }
}

function getDefaultSuggestions(sector: string): string[] {
  const suggestions = {
    tech: ['Dassault Systèmes', 'Capgemini', 'OVHcloud', 'Atos', 'Sopra Steria'],
    finance: ['BNP Paribas', 'Société Générale', 'Crédit Agricole', 'AXA', 'Natixis'],
    retail: ['Carrefour', 'LVMH', 'Auchan', 'Decathlon', 'Leroy Merlin'],
    industry: ['Airbus', 'Schneider Electric', 'Saint-Gobain', 'Michelin', 'Renault'],
    health: ['Sanofi', 'Biomérieux', 'Ipsen', 'Servier', 'Pierre Fabre'],
    education: ['OpenClassrooms', 'Simplon', 'M2i Formation', 'Cegos', 'Demos'],
    services: ['Sodexo', 'Bureau Veritas', 'Edenred', 'Teleperformance', 'Webhelp'],
    marketing: ['Publicis', 'Havas', 'TBWA France', 'Criteo', 'Webedia'],
    construction: ['Vinci', 'Bouygues', 'Eiffage', 'Spie', 'NGE'],
    transport: ['Air France-KLM', 'SNCF', 'CMA CGM', 'Geodis', 'Bolloré Logistics']
  };

  return suggestions[sector as keyof typeof suggestions] || [];
}
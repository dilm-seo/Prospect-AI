import { estimateTokenCount, addUsage } from './gptCostCalculator';

export async function getJobSuggestions(company: string, sector: string, apiKey: string): Promise<string[]> {
  if (!apiKey) {
    return getDefaultJobTitles(sector);
  }

  try {
    const prompt = `Pour l'entreprise "${company}" dans le secteur "${sector}", suggérer 5 postes clés à cibler pour la prospection B2B.
    Format: renvoyer uniquement un tableau JSON de titres de postes, sans commentaires.
    Exemple: ["Directeur Commercial", "Responsable Marketing", "DSI"]`;

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
          content: 'Vous êtes un expert en recrutement B2B. Répondez uniquement avec un tableau JSON.'
        }, {
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur API');
    }

    const data = await response.json();
    const suggestions = JSON.parse(data.choices[0].message.content);

    addUsage({
      promptTokens: estimateTokenCount(prompt),
      completionTokens: estimateTokenCount(data.choices[0].message.content),
      model: 'gpt-3.5-turbo',
      timestamp: Date.now()
    });

    return suggestions;
  } catch (error) {
    console.warn('Job suggestions error:', error);
    return getDefaultJobTitles(sector);
  }
}

function getDefaultJobTitles(sector: string): string[] {
  const titles = {
    tech: [
      'CTO',
      'Directeur Technique',
      'Lead Developer',
      'Architecte Solution',
      'DSI'
    ],
    finance: [
      'CFO',
      'Directeur Financier',
      'Risk Manager',
      'Contrôleur de Gestion',
      'Trésorier'
    ],
    marketing: [
      'CMO',
      'Directeur Marketing',
      'Brand Manager',
      'Responsable Communication',
      'Growth Manager'
    ],
    // Ajoutez d'autres secteurs selon vos besoins
    default: [
      'CEO',
      'Directeur Général',
      'Directeur Commercial',
      'Business Developer',
      'Responsable Achats'
    ]
  };

  return titles[sector as keyof typeof titles] || titles.default;
}
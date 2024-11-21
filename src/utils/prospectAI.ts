import { Prospect } from '../types/prospect';

export async function enrichProspectData(prospect: Partial<Prospect>, apiKey: string): Promise<Partial<Prospect>> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  if (!prospect.name || !prospect.company) {
    throw new Error('Name and company are required for enrichment');
  }

  try {
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
          content: 'You are an expert B2B analyst enriching prospect data. Return only valid JSON data.'
        }, {
          role: 'user',
          content: `Analyze and enrich this prospect profile:
            Name: ${prospect.name}
            Position: ${prospect.position || 'Unknown'}
            Company: ${prospect.company}
            
            Return a JSON object with:
            {
              "industry": "most likely industry",
              "tags": ["relevant", "tags", "max 5"],
              "notes": "brief analysis and engagement suggestions",
              "score": qualification score (0-100)
            }`
        }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    let enrichment;
    try {
      enrichment = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      throw new Error('Failed to parse API response');
    }

    // Validate and sanitize the enriched data
    return {
      ...prospect,
      industry: String(enrichment.industry || ''),
      tags: Array.isArray(enrichment.tags) ? enrichment.tags.map(String).slice(0, 5) : [],
      notes: String(enrichment.notes || ''),
      score: Math.min(100, Math.max(0, Number(enrichment.score) || 50))
    };
  } catch (error) {
    console.error('AI enrichment error:', error);
    throw error instanceof Error ? error : new Error('Failed to enrich prospect data');
  }
}

export async function generateProspectSuggestions(prospect: Prospect, apiKey: string): Promise<Array<Partial<Prospect>>> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  try {
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
          content: 'You are an expert B2B prospector suggesting similar prospects. Return only valid JSON data.'
        }, {
          role: 'user',
          content: `Based on this prospect:
            Name: ${prospect.name}
            Position: ${prospect.position || 'Unknown'}
            Company: ${prospect.company}
            Industry: ${prospect.industry || 'Unknown'}
            
            Generate 3 similar prospect profiles as a JSON array:
            [{
              "name": "Full Name",
              "position": "Job Title",
              "company": "Company Name",
              "industry": "Industry",
              "notes": "Brief description",
              "tags": ["tag1", "tag2"],
              "score": qualification score (0-100)
            }]`
        }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    let suggestions;
    try {
      suggestions = JSON.parse(data.choices[0].message.content);
      
      if (!Array.isArray(suggestions)) {
        throw new Error('Expected an array of suggestions');
      }

      return suggestions.map(suggestion => ({
        name: String(suggestion.name || ''),
        position: String(suggestion.position || ''),
        company: String(suggestion.company || ''),
        industry: String(suggestion.industry || ''),
        notes: String(suggestion.notes || ''),
        tags: Array.isArray(suggestion.tags) ? suggestion.tags.map(String) : [],
        score: Math.min(100, Math.max(0, Number(suggestion.score) || 50)),
        status: 'pending',
        lastContact: new Date().toISOString().split('T')[0],
        interactions: []
      }));
    } catch (parseError) {
      throw new Error('Failed to parse API response');
    }
  } catch (error) {
    console.error('AI suggestion error:', error);
    throw error instanceof Error ? error : new Error('Failed to generate prospect suggestions');
  }
}
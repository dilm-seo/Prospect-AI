import { Prospect } from '../types/prospect';

interface ProspectResponse {
  name: string;
  position: string;
  company: string;
  industry: string;
  notes: string;
  tags: string[];
  score: number;
}

export async function searchWebForProspects(
  industry: string,
  position: string,
  apiKey: string
): Promise<Partial<Prospect>[]> {
  if (!industry?.trim() || !position?.trim() || !apiKey?.trim()) {
    throw new Error('Les paramètres industrie, poste et clé API sont requis');
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
          content: `You are an expert B2B prospector. Generate realistic prospect profiles based on industry and position criteria.
            Always return a valid JSON array of exactly 5 prospects with all required fields.`
        }, {
          role: 'user',
          content: `Generate 5 realistic prospect profiles for ${industry} industry, focusing on ${position} positions.
            
            Return as JSON array with EXACTLY this structure for each prospect:
            {
              "name": "Full Name",
              "position": "Job Title",
              "company": "Company Name",
              "industry": "${industry}",
              "notes": "Brief background and context",
              "tags": ["tag1", "tag2", "tag3"],
              "score": number between 0-100
            }`
        }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(errorData.error?.message || `Erreur API: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Format de réponse API invalide');
    }

    let prospects: ProspectResponse[];
    try {
      const parsedContent = JSON.parse(data.choices[0].message.content);
      
      if (!Array.isArray(parsedContent)) {
        throw new Error('La réponse doit être un tableau de prospects');
      }

      // Validate each prospect has required fields
      prospects = parsedContent.map((prospect: any, index: number): ProspectResponse => {
        if (!prospect.name || !prospect.company) {
          throw new Error(`Prospect ${index + 1} : nom et entreprise requis`);
        }

        return {
          name: String(prospect.name),
          position: String(prospect.position || ''),
          company: String(prospect.company),
          industry: String(prospect.industry || industry),
          notes: String(prospect.notes || ''),
          tags: Array.isArray(prospect.tags) 
            ? prospect.tags.map(String).filter(Boolean).slice(0, 5)
            : [],
          score: Math.min(100, Math.max(0, Number(prospect.score) || 50))
        };
      });

      // Transform to Partial<Prospect>
      return prospects.map(prospect => ({
        ...prospect,
        status: 'pending',
        lastContact: new Date().toISOString().split('T')[0],
        interactions: [],
        email: '' // Will be filled manually
      }));
    } catch (parseError) {
      throw new Error(
        parseError instanceof Error 
          ? `Erreur de parsing: ${parseError.message}`
          : 'Erreur lors du traitement de la réponse'
      );
    }
  } catch (error) {
    // Throw a user-friendly error message
    throw new Error(
      error instanceof Error 
        ? error.message
        : 'Une erreur inattendue est survenue lors de la recherche de prospects'
    );
  }
}
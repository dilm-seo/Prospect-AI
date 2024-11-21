import * as cheerio from 'cheerio';
import { Prospect } from '../types/prospect';

// Utilise un service CORS proxy pour contourner les limitations
const CORS_PROXY = 'https://corsproxy.io/?';

interface ScrapedData {
  name?: string;
  position?: string;
  company?: string;
  location?: string;
  description?: string;
  linkedinUrl?: string;
}

async function scrapeLinkedInWithAPI(url: string, apiKey: string): Promise<ScrapedData> {
  try {
    const response = await fetch('https://api.proxycurl.com/v2/linkedin', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('Erreur API LinkedIn');
    }

    const data = await response.json();
    return {
      name: data.full_name,
      position: data.occupation,
      company: data.experiences?.[0]?.company,
      location: data.location,
      description: data.summary,
      linkedinUrl: url
    };
  } catch (error) {
    console.error('Erreur API LinkedIn:', error);
    throw new Error('Impossible de récupérer les données LinkedIn via l\'API');
  }
}

async function scrapeLinkedInPublic(url: string): Promise<ScrapedData> {
  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    if (!response.ok) throw new Error('Failed to fetch LinkedIn page');
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extraction des données publiques
    const name = $('[data-field="name"]').text().trim() ||
                $('h1.text-heading-xlarge').text().trim();
                
    const position = $('[data-field="headline"]').text().trim() ||
                    $('.text-body-medium').first().text().trim();
                    
    const company = $('h2:contains("Experience")').next().find('.pv-entity__secondary-title').first().text().trim() ||
                   $('.experience-item').first().find('.pv-entity__company-summary-info h3').text().trim();
                   
    const location = $('[data-field="location"]').text().trim() ||
                    $('.pv-top-card--list-bullet li').first().text().trim();
                    
    const description = $('[data-field="about"]').text().trim() ||
                       $('.pv-about__summary-text').text().trim();

    return {
      name,
      position,
      company,
      location,
      description,
      linkedinUrl: url
    };
  } catch (error) {
    console.error('Erreur scraping LinkedIn:', error);
    throw new Error('Impossible de récupérer les données LinkedIn publiques');
  }
}

export async function scrapeWebsite(url: string, linkedinApiKey?: string): Promise<ScrapedData> {
  try {
    // Détection si c'est une URL LinkedIn
    if (url.includes('linkedin.com')) {
      return linkedinApiKey 
        ? await scrapeLinkedInWithAPI(url, linkedinApiKey)
        : await scrapeLinkedInPublic(url);
    }

    // Scraping normal pour les autres sites
    const response = await fetch(CORS_PROXY + encodeURIComponent(url));
    if (!response.ok) throw new Error('Failed to fetch page');
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extraction générique des métadonnées
    const name = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('h1').first().text();
                
    const description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content');

    // Recherche du profil LinkedIn
    const linkedinUrl = $('a[href*="linkedin.com"]').attr('href') ||
                       $('a[href*="linkedin.com/in/"]').attr('href');

    const data: ScrapedData = {
      name: name?.trim(),
      description: description?.trim(),
      linkedinUrl: linkedinUrl?.trim()
    };

    // Recherche d'informations supplémentaires dans le contenu
    $('*').each((_, element) => {
      const text = $(element).text().trim();
      
      if (!data.position && /CEO|CTO|Director|Manager|Engineer|Developer/i.test(text)) {
        data.position = text;
      }
      
      if (!data.company && $(element).attr('itemtype') === 'http://schema.org/Organization') {
        data.company = $(element).find('[itemprop="name"]').text().trim();
      }
    });

    return data;
  } catch (error) {
    console.error('Erreur lors du scraping:', error);
    throw new Error('Impossible de récupérer les données de cette page');
  }
}

export async function enrichScrapedData(data: ScrapedData, apiKey: string): Promise<Partial<Prospect>> {
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
          content: 'Vous êtes un expert en analyse de données de prospects B2B.'
        }, {
          role: 'user',
          content: `Analysez ces données web et enrichissez-les pour un prospect:
            ${JSON.stringify(data, null, 2)}
            
            Générez une réponse JSON avec:
            - Une estimation du secteur d'activité
            - Des tags pertinents
            - Une courte analyse
            - Un score de qualification (0-100)`
        }],
      }),
    });

    const result = await response.json();
    const enrichment = JSON.parse(result.choices[0].message.content);

    return {
      ...data,
      ...enrichment,
      status: 'pending',
      lastContact: new Date().toISOString().split('T')[0],
      interactions: []
    };
  } catch (error) {
    console.error('Erreur lors de l\'enrichissement:', error);
    throw error;
  }
}
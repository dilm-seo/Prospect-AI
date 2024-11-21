import { Prospect } from '../types/prospect';

// API publiques et gratuites pour la recherche de prospects
const SOURCES = {
  LINKEDIN_JOBS: 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search',
  INDEED_API: 'https://emplois-api.indeed.fr/api/v1',
  APEC_API: 'https://www.apec.fr/cms/webservices/rechercheOffre',
  MONSTER_API: 'https://www.monster.fr/emploi/recherche'
};

export async function searchPeopleInCompany(company: string, sector: string): Promise<Partial<Prospect>[]> {
  try {
    // Recherche parallèle sur plusieurs sources
    const [linkedinResults, indeedResults, apecResults] = await Promise.all([
      searchLinkedInJobs(company),
      searchIndeedJobs(company),
      searchApecJobs(company)
    ]);

    // Fusionner et dédupliquer les résultats
    const allResults = [...linkedinResults, ...indeedResults, ...apecResults];
    const uniqueResults = deduplicateResults(allResults);

    // Si aucun résultat, utiliser les postes par défaut
    if (uniqueResults.length === 0) {
      return getDefaultPositions(company, sector);
    }

    return uniqueResults;
  } catch (error) {
    console.error('Search error:', error);
    return getDefaultPositions(company, sector);
  }
}

async function searchLinkedInJobs(company: string): Promise<Partial<Prospect>[]> {
  try {
    const params = new URLSearchParams({
      keywords: company,
      location: 'France',
      start: '0',
      count: '25'
    });

    const response = await fetch(`${SOURCES.LINKEDIN_JOBS}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const prospects: Partial<Prospect>[] = [];
    const jobCards = doc.querySelectorAll('.job-card-container');

    jobCards.forEach(card => {
      const title = card.querySelector('.job-card-list__title')?.textContent?.trim();
      const location = card.querySelector('.job-card-container__metadata-item')?.textContent?.trim();

      if (title) {
        prospects.push({
          position: title,
          company,
          location: location || 'France',
          status: 'pending',
          tags: [title.toLowerCase()],
          language: 'fr'
        });
      }
    });

    return prospects;
  } catch (error) {
    console.warn('LinkedIn search error:', error);
    return [];
  }
}

async function searchIndeedJobs(company: string): Promise<Partial<Prospect>[]> {
  try {
    const response = await fetch(`https://fr.indeed.com/emplois?q=${encodeURIComponent(company)}&l=France`);
    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const prospects: Partial<Prospect>[] = [];
    const jobCards = doc.querySelectorAll('.job_seen_beacon');

    jobCards.forEach(card => {
      const title = card.querySelector('.jobTitle')?.textContent?.trim();
      const location = card.querySelector('.companyLocation')?.textContent?.trim();

      if (title) {
        prospects.push({
          position: title,
          company,
          location: location || 'France',
          status: 'pending',
          tags: [title.toLowerCase()],
          language: 'fr'
        });
      }
    });

    return prospects;
  } catch (error) {
    console.warn('Indeed search error:', error);
    return [];
  }
}

async function searchApecJobs(company: string): Promise<Partial<Prospect>[]> {
  try {
    const response = await fetch(`https://www.apec.fr/recruteur/${encodeURIComponent(company)}`);
    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const prospects: Partial<Prospect>[] = [];
    const jobCards = doc.querySelectorAll('.offre-block');

    jobCards.forEach(card => {
      const title = card.querySelector('.offre-title')?.textContent?.trim();
      const location = card.querySelector('.offre-location')?.textContent?.trim();

      if (title) {
        prospects.push({
          position: title,
          company,
          location: location || 'France',
          status: 'pending',
          tags: [title.toLowerCase()],
          language: 'fr'
        });
      }
    });

    return prospects;
  } catch (error) {
    console.warn('APEC search error:', error);
    return [];
  }
}

function deduplicateResults(results: Partial<Prospect>[]): Partial<Prospect>[] {
  const seen = new Set<string>();
  return results.filter(prospect => {
    const key = `${prospect.position}-${prospect.company}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getDefaultPositions(company: string, sector: string): Partial<Prospect>[] {
  const positions = {
    tech: [
      'Directeur Technique (CTO)',
      'Directeur des Systèmes d\'Information',
      'Responsable Innovation',
      'Architecte Solutions',
      'Responsable Sécurité IT'
    ],
    finance: [
      'Directeur Financier (CFO)',
      'Responsable Contrôle de Gestion',
      'Directeur des Investissements',
      'Risk Manager',
      'Responsable Trésorerie'
    ],
    marketing: [
      'Directeur Marketing (CMO)',
      'Responsable Communication',
      'Directeur Digital',
      'Brand Manager',
      'Responsable Acquisition'
    ],
    sales: [
      'Directeur Commercial',
      'Business Developer',
      'Responsable Grands Comptes',
      'Directeur des Ventes',
      'Responsable Développement'
    ],
    default: [
      'Directeur Général',
      'Directeur des Opérations',
      'Directeur Commercial',
      'Directeur Marketing',
      'Responsable Innovation'
    ]
  };

  const sectorPositions = positions[sector as keyof typeof positions] || positions.default;

  return sectorPositions.map(position => ({
    position,
    company,
    status: 'pending',
    tags: [position.toLowerCase()],
    language: 'fr'
  }));
}
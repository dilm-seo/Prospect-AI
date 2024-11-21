import { Prospect } from '../types/prospect';

// URLs des API publiques
const LINKEDIN_JOBS_API = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
const LINKEDIN_COMPANY_API = 'https://www.linkedin.com/company';

export async function searchLinkedInProspects(
  company: string,
  title: string = ''
): Promise<Partial<Prospect>[]> {
  if (!company?.trim()) {
    throw new Error('Le nom de l\'entreprise est requis');
  }

  try {
    // Rechercher d'abord dans les offres d'emploi LinkedIn
    const jobResults = await searchLinkedInJobs(company, title);
    if (jobResults.length > 0) {
      return jobResults;
    }

    // Si pas de résultats, essayer via la page entreprise
    return await searchCompanyPage(company);
  } catch (error) {
    console.error('LinkedIn search error:', error);
    return [];
  }
}

async function searchLinkedInJobs(company: string, title: string): Promise<Partial<Prospect>[]> {
  const searchQuery = title ? `${title} ${company}` : company;
  const params = new URLSearchParams({
    keywords: searchQuery,
    location: 'France',
    start: '0',
    count: '25'
  });

  try {
    const response = await fetch(`${LINKEDIN_JOBS_API}?${params}`);
    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const prospects: Partial<Prospect>[] = [];
    const jobCards = doc.querySelectorAll('.job-card-container');

    jobCards.forEach(card => {
      const position = card.querySelector('.job-card-list__title')?.textContent?.trim();
      const location = card.querySelector('.job-card-container__metadata-item')?.textContent?.trim();
      const department = card.querySelector('.job-card-container__primary-description')?.textContent?.trim();

      if (position) {
        const tags = [
          position.toLowerCase(),
          department?.toLowerCase()
        ].filter(Boolean);

        prospects.push({
          position,
          company,
          location: location || 'France',
          status: 'pending',
          lastContact: new Date().toISOString().split('T')[0],
          interactions: [],
          tags,
          language: 'fr'
        });
      }
    });

    return prospects;
  } catch (error) {
    console.warn('LinkedIn jobs search error:', error);
    return [];
  }
}

async function searchCompanyPage(company: string): Promise<Partial<Prospect>[]> {
  const companySlug = company.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  try {
    const response = await fetch(`${LINKEDIN_COMPANY_API}/${companySlug}/about/`);
    if (!response.ok) return [];

    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const prospects: Partial<Prospect>[] = [];
    
    // Extraire les employés listés publiquement
    const employeeCards = doc.querySelectorAll('.org-people-profile-card');
    
    employeeCards.forEach(card => {
      const name = card.querySelector('.org-people-profile-card__profile-title')?.textContent?.trim();
      const position = card.querySelector('.org-people-profile-card__profile-position')?.textContent?.trim();
      const location = card.querySelector('.org-people-profile-card__location')?.textContent?.trim();

      if (name && position) {
        prospects.push({
          name,
          position,
          company,
          location: location || 'France',
          status: 'pending',
          lastContact: new Date().toISOString().split('T')[0],
          interactions: [],
          tags: [position.toLowerCase()],
          language: 'fr'
        });
      }
    });

    return prospects;
  } catch (error) {
    console.warn('Company page search error:', error);
    return [];
  }
}
import { Company } from '../types/company';

// API Sirene des entreprises françaises
const API_URL = 'https://api.insee.fr/entreprises/sirene/V3/siret';
const PAPPERS_API = 'https://api.pappers.fr/v2';

export async function searchCompanies(query: string, sector?: string): Promise<Company[]> {
  if (!query?.trim() || query.length < 2) {
    return [];
  }

  try {
    // Essayer d'abord l'API Pappers qui est plus fiable
    const companies = await searchPappers(query);
    if (companies.length > 0) {
      return companies;
    }

    // Fallback sur l'API entreprise.data.gouv.fr
    return await searchEntrepriseDataGouv(query, sector);
  } catch (error) {
    console.error('Company search error:', error);
    // Fallback sur l'API de base
    return searchEntrepriseDataGouv(query, sector);
  }
}

async function searchPappers(query: string): Promise<Company[]> {
  try {
    const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&per_page=20`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Pappers API error');
    }

    const data = await response.json();
    
    if (!data.results) {
      return [];
    }

    return data.results
      .filter((item: any) => 
        item?.nom_complet && 
        item?.statut_diffusion !== 'N' && 
        item?.etat_administratif === 'A'
      )
      .map((item: any) => ({
        name: item.nom_complet,
        siren: item.siren,
        address: item.siege?.geo_adresse || '',
        activity: item.libelle_activite_principale || '',
        size: getCompanySize(item.tranche_effectif_salarie_entreprise),
        website: item.site_web || ''
      }));
  } catch (error) {
    console.warn('Pappers search error:', error);
    return [];
  }
}

async function searchEntrepriseDataGouv(query: string, sector?: string): Promise<Company[]> {
  try {
    const params = new URLSearchParams({
      q: query.trim(),
      per_page: '20'
    });

    if (sector) {
      params.append('activite_principale', sector);
    }

    const response = await fetch(`https://entreprise.data.gouv.fr/api/sirene/v1/full_text/${encodeURIComponent(query)}?${params}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('API Entreprise error');
    }

    const data = await response.json();
    
    if (!data.etablissements) {
      return [];
    }

    return data.etablissements
      .filter((item: any) => item?.nom_raison_sociale)
      .map((item: any) => ({
        name: item.nom_raison_sociale,
        siren: item.siren,
        address: formatAddress(item),
        activity: item.libelle_activite_principale || '',
        size: getCompanySize(item.tranche_effectif_salarie),
        website: ''
      }));
  } catch (error) {
    console.warn('Entreprise API error:', error);
    return [];
  }
}

function formatAddress(item: any): string {
  const parts = [
    item.numero_voie,
    item.type_voie,
    item.libelle_voie,
    item.code_postal,
    item.libelle_commune
  ].filter(Boolean);
  
  return parts.join(' ');
}

function getCompanySize(tranche: string): string {
  const sizes: Record<string, string> = {
    '00': '0 salarié',
    '01': '1-2 salariés',
    '02': '3-5 salariés',
    '03': '6-9 salariés',
    '11': '10-19 salariés',
    '12': '20-49 salariés',
    '21': '50-99 salariés',
    '22': '100-199 salariés',
    '31': '200-249 salariés',
    '32': '250-499 salariés',
    '41': '500-999 salariés',
    '42': '1000-1999 salariés',
    '51': '2000-4999 salariés',
    '52': '5000-9999 salariés',
    '53': '10000+ salariés'
  };

  return sizes[tranche] || 'Non renseigné';
}
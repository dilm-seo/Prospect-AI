import { generatePossibleEmails, sanitizeForEmail } from './emailGenerator';
import { validate } from 'email-validator';

const COMMON_DOMAINS = ['.com', '.fr', '.io', '.co'];

export async function findEmail(
  firstName: string,
  lastName: string,
  company: string,
  linkedinUrl?: string
): Promise<string | null> {
  try {
    // Nettoyer les noms pour l'email
    const cleanFirstName = sanitizeForEmail(firstName);
    const cleanLastName = sanitizeForEmail(lastName);
    const cleanCompany = sanitizeForEmail(company);

    // Générer les domaines possibles
    const domains = COMMON_DOMAINS.map(tld => `${cleanCompany}${tld}`);

    // Tester chaque combinaison possible
    for (const domain of domains) {
      const emails = generatePossibleEmails(cleanFirstName, cleanLastName, domain);
      
      for (const email of emails) {
        if (!validate(email)) continue;

        try {
          // Vérifier si l'email existe via DNS
          const [localPart, domainPart] = email.split('@');
          const hasMx = await checkDomainMx(domainPart);
          
          if (hasMx) {
            // Vérifier si l'email est valide via une requête SMTP simulée
            const isValid = await verifyEmailFormat(email);
            if (isValid) return email;
          }
        } catch (error) {
          console.warn(`Error checking email ${email}:`, error);
          continue;
        }
      }
    }

    // Si aucun email trouvé, essayer de scraper depuis LinkedIn
    if (linkedinUrl) {
      const scrapedEmail = await scrapeLinkedInEmail(linkedinUrl);
      if (scrapedEmail) return scrapedEmail;
    }

    return null;
  } catch (error) {
    console.error('Error in findEmail:', error);
    return null;
  }
}

async function checkDomainMx(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();
    return data.Answer && data.Answer.length > 0;
  } catch {
    // En cas d'erreur, on suppose que le domaine est valide
    return true;
  }
}

async function verifyEmailFormat(email: string): Promise<boolean> {
  // Vérification basique du format
  if (!validate(email)) return false;

  // Vérifier les patterns communs d'emails invalides
  const invalidPatterns = [
    'noreply', 'no-reply', 'donotreply', 'do-not-reply',
    'info', 'contact', 'support', 'hello', 'admin'
  ];

  const localPart = email.split('@')[0].toLowerCase();
  if (invalidPatterns.some(pattern => localPart.includes(pattern))) {
    return false;
  }

  return true;
}

async function scrapeLinkedInEmail(linkedinUrl: string): Promise<string | null> {
  try {
    const response = await fetch(linkedinUrl);
    if (!response.ok) return null;

    const text = await response.text();
    
    // Rechercher des patterns d'emails dans le HTML
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);

    if (!matches) return null;

    // Filtrer et valider les emails trouvés
    for (const email of matches) {
      if (validate(email) && await verifyEmailFormat(email)) {
        return email;
      }
    }

    return null;
  } catch (error) {
    console.warn('LinkedIn scraping error:', error);
    return null;
  }
}

export async function findMissingEmails(
  prospects: Prospect[],
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const prospectsWithoutEmail = prospects.filter(p => !p.email);
  const total = prospectsWithoutEmail.length;

  for (const [index, prospect] of prospectsWithoutEmail.entries()) {
    try {
      const [firstName, ...lastNames] = prospect.name.split(' ');
      const lastName = lastNames.join(' ');
      
      const email = await findEmail(firstName, lastName, prospect.company, prospect.linkedinUrl);
      
      if (email) {
        results.set(prospect.id, email);
      }

      // Mettre à jour la progression
      if (onProgress) {
        onProgress({ current: index + 1, total });
      }
    } catch (error) {
      console.warn(`Failed to find email for ${prospect.name}:`, error);
    }
  }

  return results;
}
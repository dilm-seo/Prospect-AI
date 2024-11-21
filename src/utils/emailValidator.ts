import { Prospect } from '../types/prospect';
import { validate } from 'email-validator';

// Liste de services gratuits de vérification d'email
const EMAIL_VERIFICATION_APIS = [
  'https://api.email-validator.net/api/verify',
  'https://verify-email.org/api',
  'https://emailverification.whoisxmlapi.com/api/v2'
];

export async function verifyEmails(
  prospects: Prospect[],
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  const total = prospects.length;

  for (const [index, prospect] of prospects.entries()) {
    if (!prospect.email) continue;

    try {
      // Vérification basique du format
      if (!validate(prospect.email)) {
        results.set(prospect.id, false);
        continue;
      }

      // Vérification du domaine MX
      const [, domain] = prospect.email.split('@');
      const hasMx = await checkDomainMx(domain);
      
      if (!hasMx) {
        results.set(prospect.id, false);
        continue;
      }

      // Vérification avancée avec plusieurs méthodes
      const isValid = await verifyEmailFormat(prospect.email);
      results.set(prospect.id, isValid);

      // Mise à jour de la progression
      if (onProgress) {
        onProgress({ current: index + 1, total });
      }
    } catch (error) {
      console.warn(`Failed to verify email for ${prospect.email}:`, error);
      results.set(prospect.id, false);
    }
  }

  return results;
}

async function checkDomainMx(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();
    return data.Answer && data.Answer.length > 0;
  } catch {
    return false;
  }
}

export async function verifyEmailFormat(email: string): Promise<boolean> {
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

  // Vérification du domaine d'entreprise
  const [, domain] = email.split('@');
  
  try {
    // Vérification DNS
    const hasMx = await checkDomainMx(domain);
    if (!hasMx) return false;

    // Vérification supplémentaire du format
    if (localPart.length > 64 || domain.length > 255) {
      return false;
    }

    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
      return false;
    }

    // Vérification des services de catch-all
    const commonCatchAllDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'
    ];
    
    if (commonCatchAllDomains.includes(domain.toLowerCase())) {
      return true; // Ces domaines sont généralement fiables
    }

    // Test de connexion au serveur de messagerie
    return await testConnection(domain);
  } catch {
    return false;
  }
}

async function testConnection(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch {
    return false;
  }
}
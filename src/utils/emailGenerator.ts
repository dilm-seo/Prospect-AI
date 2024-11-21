const EMAIL_PATTERNS = [
  (firstName: string, lastName: string, domain: string) => `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
  (firstName: string, lastName: string, domain: string) => `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@${domain}`,
  (firstName: string, lastName: string, domain: string) => `${firstName.toLowerCase()}${lastName[0].toLowerCase()}@${domain}`,
  (firstName: string, lastName: string, domain: string) => `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${domain}`,
];

export function generatePossibleEmails(firstName: string, lastName: string, domain: string): string[] {
  return EMAIL_PATTERNS.map(pattern => pattern(firstName, lastName, domain));
}

export function sanitizeForEmail(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
    .replace(/[^a-z0-9]/gi, '') // Garde uniquement les lettres et chiffres
    .toLowerCase();
}
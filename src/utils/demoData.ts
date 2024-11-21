import { Prospect } from '../types/prospect';

const firstNames = [
  'Thomas', 'Sophie', 'Alexandre', 'Marie', 'Nicolas', 'Julie', 'Pierre', 'Claire',
  'Laurent', 'Céline', 'David', 'Anne', 'Philippe', 'Caroline', 'François', 'Isabelle'
];

const lastNames = [
  'Martin', 'Bernard', 'Dubois', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy',
  'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand'
];

const positions = {
  tech: [
    'CTO', 'Lead Developer', 'DevOps Engineer', 'Software Architect', 
    'Technical Director', 'VP Engineering', 'IT Manager', 'Head of Development'
  ],
  marketing: [
    'CMO', 'Marketing Director', 'Digital Marketing Manager', 'Brand Manager',
    'Growth Manager', 'Marketing Strategist', 'Content Manager', 'SEO Manager'
  ],
  sales: [
    'Sales Director', 'Business Development Manager', 'Account Executive',
    'VP Sales', 'Regional Sales Manager', 'Key Account Manager'
  ],
  general: [
    'CEO', 'COO', 'Managing Director', 'General Manager', 'Operations Director',
    'Country Manager', 'VP Operations', 'Department Head'
  ]
};

const generateLinkedinUrl = (firstName: string, lastName: string): string => {
  const sanitized = `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;
  const randomId = Math.floor(Math.random() * 90000) + 10000;
  return `https://linkedin.com/in/${sanitized}-${randomId}`;
};

const generateEmail = (firstName: string, lastName: string, company: string): string => {
  const sanitizedCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${sanitizedCompany}.com`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}@${sanitizedCompany}.com`,
    `${lastName.toLowerCase()}.${firstName.toLowerCase()}@${sanitizedCompany}.com`,
    `${firstName.toLowerCase()}@${sanitizedCompany}.com`
  ];
  return formats[Math.floor(Math.random() * formats.length)];
};

const getPositionCategory = (title: string): keyof typeof positions => {
  title = title.toLowerCase();
  if (title.includes('tech') || title.includes('dev') || title.includes('it')) return 'tech';
  if (title.includes('market') || title.includes('brand') || title.includes('growth')) return 'marketing';
  if (title.includes('sale') || title.includes('business') || title.includes('account')) return 'sales';
  return 'general';
};

const generateTags = (position: string, company: string): string[] => {
  const category = getPositionCategory(position);
  const baseTags = [company.toLowerCase()];
  
  switch(category) {
    case 'tech':
      return [...baseTags, 'tech', 'it', 'digital'];
    case 'marketing':
      return [...baseTags, 'marketing', 'digital', 'communication'];
    case 'sales':
      return [...baseTags, 'sales', 'business', 'commercial'];
    default:
      return [...baseTags, 'management', 'strategy'];
  }
};

const generateNotes = (position: string, company: string): string => {
  const category = getPositionCategory(position);
  const experience = Math.floor(Math.random() * 15) + 5;
  
  switch(category) {
    case 'tech':
      return `Professionnel expérimenté avec ${experience} ans d'expérience dans le secteur tech. Expert en transformation digitale et innovation technologique chez ${company}.`;
    case 'marketing':
      return `${experience} ans d'expertise en stratégie marketing et développement de marque. A piloté plusieurs campagnes majeures chez ${company}.`;
    case 'sales':
      return `Commercial confirmé avec ${experience} ans d'expérience dans le développement business. A significativement développé le portefeuille client de ${company}.`;
    default:
      return `Leader expérimenté avec ${experience} ans dans le management. A contribué à la croissance et au développement stratégique de ${company}.`;
  }
};

export const generateDemoProspects = (
  company: string,
  title: string = '',
  count: number = 5
): Partial<Prospect>[] => {
  const category = getPositionCategory(title);
  const possiblePositions = title ? [title, ...positions[category]] : positions[category];

  return Array(count).fill(null).map(() => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const position = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];

    return {
      name: `${firstName} ${lastName}`,
      position,
      company,
      email: generateEmail(firstName, lastName, company),
      linkedinUrl: generateLinkedinUrl(firstName, lastName),
      notes: generateNotes(position, company),
      tags: generateTags(position, company),
      status: 'pending',
      lastContact: new Date().toISOString().split('T')[0],
      interactions: [],
      score: Math.floor(Math.random() * 30) + 40, // Score entre 40 et 70
      language: 'fr'
    };
  });
};
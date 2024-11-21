interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

export const messageTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Introduction Personnalisée',
    content: `Je remarque que {company} fait un excellent travail dans {industry}. En tant que {position}, vous devez être intéressé par...`,
    variables: ['company', 'industry', 'position']
  },
  {
    id: '2',
    name: 'Suivi LinkedIn',
    content: `J'ai vu votre profil LinkedIn et vos réalisations chez {company} sont impressionnantes...`,
    variables: ['company']
  }
];

export const generateCustomPrompt = (prospect: Prospect, template?: MessageTemplate): string => {
  const basePrompt = `
    Contexte du prospect:
    - Nom: ${prospect.name}
    - Entreprise: ${prospect.company}
    - Poste: ${prospect.position || 'Non spécifié'}
    - Secteur: ${prospect.industry || 'Non spécifié'}
    - Historique des interactions: ${prospect.interactions.length} interactions précédentes
    - Tags: ${prospect.tags.join(', ')}

    Instructions:
    1. Créer un message personnalisé et professionnel
    2. Mentionner des éléments spécifiques de leur profil
    3. Inclure une proposition de valeur claire
    4. Terminer par une call-to-action non-agressive
  `;

  return template 
    ? `${basePrompt}\n\nUtiliser le template suivant:\n${template.content}`
    : basePrompt;
};
export const calculateProspectScore = (prospect: Prospect): number => {
  let score = 0;

  // Score based on completeness of profile
  if (prospect.name) score += 10;
  if (prospect.email) score += 10;
  if (prospect.company) score += 10;
  if (prospect.industry) score += 5;
  if (prospect.position) score += 5;
  if (prospect.linkedinUrl) score += 5;
  if (prospect.tags.length > 0) score += 5;

  // Score based on interactions
  const responseCount = prospect.interactions.filter(i => i.type === 'response').length;
  score += responseCount * 15;

  // Score based on status
  switch (prospect.status) {
    case 'converted': score += 50; break;
    case 'responded': score += 30; break;
    case 'contacted': score += 20; break;
    default: score += 0;
  }

  return Math.min(100, score);
};
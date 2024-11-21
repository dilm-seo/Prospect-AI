interface EmailStats {
  sent: number;
  opens: number;
  clicks: number;
  bounces: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

// Note: Since client.relai-smtp.com might not provide statistics API,
// we'll store stats locally
const getStoredStats = (): EmailStats => {
  const stored = localStorage.getItem('emailStats');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    sent: 0,
    opens: 0,
    clicks: 0,
    bounces: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0
  };
};

export const getEmailStats = async (): Promise<EmailStats> => {
  return getStoredStats();
};

export const updateEmailStats = (type: 'sent' | 'bounce'): void => {
  const stats = getStoredStats();
  
  if (type === 'sent') {
    stats.sent++;
  } else if (type === 'bounce') {
    stats.bounces++;
  }

  // Recalculate rates
  stats.bounceRate = stats.sent ? (stats.bounces / stats.sent) * 100 : 0;
  
  localStorage.setItem('emailStats', JSON.stringify(stats));
};
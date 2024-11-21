export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  model: string;
  timestamp: number;
}

const COST_PER_1K_TOKENS = {
  'gpt-3.5-turbo': {
    prompt: 0.0015,
    completion: 0.002
  },
  'gpt-4': {
    prompt: 0.03,
    completion: 0.06
  }
};

export function estimateTokenCount(text: string): number {
  // Estimation approximative : 1 token ≈ 4 caractères
  return Math.ceil(text.length / 4);
}

export function calculateCost(usage: TokenUsage): number {
  const model = usage.model || 'gpt-3.5-turbo';
  const rates = COST_PER_1K_TOKENS[model as keyof typeof COST_PER_1K_TOKENS];
  
  const promptCost = (usage.promptTokens / 1000) * rates.prompt;
  const completionCost = (usage.completionTokens / 1000) * rates.completion;
  
  return promptCost + completionCost;
}

export function getStoredUsage(): TokenUsage[] {
  const stored = localStorage.getItem('gptUsage');
  return stored ? JSON.parse(stored) : [];
}

export function addUsage(usage: TokenUsage): void {
  const currentUsage = getStoredUsage();
  currentUsage.push(usage);
  localStorage.setItem('gptUsage', JSON.stringify(currentUsage));
}

export function getTotalCost(): number {
  const usage = getStoredUsage();
  return usage.reduce((total, entry) => total + calculateCost(entry), 0);
}

export function getCurrentMonthCost(): number {
  const usage = getStoredUsage();
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return usage
    .filter(entry => entry.timestamp >= firstDayOfMonth.getTime())
    .reduce((total, entry) => total + calculateCost(entry), 0);
}
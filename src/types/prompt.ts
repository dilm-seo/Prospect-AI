export interface MessagePrompt {
  id: string;
  name: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
}

export const defaultPrompt: MessagePrompt = {
  id: 'default',
  name: 'Message par défaut',
  systemPrompt: 'You are a professional sales representative crafting personalized outreach messages.',
  userPrompt: `Create a personalized outreach message for {name} from {company}.
    Context:
    - Position: {position}
    - Industry: {industry}
    - Notes: {notes}
    
    Requirements:
    - Professional and engaging tone
    - Reference specific context
    - Clear value proposition
    - Soft call to action`,
  temperature: 0.7
};
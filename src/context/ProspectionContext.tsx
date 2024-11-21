import React, { createContext, useContext, useState, useEffect } from 'react';
import { estimateTokenCount, addUsage } from '../utils/gptCostCalculator';
import { Prospect } from '../types/prospect';
import { MessagePrompt, defaultPrompt } from '../types/prompt';
import { SmtpConfig } from '../types/smtp';

interface ProspectionContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  licenseKey: string;
  setLicenseKey: (key: string) => void;
  linkedinApiKey: string;
  setLinkedinApiKey: (key: string) => void;
  prospects: Prospect[];
  addProspect: (prospect: Omit<Prospect, 'id'>) => void;
  updateProspect: (id: string, updates: Partial<Prospect>) => void;
  deleteProspect: (id: string) => void;
  generateMessage: (prospect: Prospect) => Promise<string>;
  error: string | null;
  setError: (error: string | null) => void;
  prompts: MessagePrompt[];
  addPrompt: (prompt: MessagePrompt) => void;
  updatePrompt: (prompt: MessagePrompt) => void;
  deletePrompt: (id: string) => void;
  smtpConfig: SmtpConfig;
  setSmtpConfig: (config: SmtpConfig) => void;
  isLicensed: boolean;
}

const ProspectionContext = createContext<ProspectionContextType | undefined>(undefined);

export function ProspectionProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const [licenseKey, setLicenseKey] = useState(() => localStorage.getItem('licenseKey') || '');
  const [linkedinApiKey, setLinkedinApiKey] = useState(() => localStorage.getItem('linkedinApiKey') || '');
  const [prospects, setProspects] = useState<Prospect[]>(() => {
    const saved = localStorage.getItem('prospects');
    return saved ? JSON.parse(saved) : [];
  });
  const [prompts, setPrompts] = useState<MessagePrompt[]>(() => {
    const saved = localStorage.getItem('prompts');
    return saved ? JSON.parse(saved) : [defaultPrompt];
  });
  const [error, setError] = useState<string | null>(null);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(() => {
    const saved = localStorage.getItem('smtpConfig');
    return saved ? JSON.parse(saved) : {
      provider: 'relai',
      apiKey: '',
      fromEmail: '',
      fromName: ''
    };
  });

  const isLicensed = licenseKey === 'Dilm123';

  useEffect(() => {
    localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('licenseKey', licenseKey);
  }, [licenseKey]);

  useEffect(() => {
    localStorage.setItem('linkedinApiKey', linkedinApiKey);
  }, [linkedinApiKey]);

  useEffect(() => {
    localStorage.setItem('prospects', JSON.stringify(prospects));
  }, [prospects]);

  useEffect(() => {
    localStorage.setItem('prompts', JSON.stringify(prompts));
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem('smtpConfig', JSON.stringify(smtpConfig));
  }, [smtpConfig]);

  const validateApiKey = (): boolean => {
    if (!apiKey) {
      setError('Veuillez configurer votre clé API dans les réglages');
      return false;
    }
    return true;
  };

  const addProspect = (prospect: Omit<Prospect, 'id'>) => {
    try {
      const newProspect = {
        ...prospect,
        id: Date.now().toString(),
        language: prospect.language || 'fr'
      };
      setProspects(prev => [...prev, newProspect]);
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'ajout du prospect');
      console.error('Add prospect error:', err);
    }
  };

  const updateProspect = (id: string, updates: Partial<Prospect>) => {
    try {
      setProspects(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));
      setError(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour du prospect');
      console.error('Update prospect error:', err);
    }
  };

  const deleteProspect = (id: string) => {
    try {
      setProspects(prev => prev.filter(p => p.id !== id));
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression du prospect');
      console.error('Delete prospect error:', err);
    }
  };

  const addPrompt = (prompt: MessagePrompt) => {
    try {
      setPrompts(prev => [...prev, prompt]);
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'ajout du template');
      console.error('Add prompt error:', err);
    }
  };

  const updatePrompt = (updatedPrompt: MessagePrompt) => {
    try {
      setPrompts(prev => prev.map(p => 
        p.id === updatedPrompt.id ? updatedPrompt : p
      ));
      setError(null);
    } catch (err) {
      setError('Erreur lors de la mise à jour du template');
      console.error('Update prompt error:', err);
    }
  };

  const deletePrompt = (id: string) => {
    try {
      if (prompts.length <= 1) {
        setError('Impossible de supprimer le dernier template');
        return;
      }
      setPrompts(prev => prev.filter(p => p.id !== id));
      setError(null);
    } catch (err) {
      setError('Erreur lors de la suppression du template');
      console.error('Delete prompt error:', err);
    }
  };

  const generateMessage = async (prospect: Prospect): Promise<string> => {
    if (!validateApiKey()) {
      throw new Error('Clé API non configurée');
    }

    try {
      const selectedPrompt = prompts[0];
      const userPrompt = selectedPrompt.userPrompt
        .replace('{name}', prospect.name)
        .replace('{company}', prospect.company)
        .replace('{position}', prospect.position || 'Unknown')
        .replace('{industry}', prospect.industry || 'Unknown')
        .replace('{notes}', prospect.notes || 'None');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: `${selectedPrompt.systemPrompt}\nGenerate the message in ${prospect.language || 'fr'} language.`
          }, {
            role: 'user',
            content: userPrompt
          }],
          temperature: selectedPrompt.temperature,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la génération du message');
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Réponse API invalide');
      }

      const message = data.choices[0].message.content;

      addUsage({
        promptTokens: estimateTokenCount(userPrompt),
        completionTokens: estimateTokenCount(message),
        model: 'gpt-3.5-turbo',
        timestamp: Date.now()
      });

      setError(null);
      return message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du message';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return (
    <ProspectionContext.Provider value={{
      apiKey,
      setApiKey,
      licenseKey,
      setLicenseKey,
      linkedinApiKey,
      setLinkedinApiKey,
      prospects,
      addProspect,
      updateProspect,
      deleteProspect,
      generateMessage,
      error,
      setError,
      prompts,
      addPrompt,
      updatePrompt,
      deletePrompt,
      smtpConfig,
      setSmtpConfig,
      isLicensed
    }}>
      {children}
    </ProspectionContext.Provider>
  );
}

export function useProspection() {
  const context = useContext(ProspectionContext);
  if (context === undefined) {
    throw new Error('useProspection must be used within a ProspectionProvider');
  }
  return context;
}
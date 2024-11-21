import Papa from 'papaparse';
import { Prospect } from '../types/prospect';
import { validate } from 'email-validator';

export const exportToCSV = (prospects: Prospect[]): void => {
  const data = prospects.map(prospect => ({
    nom: prospect.name,
    email: prospect.email,
    entreprise: prospect.company,
    poste: prospect.position || '',
    secteur: prospect.industry || '',
    statut: prospect.status,
    linkedin: prospect.linkedinUrl || '',
    notes: prospect.notes || '',
    tags: prospect.tags.join(';'),
    score: prospect.score,
    langue: prospect.language || 'fr'
  }));

  const csv = Papa.unparse(data, {
    delimiter: ',',
    header: true,
    quotes: true
  });

  const csvContent = '\ufeff' + csv;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `prospects_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const importFromCSV = async (file: File): Promise<Partial<Prospect>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const prospects = results.data.map((row: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: row.nom || row.name || '',
            email: (row.email && validate(row.email)) ? row.email : '',
            company: row.entreprise || row.company || '',
            position: row.poste || row.position || '',
            industry: row.secteur || row.industry || '',
            status: row.statut || row.status || 'pending',
            linkedinUrl: row.linkedin || row.linkedinUrl || '',
            notes: row.notes || '',
            tags: (row.tags ? row.tags.split(';') : []).filter(Boolean),
            score: parseInt(row.score) || 50,
            language: row.langue || row.language || 'fr',
            lastContact: new Date().toISOString().split('T')[0],
            interactions: []
          }));

          resolve(prospects.filter(p => p.name && p.company));
        } catch (error) {
          reject(new Error('Format de fichier CSV invalide'));
        }
      },
      error: (error) => {
        reject(new Error(`Erreur lors de l'analyse du fichier: ${error.message}`));
      }
    });
  });
};
import React, { useState } from 'react';
import { Prospect } from '../types/prospect';
import { Send, Trash2, MessageSquare, ExternalLink, Mail, Loader, Edit2 } from 'lucide-react';
import { findEmail } from '../utils/emailFinder';
import { useProspection } from '../context/ProspectionContext';

interface ProspectCardProps {
  prospect: Prospect;
  onGenerateMessage: (prospect: Prospect) => Promise<void>;
  onDelete: (id: string) => void;
  isGenerating: boolean;
  onEdit?: (prospect: Prospect) => void;
}

export function ProspectCard({ prospect, onGenerateMessage, onDelete, isGenerating, onEdit }: ProspectCardProps) {
  const { updateProspect } = useProspection();
  const [findingEmail, setFindingEmail] = useState(false);

  const handleFindEmail = async () => {
    if (!prospect.name || !prospect.company) return;

    setFindingEmail(true);
    try {
      const [firstName, ...lastNames] = prospect.name.split(' ');
      const lastName = lastNames.join(' ');
      
      const email = await findEmail(firstName, lastName, prospect.company);
      
      if (email) {
        updateProspect(prospect.id, { email });
      }
    } catch (error) {
      console.error('Error finding email:', error);
    } finally {
      setFindingEmail(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{prospect.name}</h3>
          <p className="text-sm text-gray-500">{prospect.position} chez {prospect.company}</p>
          {prospect.email ? (
            <p className="text-sm text-gray-500 mt-1">
              <Mail className="h-4 w-4 inline mr-1" />
              {prospect.email}
            </p>
          ) : (
            <button
              onClick={handleFindEmail}
              disabled={findingEmail}
              className="text-sm text-indigo-600 hover:text-indigo-800 mt-1 flex items-center"
            >
              {findingEmail ? (
                <>
                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                  Recherche d'email...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Trouver l'email
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(prospect)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            prospect.status === 'converted' ? 'bg-green-100 text-green-800' :
            prospect.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {prospect.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {prospect.tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">{prospect.notes}</p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex space-x-2">
          <button
            onClick={() => onGenerateMessage(prospect)}
            disabled={isGenerating}
            className="p-2 text-gray-400 hover:text-indigo-600"
          >
            {isGenerating ? (
              <MessageSquare className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
          {prospect.linkedinUrl && (
            <a
              href={prospect.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-blue-600"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
          <button
            onClick={() => onDelete(prospect.id)}
            className="p-2 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        <span className="text-sm text-gray-500">
          Dernier contact: {prospect.lastContact}
        </span>
      </div>
    </div>
  );
}
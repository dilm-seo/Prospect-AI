import React, { useState } from 'react';
import { useProspection } from '../context/ProspectionContext';
import { PlusCircle, Send, Trash2, MessageSquare, Edit2, Linkedin, Search, RefreshCw, UserMinus, CheckCircle } from 'lucide-react';
import { ProspectCard } from '../components/ProspectCard';
import { LinkedInSearch } from '../components/LinkedInSearch';
import { SmartFilter } from '../components/SmartFilter';
import { MessagePreview } from '../components/MessagePreview';
import { ProspectEditor } from '../components/ProspectEditor';
import { CompanySearch } from '../components/CompanySearch';
import { findMissingEmails } from '../utils/emailFinder';
import { verifyEmails } from '../utils/emailValidator';
import { Prospect } from '../types/prospect';
import { Company } from '../types/company';

export default function Prospects() {
  const { prospects, addProspect, updateProspect, deleteProspect, generateMessage, smtpConfig } = useProspection();
  const [isSearching, setIsSearching] = useState(false);
  const [isCompanySearching, setIsCompanySearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [generatingMessage, setGeneratingMessage] = useState<string | null>(null);
  const [previewMessage, setPreviewMessage] = useState<{ prospect: Prospect; message: string } | null>(null);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [filteredProspects, setFilteredProspects] = useState<Prospect[]>(prospects);
  const [emailUpdateProgress, setEmailUpdateProgress] = useState<{ current: number; total: number } | null>(null);
  const [verificationProgress, setVerificationProgress] = useState<{ current: number; total: number } | null>(null);

  const handleGenerateMessage = async (prospect: Prospect) => {
    try {
      setGeneratingMessage(prospect.id);
      const message = await generateMessage(prospect);
      setPreviewMessage({ prospect, message });
    } catch (error) {
      console.error('Message generation error:', error);
    } finally {
      setGeneratingMessage(null);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanySearching(false);
    setIsSearching(true);
  };

  const handleUpdateEmails = async () => {
    const prospectsWithoutEmail = prospects.filter(p => !p.email);
    if (prospectsWithoutEmail.length === 0) return;

    setEmailUpdateProgress({ current: 0, total: prospectsWithoutEmail.length });
    
    try {
      const results = await findMissingEmails(prospectsWithoutEmail, setEmailUpdateProgress);
      
      results.forEach((email, id) => {
        updateProspect(id, { email });
      });
    } finally {
      setEmailUpdateProgress(null);
    }
  };

  const handleVerifyEmails = async () => {
    const prospectsWithEmail = prospects.filter(p => p.email);
    if (prospectsWithEmail.length === 0) return;

    setVerificationProgress({ current: 0, total: prospectsWithEmail.length });
    
    try {
      const results = await verifyEmails(prospectsWithEmail, setVerificationProgress);
      
      results.forEach((isValid, id) => {
        if (!isValid) {
          deleteProspect(id);
        }
      });
    } finally {
      setVerificationProgress(null);
    }
  };

  const handleRemoveEmptyEmails = () => {
    prospects
      .filter(p => !p.email)
      .forEach(p => deleteProspect(p.id));
  };

  const handleRemoveDuplicates = () => {
    const seen = new Map<string, string>();
    
    prospects.forEach(prospect => {
      if (prospect.email) {
        if (seen.has(prospect.email)) {
          deleteProspect(prospect.id);
        } else {
          seen.set(prospect.email, prospect.id);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Prospects</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCompanySearching(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Search className="h-5 w-5" />
            <span>Rechercher une entreprise</span>
          </button>
          <button
            onClick={handleUpdateEmails}
            disabled={emailUpdateProgress !== null}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${emailUpdateProgress ? 'animate-spin' : ''}`} />
            <span>Mettre à jour les emails</span>
          </button>
          <button
            onClick={handleVerifyEmails}
            disabled={verificationProgress !== null}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            <CheckCircle className="h-5 w-5" />
            <span>Vérifier les emails</span>
          </button>
          <button
            onClick={handleRemoveEmptyEmails}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <UserMinus className="h-5 w-5" />
            <span>Supprimer sans email</span>
          </button>
          <button
            onClick={handleRemoveDuplicates}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            <Trash2 className="h-5 w-5" />
            <span>Supprimer doublons</span>
          </button>
        </div>
      </div>

      {(emailUpdateProgress || verificationProgress) && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Loader className="animate-spin h-5 w-5 text-blue-500 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                {emailUpdateProgress ? 'Mise à jour des emails...' : 'Vérification des emails...'}
              </p>
              <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((emailUpdateProgress?.current || verificationProgress?.current || 0) / 
                    (emailUpdateProgress?.total || verificationProgress?.total || 1)) * 100}%` 
                  }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {emailUpdateProgress?.current || verificationProgress?.current} / 
                {emailUpdateProgress?.total || verificationProgress?.total}
              </p>
            </div>
          </div>
        </div>
      )}

      <SmartFilter 
        prospects={prospects}
        onFilteredResults={setFilteredProspects}
      />

      {isCompanySearching && (
        <CompanySearch
          onClose={() => setIsCompanySearching(false)}
          onSelect={handleCompanySelect}
        />
      )}

      {isSearching && (
        <LinkedInSearch 
          onClose={() => {
            setIsSearching(false);
            setSelectedCompany(null);
          }}
          initialCompany={selectedCompany?.name}
        />
      )}

      {previewMessage && (
        <MessagePreview
          prospect={previewMessage.prospect}
          message={previewMessage.message}
          onClose={() => setPreviewMessage(null)}
          onSend={async (updatedMessage) => {
            // Logique d'envoi du message
          }}
          smtpConfig={smtpConfig}
        />
      )}

      {editingProspect && (
        <ProspectEditor
          prospect={editingProspect}
          onSave={(updatedProspect) => {
            updateProspect(updatedProspect.id, updatedProspect);
            setEditingProspect(null);
          }}
          onClose={() => setEditingProspect(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProspects.map((prospect) => (
          <ProspectCard
            key={prospect.id}
            prospect={prospect}
            onGenerateMessage={handleGenerateMessage}
            onDelete={deleteProspect}
            isGenerating={generatingMessage === prospect.id}
            onEdit={(p) => setEditingProspect(p)}
          />
        ))}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Mail, Key, Save, CheckCircle2, ExternalLink, Mail as GmailIcon } from 'lucide-react';
import { useProspection } from '../context/ProspectionContext';
import { testSmtpConnection } from '../utils/emailSender';

export function SmtpSettings() {
  const { smtpConfig, setSmtpConfig } = useProspection();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [formData, setFormData] = useState(smtpConfig);
  const [provider, setProvider] = useState<'relai' | 'gmail' | 'outlook'>(
    formData.provider || 'relai'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpConfig({ ...formData, provider });
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await testSmtpConnection({ ...formData, provider });
      setTestResult({ success: true, message: 'Configuration SMTP validée !' });
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Erreur de connexion SMTP'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration SMTP</h2>
      
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setProvider('relai')}
          className={`px-4 py-2 rounded-md ${provider === 'relai'
            ? 'bg-indigo-100 text-indigo-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Mail className="h-4 w-4 inline-block mr-2" />
          Relai SMTP
        </button>
        <button
          onClick={() => setProvider('gmail')}
          className={`px-4 py-2 rounded-md ${provider === 'gmail'
            ? 'bg-indigo-100 text-indigo-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <GmailIcon className="h-4 w-4 inline-block mr-2" />
          Gmail
        </button>
        <button
          onClick={() => setProvider('outlook')}
          className={`px-4 py-2 rounded-md ${provider === 'outlook'
            ? 'bg-indigo-100 text-indigo-700' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Mail className="h-4 w-4 inline-block mr-2" />
          Outlook
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email d'envoi
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.fromEmail}
                onChange={e => setFormData({...formData, fromEmail: e.target.value})}
                className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={
                  provider === 'gmail' ? 'votre.email@gmail.com' :
                  provider === 'outlook' ? 'votre.email@outlook.com' :
                  'contact@votreentreprise.com'
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom d'affichage
            </label>
            <input
              type="text"
              value={formData.fromName}
              onChange={e => setFormData({...formData, fromName: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Votre Entreprise"
            />
          </div>

          {provider === 'gmail' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe d'application Gmail
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.gmailAppPassword || ''}
                  onChange={e => setFormData({...formData, gmailAppPassword: e.target.value})}
                  className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mot de passe d'application Gmail"
                />
              </div>
              <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
                <p>Créez un mot de passe d'application sur</p>
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  Google Account <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          )}

          {provider === 'outlook' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe Outlook
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.outlookPassword || ''}
                  onChange={e => setFormData({...formData, outlookPassword: e.target.value})}
                  className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mot de passe de votre compte Outlook"
                />
              </div>
              <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
                <p>Utilisez le mot de passe de votre compte Outlook</p>
              </div>
            </div>
          )}

          {provider === 'relai' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe SMTP
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={e => setFormData({...formData, apiKey: e.target.value})}
                  className="block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Mot de passe SMTP"
                />
              </div>
              <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
                <p>Configurez votre compte sur</p>
                <a
                  href="https://www.relai-smtp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  Relai SMTP <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          )}
        </div>

        {testResult && (
          <div className={`rounded-md ${testResult.success ? 'bg-green-50' : 'bg-red-50'} p-4`}>
            <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {testResult.message}
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Test en cours...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Tester la configuration
              </>
            )}
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}
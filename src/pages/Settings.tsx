import React, { useState } from 'react';
import { useProspection } from '../context/ProspectionContext';
import { Key, Save, Plus, Trash2, Edit2, Mail, Lock, ExternalLink, Linkedin } from 'lucide-react';
import { MessagePrompt } from '../types/prompt';
import { PromptEditor } from '../components/PromptEditor';
import { Tab } from '@headlessui/react';
import { CsvImportExport } from '../components/CsvImportExport';
import { SmtpSettings } from '../components/SmtpSettings';

function Settings() {
  const { 
    apiKey, 
    setApiKey, 
    licenseKey,
    setLicenseKey,
    isLicensed,
    linkedinApiKey,
    setLinkedinApiKey,
    prompts, 
    addPrompt, 
    updatePrompt, 
    deletePrompt 
  } = useProspection();
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempLicenseKey, setTempLicenseKey] = useState(licenseKey);
  const [tempLinkedinApiKey, setTempLinkedinApiKey] = useState(linkedinApiKey);
  const [saved, setSaved] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<MessagePrompt | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(tempApiKey);
    setLicenseKey(tempLicenseKey);
    setLinkedinApiKey(tempLinkedinApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEditPrompt = (prompt: MessagePrompt) => {
    setEditingPrompt(prompt);
    setShowPromptEditor(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Réglages</h1>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-8">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            Configuration API
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            Configuration SMTP
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            Templates de Messages
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-blue-700 shadow'
                : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
              }`
            }
          >
            Export/Import
          </Tab>
        </Tab.List>

        <Tab.Panels>
          <Tab.Panel>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuration</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700">
                    Clé de licence
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="licenseKey"
                      value={tempLicenseKey}
                      onChange={(e) => setTempLicenseKey(e.target.value)}
                      className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Entrez votre clé de licence"
                    />
                  </div>
                  {!isLicensed && (
                    <p className="mt-2 text-sm text-red-600">
                      Pour obtenir une clé de licence, contactez-nous sur{' '}
                      <a 
                        href="https://t.me/dilmtrading" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        Telegram
                      </a>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                    Clé API ChatGPT
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="apiKey"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="sk-..."
                    />
                  </div>
                  <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
                    <p>Obtenez votre clé API sur</p>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      OpenAI <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>

                <div>
                  <label htmlFor="linkedinApiKey" className="block text-sm font-medium text-gray-700">
                    Clé API LinkedIn (Proxycurl)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Linkedin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="linkedinApiKey"
                      value={tempLinkedinApiKey}
                      onChange={(e) => setTempLinkedinApiKey(e.target.value)}
                      className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Entrez votre clé API Proxycurl"
                    />
                  </div>
                  <div className="mt-2 flex items-center space-x-1 text-sm text-gray-500">
                    <p>Obtenez votre clé API sur</p>
                    <a
                      href="https://nubela.co/proxycurl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      Proxycurl <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  {saved && (
                    <span className="text-sm text-green-600">Paramètres sauvegardés !</span>
                  )}
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
          </Tab.Panel>

          <Tab.Panel>
            <SmtpSettings />
          </Tab.Panel>

          <Tab.Panel>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Templates de Messages</h2>
                <button
                  onClick={() => {
                    setEditingPrompt(null);
                    setShowPromptEditor(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau template
                </button>
              </div>

              <div className="space-y-4">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{prompt.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Temperature: {prompt.temperature}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPrompt(prompt)}
                          className="text-gray-400 hover:text-indigo-600"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deletePrompt(prompt.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">System Prompt:</h4>
                        <p className="text-sm text-gray-600 mt-1">{prompt.systemPrompt}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">User Prompt:</h4>
                        <p className="text-sm text-gray-600 mt-1">{prompt.userPrompt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Export/Import des données</h2>
              <CsvImportExport />
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {showPromptEditor && (
        <PromptEditor
          prompt={editingPrompt}
          onSave={(prompt) => {
            if (editingPrompt) {
              updatePrompt(prompt);
            } else {
              addPrompt(prompt);
            }
            setShowPromptEditor(false);
          }}
          onClose={() => setShowPromptEditor(false)}
        />
      )}
    </div>
  );
}

export default Settings;
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { MessagePrompt, defaultPrompt } from '../types/prompt';

interface PromptEditorProps {
  prompt?: MessagePrompt | null;
  onSave: (prompt: MessagePrompt) => void;
  onClose: () => void;
}

export function PromptEditor({ prompt, onSave, onClose }: PromptEditorProps) {
  const [formData, setFormData] = useState<MessagePrompt>(
    prompt || {
      ...defaultPrompt,
      id: Date.now().toString(),
      name: 'Nouveau template'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {prompt ? 'Modifier le template' : 'Nouveau template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom du template
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              System Prompt
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Instructions système pour définir le contexte et le ton
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              User Prompt
            </label>
            <textarea
              value={formData.userPrompt}
              onChange={(e) => setFormData({ ...formData, userPrompt: e.target.value })}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Template du message avec variables: {'{name}'}, {'{company}'}, {'{position}'}, etc.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Temperature
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              className="mt-1 block w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Plus précis (0)</span>
              <span>{formData.temperature}</span>
              <span>Plus créatif (1)</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle, Edit2, Lock } from 'lucide-react';
import { Prospect } from '../types/prospect';
import { SmtpConfig } from '../utils/emailSender';
import { useProspection } from '../context/ProspectionContext';

interface MessagePreviewProps {
  prospect: Prospect;
  message: string;
  onClose: () => void;
  onSend: (updatedMessage?: string) => Promise<void>;
  smtpConfig: SmtpConfig;
}

export function MessagePreview({ prospect, message, onClose, onSend, smtpConfig }: MessagePreviewProps) {
  const { isLicensed } = useProspection();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState(message);

  const handleSend = async () => {
    if (!isLicensed) {
      setError('Vous devez avoir une licence valide pour envoyer des emails. Contactez-nous sur Telegram: @dilmtrading');
      return;
    }

    if (!smtpConfig.apiKey || !smtpConfig.fromEmail) {
      setError('Configuration SMTP manquante. Veuillez configurer vos paramètres SMTP.');
      return;
    }

    if (!prospect.email) {
      setError('Aucune adresse email définie pour ce prospect.');
      return;
    }

    setSending(true);
    setError(null);
    
    try {
      await onSend(isEditing ? editedMessage : message);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Prévisualisation du message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={sending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <p className="text-sm text-gray-600">À: {prospect.name} ({prospect.email || 'Pas d\'email'})</p>
            <p className="text-sm text-gray-600">De: {smtpConfig.fromName} ({smtpConfig.fromEmail})</p>
          </div>

          <div className="prose max-w-none">
            {isEditing ? (
              <textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full h-64 p-4 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                disabled={sending}
              />
            ) : (
              <div className="relative group">
                <div className="whitespace-pre-wrap text-gray-800">{editedMessage}</div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-0 right-0 p-2 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                {!isLicensed && <Lock className="h-5 w-5 text-red-400 mr-2" />}
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    {error}
                    {!isLicensed && (
                      <a
                        href="https://t.me/dilmtrading"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        Obtenir une licence
                      </a>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">Message envoyé avec succès !</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedMessage(message);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={sending}
              >
                Annuler les modifications
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={sending}
            >
              Fermer
            </button>
            <button
              onClick={handleSend}
              disabled={sending || success}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
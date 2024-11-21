import React, { useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';
import { generatePossibleEmails, sanitizeForEmail } from '../utils/emailGenerator';

interface EmailGeneratorProps {
  firstName: string;
  lastName: string;
  company: string;
}

export function EmailGenerator({ firstName, lastName, company }: EmailGeneratorProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const companyDomain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  const emails = generatePossibleEmails(
    sanitizeForEmail(firstName),
    sanitizeForEmail(lastName),
    companyDomain
  );

  const copyToClipboard = async (email: string) => {
    await navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Emails possibles :</h3>
      <div className="space-y-2">
        {emails.map((email, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
          >
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm">{email}</span>
            </div>
            <button
              onClick={() => copyToClipboard(email)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {copied === email ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
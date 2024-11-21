import React from 'react';
import { MessageSquare, UserCheck, Mail, Clock } from 'lucide-react';
import { Prospect, Interaction } from '../types/prospect';

interface ProspectTimelineProps {
  prospect: Prospect;
}

export function ProspectTimeline({ prospect }: ProspectTimelineProps) {
  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'response':
        return <UserCheck className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'text-blue-500 bg-blue-100';
      case 'message':
        return 'text-green-500 bg-green-100';
      case 'response':
        return 'text-purple-500 bg-purple-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {prospect.interactions.map((interaction, idx) => (
          <li key={interaction.id}>
            <div className="relative pb-8">
              {idx !== prospect.interactions.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getInteractionColor(interaction.type)}`}>
                    {getInteractionIcon(interaction.type)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">{interaction.content}</p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {new Date(interaction.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
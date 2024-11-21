import React from 'react';
import { BarChart, PieChart, Users, TrendingUp, Calendar } from 'lucide-react';
import { Prospect } from '../types/prospect';

interface ProspectAnalyticsProps {
  prospects: Prospect[];
}

export function ProspectAnalytics({ prospects }: ProspectAnalyticsProps) {
  const getConversionRate = () => {
    const converted = prospects.filter(p => p.status === 'converted').length;
    return prospects.length ? ((converted / prospects.length) * 100).toFixed(1) : '0';
  };

  const getResponseRate = () => {
    const responded = prospects.filter(p => p.status === 'responded' || p.status === 'converted').length;
    return prospects.length ? ((responded / prospects.length) * 100).toFixed(1) : '0';
  };

  const getTopIndustries = () => {
    const industries = prospects.reduce((acc, p) => {
      if (p.industry) {
        acc[p.industry] = (acc[p.industry] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(industries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  const getWeeklyActivity = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return prospects.filter(p => 
      new Date(p.lastContact) >= oneWeekAgo
    ).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Taux de conversion</p>
              <p className="text-2xl font-semibold text-indigo-900">{getConversionRate()}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Taux de réponse</p>
              <p className="text-2xl font-semibold text-green-900">{getResponseRate()}%</p>
            </div>
            <BarChart className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Activité hebdomadaire</p>
              <p className="text-2xl font-semibold text-blue-900">{getWeeklyActivity()}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Prospects</p>
              <p className="text-2xl font-semibold text-purple-900">{prospects.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Industries</h3>
        <div className="space-y-3">
          {getTopIndustries().map(([industry, count]) => (
            <div key={industry} className="flex items-center">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">{industry}</span>
                  <span className="text-sm text-gray-500">{count} prospects</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${(count / prospects.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Mail, MousePointer, RefreshCw, AlertTriangle } from 'lucide-react';
import { useProspection } from '../context/ProspectionContext';
import { getEmailStats, type EmailStats as EmailStatsType } from '../utils/emailStats';

export function EmailStats() {
  const { smtpConfig } = useProspection();
  const [stats, setStats] = useState<EmailStatsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState(30); // 30 jours par défaut

  const loadStats = async () => {
    if (!smtpConfig.apiKey) {
      setError('Configuration SendGrid requise');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const emailStats = await getEmailStats(smtpConfig, timeframe);
      setStats(emailStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Rafraîchir toutes les 30 minutes
    const interval = setInterval(loadStats, 1800000);
    return () => clearInterval(interval);
  }, [smtpConfig.apiKey, timeframe]);

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <p className="ml-3 text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Statistiques Emails</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value={7}>7 jours</option>
            <option value={30}>30 jours</option>
            <option value={90}>90 jours</option>
          </select>
          <button
            onClick={loadStats}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Taux d'ouverture</p>
              <p className="text-2xl font-semibold text-indigo-900">
                {stats ? `${stats.openRate.toFixed(1)}%` : '-'}
              </p>
              <p className="text-sm text-indigo-600">
                {stats ? `${stats.opens} ouvertures / ${stats.sent} envois` : '-'}
              </p>
            </div>
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Taux de clic</p>
              <p className="text-2xl font-semibold text-green-900">
                {stats ? `${stats.clickRate.toFixed(1)}%` : '-'}
              </p>
              <p className="text-sm text-green-600">
                {stats ? `${stats.clicks} clics / ${stats.opens} ouvertures` : '-'}
              </p>
            </div>
            <MousePointer className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Taux de rebond</p>
              <p className="text-2xl font-semibold text-red-900">
                {stats ? `${stats.bounceRate.toFixed(1)}%` : '-'}
              </p>
              <p className="text-sm text-red-600">
                {stats ? `${stats.bounces} rebonds / ${stats.sent} envois` : '-'}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
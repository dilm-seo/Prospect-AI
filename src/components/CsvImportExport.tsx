import React, { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, Loader } from 'lucide-react';
import { exportToCSV, importFromCSV } from '../utils/csvHandler';
import { useProspection } from '../context/ProspectionContext';

export function CsvImportExport() {
  const { prospects, addProspect } = useProspection();
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const importedProspects = await importFromCSV(file);
      let importCount = 0;
      
      importedProspects.forEach(prospect => {
        if (prospect.name && prospect.company) {
          addProspect(prospect);
          importCount++;
        }
      });

      setSuccess(`${importCount} prospects importés avec succès`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    try {
      if (prospects.length === 0) {
        setError('Aucun prospect à exporter');
        return;
      }
      exportToCSV(prospects);
      setSuccess('Export réussi');
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'export');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? (
            <>
              <Loader className="animate-spin h-4 w-4 mr-2" />
              Import en cours...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Importer CSV
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          id="csv-import"
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />

        <button
          onClick={handleExport}
          disabled={prospects.length === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        <p>Format attendu du CSV : nom, email, entreprise, poste, secteur, statut, tags</p>
      </div>
    </div>
  );
}
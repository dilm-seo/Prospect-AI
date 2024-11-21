import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { getTotalCost, getCurrentMonthCost } from '../utils/gptCostCalculator';

export function GptCostCounter() {
  const [totalCost, setTotalCost] = useState(getTotalCost());
  const [monthCost, setMonthCost] = useState(getCurrentMonthCost());

  useEffect(() => {
    const updateCosts = () => {
      setTotalCost(getTotalCost());
      setMonthCost(getCurrentMonthCost());
    };

    // Mettre à jour toutes les 5 minutes
    const interval = setInterval(updateCosts, 300000);
    
    // Écouter les changements de stockage local
    window.addEventListener('storage', updateCosts);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateCosts);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <DollarSign className="h-6 w-6 text-green-600 mr-2" />
        Coûts API ChatGPT
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Coût ce mois</p>
              <p className="text-2xl font-semibold text-green-900">${monthCost.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Coût total</p>
              <p className="text-2xl font-semibold text-blue-900">${totalCost.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
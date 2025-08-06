import React, { useState, useEffect } from "react";
import { visitorService } from "../services/visitors";
import { Visitor } from "../types/visitor";
import { useAuth } from "../components/AuthProvider";

interface InBuildingTabProps {
  checkoutLoading: string | null;
}

export default function InBuildingTab({ checkoutLoading }: InBuildingTabProps) {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInBuildingVisitors();
  }, []);

  const loadInBuildingVisitors = async () => {
    try {
      setLoading(true);
      setError(null);
      const allVisitors = await visitorService.getVisitors({ filter: 'in_building' });
      setVisitors(allVisitors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar visitantes');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (visitorId: string) => {
    try {
      setError(null);
      await visitorService.checkoutVisitor({ 
        visitorId,
        currentUserId: user?.id || null,
        currentUserName: user?.name || 'Unknown'
      });
      
      // Immediately remove the visitor from the local state for instant UI feedback
      setVisitors(prevVisitors => prevVisitors.filter(v => v.id !== visitorId));
      
      // Also reload the list to ensure consistency
      await loadInBuildingVisitors();
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer checkout');
      // Reload the list in case of error to restore correct state
      await loadInBuildingVisitors();
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return "--:--";
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "--:--";
      
      return new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "--:--";
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Carregando visitantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold">Erro ao carregar visitantes</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visitantes no Prédio</h2>
          <p className="text-gray-600 mt-1">
            {visitors.length} visitante{visitors.length !== 1 ? 's' : ''} atualmente no prédio
          </p>
        </div>
        <button
          onClick={loadInBuildingVisitors}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {visitors.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum visitante no prédio</h3>
          <p className="text-gray-600">Todos os visitantes já fizeram checkout ou não há visitantes registrados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visitors.map((visitor) => (
            <div key={visitor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {visitor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{visitor.name}</h3>
                      <p className="text-sm text-gray-600">{visitor.room}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Entrada:</span>
                      <p className="text-gray-900">{formatTime(visitor.checkInTime)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Registrado por:</span>
                      <p className="text-gray-900">{visitor.registeredBy}</p>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6">
                  <button
                    onClick={() => handleCheckout(visitor.id)}
                    disabled={checkoutLoading === visitor.id}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-md"
                  >
                    {checkoutLoading === visitor.id ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saindo...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Dar Saída
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
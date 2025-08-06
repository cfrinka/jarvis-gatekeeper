import React, { useState, useEffect } from 'react';
import { loggingService, LogEntry } from '../services/logging';

const LOG_ACTION_LABELS: Record<string, string> = {
  'USER_LOGIN': 'Login de Usuário',
  'USER_LOGOUT': 'Logout de Usuário',
  'USER_REGISTRATION': 'Registro de Usuário',
  'VISITOR_REGISTERED': 'Visitante Registrado',
  'VISITOR_CHECKED_OUT': 'Visitante Saiu',
  'VISITOR_UPDATED': 'Visitante Atualizado',
  'ADMIN_ACTION': 'Ação Administrativa',
  'SYSTEM_ERROR': 'Erro do Sistema'
};

const LOG_ACTION_COLORS: Record<string, string> = {
  'USER_LOGIN': 'bg-green-100 text-green-800',
  'USER_LOGOUT': 'bg-gray-100 text-gray-800',
  'USER_REGISTRATION': 'bg-blue-100 text-blue-800',
  'VISITOR_REGISTERED': 'bg-purple-100 text-purple-800',
  'VISITOR_CHECKED_OUT': 'bg-orange-100 text-orange-800',
  'VISITOR_UPDATED': 'bg-yellow-100 text-yellow-800',
  'ADMIN_ACTION': 'bg-red-100 text-red-800',
  'SYSTEM_ERROR': 'bg-red-100 text-red-800'
};

const LOG_ACTION_ICONS: Record<string, string> = {
  'USER_LOGIN': '🔐',
  'USER_LOGOUT': '🚪',
  'USER_REGISTRATION': '👤',
  'VISITOR_REGISTERED': '📝',
  'VISITOR_CHECKED_OUT': '🚶',
  'VISITOR_UPDATED': '✏️',
  'ADMIN_ACTION': '⚙️',
  'SYSTEM_ERROR': '❌'
};

export default function LogsTab() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string | 'ALL'>('ALL');

  useEffect(() => {
    loadLogs();
  }, [filterAction]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const allLogs = await loggingService.getLogs();
      
      let filteredLogs = allLogs;
      if (filterAction !== 'ALL') {
        filteredLogs = allLogs.filter(log => log.action === filterAction);
      }
      
      setLogs(filteredLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string | Date) => {
    if (!timestamp) return "--/--/---- --:--:--";
    
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      if (isNaN(date.getTime())) return "--/--/---- --:--:--";
      
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (error) {
      return "--/--/---- --:--:--";
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Carregando logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar logs</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Logs do Sistema</h2>
        <div className="flex items-center space-x-4 text-black">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">Todas as ações</option>
            {Object.entries(LOG_ACTION_LABELS).map(([action, label]) => (
              <option key={action} value={action}>{label}</option>
            ))}
          </select>
          <button
            onClick={loadLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum log encontrado</h3>
          <p className="text-gray-600">
            {filterAction === 'ALL' ? 'Não há logs no sistema.' : `Não há logs para a ação "${LOG_ACTION_LABELS[filterAction] || filterAction}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {LOG_ACTION_ICONS[log.action] || '📋'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${LOG_ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-800'}`}>
                        {LOG_ACTION_LABELS[log.action] || log.action}
                      </span>
                      <span className="text-sm text-gray-500">
                        por {log.userName}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{log.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

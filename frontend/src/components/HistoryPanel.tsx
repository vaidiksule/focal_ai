'use client';

import { useState, useEffect } from 'react';

interface HistoryItem {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  debate_count: number;
  latest_requirement?: {
    refined_requirements: string;
    trade_offs: string;
    next_steps: string;
  };
}

export default function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/history/`);
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
      } else {
        setError(data.error || 'Failed to load history');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 text-sm font-medium">{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 font-medium">No ideas yet</p>
        <p className="text-gray-400 text-sm mt-2">Submit your first idea to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {history.map((item) => (
        <div key={item._id} className="border border-gray-100 rounded-xl p-5 hover:bg-indigo-50 transition-all duration-200">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-indigo-900 text-sm line-clamp-2">
              {item.title}
            </h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{item.debate_count} AI responses</span>
            {item.latest_requirement && (
              <span className="text-green-500 font-medium">✓ Refined</span>
            )}
          </div>
          
          {item.latest_requirement && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <details className="text-sm">
                <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium">
                  View Details
                </summary>
                <div className="mt-3 space-y-3 text-gray-600">
                  <div>
                    <strong className="text-indigo-900">Requirements:</strong>
                    <p className="mt-1 text-sm line-clamp-3">
                      {item.latest_requirement.refined_requirements}
                    </p>
                  </div>
                  <div>
                    <strong className="text-indigo-900">Trade-offs:</strong>
                    <p className="mt-1 text-sm line-clamp-2">
                      {item.latest_requirement.trade_offs}
                    </p>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
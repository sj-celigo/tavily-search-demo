'use client';

import { useState } from 'react';
import { JsonView } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Failed to perform search';
        
        // Add more context for specific error cases
        switch (response.status) {
          case 401:
            errorMessage = 'API key is invalid or not configured properly. Please check your environment variables.';
            break;
          case 429:
            errorMessage = 'Rate limit exceeded. Please try again later.';
            break;
          case 432:
            errorMessage = 'Insufficient API credits. Please check your Tavily account.';
            break;
          case 433:
            errorMessage = 'Tavily service is temporarily unavailable. Please try again later.';
            break;
        }
        
        throw new Error(errorMessage);
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Tavily Search Demo
      </h1>
      
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your search query..."
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-lg border border-red-200 text-center">
          {error}
        </div>
      )}

      {results && (
        <div className="bg-gray-50 rounded-lg p-6 overflow-auto">
          <JsonView data={results} />
        </div>
      )}
    </main>
  );
}

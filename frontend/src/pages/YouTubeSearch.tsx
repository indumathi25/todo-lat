import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { youtubeSearchSuggestions } from '../api';
import { useDebounce } from '../hooks/useDebounce';

const YouTubeSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search query with 500ms delay
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    // Only search if there's a query
    if (debouncedQuery.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await youtubeSearchSuggestions(debouncedQuery);
        setSuggestions(results);
      } catch (err) {
        setError('Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (selectedQuery: string) => {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(selectedQuery)}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">YouTube Search</h1>
            <button
              onClick={() => navigate('/todos')}
              className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-medium transition"
            >
              Back to Todos
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search YouTube..."
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleSearch(query);
                  }
                }}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              )}
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {suggestions.length > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 px-4 py-3 border-b border-gray-200">
                Suggestions
              </h2>
              <ul className="divide-y divide-gray-200">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors duration-150 flex items-center justify-between group"
                  >
                    <span className="text-gray-700 group-hover:text-blue-600">{suggestion}</span>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query.trim() && suggestions.length === 0 && !loading && !error && (
            <div className="text-center py-8 text-gray-500">No suggestions found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YouTubeSearch;

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface ResourceSearchProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  categories: string[];
  searchQuery: string;
  selectedCategory: string;
}

const ResourceSearch: React.FC<ResourceSearchProps> = ({
  onSearch,
  onCategoryFilter,
  categories,
  searchQuery,
  selectedCategory
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search is handled by parent component through searchQuery prop
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const clearFilters = () => {
    onSearch('');
    onCategoryFilter('all');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search resources..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
          />
        </div>

        {/* Filter Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
              showFilters 
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
                : 'hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Clear all filters"
            >
              <X className="h-5 w-5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                  <span>"{searchQuery}"</span>
                  <button
                    onClick={() => onSearch('')}
                    className="hover:text-indigo-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                  <span>{selectedCategory}</span>
                  <button
                    onClick={() => onCategoryFilter('all')}
                    className="hover:text-purple-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceSearch;
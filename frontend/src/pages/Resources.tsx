import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getResources, deleteResource, searchResources, Resource } from '../api/resources';
import ResourceCard from '../components/Resources/ResourceCard';
import ResourceSearch from '../components/Resources/ResourceSearch';
import ResourcePreviewModal from '../components/Resources/ResourcePreviewModal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { BookOpen, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Resources: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<{ [category: string]: Resource[] } | any[]>({});
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    // Filter resources when search query or category changes
    const filtered = searchResources(resources, searchQuery, selectedCategory);
    setFilteredResources(filtered);
  }, [resources, searchQuery, selectedCategory]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getResources();
      setResources(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch resources');
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (resourceName: string) => {
    try {
      await deleteResource(resourceName);
      toast.success('Resource deleted successfully');
      // Remove the resource from the local state
      if (Array.isArray(resources)) {
        const updatedResources = resources.map(category => ({
          ...category,
          files: category.files?.filter(file => file.name !== resourceName) || []
        }));
        setResources(updatedResources);
      } else {
        const updatedResources = { ...resources };
        Object.keys(updatedResources).forEach(category => {
          updatedResources[category] = updatedResources[category].filter(
            resource => resource.name !== resourceName
          );
        });
        setResources(updatedResources);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete resource');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePreviewResource = (resource: Resource) => {
    setPreviewResource(resource);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewResource(null);
  };

  const categories = Array.isArray(resources) 
    ? resources.map(cat => cat.category) 
    : Object.keys(resources);
  const resourceCount = filteredResources.length;
  const totalResources = Array.isArray(resources)
    ? resources.reduce((total, cat) => total + (cat.files?.length || 0), 0)
    : Object.values(resources).flat().length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Resources</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchResources}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Resource Library</h1>
          </div>
          <p className="text-gray-600">
            Discover comprehensive interview preparation resources curated by experts
          </p>
          {user?.isAdmin && (
            <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-800 text-sm">
                <span className="font-medium">Admin Mode:</span> You can delete resources by clicking the trash icon on each card.
              </p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <ResourceSearch
          onSearch={handleSearch}
          onCategoryFilter={handleCategoryFilter}
          categories={categories}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Showing {resourceCount} of {totalResources} resources
            </span>
            {selectedCategory !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {selectedCategory}
              </span>
            )}
          </div>
          {categories.length > 0 && (
            <div className="text-sm text-gray-500">
              {categories.length} categories available
            </div>
          )}
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.name}
                resource={resource}
                onDelete={user?.isAdmin ? handleDeleteResource : undefined}
                onPreview={handlePreviewResource}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search criteria or filters'
                : 'No resources are available at the moment'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Categories Overview */}
        {categories.length > 0 && filteredResources.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const categoryCount = Array.isArray(resources)
                  ? resources.find(cat => cat.category === category)?.files?.length || 0
                  : resources[category]?.length || 0;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`p-4 text-left rounded-lg border transition-colors duration-200 ${
                      selectedCategory === category
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{category}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {categoryCount} resources
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Resource Preview Modal */}
      <ResourcePreviewModal
        resource={previewResource}
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default Resources;
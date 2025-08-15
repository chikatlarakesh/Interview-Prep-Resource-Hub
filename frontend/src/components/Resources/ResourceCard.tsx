import React, { useState } from 'react';
import { Resource } from '../../api/resources';
import { FileText, File, Link as LinkIcon, Download, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../Common/ConfirmModal';

interface ResourceCardProps {
  resource: Resource;
  onDelete?: (name: string) => void;
  onPreview?: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onDelete, onPreview }) => {
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="h-6 w-6 text-blue-500" />;
      case 'link':
        return <LinkIcon className="h-6 w-6 text-green-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatResourceName = (name: string) => {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\.[^/.]+$/, '') // Remove file extension
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(resource.name);
    }
    setShowDeleteModal(false);
  };

  const handleDownload = () => {
    if (resource.type === 'link') {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    } else {
      // For files, trigger download
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(resource);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              {getResourceIcon(resource.type)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                  {formatResourceName(resource.name)}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {resource.category}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">
                    {resource.type}
                  </span>
                  {resource.size && (
                    <span className="text-xs text-gray-500">
                      {resource.size}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            {user?.isAdmin && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete resource"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {/* Preview Button */}
            <button
              onClick={handlePreview}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform group-hover:scale-[1.02]"
            >
              {resource.type === 'link' ? (
                <>
                  <LinkIcon className="h-4 w-4" />
                  <span>Open</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Resource"
        message={`Are you sure you want to delete "${formatResourceName(resource.name)}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </>
  );
};

export default ResourceCard;
import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { Resource } from '../../api/resources';
import LoadingSpinner from '../Common/LoadingSpinner';

interface ResourcePreviewModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
}

const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  resource,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && resource) {
      loadPreview();
    } else {
      setPreviewContent(null);
      setError(null);
    }
  }, [isOpen, resource]);

  const loadPreview = async () => {
    if (!resource) return;

    setLoading(true);
    setError(null);

    try {
      if (resource.type === 'link') {
        // For links, we'll show the URL and basic info
        setPreviewContent(null);
      } else if (resource.type === 'txt' || resource.type === 'md') {
        // For text and markdown files, fetch and display content
        const response = await fetch(resource.url);
        if (response.ok) {
          const text = await response.text();
          setPreviewContent(text);
        } else {
          throw new Error('Failed to load text content');
        }
      } else {
        // For other file types, we'll show file info
        setPreviewContent(null);
      }
    } catch (err) {
      setError('Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resource) return;

    const link = document.createElement('a');
    link.href = resource.url;
    link.download = resource.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExternal = () => {
    if (!resource) return;
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };

  const formatResourceName = (name: string) => {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\.[^/.]+$/, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
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

            <div className="flex items-center space-x-2">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>

              {/* Open External Button */}
              <button
                onClick={handleOpenExternal}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading preview...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-600">
                <AlertCircle className="h-6 w-6 mr-2" />
                <span>{error}</span>
              </div>
            ) : resource.type === 'link' ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-2">Link Resource</h4>
                <p className="text-gray-600 mb-4">
                  This is a link resource. Click "Open" to view it in a new tab.
                </p>
                <div className="bg-white rounded border p-3">
                  <p className="text-sm text-gray-500 mb-1">URL:</p>
                  <p className="text-sm font-mono text-blue-600 break-all">
                    {resource.url}
                  </p>
                </div>
              </div>
            ) : (resource.type === 'txt' || resource.type === 'md') && previewContent ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Text Content Preview</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-white rounded border p-4 max-h-64 overflow-y-auto">
                  {previewContent.length > 5000 
                    ? previewContent.substring(0, 5000) + '\n\n... (content truncated, download to view full file)'
                    : previewContent
                  }
                </pre>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-2">File Preview</h4>
                <p className="text-gray-600 mb-4">
                  Preview is not available for this file type ({resource.type.toUpperCase()}). 
                  You can download the file to view its contents.
                </p>
                <div className="bg-white rounded border p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">File Name:</p>
                      <p className="font-medium">{resource.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">File Type:</p>
                      <p className="font-medium uppercase">{resource.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Category:</p>
                      <p className="font-medium">{resource.category}</p>
                    </div>
                    {resource.size && (
                      <div>
                        <p className="text-gray-500 mb-1">Size:</p>
                        <p className="font-medium">{resource.size}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Click "Download" to save the file to your device, or "Open" to view it in a new tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePreviewModal;



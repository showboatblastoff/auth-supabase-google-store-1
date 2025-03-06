'use client';

import { useState, useRef } from 'react';
import { useDrive } from '@/contexts/DriveContext';

export default function DrivePage() {
  const { 
    files, 
    isLoading, 
    error, 
    isConnected, 
    connectToDrive, 
    refreshFiles, 
    uploadFile, 
    deleteFile 
  } = useDrive();
  
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConnect = () => {
    connectToDrive();
  };

  const handleRefresh = async () => {
    await refreshFiles();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    setUploadError(null);
    
    try {
      await uploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setUploadError('Failed to upload file');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await deleteFile(fileId);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold mb-4">Connect to Google Drive</h1>
        <p className="mb-6 text-center max-w-md">
          Connect your Google Drive account to access and manage your files directly from this application.
        </p>
        <button
          onClick={handleConnect}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Connect Google Drive
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Google Drive Files</h1>
          <div className="flex gap-4">
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Refresh
            </button>
            <label className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
              Upload File
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
                ref={fileInputRef}
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {uploadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {uploadError}
          </div>
        )}

        {isUploading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Uploading file...
          </div>
        )}

        {files.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No files found in your Google Drive.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div key={file.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start">
                    {file.thumbnailLink ? (
                      <img 
                        src={file.thumbnailLink} 
                        alt={file.name} 
                        className="w-12 h-12 object-cover mr-3"
                      />
                    ) : (
                      <img 
                        src={file.iconLink || '/document-icon.png'} 
                        alt={file.name} 
                        className="w-12 h-12 object-contain mr-3"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {file.mimeType}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
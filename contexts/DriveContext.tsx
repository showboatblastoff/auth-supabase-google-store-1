'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
}

interface DriveContextType {
  files: DriveFile[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  connectToDrive: () => void;
  refreshFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<DriveFile | null>;
  deleteFile: (fileId: string) => Promise<boolean>;
}

const DriveContext = createContext<DriveContextType>({} as DriveContextType);

export function DriveProvider({ children }: { children: ReactNode }) {
  const { supabase, user } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Wrap fetchFiles in useCallback to avoid infinite rerender loops
  const fetchFiles = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/drive/files');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to fetch files from Google Drive');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Check if the user has connected their Google Drive
  useEffect(() => {
    if (!user) {
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_drive_tokens')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Supabase error checking Google Drive connection:', error.message);
          throw new Error(`Database error: ${error.message}`);
        }
        
        // Check if we have any tokens
        const hasTokens = Array.isArray(data) && data.length > 0;
        setIsConnected(hasTokens);
        
        if (hasTokens) {
          await fetchFiles();
        }
      } catch (err) {
        console.error('Error checking Google Drive connection:', 
          err instanceof Error ? err.message : 'Unknown error');
        
        if (err instanceof Error && err.stack) {
          console.error('Error stack:', err.stack);
        }
        
        setError('Failed to check Google Drive connection. Please try again later.');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [user, supabase, fetchFiles]);

  // Connect to Google Drive
  const connectToDrive = () => {
    window.location.href = '/api/auth/google';
  };

  // Refresh files
  const refreshFiles = async () => {
    await fetchFiles();
  };

  // Upload a file to Google Drive
  const uploadFile = async (file: File): Promise<DriveFile | null> => {
    if (!user || !isConnected) {
      throw new Error('Not connected to Google Drive');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/drive/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Refresh the file list
      await fetchFiles();
      
      return data;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file to Google Drive');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a file from Google Drive
  const deleteFile = async (fileId: string) => {
    if (!user || !isConnected) {
      throw new Error('Not connected to Google Drive');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/drive/delete?fileId=${fileId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
      
      // Refresh the file list
      await fetchFiles();
      
      return true;
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file from Google Drive');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    files,
    isLoading,
    error,
    isConnected,
    connectToDrive,
    refreshFiles,
    uploadFile,
    deleteFile,
  };

  return (
    <DriveContext.Provider value={value}>
      {children}
    </DriveContext.Provider>
  );
}

export const useDrive = () => useContext(DriveContext); 
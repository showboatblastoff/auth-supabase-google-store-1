import { google } from 'googleapis';

// Create a new OAuth2 client with the configured keys
export const createOAuth2Client = (tokens?: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
  );

  if (tokens) {
    oauth2Client.setCredentials(tokens);
  }

  return oauth2Client;
};

// Generate the URL for the consent page
export const getAuthUrl = () => {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // This will return a refresh token
    scope: [
      'https://www.googleapis.com/auth/drive.file', // Access to files created or opened by the app
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    prompt: 'consent', // Force to show the consent screen
  });
};

// Exchange the code for tokens
export const getTokens = async (code: string) => {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Create a Google Drive client
export const createDriveClient = (tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}) => {
  const oauth2Client = createOAuth2Client(tokens);
  return google.drive({ version: 'v3', auth: oauth2Client });
};

// List files from Google Drive
export const listFiles = async (tokens: {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}, pageSize = 10) => {
  if (!tokens.access_token) {
    throw new Error('Missing access token for Google Drive');
  }
  
  // Validate that environment variables are set
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing Google API credentials in environment variables');
  }
  
  const drive = createDriveClient(tokens);
  
  try {
    console.log('Calling Google Drive API to list files');
    const response = await drive.files.list({
      pageSize,
      fields: 'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, thumbnailLink)',
    });
    
    if (!response.data) {
      throw new Error('Empty response from Google Drive API');
    }
    
    console.log(`Successfully retrieved ${response.data.files?.length || 0} files from Google Drive`);
    return response.data.files || [];
  } catch (error) {
    console.error('Error listing files from Google Drive API:');
    
    if (error instanceof Error) {
      console.error(`- Message: ${error.message}`);
      console.error(`- Stack: ${error.stack}`);
      
      // Handle Google API-specific errors
      // Using interface instead of 'any' for better type safety
      interface GoogleApiError extends Error {
        code?: number;
        errors?: { message: string; domain: string; reason: string }[];
      }
      
      const googleError = error as GoogleApiError;
      if (googleError.code) {
        console.error(`- Code: ${googleError.code}`);
      }
      if (googleError.errors) {
        console.error('- Details:', JSON.stringify(googleError.errors));
      }
    } else {
      console.error('- Unknown error type:', error);
    }
    
    throw error;
  }
};

// Upload a file to Google Drive
export const uploadFile = async (
  tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  },
  file: {
    name: string;
    mimeType: string;
    content: Buffer | string;
  }
) => {
  const drive = createDriveClient(tokens);
  
  try {
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.mimeType,
      },
      media: {
        mimeType: file.mimeType,
        body: file.content,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Download a file from Google Drive
export const downloadFile = async (
  tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  },
  fileId: string
) => {
  const drive = createDriveClient(tokens);
  
  try {
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    }, { responseType: 'arraybuffer' });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Delete a file from Google Drive
export const deleteFile = async (
  tokens: {
    access_token: string;
    refresh_token?: string;
    expiry_date?: number;
  },
  fileId: string
) => {
  const drive = createDriveClient(tokens);
  
  try {
    await drive.files.delete({
      fileId,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 
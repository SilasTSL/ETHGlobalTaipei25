import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();

const port = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${port}/auth`;

interface AuthResponse {
  message: string;
  ensName: string | null;
  address: string | null;
}

interface SessionResponse {
  ensName: string;
}

interface ExistsResponse {
  exists: boolean;
}

/**
 * Register a new user with seedphrase and ENS name
 */
const registerUser = async (
  seedphrase: string,
  ensName: string
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/register`, {
      seedphrase,
      ensName,
    });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw new Error('Failed to register user');
  }
};

/**
 * Login user with seedphrase
 */
const loginUser = async (
  seedphrase: string
): Promise<AuthResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      seedphrase,
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw new Error('Failed to login');
  }
};

/**x
 * Check if user exists by seedphrase
 */
const checkUserExists = async (
  seedphrase: string
): Promise<ExistsResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/exists`, {
      seedphrase,
    });
    return response.data;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw new Error('Failed to check user existence');
  }
};

/**
 * Get current user session information
 */
const getUserSession = async (): Promise<SessionResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/session`, {
      withCredentials: true
    });
    console.log('session response', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting user session:', error);
    throw new Error('Failed to get user session');
  }
};

export {
  registerUser,
  loginUser,
  checkUserExists,
  getUserSession,
};

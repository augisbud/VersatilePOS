import { client } from '@/api/client.gen';

export const setAuthToken = (token: string | undefined) => {
  client.setConfig({
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
};

export const initializeApiClient = () => {
  try {
    const serializedState = localStorage.getItem('userState');

    if (serializedState) {
      const userState = JSON.parse(serializedState) as {
        token?: string;
      };

      if (userState.token) {
        setAuthToken(userState.token);
      }
    }
  } catch (err) {
    console.error('Failed to initialize API client:', err);
  }
};

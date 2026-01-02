import { QueryClient, QueryFunction } from '@tanstack/react-query';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get authentication data from localStorage (matching persistent auth system)
  const passengerInfo = localStorage.getItem('passengerInfo');
  const driverInfo = localStorage.getItem('driverInfo');

  // Create headers object
  const headers: Record<string, string> = {};

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  // Add authentication headers with context detection
  const currentPath = window.location.pathname;
  const isDriverContext =
    currentPath.includes('/driver') || currentPath.includes('/drivers');

  if (isDriverContext && driverInfo) {
    // Driver context - prioritize driver authentication
    try {
      const driver = JSON.parse(driverInfo);
      if (driver.phone) {
        headers['x-session-phone'] = driver.phone;
        headers['x-session-driver-id'] = driver.id;
      }
    } catch (e) {
      console.warn('Failed to parse driverInfo from localStorage');
    }
  } else if (!isDriverContext && passengerInfo) {
    // Passenger context - prioritize passenger authentication
    try {
      const passenger = JSON.parse(passengerInfo);
      if (passenger.phone) {
        headers['x-session-phone'] = passenger.phone;
        headers['x-session-passenger-id'] = passenger.id;
      }
    } catch (e) {
      console.warn('Failed to parse passengerInfo from localStorage');
    }
  } else {
    // Fallback to legacy behavior
    if (passengerInfo) {
      try {
        const passenger = JSON.parse(passengerInfo);
        if (passenger.phone) {
          headers['x-session-phone'] = passenger.phone;
          headers['x-session-passenger-id'] = passenger.id;
        }
      } catch (e) {
        console.warn('Failed to parse passengerInfo from localStorage');
      }
    } else if (driverInfo) {
      try {
        const driver = JSON.parse(driverInfo);
        if (driver.phone) {
          headers['x-session-phone'] = driver.phone;
          headers['x-session-driver-id'] = driver.id;
        }
      } catch (e) {
        console.warn('Failed to parse driverInfo from localStorage');
      }
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get authentication data from localStorage (matching persistent auth system)
    const passengerInfo = localStorage.getItem('passengerInfo');
    const driverInfo = localStorage.getItem('driverInfo');

    // Create headers object
    const headers: Record<string, string> = {};

    // Add authentication headers with context detection
    const currentPath = window.location.pathname;
    const isDriverContext =
      currentPath.includes('/driver') || currentPath.includes('/drivers');

    if (isDriverContext && driverInfo) {
      // Driver context - prioritize driver authentication
      try {
        const driver = JSON.parse(driverInfo);
        if (driver.phone) {
          headers['x-session-phone'] = driver.phone;
          headers['x-session-driver-id'] = driver.id;
        }
      } catch (e) {
        console.warn('Failed to parse driverInfo from localStorage');
      }
    } else if (!isDriverContext && passengerInfo) {
      // Passenger context - prioritize passenger authentication
      try {
        const passenger = JSON.parse(passengerInfo);
        if (passenger.phone) {
          headers['x-session-phone'] = passenger.phone;
          headers['x-session-passenger-id'] = passenger.id;
        }
      } catch (e) {
        console.warn('Failed to parse passengerInfo from localStorage');
      }
    } else {
      // Fallback to legacy behavior
      if (passengerInfo) {
        try {
          const passenger = JSON.parse(passengerInfo);
          if (passenger.phone) {
            headers['x-session-phone'] = passenger.phone;
            headers['x-session-passenger-id'] = passenger.id;
          }
        } catch (e) {
          console.warn('Failed to parse passengerInfo from localStorage');
        }
      } else if (driverInfo) {
        try {
          const driver = JSON.parse(driverInfo);
          if (driver.phone) {
            headers['x-session-phone'] = driver.phone;
            headers['x-session-driver-id'] = driver.id;
          }
        } catch (e) {
          console.warn('Failed to parse driverInfo from localStorage');
        }
      }
    }

    const res = await fetch(queryKey.join('/') as string, {
      headers,
      credentials: 'include',
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false, // Disable automatic polling by default
      refetchOnWindowFocus: false,
      staleTime: 30000, // Cache data for 30 seconds
      gcTime: 60000, // Keep unused data for 1 minute
      retry: 1, // Only retry failed requests once
      refetchIntervalInBackground: false, // Don't poll when tab is not active
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

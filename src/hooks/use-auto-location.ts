import { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../helper/queryClient';
import {
  DriverWebSocket,
  PassengerWebSocket,
} from '../websocket/websocket-manager';

interface LocationHookOptions {
  userId?: string;
  driverId?: string;
  userType: 'passenger' | 'driver';
  autoStart?: boolean;
  isManualPickupActive?: boolean;
}

interface LocationState {
  isSharing: boolean;
  currentLocation: { lat: number; lng: number } | null;
  error: string | null;
  accuracy: number | null;
}

// Global GPS state to persist across pages for drivers
let globalDriverGPS = {
  isActive: false,
  watchId: null as number | null,
  currentLocation: null as { lat: number; lng: number } | null,
  driverId: null as string | null,
  listeners: new Set<(state: LocationState) => void>(),
};

export function useAutoLocation(options: LocationHookOptions) {
  const {
    userId,
    driverId,
    userType,
    autoStart = true,
    isManualPickupActive = false,
  } = options;
  //   const { toast } = useToast();

  // Get current user ID for WebSocket connection
  const currentUserId = userType === 'driver' ? driverId : userId;

  // WebSocket connections are handled by global providers (DriverWebSocketProvider/PassengerWebSocketProvider)
  // No need to force connections here - just use existing connections for GPS sharing

  // FIX: Prevent duplicate GPS updates to avoid flickering
  const lastGPSSendRef = useRef({ lat: 0, lng: 0, timestamp: 0 });

  // IMPROVED: More reliable WebSocket GPS sending with duplicate prevention
  const sendGPSToWebSocket = (latitude: number, longitude: number) => {
    const now = Date.now();
    const lastSend = lastGPSSendRef.current;

    // Prevent duplicate GPS sends within 2 seconds
    const timeDiff = now - lastSend.timestamp;
    const distanceDiff = Math.sqrt(
      Math.pow(latitude - lastSend.lat, 2) +
        Math.pow(longitude - lastSend.lng, 2),
    );

    // Skip if same location and less than 2 seconds ago
    if (timeDiff < 2000 && distanceDiff < 0.0001) {
      console.log(
        '🚫 [GPS FIX] Skipping duplicate GPS update to prevent flickering',
      );
      return;
    }

    // Update last send reference
    lastGPSSendRef.current = { lat: latitude, lng: longitude, timestamp: now };

    if (userType === 'driver' && currentUserId) {
      const success = DriverWebSocket.sendGPS(latitude, longitude);
      if (!success) {
        console.log('📡 [WEBSOCKET] Driver GPS send failed, reconnecting...');
        DriverWebSocket.connect(currentUserId);
        // Retry sending GPS with exponential backoff
        setTimeout(() => {
          const retrySuccess = DriverWebSocket.sendGPS(latitude, longitude);
          if (!retrySuccess) {
            console.warn(
              '📡 [WEBSOCKET] Driver GPS retry failed, will try again on next update',
            );
          }
        }, 2000); // Increased to 2s to reduce spam
      }
    } else if (userType === 'passenger' && currentUserId) {
      const success = PassengerWebSocket.sendGPS(latitude, longitude);
      if (!success) {
        console.log(
          '📡 [WEBSOCKET] Passenger GPS send failed, reconnecting...',
        );
        PassengerWebSocket.connect(currentUserId);
        // Retry sending GPS with exponential backoff
        setTimeout(() => {
          const retrySuccess = PassengerWebSocket.sendGPS(latitude, longitude);
          if (!retrySuccess) {
            console.warn(
              '📡 [WEBSOCKET] Passenger GPS retry failed, will try again on next update',
            );
          }
        }, 2000); // Increased to 2s to reduce spam
      }
    }
  };

  // Send manual pickup coordinates to WebSocket
  const sendManualPickupToWebSocket = (lat: number, lng: number) => {
    if (userType === 'passenger' && currentUserId) {
      const success = PassengerWebSocket.sendGPS(lat, lng);
      if (success) {
        console.log('🟢 Sent manual pickup to WebSocket:', lat, lng);
      } else {
        console.log('❌ Failed to send manual pickup to WebSocket');
      }
    }
  };

  // For drivers, use global state; for passengers, use local state
  const [locationState, setLocationState] = useState<LocationState>({
    isSharing: userType === 'driver' ? globalDriverGPS.isActive : false,
    currentLocation:
      userType === 'driver' ? globalDriverGPS.currentLocation : null,
    error: null,
    accuracy: null,
  });

  // CRITICAL: Force GPS restart for drivers after server restart
  useEffect(() => {
    if (userType !== 'driver' || !currentUserId || !autoStart) {
      return;
    }

    // Reset global
    globalDriverGPS.isActive = false;
    globalDriverGPS.watchId = null;
    globalDriverGPS.currentLocation = null;

    // Enable sharing in DB
    apiRequest('PATCH', `/api/drivers/${currentUserId}`, {
      isGPSSharing: true,
      isAvailable: true,
    }).catch(console.error);

    // Start GPS safely (no hooks inside)
    const timeout = setTimeout(() => {
      startLocationSharing(); // must NOT contain hooks
    }, 1000);

    return () => clearTimeout(timeout);
  }, [userType, currentUserId, autoStart]);

  // Subscribe to global GPS state changes for drivers
  useEffect(() => {
    if (userType === 'driver') {
      const listener = (state: LocationState) => {
        setLocationState(state);
      };

      globalDriverGPS.listeners.add(listener);

      // If GPS is already active globally, sync immediately
      if (globalDriverGPS.isActive && globalDriverGPS.currentLocation) {
        setLocationState({
          isSharing: true,
          currentLocation: globalDriverGPS.currentLocation,
          error: null,
          accuracy: null,
        });
      }

      return () => {
        globalDriverGPS.listeners.delete(listener);
      };
    }
  }, [userType]);

  const watchIdRef = useRef<number | null>(
    userType === 'driver' ? globalDriverGPS.watchId : null,
  );
  const isComponentMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const useHighAccuracyRef = useRef(userType === 'driver'); // Start with high accuracy for drivers

  // Update location to server
  // Debounce GPS updates to prevent excessive server calls
  const lastUpdateRef = useRef({ lat: 0, lng: 0, timestamp: 0 });
  const lastDisplayUpdateRef = useRef({ lat: 0, lng: 0, timestamp: 0 });

  // Update display coordinates immediately (for real-time display)
  const updateDisplayCoordinates = (lat: number, lng: number) => {
    const newState = {
      isSharing: locationState.isSharing,
      currentLocation: { lat, lng },
      error: null,
      accuracy: null,
    };

    setLocationState(newState);
    updateDriverGlobalState(newState);

    // Send GPS data via WebSocket for real-time updates
    sendGPSToWebSocket(lat, lng);
  };

  const updateLocationToServer = async (lat: number, lng: number) => {
    try {
      const id = userType === 'driver' ? driverId : userId;
      if (!id) return;

      // Always update display coordinates immediately for real-time UI
      updateDisplayCoordinates(lat, lng);

      // FIX: Reduced GPS update frequency to prevent flickering
      // For drivers: Update every 15 seconds or 50m movement to prevent rapid updates
      // For passengers: Update every 20 seconds or 100m movement
      const distanceFromLast = lastUpdateRef.current.lat
        ? Math.sqrt(
            Math.pow((lat - lastUpdateRef.current.lat) * 111000, 2) +
              Math.pow((lng - lastUpdateRef.current.lng) * 111000, 2),
          )
        : 1000; // Distance in meters, default to 1000 if no previous location
      const timeSinceLastUpdate = Date.now() - lastUpdateRef.current.timestamp;

      // For drivers: Send heartbeat every 20 seconds for stable tracking (increased from 15s)
      const isDriverHeartbeat =
        userType === 'driver' && timeSinceLastUpdate >= 20000;

      // FIX: Increased minimum time between updates to prevent flickering
      const minDistance = userType === 'driver' ? 50 : 100; // 50m for drivers, 100m for passengers (increased)
      const minTime = userType === 'driver' ? 15000 : 20000; // 15s for drivers (increased from 5s), 20s for passengers

      if (
        distanceFromLast < minDistance &&
        timeSinceLastUpdate < minTime &&
        !isDriverHeartbeat
      ) {
        // Reduce console spam by only logging occasionally
        if (timeSinceLastUpdate > 5000) {
          console.log(
            `📍 ${userType} GPS debounced: ${distanceFromLast.toFixed(
              1,
            )}m in ${(timeSinceLastUpdate / 1000).toFixed(1)}s`,
          );
        }
        return; // Skip server update but UI is already updated
      }

      lastUpdateRef.current = { lat, lng, timestamp: Date.now() };

      // For passengers, check if it's a temp user (skip database update for temp users)
      if (userType === 'passenger' && id.startsWith('temp-passenger-')) {
        console.log(
          `📍 ${userType} ${id} location updated locally (temp user - no DB update): ${lat.toFixed(
            6,
          )}, ${lng.toFixed(6)}`,
        );
        return; // Skip database update for temp passengers, just use GPS locally
      }

      const endpoint =
        userType === 'driver'
          ? `/api/drivers/${id}/location`
          : `/api/users/${id}`;

      await apiRequest('PATCH', endpoint, {
        latitude: lat,
        longitude: lng,
        isLocationSharing: true,
      });

      // For drivers, also send heartbeat to maintain connection
      if (userType === 'driver') {
        try {
          await apiRequest('POST', `/api/drivers/${id}/heartbeat`, {
            latitude: lat,
            longitude: lng,
          });
          // Reduce heartbeat logging spam - only log occasionally
          if (Date.now() % 30000 < 5000) {
            // Log ~once per 30 seconds
            console.log(
              `💓 Driver ${id} heartbeat sent: ${lat.toFixed(6)}, ${lng.toFixed(
                6,
              )}`,
            );
          }
        } catch (heartbeatError) {
          console.warn(`⚠️ Driver ${id} heartbeat failed:`, heartbeatError);
        }
      }

      // Log location update (reduce spam - only log significant updates)
      if (distanceFromLast >= 50 || timeSinceLastUpdate >= 30000) {
        // Log moves >50m or every 30s
        console.log(
          `📍 ${userType} ${id} location updated: ${lat.toFixed(
            6,
          )}, ${lng.toFixed(6)} (moved ${distanceFromLast.toFixed(1)}m)`,
        );
      }

      // For drivers, the location endpoint automatically sets availability to true
      // (No need to log this frequently)
    } catch (error) {
      console.error(`Failed to update ${userType} location:`, error);
    }
  };

  // Update global state for drivers
  const updateDriverGlobalState = (state: Partial<LocationState>) => {
    if (userType === 'driver') {
      if (state.isSharing !== undefined)
        globalDriverGPS.isActive = state.isSharing;
      if (state.currentLocation !== undefined)
        globalDriverGPS.currentLocation = state.currentLocation;
      if (driverId) globalDriverGPS.driverId = driverId;

      // Notify all listeners
      globalDriverGPS.listeners.forEach(listener => {
        listener({ ...locationState, ...state });
      });
    }
  };

  // Start location sharing
  const startLocationSharing = () => {
    // Skip GPS if manual pickup is active (for passengers only)
    if (userType === 'passenger' && isManualPickupActive) {
      console.log('🚫 Skipping GPS start - manual pickup is active');
      return;
    }

    // Reset GPS settings for fresh start
    retryCountRef.current = 0;
    useHighAccuracyRef.current = userType === 'driver';

    // For drivers, check if GPS is already active globally
    if (
      userType === 'driver' &&
      globalDriverGPS.isActive &&
      globalDriverGPS.watchId
    ) {
      console.log('📍 GPS already active globally - reusing existing session');
      setLocationState(prev => ({
        ...prev,
        isSharing: true,
        currentLocation: globalDriverGPS.currentLocation,
        error: null,
      }));
      // Update refs to match global state
      watchIdRef.current = globalDriverGPS.watchId;
      return;
    }

    if (!navigator.geolocation) {
      const error = 'GPS not supported by this browser';
      setLocationState(prev => ({ ...prev, error, isSharing: false }));
      updateDriverGlobalState({ isSharing: false });
      //   toast({
      //     title: "GPS Not Supported",
      //     description: error,
      //     variant: "destructive",
      //   });
      return;
    }

    const newState = { isSharing: true, error: null };
    setLocationState(prev => ({ ...prev, ...newState }));
    updateDriverGlobalState(newState);

    // Use real browser GPS - no development mode coordinates

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;

        if (!isComponentMountedRef.current) return;

        // Reset retry counter on successful GPS lock
        retryCountRef.current = 0;

        const newState = {
          currentLocation: { lat: latitude, lng: longitude },
          accuracy,
          error: null,
        };

        setLocationState(prev => ({ ...prev, ...newState }));
        updateDriverGlobalState(newState);

        updateLocationToServer(latitude, longitude);

        // Send real-time GPS via WebSocket
        sendGPSToWebSocket(latitude, longitude);

        // Automatic GPS sharing - no toast notification needed since it's mandatory
        console.log(
          `📍 Auto GPS sharing enabled for ${userType} - accuracy: ${accuracy?.toFixed(
            0,
          )}m`,
        );
      },
      async error => {
        if (!isComponentMountedRef.current) return;

        console.error(
          'Initial geolocation error:',
          error.message || 'GPS Permission Issue',
          error,
        );

        let errorMessage = 'Please enable GPS to share location';
        switch (error.code) {
          case 1:
            errorMessage =
              "🔒 Please allow location access in browser settings. Click the location icon in the address bar and select 'Allow'.";
            break;
          case 2:
            errorMessage =
              '📡 GPS unavailable. Check device location settings and try again.';
            break;
          case 3:
            errorMessage = '⏱️ GPS timeout. Checking signal...';
            break;
          default:
            errorMessage =
              '🔧 GPS permission needed. Please enable location access in browser.';
        }

        setLocationState(prev => ({
          ...prev,
          error: errorMessage,
          isSharing: false,
          // 🔑 FIX: Keep currentLocation to avoid map reload
          currentLocation: prev.currentLocation,
        }));

        // Show error toast for GPS issues - but don't make it too alarming for timeouts
        if (error.code === 3) {
          retryCountRef.current += 1;
          if (retryCountRef.current <= maxRetries) {
            // For drivers, try fallback to lower accuracy after first timeout
            if (
              userType === 'driver' &&
              retryCountRef.current === 2 &&
              useHighAccuracyRef.current
            ) {
              useHighAccuracyRef.current = false;
              console.log(
                `🔄 Switching to lower accuracy GPS for better reliability (attempt ${retryCountRef.current})`,
              );
            }

            const retryDelay = Math.min(2000 * retryCountRef.current, 8000); // 2s, 4s, 6s max (faster)
            console.log(
              `GPS timeout - retry ${retryCountRef.current}/${maxRetries} in ${
                retryDelay / 1000
              }s`,
            );

            setTimeout(() => {
              if (
                isComponentMountedRef.current &&
                !locationState.currentLocation
              ) {
                console.log(
                  `🔄 Retrying GPS after timeout (attempt ${retryCountRef.current})...`,
                );
                startLocationSharing();
              }
            }, retryDelay);
          } else {
            console.log(
              `❌ GPS failed after ${maxRetries} attempts - stopping retries`,
            );
            setLocationState(prev => ({
              ...prev,
              error: 'GPS unavailable after multiple attempts',
              isSharing: false,
              // 🔑 FIX: Keep currentLocation to avoid map reload
              currentLocation: prev.currentLocation,
            }));
          }
        } else {
          // For GPS permission issues, provide more helpful guidance
          const isPermissionIssue = error.code === 1;
          //   toast({
          //     title: isPermissionIssue ? "Location Permission Required" : "GPS Issue",
          //     description: errorMessage,
          //     variant: "destructive",
          //     duration: isPermissionIssue ? 8000 : 5000, // Longer duration for permission issues
          //   });
        }

        // If this is a driver and GPS fails, automatically set them as unavailable
        if (userType === 'driver' && driverId) {
          try {
            await apiRequest('PATCH', `/api/drivers/${driverId}`, {
              isAvailable: false,
            });
            console.log(
              '🔴 Driver automatically set offline due to GPS failure',
            );

            // 🔑 FIX: Don't delete location immediately to avoid map reload
            // Only delete location when really necessary
            console.log(
              '✅ Driver set offline but location preserved to prevent map reload',
            );
          } catch (error) {
            console.error('Failed to set driver offline:', error);
          }
        }
      },
      {
        enableHighAccuracy: useHighAccuracyRef.current, // Dynamic accuracy based on attempts
        timeout: userType === 'driver' ? 30000 : 20000, // Drivers: 30s, Passengers: 20s (faster for real-time)
        maximumAge: userType === 'driver' ? 5000 : 10000, // Drivers: 5s, Passengers: 10s cache for real-time updates
      },
    );

    // Start continuous tracking
    const watchId = navigator.geolocation.watchPosition(
      position => {
        if (!isComponentMountedRef.current) return;

        // Skip GPS updates if manual pickup is active (for passengers only)
        if (userType === 'passenger' && isManualPickupActive) {
          console.log('🚫 Skipping GPS update - manual pickup is active');
          return;
        }

        const { latitude, longitude, accuracy } = position.coords;

        // Reset retry counter on successful tracking update
        retryCountRef.current = 0;

        // Update location directly - this calls updateDisplayCoordinates internally which updates UI immediately
        updateLocationToServer(latitude, longitude);

        // Send real-time GPS via WebSocket for continuous tracking
        sendGPSToWebSocket(latitude, longitude);
      },
      async error => {
        if (!isComponentMountedRef.current) return;

        console.warn('⚠️ GPS tracking error (will retry):', error.code);

        // IMPROVED: More resilient GPS error handling
        // Only set driver offline for critical errors, not timeouts or temporary issues
        if (error.code !== 3 && userType === 'driver' && driverId) {
          // For drivers, try to maintain availability even with GPS issues
          // Only set offline after multiple consecutive failures
          const errorState = {
            error: 'GPS tracking issue - retrying...',
            isSharing: false,
            // 🔑 FIX: Keep currentLocation to prevent map reload
          };

          setLocationState(prev => ({
            ...prev,
            ...errorState,
            // 🔑 FIX: Keep currentLocation to avoid map reload
            currentLocation: prev.currentLocation,
          }));
          updateDriverGlobalState({
            ...errorState,
            // 🔑 FIX: Keep currentLocation to avoid map reload
            currentLocation: globalDriverGPS.currentLocation,
          });

          // Don't immediately set driver offline - let heartbeat timeout handle it
          // This prevents location from disappearing due to temporary GPS issues
          console.log(
            '⚠️ Driver GPS error - maintaining location to prevent map reload',
          );
        }
        // For timeout errors (code 3) during tracking, just log - watchPosition will auto-retry
        if (error.code === 3) {
          console.log(
            '⏱️ GPS timeout during tracking - will retry automatically',
          );
          // Don't manually retry during tracking - watchPosition handles this automatically
        }
      },
      {
        enableHighAccuracy: useHighAccuracyRef.current, // Dynamic accuracy
        timeout: userType === 'driver' ? 30000 : 20000, // Drivers: 30s, Passengers: 20s (faster for real-time)
        maximumAge: userType === 'driver' ? 5000 : 10000, // Drivers: 5s, Passengers: 10s cache for real-time updates
      },
    );

    watchIdRef.current = watchId;
    if (userType === 'driver') {
      globalDriverGPS.watchId = watchId;
    }
  };

  // Stop location sharing
  const stopLocationSharing = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setLocationState(prev => ({
      ...prev,
      isSharing: false,
      // 🔑 FIX: Giữ nguyên currentLocation để tránh reload bản đồ
      currentLocation: prev.currentLocation,
      accuracy: null,
      error: null,
    }));

    // For drivers, clear global GPS state
    if (userType === 'driver') {
      globalDriverGPS.isActive = false;
      globalDriverGPS.currentLocation = null;
      if (globalDriverGPS.watchId) {
        navigator.geolocation.clearWatch(globalDriverGPS.watchId);
        globalDriverGPS.watchId = null;
      }
      globalDriverGPS.driverId = null;

      // Notify all listeners
      globalDriverGPS.listeners.forEach(listener => {
        listener({
          isSharing: false,
          // 🔑 FIX: Keep currentLocation to avoid map reload
          currentLocation: globalDriverGPS.currentLocation,
          error: null,
          accuracy: null,
        });
      });
    }

    // CRITICAL: Immediately set driver as unavailable when GPS is turned off
    try {
      if (userType === 'driver' && driverId) {
        console.log(
          '🔴 GPS sharing stopped - setting driver offline immediately',
        );

        // First set as unavailable, but preserve location to prevent map reload
        await apiRequest('PATCH', `/api/drivers/${driverId}`, {
          isAvailable: false,
        });

        // 🔑 FIX: Don't delete location immediately to avoid map reload
        // Only delete location when really necessary
        // await apiRequest('PATCH', `/api/drivers/${driverId}/location`, {
        //   latitude: null,
        //   longitude: null
        // });

        console.log(
          '✅ Driver automatically set offline but location preserved to prevent map reload',
        );
      } else if (userType === 'passenger' && userId) {
        // Clear passenger location
        await apiRequest('PATCH', `/api/users/${userId}/location`, {
          latitude: null,
          longitude: null,
        });
        console.log(`📍 Passenger ${userId} stopped location sharing`);
      }
    } catch (error) {
      console.error(`Failed to stop ${userType} location sharing:`, error);
    }

    // Location sharing stopped automatically when app closes - no notification needed
  };

  // Toggle location sharing
  const toggleLocationSharing = () => {
    console.log(
      `🔄 Toggle GPS called - current state: ${
        locationState.isSharing ? 'ON' : 'OFF'
      }`,
    );

    if (locationState.isSharing) {
      console.log('📍 Stopping location sharing...');
      stopLocationSharing();
    } else {
      console.log('📍 Starting location sharing...');
      startLocationSharing();
    }
  };

  // Auto-start location sharing when component mounts
  useEffect(() => {
    isComponentMountedRef.current = true;

    console.log('🔍 [GPS AUTO-START] Hook received:', {
      autoStart,
      userId,
      driverId,
      userType,
      shouldStart: autoStart && (userId || driverId),
    });

    if (autoStart && (userId || driverId)) {
      // For drivers, check if GPS is already active globally and restore immediately
      if (
        userType === 'driver' &&
        globalDriverGPS.isActive &&
        globalDriverGPS.currentLocation
      ) {
        console.log(
          '📍 GPS already active globally - restoring immediately on page load',
        );
        setLocationState({
          isSharing: true,
          currentLocation: globalDriverGPS.currentLocation,
          error: null,
          accuracy: null,
        });
        watchIdRef.current = globalDriverGPS.watchId;
        return;
      }

      // Auto-start after sufficient delay to ensure proper browser initialization
      const timer = setTimeout(
        () => {
          if (isComponentMountedRef.current) {
            console.log(
              `🚀 Auto-starting GPS for ${userType} after initialization delay`,
            );
            retryCountRef.current = 0; // Reset retry counter on fresh start
            useHighAccuracyRef.current = userType === 'driver'; // Reset accuracy setting
            startLocationSharing();
          }
        },
        userType === 'driver' ? 1000 : 2000,
      ); // Drivers: 1s, Passengers: 2s for faster initialization

      return () => clearTimeout(timer);
    }

    return () => {
      isComponentMountedRef.current = false;
    };
  }, [userId, driverId, autoStart]);

  // Cleanup on unmount - for drivers, preserve GPS globally
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false;

      // For passengers, clean up GPS tracking
      if (userType === 'passenger' && watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // For drivers, keep GPS running globally but remove this component's listener
      if (userType === 'driver') {
        // Don't stop GPS when navigating between driver pages
        console.log('📍 Driver page unmounting - preserving GPS globally');
      }
    };
  }, [userType]);

  // Handle page unload - CRITICAL: Set driver offline immediately when app is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (userType === 'driver' && driverId) {
        console.log(
          '🔴 CRITICAL: Driver closing app - setting offline immediately',
        );

        // Set driver as unavailable immediately when app closes
        const offlineData = JSON.stringify({
          isAvailable: false,
          latitude: null,
          longitude: null,
          isLocationSharing: false,
        });

        // Use sendBeacon for reliable delivery during page unload
        const blob1 = new Blob([offlineData], { type: 'application/json' });
        fetch(`/api/drivers/${driverId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: offlineData,
          keepalive: true,
        });

        // Also clear location data specifically
        const locationData = JSON.stringify({
          latitude: null,
          longitude: null,
        });
        const blob2 = new Blob([locationData], { type: 'application/json' });
        fetch(`/api/drivers/${driverId}/location`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: locationData,
          keepalive: true,
        });
      }
    };

    // Handle visibility change - when user switches tabs or minimizes
    const handleVisibilityChange = () => {
      // 🔑 FIX: Only handle when really necessary to avoid map reload
      if (document.hidden && userType === 'driver' && driverId) {
        console.log('⚠️ Driver app hidden - starting offline timer');

        // Increase wait time to avoid unnecessary map reload (30 seconds instead of immediate)
        const offlineTimer = setTimeout(async () => {
          // Check again if app is really hidden
          if (document.hidden && isComponentMountedRef.current) {
            console.log('🔴 Driver app hidden too long - setting offline');
            try {
              // Only update offline status, don't delete location to avoid map reload
              await apiRequest('PATCH', `/api/drivers/${driverId}`, {
                isAvailable: false,
              });

              // Don't delete location immediately to avoid map reload
              // Only delete location when really necessary
              console.log(
                '✅ Driver set offline but location preserved to prevent map reload',
              );
            } catch (error) {
              console.error('Failed to set driver offline:', error);
            }
          }
        }, 30000); // 30 seconds delay to avoid immediate offline

        // Clear timer when app becomes visible again
        const clearTimer = () => {
          clearTimeout(offlineTimer);
          // 🔑 FIX: Don't add unnecessary event listeners to avoid page reload
          // document.removeEventListener('visibilitychange', clearTimer);
        };

        if (!document.hidden) {
          clearTimer();
        } else {
          // 🔑 FIX: Don't add unnecessary event listeners to avoid page reload
          // document.addEventListener('visibilitychange', clearTimer);
          // Instead, use a simple timer
          setTimeout(() => {
            if (!document.hidden) {
              clearTimer();
            }
          }, 1000); // Check every second
        }
      }
    };

    // window.addEventListener('beforeunload', handleBeforeUnload);
    // document.addEventListener('visibilitychange', handleVisibilityChange);

    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    //   document.removeEventListener('visibilitychange', handleVisibilityChange);
    // };
  }, [userType, driverId]);

  return {
    ...locationState,
    startLocationSharing,
    stopLocationSharing,
    toggleLocationSharing,
    sendManualPickupToWebSocket,
  };
}

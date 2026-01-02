declare module 'react-native-geolocation-service' {
  import { PermissionsAndroidStatic } from 'react-native';

  export interface GeoPosition {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export interface GeoError {
    code: number;
    message: string;
    PERMISSION_DENIED: number;
    POSITION_UNAVAILABLE: number;
    TIMEOUT: number;
  }

  export interface GeoOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    distanceFilter?: number;
  }

  export default class Geolocation {
    static requestAuthorization(
      authLevel?: 'always' | 'whenInUse',
    ): Promise<'granted' | 'denied'>;

    static getCurrentPosition(
      success: (position: GeoPosition) => void,
      error?: (error: GeoError) => void,
      options?: GeoOptions,
    ): void;

    static watchPosition(
      success: (position: GeoPosition) => void,
      error?: (error: GeoError) => void,
      options?: GeoOptions,
    ): number;

    static clearWatch(watchId: number): void;

    static stopObserving(): void;
  }
}

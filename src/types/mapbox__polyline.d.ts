declare module '@mapbox/polyline' {
  interface Polyline {
    decode: (encoded: string, precision?: number) => [number, number][];
    encode: (coords: [number, number][], precision?: number) => string;
    fromGeoJSON: (geojson: any) => string;
    toGeoJSON: (str: string) => any;
  }

  const polyline: Polyline;
  export default polyline;
}

import { getBaseUrl } from "./getBaseUrl";

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function shippingFeeByKm(km: number) {
  if (km <= 5) return 10000n;
  if (km <= 15) return 20000n;
  if (km <= 30) return 30000n;
  return 50000n;
}

export async function geocodeViaApiRoute(q: string) {
  const url = `${getBaseUrl()}/api/geocode?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as {
    lat: number;
    lng: number;
    displayName: string;
  };
}

import { Project } from '@/types/project';

export const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  // Maharashtra
  "pune": [18.5204, 73.8567],
  "nashik": [19.9975, 73.7898],
  "thane": [19.2183, 72.9781],
  "nagpur": [21.1458, 79.0882],
  "mumbai suburban": [19.0760, 72.8777],
  "mumbai": [18.9388, 72.8353],
  "chhatrapati sambhajinagar": [19.8762, 75.3433],
  "aurangabad": [19.8762, 75.3433],
  "satara": [17.6805, 74.0183],
  "solapur": [17.6599, 75.9064],
  "kolhapur": [16.7050, 74.2433],
  "amravati": [20.9374, 77.7796],
  "jalgaon": [21.0077, 75.5626],
  "ahmednagar": [19.0948, 74.7480],
  "ahilyanagar": [19.0948, 74.7480],
  "nanded": [19.1383, 77.3210],
  "latur": [18.4088, 76.5604],
  "raigad": [18.5158, 73.1822],
  "ratnagiri": [16.9902, 73.3120],
  "sindhudurg": [16.1649, 73.6934],
  "palghar": [19.6966, 72.7699],
  "dhule": [20.9042, 74.7749],
  "nandurbar": [21.3723, 74.2384],
  "bhed": [18.9892, 75.7601],
  "beed": [18.9892, 75.7601],
  "osmanabad": [18.1861, 76.0419],
  "dharashiv": [18.1861, 76.0419],
  "parbhani": [19.2644, 76.7739],
  "hingoli": [19.7173, 77.1472],
  "washim": [20.1109, 77.1327],
  "yavatmal": [20.3888, 78.1204],
  "wardha": [20.7453, 78.6022],
  "bhandara": [21.1704, 79.6548],
  "gondia": [21.4578, 80.1963],
  "chandrapur": [19.9615, 79.2961],
  "gadchiroli": [20.1849, 80.0024],
  
  // Delhi NCR
  "new delhi": [28.6139, 77.2090],
  "north delhi": [28.7041, 77.1025],
  "south delhi": [28.5355, 77.2410],
  "east delhi": [28.6280, 77.2950],
  "west delhi": [28.6667, 77.0667],

  // Uttar Pradesh
  "lucknow": [26.8467, 80.9462],
  "varanasi": [25.3176, 82.9739],
  "kanpur": [26.4499, 80.3319],
  "agra": [27.1767, 78.0081],
  "prayagraj": [25.4358, 81.8463],
  "allahabad": [25.4358, 81.8463],
  "badaun": [28.0339, 79.1265],
  "gorakhpur": [26.7606, 83.3732],
  "gautam buddha nagar": [28.5355, 77.3910],

  // Karnataka
  "bengaluru": [12.9716, 77.5946],
  "bangalore": [12.9716, 77.5946],
  "mysuru": [12.2958, 76.6394],
  "hubballi": [15.3647, 75.1240],

  // Tamil Nadu
  "chennai": [13.0827, 80.2707],
  "coimbatore": [11.0168, 76.9558],
  "madurai": [9.9252, 78.1198],

  // Gujarat
  "ahmedabad": [23.0225, 72.5714],
  "surat": [21.1702, 72.8311],
  "vadodara": [22.3072, 73.1812],
  "rajkot": [22.3039, 70.8022],

  // West Bengal
  "kolkata": [22.5726, 88.3639],
  "howrah": [22.5958, 88.2636],

  // Telangana & Andhra Pradesh
  "hyderabad": [17.3850, 78.4867],
  "visakhapatnam": [17.6868, 83.2185],

  // Rajasthan
  "jaipur": [26.9124, 75.7873],
  "jodhpur": [26.2389, 73.0243],
  "udaipur": [24.5854, 73.7125],

  // Madhya Pradesh
  "bhopal": [23.2599, 77.4126],
  "indore": [22.7196, 75.8577]
};

export const INDIA_CENTER: [number, number] = [22.9734, 78.6569];
export const DEFAULT_ZOOM = 5;

/**
 * Validates if coordinates are strictly within valid Indian geographical bounds.
 */
export function isValidIndiaCoordinate(lat?: number | null, lng?: number | null): boolean {
  if (lat == null || lng == null) return false;
  if (lat === 0 || lng === 0) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= 6.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0;
}

/**
 * Resolves project coordinates safely ensuring they land within India bounds.
 */
export function getProjectCoordinates(p: Project | any, index: number = 0): [number, number] {
  const rawLat = p.latitude ?? p.lat;
  const rawLng = p.longitude ?? p.lng;

  // 1. If project has explicit valid coordinates in India bounds, use them
  if (isValidIndiaCoordinate(rawLat, rawLng) && rawLat !== 21.3554) {
    return [Number(rawLat), Number(rawLng)];
  }

  // 2. Resolve based on district lookup
  const distName = (p.districtName || p.districtId || p.district || p.state || "").toString().toLowerCase().trim();
  let baseCoords: [number, number] = [18.5204, 73.8567]; // Default Maharashtra center

  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (distName.includes(key)) {
      baseCoords = coords;
      break;
    }
  }

  // 3. Apply deterministic jitter hash per project ID to spread markers within district
  let hash = 0;
  const str = (p.id || p.project_id || p.projectCode || p.project_code || String(index)).toString();
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 120) - 60) * 0.0035;
  const lngOffset = ((Math.abs(hash >> 3) % 120) - 60) * 0.0035;

  const finalLat = Math.min(Math.max(baseCoords[0] + latOffset, 6.0), 38.0);
  const finalLng = Math.min(Math.max(baseCoords[1] + lngOffset, 68.0), 98.0);

  return [finalLat, finalLng];
}

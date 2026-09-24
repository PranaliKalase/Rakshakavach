import { Project } from '@/types/project';

export const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  "Pune": [18.5204, 73.8567],
  "Nashik": [19.9975, 73.7898],
  "Thane": [19.2183, 72.9781],
  "Nagpur": [21.1458, 79.0882],
  "Mumbai Suburban": [19.0760, 72.8777],
  "Mumbai": [18.9388, 72.8353],
  "Chhatrapati Sambhajinagar": [19.8762, 75.3433],
  "Aurangabad": [19.8762, 75.3433],
  "Satara": [17.6805, 74.0183],
  "Solapur": [17.6599, 75.9064],
  "Kolhapur": [16.7050, 74.2433],
  "Amravati": [20.9374, 77.7796],
  "Jalgaon": [21.0077, 75.5626],
  "Ahmednagar": [19.0948, 74.7480],
  "Nanded": [19.1383, 77.3210],
  "Latur": [18.4088, 76.5604],
  "Raigad": [18.5158, 73.1822],
  "Ratnagiri": [16.9902, 73.3120],
  "Sindhudurg": [16.1649, 73.6934],
  "Palghar": [19.6966, 72.7699],
  "Badaun": [28.0339, 79.1265],
  "Lucknow": [26.8467, 80.9462],
  "Varanasi": [25.3176, 82.9739],
  "North Delhi": [28.7041, 77.1025],
  "South Delhi": [28.5355, 77.2410],
  "New Delhi": [28.6139, 77.2090]
};

export function getProjectCoordinates(p: Project, index: number): [number, number] {
  if (p.latitude && p.longitude && p.latitude !== 21.3554 && p.longitude !== 72.7368) {
    return [p.latitude, p.longitude];
  }

  const distName = p.districtName || p.districtId || p.district || "";
  let baseCoords: [number, number] = [18.5204, 73.8567]; // Default Pune / MH

  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (distName.toLowerCase().includes(key.toLowerCase())) {
      baseCoords = coords;
      break;
    }
  }

  let hash = 0;
  const str = p.id || p.projectCode || String(index);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 100) - 50) * 0.0035;
  const lngOffset = ((Math.abs(hash >> 3) % 100) - 50) * 0.0035;

  return [baseCoords[0] + latOffset, baseCoords[1] + lngOffset];
}

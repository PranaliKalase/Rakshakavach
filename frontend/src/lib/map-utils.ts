import { Project } from '@/types/project';

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal"
];

export const STATE_COORDINATES: Record<string, [number, number]> = {
  "Maharashtra": [19.7515, 75.7139],
  "Uttar Pradesh": [26.8467, 80.9462],
  "Karnataka": [15.3173, 75.7139],
  "Tamil Nadu": [11.1271, 78.6569],
  "Gujarat": [22.2587, 71.1924],
  "West Bengal": [22.9868, 87.8550],
  "Rajasthan": [27.0238, 74.2179],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Telangana": [18.1124, 79.0193],
  "Andhra Pradesh": [15.9129, 79.7400],
  "Delhi": [28.6862, 77.2217],
  "Kerala": [10.8505, 76.2711],
  "Bihar": [25.0961, 85.3131],
  "Punjab": [31.1471, 75.3412],
  "Haryana": [29.0588, 76.0856],
  "Odisha": [20.9517, 85.0985],
  "Assam": [26.2006, 92.9376]
};

export const STATE_DISTRICTS: Record<string, string[]> = {
  "Karnataka": [
    "Bengaluru", "Mysuru", "Belagavi", "Hubballi", "Kalaburagi", 
    "Vijayapura", "Ballari", "Mangaluru", "Shivamogga", "Tumakuru", "Davangere", "Udupi"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Varanasi", "Kanpur", "Agra", "Prayagraj", 
    "Gorakhpur", "Badaun", "Gautam Buddha Nagar", "Ghaziabad", "Mathura", "Ayodhya", "Meerut"
  ],
  "Maharashtra": [
    "Pune", "Mumbai City", "Mumbai Suburban", "Thane", "Nagpur", "Nashik", 
    "Chhatrapati Sambhajinagar", "Amravati", "Solapur", "Kolhapur", "Satara", 
    "Jalgaon", "Ahmednagar", "Nanded", "Latur", "Raigad", "Ratnagiri", 
    "Sindhudurg", "Palghar", "Dhule", "Nandurbar", "Beed", "Osmanabad", 
    "Parbhani", "Hingoli", "Washim", "Yavatmal", "Wardha", "Bhandara", 
    "Gondia", "Chandrapur", "Gadchiroli", "Akola", "Buldhana", "Jalna", "Sangli"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", 
    "Tirunelveli", "Vellore", "Erode", "Thanjavur", "Kanchipuram"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", 
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Kutch"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Darjeeling", "North 24 Parganas", "South 24 Parganas", 
    "Hooghly", "Paschim Medinipur", "Purba Bardhaman", "Murshidabad", "Siliguri"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", 
    "Bikaner", "Alwar", "Bhilwara", "Sikar", "Jaisalmer"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", 
    "Sagar", "Satna", "Rewa", "Ratlam", "Dewas"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", 
    "Ramagundam", "Mahbubnagar", "Nalgonda", "Suryapet"
  ],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", 
    "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur"
  ],
  "Delhi": [
    "New Delhi", "North Delhi", "South Delhi", "East Delhi", 
    "West Delhi", "Central Delhi", "North West Delhi", "South West Delhi"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", 
    "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Malappuram", "Wayanad", "Idukki"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", 
    "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", 
    "Mohali", "Pathankot", "Hoshiarpur", "Batala"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", 
    "Rohtak", "Hisar", "Karnal", "Sonipat"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", 
    "Puri", "Balasore", "Bhadrak", "Baripada"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", 
    "Tinsukia", "Tezpur", "Bongaigaon"
  ]
};

export const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  // Karnataka
  "bengaluru": [12.9716, 77.5946],
  "mysuru": [12.2958, 76.6394],
  "belagavi": [15.8497, 74.4977],
  "hubballi": [15.3647, 75.1240],
  "kalaburagi": [17.3297, 76.8343],
  "vijayapura": [16.8302, 75.7100],
  "ballari": [15.1394, 76.9214],
  "mangaluru": [12.9141, 74.8560],
  "shivamogga": [13.9299, 75.5681],
  "tumakuru": [13.3379, 77.1173],
  "davangere": [14.4644, 75.9218],
  "udupi": [13.3409, 74.7421],

  // Kerala
  "thiruvananthapuram": [8.5241, 76.9366],
  "kochi": [9.9312, 76.2673],
  "kozhikode": [11.2588, 75.7804],
  "thrissur": [10.5276, 76.2144],
  "kollam": [8.8932, 76.6141],
  "kannur": [11.8745, 75.3704],
  "alappuzha": [9.4981, 76.3388],
  "kottayam": [9.5916, 76.5222],
  "palakkad": [10.7867, 76.6548],
  "malappuram": [11.0720, 76.0740],
  "wayanad": [11.6854, 76.1320],
  "idukki": [9.8497, 76.9822],

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
  "ghaziabad": [28.6692, 77.4538],
  "mathura": [27.4924, 77.6737],
  "ayodhya": [26.7922, 82.1998],
  "meerut": [28.9845, 77.7064],

  // Maharashtra
  "pune": [18.5204, 73.8567],
  "nashik": [19.9975, 73.7898],
  "thane": [19.2183, 72.9781],
  "nagpur": [21.1458, 79.0882],
  "mumbai suburban": [19.0760, 72.8777],
  "mumbai city": [18.9388, 72.8353],
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
  "akola": [20.7002, 77.0082],
  "buldhana": [20.5292, 76.1843],
  "jalna": [19.8410, 75.8864],
  "sangli": [16.8524, 74.5815],
  
  // Delhi NCR
  "new delhi": [28.6139, 77.2090],
  "north delhi": [28.7041, 77.1025],
  "south delhi": [28.5355, 77.2410],
  "east delhi": [28.6280, 77.2950],
  "west delhi": [28.6667, 77.0667],

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

export const DISTRICT_TO_STATE: Record<string, string> = {
  // Delhi
  "new delhi": "Delhi",
  "north delhi": "Delhi",
  "south delhi": "Delhi",
  "east delhi": "Delhi",
  "west delhi": "Delhi",

  // Uttar Pradesh
  "lucknow": "Uttar Pradesh",
  "varanasi": "Uttar Pradesh",
  "kanpur": "Uttar Pradesh",
  "agra": "Uttar Pradesh",
  "prayagraj": "Uttar Pradesh",
  "allahabad": "Uttar Pradesh",
  "badaun": "Uttar Pradesh",
  "gorakhpur": "Uttar Pradesh",
  "gautam buddha nagar": "Uttar Pradesh",

  // Karnataka
  "bengaluru": "Karnataka",
  "bangalore": "Karnataka",
  "mysuru": "Karnataka",
  "hubballi": "Karnataka",

  // Tamil Nadu
  "chennai": "Tamil Nadu",
  "coimbatore": "Tamil Nadu",
  "madurai": "Tamil Nadu",

  // Gujarat
  "ahmedabad": "Gujarat",
  "surat": "Gujarat",
  "vadodara": "Gujarat",
  "rajkot": "Gujarat",

  // West Bengal
  "kolkata": "West Bengal",
  "howrah": "West Bengal",

  // Telangana & Andhra Pradesh
  "hyderabad": "Telangana",
  "visakhapatnam": "Andhra Pradesh",

  // Rajasthan
  "jaipur": "Rajasthan",
  "jodhpur": "Rajasthan",
  "udaipur": "Rajasthan",

  // Madhya Pradesh
  "bhopal": "Madhya Pradesh",
  "indore": "Madhya Pradesh"
};

export const INDIA_CENTER: [number, number] = [22.9734, 78.6569];
export const DEFAULT_ZOOM = 5;

/**
 * Derives state name for a given raw project.
 */
export function getProjectState(p: any): string {
  if (p.state && p.state !== "Maharashtra") return p.state;
  if (p.state_name) return p.state_name;
  if (p.stateName) return p.stateName;

  const dist = (p.districtName || p.district_name || p.districtId || p.district || "").toString().toLowerCase().trim();
  for (const [dKey, sName] of Object.entries(DISTRICT_TO_STATE)) {
    if (dist && dist.includes(dKey)) {
      return sName;
    }
  }

  // Map based on constituency or MP or project ID index to distribute across Indian states
  const mpName = (p.mp_name || p.mpName || "").toString();
  const constName = (p.constituency_name || p.constituencyName || p.constituency_id || "").toString();
  const pid = (p.id || p.project_id || p.projectCode || p.project_code || "").toString();

  const match = mpName.match(/\d+/) || constName.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return INDIAN_STATES[(num - 1) % INDIAN_STATES.length];
  }

  let hash = 0;
  for (let i = 0; i < pid.length; i++) {
    hash = (hash << 5) - hash + pid.charCodeAt(i);
    hash |= 0;
  }
  return INDIAN_STATES[Math.abs(hash) % INDIAN_STATES.length];
}

/**
 * Derives valid district name belonging to the project's assigned state.
 */
export function getProjectDistrict(p: any, state: string): string {
  const stateDistricts = STATE_DISTRICTS[state] || STATE_DISTRICTS["Maharashtra"];
  const rawDist = (p.districtName || p.district_name || p.district || "").toString().trim();

  // If raw district already belongs to this state, return it
  if (rawDist && stateDistricts.some(d => d.toLowerCase() === rawDist.toLowerCase())) {
    const matched = stateDistricts.find(d => d.toLowerCase() === rawDist.toLowerCase());
    if (matched) return matched;
  }

  // Otherwise, deterministically select a district from this state based on project ID / code
  const pid = (p.id || p.project_id || p.projectCode || p.project_code || "").toString();
  let hash = 0;
  for (let i = 0; i < pid.length; i++) {
    hash = (hash << 5) - hash + pid.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % stateDistricts.length;
  return stateDistricts[idx];
}

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
  let found = false;

  for (const [key, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (distName.includes(key)) {
      baseCoords = coords;
      found = true;
      break;
    }
  }

  if (!found && p.state && STATE_COORDINATES[p.state]) {
    baseCoords = STATE_COORDINATES[p.state];
  }

  // 3. Apply deterministic jitter hash per project ID to spread markers within district/state
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

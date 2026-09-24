"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  MapPin,
  Building,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { PROTOTYPE_DISCLAIMER } from '@/lib/constants';
import { UserProfile, UserRole } from '@/types/user';

// Dynamic State and District Dataset
const STATE_DISTRICT_MAP: Record<string, string[]> = {
  "Maharashtra": ["Pune", "Mumbai", "Nagpur", "Nashik", "Aurangabad", "Kolhapur", "Thane", "Solapur"],
  "Uttar Pradesh": ["Badaun", "Lucknow", "Varanasi", "Kanpur", "Agra", "Prayagraj", "Gorakhpur", "Ghaziabad"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain", "Sagar"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
  "Karnataka": ["Bengaluru Urban", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Dharwad"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"]
};

const STATES = Object.keys(STATE_DISTRICT_MAP);

interface AuthUserRecord {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  state: string;
  district: string;
  constituency_id?: string;
  constituency_name?: string;
  is_active: boolean;
}

// User records database
const AUTH_USER_DATABASE: AuthUserRecord[] = [
  // Maharashtra - Pune
  {
    user_id: "usr-mh-pune-da",
    name: "District Collector — Pune, Maharashtra",
    email: "collector.pune@gov.in",
    password_hash: "pune@123",
    role: "DISTRICT_AUTHORITY",
    state: "Maharashtra",
    district: "Pune",
    is_active: true
  },
  {
    user_id: "usr-mh-pune-mp",
    name: "Hon'ble MP — Pune Constituency",
    email: "mp.pune@gov.in",
    password_hash: "mp@pune123",
    role: "MP",
    state: "Maharashtra",
    district: "Pune",
    constituency_id: "C-MH-01",
    constituency_name: "Pune Lok Sabha Constituency",
    is_active: true
  },
  {
    user_id: "usr-mh-pune-ia",
    name: "Public Works Dept (PWD) — Pune",
    email: "agency.pune@gov.in",
    password_hash: "agency@123",
    role: "IMPLEMENTING_AGENCY",
    state: "Maharashtra",
    district: "Pune",
    is_active: true
  },
  {
    user_id: "usr-mh-pune-mo",
    name: "Field Monitoring Officer — Pune",
    email: "monitoring.pune@gov.in",
    password_hash: "monitor@123",
    role: "MONITORING_OFFICER",
    state: "Maharashtra",
    district: "Pune",
    is_active: true
  },

  // Uttar Pradesh - Badaun
  {
    user_id: "usr-up-badaun-da",
    name: "District Collector — Badaun, Uttar Pradesh",
    email: "collector.badaun@gov.in",
    password_hash: "badaun@123",
    role: "DISTRICT_AUTHORITY",
    state: "Uttar Pradesh",
    district: "Badaun",
    is_active: true
  },
  {
    user_id: "usr-up-badaun-mp",
    name: "Shri Aditya Yadav (Hon'ble MP — Badaun, UP)",
    email: "mp013@sansad.in",
    password_hash: "mp@badaun123",
    role: "MP",
    state: "Uttar Pradesh",
    district: "Badaun",
    constituency_id: "C007",
    constituency_name: "Badaun Parliamentary Constituency",
    is_active: true
  },
  {
    user_id: "usr-up-badaun-ia",
    name: "Public Works Dept (PWD) — Uttar Pradesh",
    email: "pwd.up@gov.in",
    password_hash: "pwd@up123",
    role: "IMPLEMENTING_AGENCY",
    state: "Uttar Pradesh",
    district: "Badaun",
    is_active: true
  },
  {
    user_id: "usr-up-badaun-mo",
    name: "Field Monitoring Officer (UP Scope)",
    email: "inspection.mo@gov.in",
    password_hash: "mo@up123",
    role: "MONITORING_OFFICER",
    state: "Uttar Pradesh",
    district: "Badaun",
    is_active: true
  },

  // Admin Accounts
  {
    user_id: "usr-admin-official",
    name: "System Administrator (MOSPI Technical Cell)",
    email: "admin@rakshkavach.gov.in",
    password_hash: "admin123",
    role: "ADMIN",
    state: "Maharashtra",
    district: "Pune",
    is_active: true
  },
  {
    user_id: "usr-admin-legacy",
    name: "System Administrator (MOSPI Technical Cell)",
    email: "admin@rakshakavach.in",
    password_hash: "admin123",
    role: "ADMIN",
    state: "Uttar Pradesh",
    district: "Badaun",
    is_active: true
  },

  // Inactive Account Example
  {
    user_id: "usr-inactive-official",
    name: "Inactive Official User",
    email: "inactive.officer@gov.in",
    password_hash: "inactive123",
    role: "DISTRICT_AUTHORITY",
    state: "Maharashtra",
    district: "Mumbai",
    is_active: false
  }
];

const DASHBOARD_ROUTES: Record<string, string> = {
  MP: '/dashboard/mp',
  DISTRICT_AUTHORITY: '/dashboard/district-authority',
  IMPLEMENTING_AGENCY: '/dashboard/implementing-agency',
  MONITORING_OFFICER: '/dashboard/monitoring-officer',
  ADMIN: '/dashboard/admin'
};

export default function LoginPage() {
  const router = useRouter();

  // Form States
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pune');
  const [selectedRole, setSelectedRole] = useState<string>('DISTRICT_AUTHORITY');
  const [email, setEmail] = useState<string>('collector.pune@gov.in');
  const [password, setPassword] = useState<string>('pune@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const availableDistricts = STATE_DISTRICT_MAP[selectedState] || [];

  // Quick fill handler
  const fillQuickCredentials = (rec: AuthUserRecord) => {
    setSelectedState(rec.state);
    setSelectedDistrict(rec.district);
    setSelectedRole(rec.role);
    setEmail(rec.email);
    setPassword(rec.password_hash);
    setErrorMsg('');
  };

  // Auto-sync when typing matching email
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setErrorMsg('');

    const matchUser = AUTH_USER_DATABASE.find(
      (u) => u.email.toLowerCase() === val.trim().toLowerCase()
    );

    if (matchUser) {
      setSelectedState(matchUser.state);
      setSelectedDistrict(matchUser.district);
      setSelectedRole(matchUser.role);
      if (!password) {
        setPassword(matchUser.password_hash);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Email format validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid official email address.");
      return;
    }

    // 2. Password validation
    if (!password || password.trim() === '') {
      setErrorMsg("Password is required.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Look up user in Database by Email
      const dbUser = AUTH_USER_DATABASE.find(
        (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
      );

      let targetUser: AuthUserRecord;

      if (dbUser) {
        // Check 1: Active account
        if (!dbUser.is_active) {
          setLoading(false);
          setErrorMsg("Your account is currently inactive. Please contact the administrator.");
          return;
        }

        // Check 2: Password match (flexible for demo: accepts exact password or standard passwords like '123456', 'password', 'admin123', etc.)
        const isPasswordValid =
          dbUser.password_hash === password ||
          ['123456', 'password', 'admin123', 'pune@123', 'badaun@123', 'admin'].includes(password.trim());

        if (!isPasswordValid) {
          setLoading(false);
          setErrorMsg("Invalid email or password.");
          return;
        }

        // Check 3: State match (skip check if ADMIN)
        if (dbUser.role !== 'ADMIN' && dbUser.state.toLowerCase() !== selectedState.toLowerCase()) {
          setLoading(false);
          setErrorMsg("Selected state does not match authorized account.");
          return;
        }

        // Check 4: District match
        if (dbUser.role !== 'ADMIN' && dbUser.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
          setLoading(false);
          setErrorMsg("Selected district does not match authorized account.");
          return;
        }

        // Check 5: Role match
        if (dbUser.role !== selectedRole) {
          setLoading(false);
          setErrorMsg("Selected profile does not match authorized user role.");
          return;
        }

        targetUser = dbUser;
      } else {
        // Dynamic fallback for any custom email (e.g. user@gmail.com or official emails)
        targetUser = {
          user_id: `usr-dynamic-${Date.now()}`,
          name: `Official User (${trimmedEmail.split('@')[0]})`,
          email: trimmedEmail,
          password_hash: password,
          role: selectedRole,
          state: selectedState,
          district: selectedDistrict,
          is_active: true
        };
      }

      // Store authenticated user profile in localStorage
      const userProfile: UserProfile = {
        id: targetUser.user_id,
        email: targetUser.email,
        fullName: targetUser.name,
        role: targetUser.role as UserRole,
        mpName: targetUser.role === 'MP' ? (targetUser.name || "Demo MP 013") : undefined,
        districtId: targetUser.district,
        constituencyId: targetUser.constituency_id || `C-${selectedDistrict}`,
        constituencyName: targetUser.constituency_name || `${selectedDistrict} Parliamentary Constituency`
      };

      localStorage.setItem('rakshakavach_user', JSON.stringify(userProfile));

      setLoading(false);
      const targetRoute = DASHBOARD_ROUTES[selectedRole] || '/dashboard/district-authority';
      router.push(targetRoute);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-govBg flex flex-col justify-between text-textPrimary">
      {/* Top Disclosure Banner */}
      <div className="bg-darkNavy text-white py-2 px-4 text-center text-xs flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <span>{PROTOTYPE_DISCLAIMER}</span>
      </div>

      {/* Main Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-govBorder rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex bg-primaryBlue p-3 rounded-lg mb-3 shadow-md">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">RAKSHKAVACH</h1>
            <p className="text-xs text-textSecondary font-semibold">MOSPI Official MPLADS Verification & Trust Platform</p>
          </div>

          {/* Validation Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-statusRed text-xs font-semibold rounded-md flex items-start gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-statusRed shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* 1. Select State */}
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Select State *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-primaryBlue absolute left-3 top-3 pointer-events-none" />
                <select
                  value={selectedState}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSelectedState(st);
                    const dists = STATE_DISTRICT_MAP[st] || [];
                    setSelectedDistrict(dists[0] || '');
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-govBg border border-govBorder rounded font-semibold text-govNavy focus:outline-none focus:border-primaryBlue cursor-pointer"
                  required
                >
                  {STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Select District */}
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Select District *</label>
              <div className="relative">
                <Building className="w-4 h-4 text-primaryBlue absolute left-3 top-3 pointer-events-none" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-govBg border border-govBorder rounded font-semibold text-govNavy focus:outline-none focus:border-primaryBlue cursor-pointer"
                  required
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Official User Profile Dropdown */}
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Select Official User Profile *</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-primaryBlue absolute left-3 top-3 pointer-events-none" />
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-govBg border border-govBorder rounded font-semibold text-govNavy focus:outline-none focus:border-primaryBlue cursor-pointer"
                  required
                >
                  <option value="MP">Hon'ble MP</option>
                  <option value="DISTRICT_AUTHORITY">District Authority</option>
                  <option value="IMPLEMENTING_AGENCY">Implementing Agency</option>
                  <option value="MONITORING_OFFICER">Monitoring Officer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {/* 4. Official Email Address */}
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Official Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-primaryBlue absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. collector.pune@gov.in"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-govBg border border-govBorder rounded font-semibold text-govNavy focus:outline-none focus:border-primaryBlue placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* 5. Password Field */}
            <div>
              <label className="block font-semibold text-textPrimary mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-primaryBlue absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-10 py-2.5 bg-govBg border border-govBorder rounded font-semibold text-govNavy focus:outline-none focus:border-primaryBlue placeholder:text-gray-400 placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-textSecondary hover:text-govNavy focus:outline-none cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Interactive Clickable Quick Demo Credentials */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-[11px] text-govNavy space-y-1.5 shadow-sm">
              <span className="font-extrabold text-xs block text-govNavy flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primaryBlue" />
                <span>Click a Demo Persona to Auto-Fill Credentials:</span>
              </span>
              <div className="grid grid-cols-1 gap-1.5 pt-1">
                {/* 1. District Collector (Pune, MH) */}
                <button
                  type="button"
                  onClick={() => fillQuickCredentials(AUTH_USER_DATABASE[0])}
                  className="text-left px-2.5 py-1.5 bg-white border border-blue-200 rounded hover:bg-blue-100/70 hover:border-blue-400 transition-all font-medium flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <strong className="text-govNavy">District Collector (Pune, MH)</strong>
                    <div className="text-[10px] text-gray-500 font-mono">collector.pune@gov.in • pune@123</div>
                  </div>
                  <span className="text-[10px] bg-primaryBlue text-white px-2 py-0.5 rounded font-bold group-hover:bg-darkNavy">Use</span>
                </button>

                {/* 2. Hon'ble MP (Pune, MH) */}
                <button
                  type="button"
                  onClick={() => fillQuickCredentials(AUTH_USER_DATABASE[1])}
                  className="text-left px-2.5 py-1.5 bg-white border border-blue-200 rounded hover:bg-blue-100/70 hover:border-blue-400 transition-all font-medium flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <strong className="text-govNavy">Hon'ble MP (Pune, MH)</strong>
                    <div className="text-[10px] text-gray-500 font-mono">mp.pune@gov.in • mp@pune123</div>
                  </div>
                  <span className="text-[10px] bg-primaryBlue text-white px-2 py-0.5 rounded font-bold group-hover:bg-darkNavy">Use</span>
                </button>

                {/* 3. Implementing Agency (Pune, MH) */}
                <button
                  type="button"
                  onClick={() => fillQuickCredentials(AUTH_USER_DATABASE[2])}
                  className="text-left px-2.5 py-1.5 bg-white border border-blue-200 rounded hover:bg-blue-100/70 hover:border-blue-400 transition-all font-medium flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <strong className="text-govNavy">Implementing Agency (Pune, MH)</strong>
                    <div className="text-[10px] text-gray-500 font-mono">agency.pune@gov.in • agency@123</div>
                  </div>
                  <span className="text-[10px] bg-primaryBlue text-white px-2 py-0.5 rounded font-bold group-hover:bg-darkNavy">Use</span>
                </button>

                {/* 4. Monitoring Officer (Pune, MH) */}
                <button
                  type="button"
                  onClick={() => fillQuickCredentials(AUTH_USER_DATABASE[3])}
                  className="text-left px-2.5 py-1.5 bg-white border border-blue-200 rounded hover:bg-blue-100/70 hover:border-blue-400 transition-all font-medium flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <strong className="text-govNavy">Monitoring Officer (Pune, MH)</strong>
                    <div className="text-[10px] text-gray-500 font-mono">monitoring.pune@gov.in • monitor@123</div>
                  </div>
                  <span className="text-[10px] bg-primaryBlue text-white px-2 py-0.5 rounded font-bold group-hover:bg-darkNavy">Use</span>
                </button>

                {/* 5. System Administrator */}
                <button
                  type="button"
                  onClick={() => fillQuickCredentials(AUTH_USER_DATABASE[8])}
                  className="text-left px-2.5 py-1.5 bg-white border border-blue-200 rounded hover:bg-blue-100/70 hover:border-blue-400 transition-all font-medium flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <strong className="text-govNavy">System Administrator</strong>
                    <div className="text-[10px] text-gray-500 font-mono">admin@rakshkavach.gov.in • admin123</div>
                  </div>
                  <span className="text-[10px] bg-primaryBlue text-white px-2 py-0.5 rounded font-bold group-hover:bg-darkNavy">Use</span>
                </button>
              </div>
            </div>

            {/* 6. Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-govNavy hover:bg-darkNavy text-white text-xs font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <span>Authenticating Role & Jurisdiction...</span>
                ) : (
                  <>
                    <span>Authenticate & Access Authorized Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-textSecondary border-t border-govBorder bg-white">
        RAKSHKAVACH • Powered by Official MOSPI MPLADS Dataset (543 Lok Sabha Constituencies)
      </footer>
    </div>
  );
}



import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { Role } from '../../types';
import { Shield, Key, Smartphone, ArrowDown, Check, Sparkles, Lock, Waves, Send, UserCheck, ShieldCheck } from 'lucide-react';
import { Language, t } from '../../services/i18n';
import { USER_ACCOUNTS } from '../../services/mockData';

export const Gateway: React.FC = () => {
  const { signInAs, signInAsPublicViewer, language, setLanguage } = useAppStore();

  const [activeStratum, setActiveStratum] = useState<Role | null>(null);
  const [hoveredStratum, setHoveredStratum] = useState<Role | null>(null);
  const [isDescending, setIsDescending] = useState(false);

  // Form states for simulated sign-in
  const [communityPhone, setCommunityPhone] = useState('+91 94441 23890');
  const [communityOtp, setCommunityOtp] = useState('');
  const [otpDispatched, setOtpDispatched] = useState(false);

  const [officialEmail, setOfficialEmail] = useState('rajendran.ias@tnfisheries.gov.in');
  const [officialMfa, setOfficialMfa] = useState('NIC-TN-SSO-89211');

  const [analystEmail, setAnalystEmail] = useState('ananya.deshmukh@tidemark.gov.in');
  const [analystPass, setAnalystPass] = useState('••••••••••••');
  const [analystTotp, setAnalystTotp] = useState('892411');
  const [hardwareKeyTouched, setHardwareKeyTouched] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleStratumSelect = (role: Role) => {
    setIsDescending(true);
    setTimeout(() => {
      setActiveStratum(role);
      setIsDescending(false);
      setAuthError('');
    }, 350);
  };

  const handleSendOtp = () => {
    if (!communityPhone.trim()) {
      setAuthError('Please enter a valid mobile number.');
      return;
    }
    setOtpDispatched(true);
    setAuthError('');
  };

  const handleCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityOtp.trim()) {
      setAuthError('Please enter the 6-digit OTP code (demo code: 123456).');
      return;
    }
    if (communityOtp.trim() === '123456') {
      const user = {
        ...USER_ACCOUNTS[0],
        emailOrPhone: communityPhone,
      };
      signInAs('user', user);
    } else {
      setAuthError('Invalid OTP code. Enter 123456 for synthetic authentication.');
    }
  };

  const handleOfficialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = USER_ACCOUNTS.find(
      (u) => u.role === 'official' && u.emailOrPhone.toLowerCase() === officialEmail.toLowerCase()
    ) || USER_ACCOUNTS[1];
    signInAs('official', matched);
  };

  const handleAnalystSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hardwareKeyTouched) {
      setAuthError('FIDO2 Hardware Security Key verification required. Tap the key prompt to verify.');
      return;
    }
    if (analystTotp.trim() && analystTotp.trim() !== '892411') {
      setAuthError('Invalid TOTP authenticator code. Enter 892411 for synthetic verification.');
      return;
    }
    signInAs('analyst', USER_ACCOUNTS[3]);
  };

  // Determine background depth tint based on hovered or selected stratum
  const targetDepth = hoveredStratum || activeStratum;
  const bgClasses = targetDepth === 'analyst'
    ? 'bg-[#05141F]'
    : targetDepth === 'official'
    ? 'bg-[#0B2230]'
    : 'bg-[#F2F7F6]';

  const textColorClass = targetDepth === 'analyst' || targetDepth === 'official'
    ? 'text-[#EEF8F8]'
    : 'text-[#0E2230]';

  return (
    <div
      className={`min-h-[calc(100vh-80px)] w-full transition-colors duration-500 relative flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-hidden ${bgClasses} ${textColorClass}`}
    >
      {/* Drifting Hydrographic Topography & Bathymetric Contours Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-25 select-none overflow-hidden"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full animate-contour-drift"
        >
          <defs>
            <linearGradient id="contourFade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1F7280" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#2EA2B5" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0A2A3E" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Graticule Grid Lines */}
          <line x1="200" y1="0" x2="200" y2="900" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />
          <line x1="600" y1="0" x2="600" y2="900" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />
          <line x1="1000" y1="0" x2="1000" y2="900" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />
          <line x1="0" y1="300" x2="1440" y2="300" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />
          <line x1="0" y1="600" x2="1440" y2="600" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3" />

          {/* Coordinate stamps */}
          <text x="210" y="25" fill="currentColor" fontSize="10" fontFamily="IBM Plex Sans" opacity="0.6">79°00'E</text>
          <text x="610" y="25" fill="currentColor" fontSize="10" fontFamily="IBM Plex Sans" opacity="0.6">80°00'E</text>
          <text x="1010" y="25" fill="currentColor" fontSize="10" fontFamily="IBM Plex Sans" opacity="0.6">81°00'E</text>
          <text x="20" y="295" fill="currentColor" fontSize="10" fontFamily="IBM Plex Sans" opacity="0.6">12°00'N</text>
          <text x="20" y="595" fill="currentColor" fontSize="10" fontFamily="IBM Plex Sans" opacity="0.6">9°30'N</text>

          {/* Bathymetric Isobath Topography Contours */}
          {/* 10m Isobath */}
          <path
            d="M 1440,80 Q 1100,120 850,220 T 500,480 T 150,750 T 0,820"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.5"
          />
          <text x="920" y="195" fill="currentColor" fontSize="9" fontFamily="monospace" opacity="0.7">10m</text>

          {/* 20m Isobath */}
          <path
            d="M 1440,140 Q 1150,190 920,290 T 580,550 T 220,820 T 0,890"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.9"
            opacity="0.55"
          />
          <text x="980" y="270" fill="currentColor" fontSize="9" fontFamily="monospace" opacity="0.7">20m</text>

          {/* 50m Isobath */}
          <path
            d="M 1440,210 Q 1200,260 990,370 T 660,630 T 310,900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            opacity="0.6"
          />
          <text x="1050" y="350" fill="currentColor" fontSize="9" fontFamily="monospace" opacity="0.7">50m</text>

          {/* 100m Isobath */}
          <path
            d="M 1440,300 Q 1240,360 1060,470 T 740,730 T 420,900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            opacity="0.65"
          />
          <text x="1110" y="445" fill="currentColor" fontSize="9" fontFamily="monospace" opacity="0.7">100m</text>

          {/* 200m Continental Shelf Edge */}
          <path
            d="M 1440,400 Q 1280,470 1130,580 T 830,830 T 550,900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            opacity="0.75"
          />
          <text x="1180" y="550" fill="currentColor" fontSize="10" fontWeight="bold" fontFamily="monospace" opacity="0.8">200m (Shelf Edge)</text>

          {/* 500m Slope Isobath */}
          <path
            d="M 1440,510 Q 1310,580 1190,690 T 910,900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            opacity="0.65"
          />
          <text x="1240" y="655" fill="currentColor" fontSize="9" fontFamily="monospace" opacity="0.7">500m</text>

          {/* 1000m Abyssal Transition */}
          <path
            d="M 1440,620 Q 1340,700 1240,800 T 1000,900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <text x="1290" y="760" fill="currentColor" fontSize="9" fontFamily="monospace" opacity="0.7">1000m</text>

          {/* 2500m Abyssal Plain */}
          <path
            d="M 1440,730 Q 1370,810 1300,900"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            opacity="0.8"
          />
          <text x="1350" y="855" fill="currentColor" fontSize="9" fontFamily="monospace" opacity="0.7">2500m</text>

          {/* Sounding Depth Numbers Scattered on Topographic Grid */}
          <g fontSize="10" fontFamily="monospace" opacity="0.45" fill="currentColor">
            <text x="440" y="180">7.8</text>
            <text x="560" y="240">14.1</text>
            <text x="720" y="310">34</text>
            <text x="890" y="420">78</text>
            <text x="1040" y="520">165</text>
            <text x="1180" y="620">420</text>
            <text x="1280" y="740">1140</text>
            <text x="1380" y="860">2840</text>
            <text x="320" y="420">5.4</text>
            <text x="480" y="580">18.6</text>
            <text x="620" y="690">42</text>
            <text x="760" y="790">110</text>
          </g>

          {/* Watermark Compass Rose in Southeast quadrant */}
          <g transform="translate(1220, 220) scale(0.9)" opacity="0.25" stroke="currentColor" fill="none">
            <circle cx="0" cy="0" r="100" strokeWidth="1" />
            <circle cx="0" cy="0" r="85" strokeWidth="0.6" strokeDasharray="2 3" />
            <circle cx="0" cy="0" r="50" strokeWidth="0.8" />
            <polygon points="0,-100 12,-35 0,-15 -12,-35" fill="currentColor" opacity="0.6" />
            <polygon points="0,100 12,35 0,15 -12,35" fill="currentColor" opacity="0.4" />
            <polygon points="100,0 35,12 15,0 35,-12" fill="currentColor" opacity="0.4" />
            <polygon points="-100,0 -35,12 -15,0 -35,-12" fill="currentColor" opacity="0.4" />
            <text x="-4" y="-108" fontSize="12" fontFamily="serif" fontWeight="bold" fill="currentColor">N</text>
            <text x="108" y="4" fontSize="11" fontFamily="serif" fill="currentColor">E</text>
            <text x="-4" y="118" fontSize="11" fontFamily="serif" fill="currentColor">S</text>
            <text x="-120" y="4" fontSize="11" fontFamily="serif" fill="currentColor">W</text>
          </g>
        </svg>
      </div>

      {/* Noble Dignified Masthead */}
      <div className="w-full max-w-4xl mx-auto z-10 pt-2 pb-4">
        <div className="flex items-center gap-3 mb-2">
          {/* National Observatory Emblem */}
          <div className="w-10 h-10 rounded-[2px] bg-[#0E2230] dark:bg-[#1E445C] border border-[#BFE6DF]/50 flex items-center justify-center text-[#BFE6DF] shadow-md shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="9" strokeWidth="1" opacity="0.7" />
              <path d="M12 3v18M3 12h18" strokeWidth="0.8" strokeDasharray="2 2" />
              <circle cx="12" cy="6" r="2" />
              <path d="M12 8v11M7 14c2.5 3 7.5 3 10 0" strokeWidth="1.8" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#1F7280] dark:text-[#2EA2B5] block font-ui">
              NATIONAL OBSERVATORY OF MARITIME RESOURCES & BLUE ECONOMY
            </span>
            <p className="text-[11px] text-[#5E7A8A] dark:text-[#799CA9] font-ui">
              Government of India & State of Tamil Nadu &bull; Hydrographic Sector
            </p>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#0E2230] dark:text-[#EEF8F8]">
          {t('app.name', language)} <span className="font-normal italic text-lg sm:text-xl text-[#5E7A8A] dark:text-[#799CA9]">&mdash; National Blue Economy Observatory</span>
        </h1>
        <p className="text-xs sm:text-sm opacity-80 font-normal mt-1 max-w-2xl font-ui leading-relaxed">
          The sovereign data instrument uniting artisanal fishers, coastal aquaculture, port authorities, and ministerial analysts along the Tamil Nadu littoral.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto my-auto py-6 z-10">
        {/* If descending transition is running */}
        {isDescending && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full border-2 border-[#1F7280] border-t-transparent animate-spin" />
            <p className="font-display italic text-lg sm:text-xl">
              Calibrating hydrographic sounding strata...
            </p>
          </div>
        )}

        {/* Stratum Selection (When no active door is open) */}
        {!activeStratum && !isDescending && (
          <div className="space-y-6">
            <div className="border-b border-current/20 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.18em] font-bold opacity-75 block mb-0.5">
                  OPERATIONAL STRATA (DEPTH IS ROLE)
                </span>
                <p className="text-xs opacity-85">
                  Select your operational sounding depth to engage RBAC-authorized instruments.
                </p>
              </div>
              <span className="hidden sm:inline text-[11px] font-mono text-[#1F7280] dark:text-[#2EA2B5] border border-current/30 px-2 py-0.5 rounded-[2px]">
                DATUM: WGS84 LAT
              </span>
            </div>

            <div className="space-y-4">
              {/* Stratum 1: Shallows */}
              <div
                onMouseEnter={() => setHoveredStratum('user')}
                onMouseLeave={() => setHoveredStratum(null)}
                className="group relative border border-[#D3E2E1] dark:border-[#1E445C] bg-white/85 dark:bg-[#0E2A3C]/85 hover:border-[#1F7280] p-5 sm:p-6 rounded-[2px] transition-all cursor-pointer shadow-sm"
                onClick={() => handleStratumSelect('user')}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl sm:text-2xl font-bold text-[#0E2230] dark:text-[#EEF8F8]">
                        {t('gateway.shallows.title', language)}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#BFE6DF]/50 text-[#0E2230] font-bold border border-[#1F7280]/20">
                        DEPTH: 0m – 50m &bull; SHALLOW SHELF
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#1F7280] dark:text-[#2EA2B5]">
                      {t('gateway.shallows.subtitle', language)}
                    </p>
                    <p className="text-xs text-[#5E7A8A] dark:text-[#799CA9]">
                      {t('gateway.shallows.desc', language)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        signInAs('user');
                      }}
                      className="px-3.5 py-2 text-xs font-semibold bg-[#1F7280] hover:bg-[#17566A] text-white rounded-[2px] shadow-sm transition-colors"
                    >
                      1-Click Fisher Demo
                    </button>
                    <span className="text-xs font-semibold text-[#5E7A8A] group-hover:text-[#1F7280] transition-colors">
                      Sign in &rarr;
                    </span>
                  </div>
                </div>
              </div>

              {/* Stratum 2: Shelf */}
              <div
                onMouseEnter={() => setHoveredStratum('official')}
                onMouseLeave={() => setHoveredStratum(null)}
                className="group relative border border-[#D3E2E1] dark:border-[#1E445C] bg-[#E5EFEF]/85 dark:bg-[#0E2A3C]/90 hover:border-[#2EA2B5] p-5 sm:p-6 rounded-[2px] transition-all cursor-pointer shadow-sm"
                onClick={() => handleStratumSelect('official')}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl sm:text-2xl font-bold text-[#0E2230] dark:text-[#EEF8F8]">
                        {t('gateway.shelf.title', language)}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#1F7280]/20 text-[#1F7280] dark:text-[#2EA2B5] font-bold border border-[#2EA2B5]/30">
                        DEPTH: 50m – 200m &bull; CONTINENTAL SHELF
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#1F7280] dark:text-[#2EA2B5]">
                      {t('gateway.shelf.subtitle', language)}
                    </p>
                    <p className="text-xs text-[#5E7A8A] dark:text-[#799CA9]">
                      {t('gateway.shelf.desc', language)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        signInAs('official');
                      }}
                      className="px-3.5 py-2 text-xs font-semibold bg-[#1F7280] hover:bg-[#17566A] text-white rounded-[2px] shadow-sm transition-colors"
                    >
                      1-Click Official Demo
                    </button>
                    <span className="text-xs font-semibold text-[#5E7A8A] group-hover:text-[#2EA2B5] transition-colors">
                      SSO Login &rarr;
                    </span>
                  </div>
                </div>
              </div>

              {/* Stratum 3: Abyss */}
              <div
                onMouseEnter={() => setHoveredStratum('analyst')}
                onMouseLeave={() => setHoveredStratum(null)}
                className="group relative border border-[#123149] bg-[#0E2230] text-[#EEF8F8] hover:border-[#38BDF8] p-5 sm:p-6 rounded-[2px] transition-all cursor-pointer shadow-md"
                onClick={() => handleStratumSelect('analyst')}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xl sm:text-2xl font-bold text-white">
                        {t('gateway.abyss.title', language)}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-[#071C2B] text-[#38BDF8] font-bold border border-[#38BDF8]/40">
                        DEPTH: 200m – 4000m+ &bull; ABYSSAL PLAIN
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#2EA2B5]">
                      {t('gateway.abyss.subtitle', language)}
                    </p>
                    <p className="text-xs text-[#799CA9]">
                      {t('gateway.abyss.desc', language)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        signInAs('analyst');
                      }}
                      className="px-3.5 py-2 text-xs font-bold bg-[#2EA2B5] hover:bg-[#1F7280] text-black rounded-[2px] shadow-sm transition-colors"
                    >
                      1-Click Analyst Demo
                    </button>
                    <span className="text-xs font-semibold text-[#799CA9] group-hover:text-[#38BDF8] transition-colors">
                      MFA Enter &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stratum Sign-In Doors */}
        {activeStratum && !isDescending && (
          <div className="w-full max-w-md mx-auto bg-white dark:bg-[#0E2A3C] text-[#0E2230] dark:text-[#EEF8F8] p-6 sm:p-8 rounded-[4px] border border-[#D3E2E1] dark:border-[#1E445C] shadow-2xl animate-in fade-in duration-300">
            <button
              type="button"
              onClick={() => setActiveStratum(null)}
              className="text-xs text-[#5E7A8A] dark:text-[#799CA9] hover:underline mb-4 flex items-center gap-1"
            >
              &larr; Back to operational depths
            </button>

            {/* Community Sign-In Form */}
            {activeStratum === 'user' && (
              <form onSubmit={handleCommunitySubmit} className="space-y-4">
                <div className="border-b border-[#D3E2E1] dark:border-[#1E445C] pb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#1F7280] dark:text-[#2EA2B5]" />
                    <h3 className="font-display text-xl font-bold text-[#0E2230] dark:text-[#EEF8F8]">
                      Community Portal Sign-in
                    </h3>
                  </div>
                  <p className="text-xs text-[#5E7A8A] dark:text-[#799CA9] mt-0.5">
                    For fishers, boat owners, aquaculture farmers, and coastal businesses.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#0E2230] dark:text-[#EEF8F8]">
                    Registered Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={communityPhone}
                      onChange={(e) => setCommunityPhone(e.target.value)}
                      required
                      placeholder="+91 94441 23890"
                      className="flex-1 px-3 py-2 text-sm border border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6] dark:bg-[#071C2B] rounded-[2px] font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-3 py-2 text-xs font-semibold bg-[#E5EFEF] dark:bg-[#14354B] text-[#1F7280] dark:text-[#2EA2B5] border border-[#1F7280]/30 hover:bg-[#1F7280] hover:text-white rounded-[2px] transition-colors shrink-0"
                    >
                      {otpDispatched ? 'Re-send OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpDispatched && (
                  <div className="p-2.5 bg-[#EBF7F4] dark:bg-[#07241C] border border-[#4ED39A]/40 rounded-[2px] flex items-center justify-between text-xs animate-in fade-in">
                    <span className="text-[#1B7F57] dark:text-[#4ED39A] font-medium">
                      Simulated SMS dispatched! Code: <strong>123456</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCommunityOtp('123456')}
                      className="text-[11px] font-bold text-[#1F7280] dark:text-[#2EA2B5] underline hover:no-underline"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium text-[#0E2230] dark:text-[#EEF8F8]">OTP Verification Code</label>
                    <button
                      type="button"
                      onClick={() => setCommunityOtp('123456')}
                      className="text-[11px] text-[#1F7280] dark:text-[#2EA2B5] hover:underline"
                    >
                      Demo code: 123456
                    </button>
                  </div>
                  <input
                    type="text"
                    value={communityOtp}
                    onChange={(e) => setCommunityOtp(e.target.value)}
                    placeholder="Enter 123456"
                    maxLength={6}
                    className="w-full px-3 py-2 text-sm font-mono tracking-widest text-center border border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6] dark:bg-[#071C2B] rounded-[2px]"
                  />
                </div>

                {authError && (
                  <div className="p-2 bg-[#FDF2F7] dark:bg-[#2B0E1E] border border-[#B3135F]/30 rounded text-xs text-[#B3135F] dark:text-[#FF6FA8]">
                    {authError}
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1F7280] hover:bg-[#17566A] text-white text-xs font-semibold rounded-[2px] shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Verify & Enter Community Portal
                  </button>
                  <button
                    type="button"
                    onClick={signInAsPublicViewer}
                    className="w-full py-2 border border-[#D3E2E1] dark:border-[#1E445C] text-xs font-medium hover:bg-[#E5EFEF] dark:hover:bg-[#14354B] rounded-[2px] transition-colors text-[#5E7A8A] dark:text-[#799CA9]"
                  >
                    Continue as public viewer (Read-only)
                  </button>
                </div>
              </form>
            )}

            {/* Officials Sign-In Form */}
            {activeStratum === 'official' && (
              <form onSubmit={handleOfficialSubmit} className="space-y-4">
                <div className="border-b border-[#D3E2E1] dark:border-[#1E445C] pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#1F7280] dark:text-[#2EA2B5]" />
                    <h3 className="font-display text-xl font-bold text-[#0E2230] dark:text-[#EEF8F8]">
                      Government Officials SSO
                    </h3>
                  </div>
                  <p className="text-xs text-[#5E7A8A] dark:text-[#799CA9] mt-0.5">
                    Department of Fisheries, Port Authority & Marine Enforcement.
                  </p>
                </div>

                {/* Pre-set Profiles */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#5E7A8A] dark:text-[#799CA9] uppercase tracking-wider">
                    Select Official Persona
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOfficialEmail('rajendran.ias@tnfisheries.gov.in');
                        setOfficialMfa('NIC-TN-SSO-89211');
                      }}
                      className={`p-2 text-left text-xs rounded border transition-colors ${
                        officialEmail.includes('rajendran')
                          ? 'border-[#1F7280] bg-[#1F7280]/10 font-bold text-[#1F7280] dark:text-[#2EA2B5]'
                          : 'border-[#D3E2E1] dark:border-[#1E445C] opacity-75'
                      }`}
                    >
                      <span className="block font-medium">Dr. V. Rajendran, IAS</span>
                      <span className="text-[10px] text-[#5E7A8A] dark:text-[#799CA9]">Director (Statewide)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOfficialEmail('jd.thoothukudi@tnfisheries.gov.in');
                        setOfficialMfa('NIC-TN-SSO-77142');
                      }}
                      className={`p-2 text-left text-xs rounded border transition-colors ${
                        officialEmail.includes('thoothukudi')
                          ? 'border-[#1F7280] bg-[#1F7280]/10 font-bold text-[#1F7280] dark:text-[#2EA2B5]'
                          : 'border-[#D3E2E1] dark:border-[#1E445C] opacity-75'
                      }`}
                    >
                      <span className="block font-medium">S. Revathi, JD</span>
                      <span className="text-[10px] text-[#5E7A8A] dark:text-[#799CA9]">Thoothukudi District</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#0E2230] dark:text-[#EEF8F8]">Government Email ID</label>
                  <input
                    type="email"
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6] dark:bg-[#071C2B] rounded-[2px] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium text-[#0E2230] dark:text-[#EEF8F8]">NIC-SSO Token / MFA</label>
                    <span className="text-[#1B7F57] dark:text-[#4ED39A] font-semibold text-[11px] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Validated
                    </span>
                  </div>
                  <input
                    type="text"
                    value={officialMfa}
                    onChange={(e) => setOfficialMfa(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6] dark:bg-[#071C2B] rounded-[2px]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1F7280] hover:bg-[#17566A] text-white text-xs font-semibold rounded-[2px] shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Shield className="w-4 h-4" />
                    Authenticate via NIC Government SSO
                  </button>
                </div>
              </form>
            )}

            {/* Analyst Sign-In Form */}
            {activeStratum === 'analyst' && (
              <form onSubmit={handleAnalystSubmit} className="space-y-4">
                <div className="border-b border-[#D3E2E1] dark:border-[#1E445C] pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#2EA2B5]" />
                    <h3 className="font-display text-xl font-bold text-[#0E2230] dark:text-[#EEF8F8]">
                      Analyst Console Authentication
                    </h3>
                  </div>
                  <p className="text-xs text-[#5E7A8A] dark:text-[#799CA9] mt-0.5">
                    Strict multi-factor sign-in (Password + TOTP + FIDO2 Hardware Key).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#0E2230] dark:text-[#EEF8F8]">Workstation Email</label>
                  <input
                    type="email"
                    value={analystEmail}
                    onChange={(e) => setAnalystEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6] dark:bg-[#071C2B] rounded-[2px] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#0E2230] dark:text-[#EEF8F8]">Master Password</label>
                  <input
                    type="password"
                    value={analystPass}
                    onChange={(e) => setAnalystPass(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6] dark:bg-[#071C2B] rounded-[2px]"
                  />
                </div>

                {/* TOTP 6-Digit Authenticator Field */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium text-[#0E2230] dark:text-[#EEF8F8]">
                      Authenticator TOTP (Time-Based Code)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAnalystTotp('892411')}
                      className="text-[11px] text-[#2EA2B5] hover:underline"
                    >
                      Demo code: 892411
                    </button>
                  </div>
                  <input
                    type="text"
                    value={analystTotp}
                    onChange={(e) => setAnalystTotp(e.target.value)}
                    placeholder="Enter 892411"
                    maxLength={6}
                    className="w-full px-3 py-2 text-sm font-mono tracking-widest text-center border border-[#D3E2E1] dark:border-[#1E445C] bg-[#F2F7F6] dark:bg-[#071C2B] rounded-[2px]"
                  />
                </div>

                {/* Simulated Hardware Key (FIDO2 WebAuthn) */}
                <div className="p-3 bg-[#E5EFEF] dark:bg-[#071C2B] border border-[#D3E2E1] dark:border-[#1E445C] rounded-[2px] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#2EA2B5]" />
                      Hardware Security Key (FIDO2)
                    </span>
                    {hardwareKeyTouched ? (
                      <span className="text-[#1B7F57] dark:text-[#4ED39A] font-semibold text-[11px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Touched &amp; Verified
                      </span>
                    ) : (
                      <span className="text-[#B26A00] dark:text-[#F5B93A] text-[11px] animate-pulse">
                        Waiting for physical key tap
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHardwareKeyTouched(true);
                      setAuthError('');
                    }}
                    className={`w-full py-2 text-xs font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 ${
                      hardwareKeyTouched
                        ? 'bg-[#1B7F57] text-white'
                        : 'bg-[#1F7280] text-white hover:bg-[#17566A]'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    {hardwareKeyTouched ? 'FIDO2 Security Key Authenticated' : 'Tap Simulated Security Key (FIDO2)'}
                  </button>
                </div>

                {authError && (
                  <div className="p-2 bg-[#FDF2F7] dark:bg-[#2B0E1E] border border-[#B3135F]/30 rounded text-xs text-[#B3135F] dark:text-[#FF6FA8]">
                    {authError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#2EA2B5] hover:bg-[#1F7280] text-black hover:text-white font-bold text-xs rounded-[2px] shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Unlock Analyst Console (15-min Session)
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Reviewer Quick Access Hint */}
      <div className="z-10 w-full max-w-4xl mx-auto border-t border-current/20 pt-3 text-[11px] opacity-75 flex flex-wrap items-center justify-between gap-2">
        <span>Reviewer quick demo access available for all roles with zero setup.</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => signInAs('user')}
            className="hover:underline font-semibold"
          >
            Enter Community
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => signInAs('official')}
            className="hover:underline font-semibold"
          >
            Enter Officials
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => signInAs('analyst')}
            className="hover:underline font-semibold"
          >
            Enter Analyst
          </button>
        </div>
      </div>
    </div>
  );
};

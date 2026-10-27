import React, { useState } from 'react';
import { useAppStore } from '../../services/store';
import { Harbour, Vessel } from '../../types';
import { Layers, Compass, AlertTriangle, Eye, Shield, Waves, Anchor, Info } from 'lucide-react';
import { ProvenancePopover } from '../common/ProvenancePopover';

interface TheChartProps {
  heightClass?: string;
  onSelectVessel?: (vessel: Vessel) => void;
  onSelectHarbour?: (harbour: Harbour) => void;
  selectedEntityId?: string;
  showControls?: boolean;
}

export const TheChart: React.FC<TheChartProps> = ({
  heightClass = 'h-[540px]',
  onSelectVessel,
  onSelectHarbour,
  selectedEntityId,
  showControls = true,
}) => {
  const { harbours, vessels, selectedJurisdiction } = useAppStore();

  // Layer toggles
  const [showBathymetry, setShowBathymetry] = useState(true);
  const [showClosures, setShowClosures] = useState(true);
  const [showMpa, setShowMpa] = useState(true);
  const [showPfz, setShowPfz] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [activeInspector, setActiveInspector] = useState<{
    type: 'vessel' | 'harbour' | 'zone' | 'sounding';
    title: string;
    details: Record<string, string>;
  } | null>(null);

  // Map coordinate conversion for Tamil Nadu coastline (Lat: 8.0 - 13.5 N, Lng: 77.0 - 81.0 E)
  // ViewBox: 0 0 900 680
  const latMin = 7.8, latMax = 13.6;
  const lngMin = 76.8, lngMax = 81.4;

  const project = (lat: number, lng: number): [number, number] => {
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 900;
    const y = ((latMax - lat) / (latMax - latMin)) * 680;
    return [x, y];
  };

  const filteredHarbours = harbours.filter(
    (h) => selectedJurisdiction === 'all' || h.district === selectedJurisdiction
  );

  const filteredVessels = vessels.filter(
    (v) => selectedJurisdiction === 'all' || v.district === selectedJurisdiction
  );

  return (
    <div className={`relative w-full ${heightClass} bg-[#0A2230] text-[#EEF8F8] overflow-hidden rounded-[2px] border border-[#1E445C] select-none flex flex-col`}>
      {/* Chart Top Navigation / Layer bar */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-wrap items-center gap-1.5 bg-[#071C2B]/95 backdrop-blur-md border border-[#1E445C] px-3 py-1.5 rounded-[2px] text-xs shadow-md">
        <span className="font-semibold text-[#EEF8F8] flex items-center gap-1.5 mr-1 text-[11px] uppercase tracking-wider font-mono">
          <Compass className="w-3.5 h-3.5 text-[#2EA2B5]" />
          Hydrographic Chart TN-01 &bull; INCOIS
        </span>
        <div className="h-3 w-[1px] bg-[#1E445C] mx-1" />

        {showControls && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setShowBathymetry(!showBathymetry)}
              className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                showBathymetry ? 'bg-[#1F7280] text-white font-medium' : 'text-[#799CA9] hover:text-white'
              }`}
            >
              Soundings
            </button>
            <button
              type="button"
              onClick={() => setShowClosures(!showClosures)}
              className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                showClosures ? 'bg-[#B3135F] text-white font-medium' : 'text-[#799CA9] hover:text-white'
              }`}
            >
              Closures
            </button>
            <button
              type="button"
              onClick={() => setShowMpa(!showMpa)}
              className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                showMpa ? 'bg-[#1B7F57] text-white font-medium' : 'text-[#799CA9] hover:text-white'
              }`}
            >
              MPA Sanctuary
            </button>
            <button
              type="button"
              onClick={() => setShowPfz(!showPfz)}
              className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                showPfz ? 'bg-[#2EA2B5] text-white font-medium' : 'text-[#799CA9] hover:text-white'
              }`}
            >
              PFZ Fronts
            </button>
            <button
              type="button"
              onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
              className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                showWeatherOverlay ? 'bg-[#F5B93A] text-[#0A2230] font-semibold' : 'text-[#799CA9] hover:text-white'
              }`}
            >
              SST Vectors
            </button>
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className={`px-2 py-0.5 rounded-[2px] border border-[#2EA2B5]/40 transition-colors ${
                showProfile ? 'bg-[#2EA2B5] text-[#071C2B] font-bold' : 'text-[#2EA2B5] hover:bg-[#14354B]'
              }`}
            >
              Seafloor Profile
            </button>
          </div>
        )}
      </div>

      {/* Bathymetric Depth Scale Legend */}
      <div className="absolute bottom-2.5 left-2.5 z-20 bg-[#071C2B]/85 backdrop-blur-sm border border-[#1E445C] px-2.5 py-1.5 rounded-[2px] text-[10px] space-y-1">
        <span className="font-semibold text-[#799CA9] uppercase block tracking-wider">Bathymetry (m)</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-2 bg-[#BFE6DF]/50 border border-[#BFE6DF]/70" />
          <span>0–10</span>
          <div className="w-3.5 h-2 bg-[#6CB9B8]/40 border border-[#6CB9B8]/60 ml-1" />
          <span>10–50</span>
          <div className="w-3.5 h-2 bg-[#1F7280]/40 border border-[#1F7280]/60 ml-1" />
          <span>50–200</span>
          <div className="w-3.5 h-2 bg-[#0A2A3E] border border-[#1E445C] ml-1" />
          <span>200+</span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="w-full h-full relative">
        <svg
          viewBox="0 0 900 680"
          className="w-full h-full cursor-crosshair"
          aria-label="Tamil Nadu Hydrographic Sea Chart"
        >
          <defs>
            {/* Pattern for Closure Zones (Hatched) */}
            <pattern id="hatch-closure" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#FF6FA8" strokeWidth="2.5" opacity="0.65" />
            </pattern>

            {/* Weather / Wind vector gradient */}
            <linearGradient id="sst-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#F5B93A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF6FA8" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Deep Sea Oceanic Background (Abyssal Plain) */}
          <rect width="900" height="680" fill="#071926" />

          {/* Bathymetry Bands: 200m+ Slope */}
          {showBathymetry && (
            <path
              d="M 620,0 Q 640,180 570,300 Q 520,400 460,540 Q 360,650 300,680 L 900,680 L 900,0 Z"
              fill="#0A2436"
              stroke="#143A52"
              strokeWidth="0.8"
            />
          )}

          {/* Bathymetry Bands: 50m-200m Continental Shelf */}
          {showBathymetry && (
            <path
              d="M 520,0 Q 550,160 480,280 Q 420,380 380,500 Q 280,620 220,680 L 620,680 Q 520,400 570,300 Z"
              fill="#123B50"
              stroke="#1C4F6B"
              strokeWidth="0.8"
            />
          )}

          {/* Bathymetry Bands: 10m-50m Inner Shelf */}
          {showBathymetry && (
            <path
              d="M 410,0 Q 440,150 380,260 Q 320,340 300,460 Q 210,580 160,680 L 220,680 Q 280,620 380,500 Q 420,380 480,280 Z"
              fill="#164A62"
              stroke="#246484"
              strokeWidth="0.7"
            />
          )}

          {/* Weather / SST gradient overlay */}
          {showWeatherOverlay && (
            <rect width="900" height="680" fill="url(#sst-gradient)" />
          )}

          {/* Tamil Nadu Coastline & Land Mass */}
          {/* Detailed realistic vector contours representing Coromandel, Palk Strait, and Gulf of Mannar */}
          <path
            d="M 0,0 L 370,0 
               Q 360,70 355,130 
               Q 345,210 320,290 
               Q 300,345 285,395 
               L 330,420 Q 360,425 380,440 L 350,455 Q 310,450 270,440 
               Q 250,480 230,530 
               Q 200,590 145,640 
               Q 115,665 90,680 
               L 0,680 Z"
            fill="#122533"
            stroke="#2B4E66"
            strokeWidth="1.5"
          />

          {/* Sri Lanka Landmass (Jaffna / Mannar Coast) */}
          <path
            d="M 440,360 Q 480,380 500,430 Q 520,490 490,560 Q 450,600 420,580 Q 410,510 420,440 Q 415,390 440,360 Z"
            fill="#122533"
            stroke="#2B4E66"
            strokeWidth="1.2"
          />

          {/* Land Topography Relief Contours (Eastern Ghats & Coastal Plain) */}
          <g opacity="0.35" stroke="#3D627D" fill="none">
            {/* 600m High Ridge Elevation */}
            <path d="M 0,120 Q 90,160 110,250 Q 80,380 40,510 L 0,550 Z" strokeWidth="0.8" />
            <text x="35" y="240" fill="#6B92A7" fontSize="8" fontFamily="monospace">600m el</text>
            {/* 300m Mid Elevation */}
            <path d="M 0,70 Q 140,120 180,240 Q 150,370 120,490 Q 70,580 0,620 Z" strokeWidth="0.8" strokeDasharray="3 3" />
            <text x="95" y="340" fill="#6B92A7" fontSize="8" fontFamily="monospace">300m el</text>
            {/* 100m Coastal Plain Margin */}
            <path d="M 50,0 Q 230,80 260,210 Q 240,320 200,430 Q 150,540 50,670 Z" strokeWidth="0.7" opacity="0.7" />
            <text x="175" y="220" fill="#6B92A7" fontSize="8" fontFamily="monospace">100m el</text>
          </g>

          {/* Detailed Bathymetric Isobaths with Stamped Depths */}
          {showBathymetry && (
            <g fill="none">
              {/* 10m Isobath */}
              <path
                d="M 390,0 Q 380,80 370,160 Q 350,250 330,320 Q 300,360 300,420 Q 260,470 240,520 Q 210,580 150,650 Q 120,670 100,680"
                stroke="#4DB3A2"
                strokeWidth="1"
                opacity="0.6"
              />
              <text x="362" y="150" fill="#4DB3A2" fontSize="8" fontFamily="monospace" opacity="0.85">10m</text>

              {/* 20m Isobath */}
              <path
                d="M 430,0 Q 420,90 400,180 Q 380,270 350,335 Q 320,380 315,440 Q 280,480 260,535 Q 225,600 165,665 L 120,680"
                stroke="#3CA39B"
                strokeWidth="0.9"
                opacity="0.65"
              />
              <text x="395" y="240" fill="#3CA39B" fontSize="8" fontFamily="monospace" opacity="0.85">20m</text>

              {/* 50m Isobath */}
              <path
                d="M 480,0 Q 470,110 440,210 Q 410,290 380,360 Q 340,420 330,480 Q 300,520 280,560 Q 240,620 185,680"
                stroke="#2B9194"
                strokeWidth="1"
                opacity="0.7"
              />
              <text x="435" y="215" fill="#2B9194" fontSize="8" fontFamily="monospace" opacity="0.9">50m</text>

              {/* 100m Isobath */}
              <path
                d="M 530,0 Q 520,130 480,240 Q 440,320 410,400 Q 370,470 350,520 Q 320,570 295,620 Q 255,660 210,680"
                stroke="#238189"
                strokeWidth="1.1"
                opacity="0.75"
              />
              <text x="475" y="255" fill="#238189" fontSize="8" fontFamily="monospace" opacity="0.9">100m</text>

              {/* 200m Continental Shelf Edge (Distinct Prominent Line) */}
              <path
                d="M 590,0 Q 580,150 530,270 Q 480,360 450,450 Q 410,530 380,580 Q 345,630 310,680"
                stroke="#2EA2B5"
                strokeWidth="1.6"
                strokeDasharray="6 2"
                opacity="0.9"
              />
              <text x="522" y="285" fill="#2EA2B5" fontSize="9" fontWeight="bold" fontFamily="monospace">200m (Shelf Break)</text>

              {/* 500m Slope Isobath */}
              <path
                d="M 660,0 Q 640,170 590,300 Q 540,400 500,500 Q 460,580 415,640 Q 380,670 360,680"
                stroke="#1B6D80"
                strokeWidth="1.1"
                opacity="0.75"
              />
              <text x="580" y="325" fill="#6CB9B8" fontSize="8" fontFamily="monospace">500m</text>

              {/* 1000m Bathyal Isobath */}
              <path
                d="M 740,0 Q 710,190 660,330 Q 600,440 560,540 Q 510,620 450,680"
                stroke="#155768"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <text x="650" y="360" fill="#6CB9B8" fontSize="8" fontFamily="monospace">1000m</text>

              {/* 2000m Abyssal Contour */}
              <path
                d="M 820,0 Q 780,210 730,360 Q 660,480 620,580 Q 560,650 520,680"
                stroke="#114554"
                strokeWidth="1.2"
                opacity="0.85"
              />
              <text x="720" y="390" fill="#6CB9B8" fontSize="8" fontFamily="monospace">2000m</text>
            </g>
          )}

          {/* Ornate Noble Mariner's Compass Rose in open Bay of Bengal */}
          <g transform="translate(750, 190) scale(0.85)" opacity="0.65" pointerEvents="none" select-none="true">
            {/* Outer Degree Scale Ring */}
            <circle cx="0" cy="0" r="80" stroke="#3D6880" strokeWidth="1.2" fill="none" />
            <circle cx="0" cy="0" r="74" stroke="#2B4E63" strokeWidth="0.8" strokeDasharray="1 3" fill="none" />
            <circle cx="0" cy="0" r="62" stroke="#2B4E63" strokeWidth="0.8" fill="none" />
            <circle cx="0" cy="0" r="32" stroke="#3D6880" strokeWidth="0.6" fill="none" />

            {/* 16-Point Compass Star */}
            {/* North Point (Fleur-de-lis styling) */}
            <polygon points="0,-80 10,-32 0,-12 -10,-32" fill="#2EA2B5" stroke="#1F7280" strokeWidth="0.8" />
            <polygon points="0,-80 0,-12 -10,-32" fill="#6CB9B8" />

            {/* South Point */}
            <polygon points="0,80 10,32 0,12 -10,32" fill="#17566A" stroke="#0E3947" strokeWidth="0.8" />
            <polygon points="0,80 0,12 10,32" fill="#0A2A3E" />

            {/* East Point */}
            <polygon points="80,0 32,10 12,0 32,-10" fill="#1F7280" stroke="#123B50" strokeWidth="0.8" />
            <polygon points="80,0 12,0 32,10" fill="#143A52" />

            {/* West Point */}
            <polygon points="-80,0 -32,10 -12,0 -32,-10" fill="#17566A" stroke="#0E3947" strokeWidth="0.8" />
            <polygon points="-80,0 -12,0 -32,-10" fill="#0A2A3E" />

            {/* Intermediate Points NE, NW, SE, SW */}
            <polygon points="56,-56 26,-10 0,0 10,-26" fill="#1A4A5E" opacity="0.75" />
            <polygon points="-56,-56 -26,-10 0,0 -10,-26" fill="#1A4A5E" opacity="0.75" />
            <polygon points="56,56 26,10 0,0 10,26" fill="#1A4A5E" opacity="0.75" />
            <polygon points="-56,56 -26,10 0,0 -10,26" fill="#1A4A5E" opacity="0.75" />

            {/* Compass Labels */}
            <text x="-4" y="-87" fill="#EEF8F8" fontSize="11" fontWeight="bold" fontFamily="serif">N</text>
            <text x="86" y="4" fill="#ADC6CF" fontSize="9" fontFamily="serif">E</text>
            <text x="-3" y="96" fill="#ADC6CF" fontSize="9" fontFamily="serif">S</text>
            <text x="-97" y="4" fill="#ADC6CF" fontSize="9" fontFamily="serif">W</text>

            {/* Magnetic Declination Text Inscription */}
            <text x="-48" y="112" fill="#6B92A7" fontSize="7" fontFamily="monospace">
              VAR 2°15'W (2026)
            </text>
          </g>

          {/* Graticule Latitude & Longitude Coordinate Neatline */}
          <g stroke="#1E445C" strokeWidth="0.5" strokeDasharray="3 6" opacity="0.4" fill="none">
            <line x1="200" y1="0" x2="200" y2="680" />
            <line x1="450" y1="0" x2="450" y2="680" />
            <line x1="700" y1="0" x2="700" y2="680" />
            <line x1="0" y1="150" x2="900" y2="150" />
            <line x1="0" y1="350" x2="900" y2="350" />
            <line x1="0" y1="550" x2="900" y2="550" />
          </g>
          <g fill="#5D7E91" fontSize="9" fontFamily="monospace" opacity="0.75">
            <text x="205" y="16">78°00'E</text>
            <text x="455" y="16">79°30'E</text>
            <text x="705" y="16">81°00'E</text>
            <text x="860" y="146">13°00'N</text>
            <text x="860" y="346">10°30'N</text>
            <text x="860" y="546">8°30'N</text>
          </g>

          {/* Water feature names in Newsreader serif italic */}
          <g className="font-display italic text-[#63879B] select-none pointer-events-none text-opacity-80">
            <text x="640" y="140" fill="#6B92A7" fontSize="16">Bay of Bengal</text>
            <text x="440" y="100" fill="#6B92A7" fontSize="13">Coromandel Coast</text>
            <text x="350" y="380" fill="#6B92A7" fontSize="12">Palk Bay</text>
            <text x="400" y="340" fill="#6B92A7" fontSize="12">Palk Strait</text>
            <text x="290" y="520" fill="#6B92A7" fontSize="14">Gulf of Mannar</text>
            <text x="160" y="660" fill="#6B92A7" fontSize="13">Laccadive Sea / Indian Ocean</text>
          </g>

          {/* Land labels in upright sans */}
          <g className="font-ui font-semibold text-[11px] fill-[#89A8BA] select-none pointer-events-none">
            <text x="270" y="135">CHENNAI</text>
            <text x="240" y="275">CUDDALORE</text>
            <text x="210" y="350">NAGAPATTINAM</text>
            <text x="180" y="445">RAMANATHAPURAM</text>
            <text x="145" y="555">THOOTHUKUDI</text>
            <text x="60" y="655">KANNIYAKUMARI</text>
            <text x="450" y="480">SRI LANKA</text>
          </g>

          {/* Sounding numeric depth labels (Sounding style) */}
          {showBathymetry && (
            <g className="text-[10px] font-mono fill-[#4C758C] select-none pointer-events-none opacity-75">
              <text x="420" y="70">8.4</text>
              <text x="500" y="90">14.2</text>
              <text x="610" y="110">68</text>
              <text x="740" y="130">240</text>
              <text x="400" y="210">11.8</text>
              <text x="490" y="230">36</text>
              <text x="620" y="260">180</text>
              <text x="760" y="300">1420</text>
              <text x="330" y="370">4.6</text>
              <text x="360" y="400">7.2</text>
              <text x="310" y="490">12.5</text>
              <text x="360" y="540">44</text>
              <text x="480" y="620">310</text>
              <text x="230" y="650">18.0</text>
            </g>
          )}

          {/* Marine Protected Area: Gulf of Mannar Biosphere Reserve (Dotted Outline) */}
          {showMpa && (
            <g>
              <polygon
                points="240,490 320,495 330,560 250,570"
                fill="#1B7F57"
                fillOpacity="0.18"
                stroke="#4ED39A"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                className="cursor-pointer hover:fill-opacity-30 transition-all"
                onClick={() =>
                  setActiveInspector({
                    type: 'zone',
                    title: 'Gulf of Mannar Marine National Park & Biosphere Reserve',
                    details: {
                      'Protection Tier': 'Tier 1 No-Take Marine Sanctuary',
                      'Jurisdiction': 'Ramanathapuram & Thoothukudi',
                      'Status': 'Strict Mechanised Ban (21 Coral Islands)',
                      'Active Patrol': 'ICGS Rani Abbakka & Forest Dept Interceptor',
                    },
                  })
                }
              />
              <text x="245" y="535" fill="#4ED39A" fontSize="9" fontWeight="bold">
                MPA: GULF OF MANNAR
              </text>
            </g>
          )}

          {/* Closure Zone: Hatched Monsoon / Mechanized Trawler Closure */}
          {showClosures && (
            <g>
              <polygon
                points="360,80 540,90 510,240 340,230"
                fill="url(#hatch-closure)"
                stroke="#FF6FA8"
                strokeWidth="1.8"
                className="cursor-pointer hover:opacity-90 transition-all"
                onClick={() =>
                  setActiveInspector({
                    type: 'zone',
                    title: 'Coromandel Coastal Juvenile Closure Zone',
                    details: {
                      'Regulation': 'Section 4(2) TN Marine Fisheries Act',
                      'Species Covered': 'Silver pomfret & King seer juveniles',
                      'Effective Until': '15 Nov 2026',
                      'Target Fleet': 'Trawlers > 25 GT prohibited',
                    },
                  })
                }
              />
              <text x="375" y="165" fill="#FF6FA8" fontSize="10" fontWeight="bold">
                CLOSURE: COROMANDEL ZONE
              </text>
            </g>
          )}

          {/* Potential Fishing Zone (PFZ): Solid Translucent Shoal Polygon */}
          {showPfz && (
            <g>
              <polygon
                points="390,270 470,285 450,335 375,320"
                fill="#2EA2B5"
                fillOpacity="0.25"
                stroke="#6CB9B8"
                strokeWidth="1.5"
                className="cursor-pointer hover:fill-opacity-40 transition-all"
                onClick={() =>
                  setActiveInspector({
                    type: 'zone',
                    title: 'Nagapattinam Potential Fishing Zone (PFZ-26)',
                    details: {
                      'Ocean Feature': 'Thermal chlorophyll front',
                      'Distance': '36 km ESE of Nagapattinam (110°)',
                      'Target Species': 'Indian mackerel, anchovy, squid',
                      'Sea Surface Temp': '28.9°C with upwelling gradient',
                    },
                  })
                }
              />
              <text x="395" y="305" fill="#6CB9B8" fontSize="9" fontWeight="bold">
                PFZ: CHLOROPHYLL FRONT
              </text>
            </g>
          )}

          {/* Vessel Traces & Markers */}
          {showVessels &&
            filteredVessels.map((v) => {
              const [vx, vy] = project(v.coordinates[0], v.coordinates[1]);
              const isSelected = selectedEntityId === v.id;

              // Color based on compliance status
              let color = '#4ED39A'; // healthy green
              if (v.complianceStatus === 'geofence_breach') color = '#FF6FA8'; // magenta
              else if (v.complianceStatus === 'transponder_gap' || v.complianceStatus === 'closed_season_suspect')
                color = '#F5B93A'; // caution amber

              // Render trail
              const trailPoints = v.trail.map((t) => project(t[0], t[1])).map((pt) => `${pt[0]},${pt[1]}`).join(' ');

              return (
                <g
                  key={v.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    if (onSelectVessel) onSelectVessel(v);
                    setActiveInspector({
                      type: 'vessel',
                      title: v.name,
                      details: {
                        'Registration': v.registrationNo,
                        'Vessel Type': v.type,
                        'Speed / Heading': `${v.speedKnots} knots @ ${v.headingDegrees}°`,
                        'Home Port': v.homeHarbourId,
                        'Compliance': v.complianceStatus,
                        'Crew Count': `${v.crewCount} personnel`,
                        'Last Seen': `${v.lastSeenMinutesAgo} mins ago`,
                      },
                    });
                  }}
                >
                  {/* Faint trail */}
                  {trailPoints && (
                    <polyline
                      points={trailPoints}
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      strokeOpacity="0.45"
                      strokeDasharray="2 3"
                    />
                  )}

                  {/* Heading tick needle */}
                  <line
                    x1={vx}
                    y1={vy}
                    x2={vx + Math.sin((v.headingDegrees * Math.PI) / 180) * 12}
                    y2={vy - Math.cos((v.headingDegrees * Math.PI) / 180) * 12}
                    stroke={color}
                    strokeWidth="1.8"
                  />

                  {/* Vessel Point */}
                  <circle
                    cx={vx}
                    cy={vy}
                    r={isSelected ? 6 : 4}
                    fill={color}
                    stroke="#071C2B"
                    strokeWidth="1.5"
                  />

                  {/* Active selection glow or pulse ring for anomalies */}
                  {v.complianceStatus !== 'compliant' && (
                    <circle
                      cx={vx}
                      cy={vy}
                      r="9"
                      fill="none"
                      stroke={color}
                      strokeWidth="1"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Vessel Name Label on Hover/Select */}
                  <text
                    x={vx + 8}
                    y={vy + 4}
                    fill="#EEF8F8"
                    fontSize="10"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-black font-mono select-none pointer-events-none"
                  >
                    {v.name} ({v.speedKnots}kt)
                  </text>
                </g>
              );
            })}

          {/* Harbour Anchor Points */}
          {filteredHarbours.map((h) => {
            const [hx, hy] = project(h.coordinates[0], h.coordinates[1]);
            const isSelected = selectedEntityId === h.id;

            let verdictColor = '#4ED39A'; // go
            if (h.seaStateVerdict === 'caution') verdictColor = '#F5B93A';
            if (h.seaStateVerdict === 'stay_ashore') verdictColor = '#FF6FA8';

            return (
              <g
                key={h.id}
                className="cursor-pointer group"
                onClick={() => {
                  if (onSelectHarbour) onSelectHarbour(h);
                  setActiveInspector({
                    type: 'harbour',
                    title: h.name,
                    details: {
                      'Sea Verdict': h.seaStateVerdict.toUpperCase(),
                      'Condition': h.verdictReason,
                      'Wave Height': `${h.waveHeightM} meters`,
                      'Wind Speed': `${h.windKnots} knots`,
                      'Water Temp': `${h.sstCelsius}°C`,
                      'PFZ Vector': h.pfzBearingKm,
                    },
                  });
                }}
              >
                <circle
                  cx={hx}
                  cy={hy}
                  r={isSelected ? 7 : 5}
                  fill="#0E2A3C"
                  stroke={verdictColor}
                  strokeWidth="2"
                />
                <circle cx={hx} cy={hy} r="2" fill={verdictColor} />

                {/* Harbour Label */}
                <text
                  x={hx + 8}
                  y={hy + 3}
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="600"
                  className="font-ui drop-shadow-md select-none pointer-events-none"
                >
                  {h.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Interactive Bathymetric Cross-Section Profile (Topographic Sounding Transect) */}
        {showProfile && (
          <div className="absolute top-12 right-2.5 z-30 w-80 sm:w-96 bg-[#071C2B]/95 backdrop-blur-md border border-[#2EA2B5]/50 rounded-[2px] p-3 shadow-2xl text-xs font-mono animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#1E445C] pb-1.5 mb-2">
              <span className="font-bold text-[#38BDF8] flex items-center gap-1.5 text-[11px] uppercase">
                <Compass className="w-3.5 h-3.5 text-[#2EA2B5]" />
                Coromandel Bathymetric Cross-Section Transect
              </span>
              <button
                type="button"
                onClick={() => setShowProfile(false)}
                className="text-[#799CA9] hover:text-white px-1"
                aria-label="Close seafloor profile"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-[#8DA8BA] leading-tight">
                Transect: 13°12'N Kasimedu Wharf &rarr; 80°29'E Bay of Bengal Abyssal Trench (120 km offshore)
              </p>

              {/* Bathymetry Profile SVG */}
              <div className="w-full h-28 bg-[#05141F] border border-[#123149] rounded-[2px] p-1 relative">
                <svg viewBox="0 0 320 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="profileGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2EA2B5" stopOpacity="0.6" />
                      <stop offset="35%" stopColor="#1F7280" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#071926" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* Sea Surface Line */}
                  <line x1="10" y1="15" x2="310" y2="15" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="12" y="12" fill="#38BDF8" fontSize="7">0m (Surface)</text>

                  {/* Thermocline line */}
                  <line x1="10" y1="35" x2="310" y2="35" stroke="#F5B93A" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.6" />
                  <text x="120" y="32" fill="#F5B93A" fontSize="6">Thermocline Layer (28°C &rarr; 12°C)</text>

                  {/* Seafloor Profile Slope */}
                  {/* Continental Shelf (0 - 45km), Slope Break (45 - 75km), Rise & Abyssal Trench (75 - 120km) */}
                  <path
                    d="M 10,18 L 80,26 L 130,42 L 180,78 L 240,88 L 310,92 L 310,100 L 10,100 Z"
                    fill="url(#profileGradient)"
                    stroke="#4ED39A"
                    strokeWidth="1.2"
                  />

                  {/* Depth Reference Markers */}
                  <circle cx="80" cy="26" r="2" fill="#2EA2B5" />
                  <text x="75" y="22" fill="#2EA2B5" fontSize="6">50m</text>

                  <circle cx="130" cy="42" r="2.5" fill="#FF6FA8" />
                  <text x="115" y="52" fill="#FF6FA8" fontSize="6" fontWeight="bold">200m Shelf Break</text>

                  <circle cx="180" cy="78" r="2" fill="#6CB9B8" />
                  <text x="185" y="76" fill="#6CB9B8" fontSize="6">1200m Slope</text>

                  <circle cx="280" cy="90" r="2" fill="#38BDF8" />
                  <text x="245" y="86" fill="#38BDF8" fontSize="6">2800m Trench</text>
                </svg>
              </div>

              {/* Zonation Statistics */}
              <div className="grid grid-cols-3 gap-1 text-[9px] pt-1 border-t border-[#1E445C] text-[#8DA8BA]">
                <div>
                  <span className="text-[#4ED39A] font-bold block">EPIPELAGIC</span>
                  <span>0 - 200m &bull; Trawlers</span>
                </div>
                <div>
                  <span className="text-[#2EA2B5] font-bold block">MESOPELAGIC</span>
                  <span>200 - 1000m &bull; Tuna</span>
                </div>
                <div>
                  <span className="text-[#38BDF8] font-bold block">BATHYAL</span>
                  <span>1000m+ &bull; Deep Benthic</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Entity Inspector Floating HUD */}
        {activeInspector && (
          <div className="absolute bottom-3 right-3 z-30 w-72 bg-[#071C2B]/95 backdrop-blur-md border border-[#1E445C] rounded-[4px] p-3 text-xs shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#1E445C] pb-1.5 mb-2">
              <span className="font-semibold text-[#EEF8F8] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#2EA2B5]" />
                {activeInspector.title}
              </span>
              <button
                type="button"
                onClick={() => setActiveInspector(null)}
                className="text-[#799CA9] hover:text-white px-1"
                aria-label="Close inspector"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-[11px]">
              {Object.entries(activeInspector.details).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-[#1E445C]/40 pb-0.5">
                  <span className="text-[#799CA9]">{key}:</span>
                  <span className="font-medium text-[#EEF8F8] text-right truncate max-w-[140px]">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Chart Footer Metadata */}
      <div className="bg-[#071C2B] px-3 py-1.5 border-t border-[#1E445C] flex items-center justify-between text-[11px] text-[#799CA9]">
        <div className="flex items-center gap-3">
          <span>Projection: WGS84 Mercator Hydro-TN</span>
          <span className="hidden sm:inline">Active Telemetry: {filteredVessels.length} vessels</span>
        </div>
        <ProvenancePopover
          provenance={{
            source: 'Hydrographic Office of India & INCOIS Ocean State Altimetry',
            lastUpdated: 'Live Telemetry (12s refresh)',
            qualityScore: 99,
            slaStatus: 'fresh',
          }}
        />
      </div>
    </div>
  );
};

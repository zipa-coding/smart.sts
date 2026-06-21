import React from "react";

interface SmpIslamSmartLogoProps {
  className?: string;
  size?: number | string;
}

export default function SmpIslamSmartLogo({ className = "", size = "100%" }: SmpIslamSmartLogoProps) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      width={size} 
      height={size} 
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      id="smp-islam-smart-logo"
    >
      {/* 1. TOP COGNITIVE CANOPY (Concentric Navy Arch above the Circle) */}
      <path 
        d="M 38.6 67.0 L 30.4 61.2 A 85 85 0 0 1 169.6 61.2 L 161.4 67.0 A 75 75 0 0 0 38.6 67.0 Z" 
        fill="#0B2A4A" 
        stroke="#D4AF37" 
        strokeWidth="1.8" 
        strokeLinejoin="round"
      />

      {/* Double Concentric Gold Wings inside Left Canopy */}
      <path 
        d="M 36.1 65.3 A 78 78 0 0 1 67.0 39.3" 
        fill="none" 
        stroke="#D4AF37" 
        strokeWidth="1.2" 
      />
      <path 
        d="M 32.8 63.0 A 82 82 0 0 1 65.3 35.7" 
        fill="none" 
        stroke="#D4AF37" 
        strokeWidth="1.2" 
      />

      {/* Double Concentric Gold Wings inside Right Canopy */}
      <path 
        d="M 133.0 39.3 A 78 78 0 0 1 163.9 65.3" 
        fill="none" 
        stroke="#D4AF37" 
        strokeWidth="1.2" 
      />
      <path 
        d="M 134.7 35.7 A 82 82 0 0 1 167.2 63.0" 
        fill="none" 
        stroke="#D4AF37" 
        strokeWidth="1.2" 
      />

      {/* Topmost central star on canopy */}
      <polygon points="100,25 101.4,28.5 105,28.5 102,30.5 103.2,34 100,32 96.8,34 98,30.5 95,28.5 98.6,28.5" fill="#D4AF37" />

      {/* 2. MAIN BLUE CIRCLE */}
      {/* Outer Golden Border Rim */}
      <circle cx="100" cy="110" r="75" fill="#0B2A4A" stroke="#D4AF37" strokeWidth="2.2" />
      
      {/* Fine Golden Concentric Ring inside the Navy Band */}
      <circle cx="100" cy="110" r="71" fill="none" stroke="#D4AF37" strokeWidth="1" />
      
      {/* Inner White Core Circle with Double Gold Border */}
      <circle cx="100" cy="110" r="51" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="2" />

      {/* 3. ARCUATED TEXT PATHS */}
      {/* Curved top path for "SMP ISLAM SMART" */}
      <path 
        id="topTextPathNew" 
        d="M 38 110 A 62 62 0 0 1 162 110" 
        fill="none"
        stroke="transparent"
      />
      {/* Curved bottom path for "PANGKALPINANG", matching top flow */}
      <path 
        id="bottomTextPathNew" 
        d="M 162 110 A 62 62 0 0 1 38 110" 
        fill="none"
        stroke="transparent"
      />
      
      {/* Top Text: SMP ISLAM SMART */}
      <text fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.8">
        <textPath href="#topTextPathNew" startOffset="50%" textAnchor="middle">
          SMP ISLAM SMART
        </textPath>
      </text>
      
      {/* Bottom Text: PANGKALPINANG */}
      <text fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.8">
        <textPath href="#bottomTextPathNew" startOffset="50%" textAnchor="middle">
          PANGKALPINANG
        </textPath>
      </text>

      {/* 4. MIDBAND SIDE STARS */}
      {/* Left side star */}
      <polygon points="37,106 38.1,108.7 41,108.7 38.7,110.3 39.6,113 37,111.4 34.4,113 35.3,110.3 33,108.7 35.9,108.7" fill="#D4AF37" />
      
      {/* Right side star */}
      <polygon points="163,106 164.1,108.7 167,108.7 164.7,110.3 165.6,113 163,111.4 160.4,113 161.3,110.3 159,108.7 161.9,108.7" fill="#D4AF37" />

      {/* 5. CENTER WHITE CORE CONTENT */}
      {/* Inner Central Top Star (under inner ring) */}
      <polygon points="100,66 101.1,68.7 104,68.7 101.7,70.3 102.6,73 100,71.4 97.4,73 98.3,68.7 96,68.7 98.9,68.7" fill="#D4AF37" />

      {/* Fountain Pen Nib pointing upwards */}
      <path 
        d="M 100 74 L 109 88 L 109 102 L 105 104 L 95 104 L 91 102 L 91 88 Z" 
        fill="#D4AF37" 
      />
      {/* Nib ink split line and breather hole */}
      <line x1="100" y1="75" x2="100" y2="93.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="100" cy="94" r="1.8" fill="#FFFFFF" />
      
      {/* Pen holder collar ring */}
      <rect x="94" y="104" width="12" height="2.5" rx="1" fill="#B17B1E" />

      {/* Open Book pages */}
      {/* Left page shadow */}
      <path 
        d="M 100 126 C 84 121, 70 110, 64 116 L 64 130 C 70 124, 84 135, 100 140 Z" 
        fill="#B17B1E"
      />
      {/* Left page main */}
      <path 
        d="M 100 122 C 84 117, 70 106, 62 112 L 62 126 C 70 120, 84 131, 100 136 Z" 
        fill="#D4AF37"
      />
      {/* Left page inner margin line (highlight) */}
      <path 
        d="M 97 123 C 83 119, 72 110, 65 115 L 65 123 C 71 118, 83 127, 97 132" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="0.8" 
        strokeLinecap="round" 
        opacity="0.45"
      />

      {/* Right page shadow */}
      <path 
        d="M 100 126 C 116 121, 130 110, 136 116 L 136 130 C 130 124, 116 135, 100 140 Z" 
        fill="#B17B1E"
      />
      {/* Right page main */}
      <path 
        d="M 100 122 C 116 117, 130 106, 138 112 L 138 126 C 130 120, 116 131, 100 136 Z" 
        fill="#D4AF37"
      />
      {/* Right page inner margin line (highlight) */}
      <path 
        d="M 103 123 C 117 119, 128 110, 135 115 L 135 123 C 129 118, 117 127, 103 132" 
        fill="none" 
        stroke="#FFFFFF" 
        strokeWidth="0.8" 
        strokeLinecap="round" 
        opacity="0.45"
      />

      {/* Book spine middle separator */}
      <rect x="98.5" y="108" width="3" height="32" rx="1.5" fill="#B17B1E" />
    </svg>
  );
}

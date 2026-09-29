// High-resolution SVG Avatars encoded for instant zero-dependency rendering
export const AVATAR_PRESETS = [
  {
    id: 'original',
    name: 'Original Classic',
    type: 'image',
    category: 'Classic',
    url: null, // Will use default avatar.png
  },
  {
    id: 'cyber-architect',
    name: 'Cyber Architect',
    type: 'svg',
    category: 'Neo-Fintech',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg_ca" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#312E81"/>
          <stop offset="100%" stop-color="#4338CA"/>
        </linearGradient>
        <linearGradient id="vis_ca" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#818CF8"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#bg_ca)"/>
      <circle cx="50" cy="38" r="19" fill="#E2E8F0"/>
      <rect x="36" y="32" width="28" height="9" rx="4.5" fill="url(#vis_ca)"/>
      <circle cx="43" cy="36.5" r="2.5" fill="#FFFFFF"/>
      <circle cx="57" cy="36.5" r="2.5" fill="#FFFFFF"/>
      <path d="M22 84C22 68 35 60 50 60C65 60 78 68 78 84" fill="#1E1B4B" stroke="#6366F1" stroke-width="2.5"/>
      <polygon points="50,65 44,78 56,78" fill="#38BDF8"/>
    </svg>`
  },
  {
    id: 'crypto-whale',
    name: 'Crypto Whale',
    type: 'svg',
    category: 'Web3 & Crypto',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg_cw" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#581C87"/>
          <stop offset="100%" stop-color="#1E1B4B"/>
        </linearGradient>
        <linearGradient id="glow_cw" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C084FC"/>
          <stop offset="100%" stop-color="#F43F5E"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#bg_cw)"/>
      <circle cx="50" cy="40" r="18" fill="#F8FAFC"/>
      <path d="M42 38L47 43L58 32" stroke="#9333EA" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="34" y="30" width="32" height="12" rx="6" fill="#1E1B4B" stroke="#C084FC" stroke-width="1.5"/>
      <circle cx="42" cy="36" r="2" fill="#38BDF8"/>
      <circle cx="58" cy="36" r="2" fill="#38BDF8"/>
      <path d="M24 86C24 70 36 62 50 62C64 62 76 70 76 86" fill="url(#glow_cw)"/>
      <circle cx="50" cy="74" r="5" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'wealth-executive',
    name: 'Wealth Executive',
    type: 'svg',
    category: 'Private Wealth',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg_we" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064E3B"/>
          <stop offset="100%" stop-color="#022C22"/>
        </linearGradient>
        <linearGradient id="tie_we" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10B981"/>
          <stop offset="100%" stop-color="#059669"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#bg_we)"/>
      <circle cx="50" cy="36" r="17" fill="#FDE68A"/>
      <path d="M38 34C38 34 43 37 50 37C57 37 62 34 62 34" stroke="#78350F" stroke-width="2" stroke-linecap="round"/>
      <path d="M33 28C35 22 42 20 50 20C58 20 65 22 67 28" fill="#78350F"/>
      <path d="M22 86C22 68 34 60 50 60C66 60 78 68 78 86" fill="#0F172A"/>
      <polygon points="50,60 44,72 50,86 56,72" fill="url(#tie_we)"/>
      <polygon points="46,60 54,60 52,66 48,66" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'gold-investor',
    name: 'Gold Investor',
    type: 'svg',
    category: 'Commodities',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg_gi" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#78350F"/>
          <stop offset="100%" stop-color="#451A03"/>
        </linearGradient>
        <linearGradient id="gold_gi" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE047"/>
          <stop offset="100%" stop-color="#D97706"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#bg_gi)"/>
      <circle cx="50" cy="38" r="18" fill="#FED7AA"/>
      <path d="M38 23L50 17L62 23L58 28L42 28Z" fill="url(#gold_gi)"/>
      <circle cx="50" cy="20" r="2" fill="#FFFFFF"/>
      <path d="M22 86C22 68 34 61 50 61C66 61 78 68 78 86" fill="url(#gold_gi)"/>
      <circle cx="50" cy="73" r="6" fill="#78350F"/>
      <path d="M49 70V76M47 71.5H53M47 74.5H53" stroke="#FDE047" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'cyberpunk-analyst',
    name: 'Cyberpunk Analyst',
    type: 'svg',
    category: 'Quant & Algorithmic',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg_cp" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#831843"/>
          <stop offset="100%" stop-color="#18181B"/>
        </linearGradient>
        <linearGradient id="neon_cp" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#F43F5E"/>
          <stop offset="100%" stop-color="#FB7185"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#bg_cp)"/>
      <circle cx="50" cy="38" r="18" fill="#F472B6"/>
      <path d="M34 26C38 18 62 18 66 26C66 26 62 30 50 30C38 30 34 26 34 26Z" fill="#F43F5E"/>
      <rect x="35" y="34" width="30" height="9" rx="4.5" fill="#18181B" stroke="#FB7185" stroke-width="1.5"/>
      <circle cx="43" cy="38.5" r="2" fill="#38BDF8"/>
      <circle cx="57" cy="38.5" r="2" fill="#38BDF8"/>
      <path d="M22 86C22 68 34 60 50 60C66 60 78 68 78 86" fill="#18181B" stroke="url(#neon_cp)" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'titanium-minimalist',
    name: 'Titanium Minimalist',
    type: 'svg',
    category: 'Modernist',
    svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg_tm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#bg_tm)"/>
      <circle cx="50" cy="38" r="18" fill="#E2E8F0"/>
      <path d="M22 86C22 68 34 60 50 60C66 60 78 68 78 86" fill="#64748B"/>
      <circle cx="50" cy="38" r="13" fill="#0F172A"/>
      <circle cx="50" cy="38" r="7" fill="#38BDF8"/>
    </svg>`
  }
];

export const AURA_COLORS = [
  { id: 'emerald', name: 'Emerald Glow', color: '#10B981', ringGradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', shadow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'violet', name: 'Neon Violet', color: '#8B5CF6', ringGradient: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', shadow: 'rgba(168, 85, 247, 0.4)' },
  { id: 'cyan', name: 'Cyber Cyan', color: '#06B6D4', ringGradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)', shadow: 'rgba(14, 165, 233, 0.4)' },
  { id: 'rose', name: 'Rose Gold', color: '#F43F5E', ringGradient: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)', shadow: 'rgba(244, 63, 94, 0.4)' },
  { id: 'amber', name: 'Sunset Amber', color: '#F59E0B', ringGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', shadow: 'rgba(245, 158, 11, 0.4)' },
];

export const ROLE_PRESETS = [
  'Wealth Builder',
  'Portfolio Lead',
  'Crypto Investor',
  'Financial Freedom',
  'Day Trader',
  'Angel Investor',
  'Capital Allocator'
];

/**
 * Helper to render avatar safely whether it's SVG string, custom image URL, or default asset
 */
export function getAvatarDataUrl(svgString) {
  if (!svgString) return null;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

import { NextRequest, NextResponse } from 'next/server';

// Generate a share card as SVG (can be converted to image client-side)
export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || 'Jogador';
    const points = url.searchParams.get('points') || '0';
    const accuracy = url.searchParams.get('accuracy') || '0';
    const city = url.searchParams.get('city') || '';
    const rank = url.searchParams.get('rank') || '-';
    const level = url.searchParams.get('level') || '1';
    const levelName = url.searchParams.get('levelName') || 'Ouvinte';

    const grade = parseInt(accuracy) === 100 ? 'PERFEITO!' : parseInt(accuracy) >= 80 ? 'EXCELENTE' : parseInt(accuracy) >= 60 ? 'BOM' : 'TENTE NOVAMENTE';
    const gradeColor = parseInt(accuracy) === 100 ? '#c9a227' : parseInt(accuracy) >= 80 ? '#2ecc71' : parseInt(accuracy) >= 60 ? '#c9a227' : '#e74c3c';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d0b2e"/>
      <stop offset="40%" stop-color="#1a0a4a"/>
      <stop offset="100%" stop-color="#0d1b4a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c9a227"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#bg)"/>
  <rect x="0" y="0" width="600" height="4" fill="url(#gold)"/>
  <rect x="0" y="396" width="600" height="4" fill="url(#gold)"/>

  <!-- Logo -->
  <rect x="258" y="20" width="4" height="20" rx="1" fill="#c9a227"/>
  <rect x="250" y="27" width="20" height="4" rx="1" fill="#c9a227"/>
  <text x="300" y="62" text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="700" fill="#ffffff">O Discípulo</text>

  <!-- Grade -->
  <text x="300" y="100" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="800" fill="${gradeColor}">${grade}</text>

  <!-- City -->
  ${city ? `<text x="300" y="125" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">${city}</text>` : ''}

  <!-- Stats boxes -->
  <rect x="40" y="145" width="160" height="90" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(201,162,39,0.35)" stroke-width="1"/>
  <text x="120" y="175" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#c9a227" font-weight="700">PONTOS</text>
  <text x="120" y="215" text-anchor="middle" font-family="Georgia,serif" font-size="32" font-weight="800" fill="#ffffff">${points}</text>

  <rect x="220" y="145" width="160" height="90" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(201,162,39,0.35)" stroke-width="1"/>
  <text x="300" y="175" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#c9a227" font-weight="700">PRECISÃO</text>
  <text x="300" y="215" text-anchor="middle" font-family="Georgia,serif" font-size="32" font-weight="800" fill="${parseInt(accuracy) >= 80 ? '#2ecc71' : '#c9a227'}">${accuracy}%</text>

  <rect x="400" y="145" width="160" height="90" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(201,162,39,0.35)" stroke-width="1"/>
  <text x="480" y="175" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#c9a227" font-weight="700">RANKING</text>
  <text x="480" y="215" text-anchor="middle" font-family="Georgia,serif" font-size="32" font-weight="800" fill="#ffffff">#${rank}</text>

  <!-- Player info -->
  <circle cx="200" cy="290" r="24" fill="url(#gold)"/>
  <text x="200" y="297" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="800" fill="#1a0a4a">${name.charAt(0).toUpperCase()}</text>
  <text x="240" y="283" font-family="Georgia,serif" font-size="18" font-weight="700" fill="#ffffff">${name}</text>
  <text x="240" y="303" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.5)">Nível ${level} · ${levelName}</text>

  <!-- CTA -->
  <rect x="150" y="340" width="300" height="36" rx="10" fill="url(#gold)"/>
  <text x="300" y="363" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#1a0a4a">Jogue em disciplegame.com</text>
</svg>`;

    return new NextResponse(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}

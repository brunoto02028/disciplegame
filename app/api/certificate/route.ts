import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { mockStore, getCitiesByCircuit, getCompletedCityIds } from '@/lib/mockDb';
import { getUserGamification } from '@/lib/gamification';

const MVP_CIRCUIT_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const user = mockStore.users.get(session.userId);
    if (!user) return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });

    const cities = getCitiesByCircuit(MVP_CIRCUIT_ID);
    const completedIds = getCompletedCityIds(session.userId, MVP_CIRCUIT_ID);
    const allCompleted = cities.length > 0 && completedIds.length >= cities.length;
    const gam = getUserGamification(session.userId);

    const date = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const citiesText = cities.map(c => c.name).join(' · ');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d0b2e"/>
      <stop offset="50%" stop-color="#1a0a4a"/>
      <stop offset="100%" stop-color="#0d1b4a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c9a227"/>
      <stop offset="100%" stop-color="#8b6914"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="560" fill="url(#bg)"/>

  <!-- Gold border -->
  <rect x="16" y="16" width="768" height="528" rx="16" fill="none" stroke="url(#gold)" stroke-width="2"/>
  <rect x="24" y="24" width="752" height="512" rx="12" fill="none" stroke="rgba(201,162,39,0.3)" stroke-width="1"/>

  <!-- Corner ornaments -->
  <rect x="36" y="36" width="20" height="2" fill="#c9a227"/>
  <rect x="36" y="36" width="2" height="20" fill="#c9a227"/>
  <rect x="744" y="36" width="20" height="2" fill="#c9a227"/>
  <rect x="762" y="36" width="2" height="20" fill="#c9a227"/>
  <rect x="36" y="522" width="20" height="2" fill="#c9a227"/>
  <rect x="36" y="504" width="2" height="20" fill="#c9a227"/>
  <rect x="744" y="522" width="20" height="2" fill="#c9a227"/>
  <rect x="762" y="504" width="2" height="20" fill="#c9a227"/>

  <!-- Cross logo -->
  <rect x="388" y="50" width="24" height="4" rx="1" fill="#c9a227"/>
  <rect x="398" y="42" width="4" height="20" rx="1" fill="#c9a227"/>

  <!-- Title -->
  <text x="400" y="95" text-anchor="middle" font-family="Georgia,serif" font-size="14" fill="rgba(201,162,39,0.7)" letter-spacing="4" font-weight="700">CERTIFICADO DE</text>
  <text x="400" y="135" text-anchor="middle" font-family="Georgia,serif" font-size="36" font-weight="800" fill="#ffffff">Peregrino Digital</text>

  <!-- Divider -->
  <line x1="300" y1="155" x2="500" y2="155" stroke="rgba(201,162,39,0.4)" stroke-width="1"/>

  <!-- Attestation text -->
  <text x="400" y="190" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.5)">Certificamos que</text>

  <!-- Name -->
  <text x="400" y="230" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="800" fill="#c9a227">${user.name}</text>

  <!-- Description -->
  <text x="400" y="265" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.55)">completou com sucesso a Jornada das Viagens Missionárias do Apóstolo Paulo</text>
  <text x="400" y="285" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="rgba(255,255,255,0.55)">no jogo O Discípulo — Gamificação de Turismo Religioso</text>

  <!-- Cities visited -->
  <text x="400" y="320" text-anchor="middle" font-family="Georgia,serif" font-size="12" fill="rgba(201,162,39,0.6)" letter-spacing="2" font-weight="700">CIDADES VISITADAS</text>
  <text x="400" y="345" text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="600" fill="#ffffff">${citiesText}</text>

  <!-- Stats -->
  <text x="250" y="390" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="rgba(201,162,39,0.6)" font-weight="700">NÍVEL</text>
  <text x="250" y="412" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="800" fill="#ffffff">${gam.levelName}</text>

  <text x="400" y="390" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="rgba(201,162,39,0.6)" font-weight="700">XP TOTAL</text>
  <text x="400" y="412" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="800" fill="#c9a227">${gam.xp}</text>

  <text x="550" y="390" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="rgba(201,162,39,0.6)" font-weight="700">LIGA</text>
  <text x="550" y="412" text-anchor="middle" font-family="Georgia,serif" font-size="18" font-weight="800" fill="#ffffff">${gam.league}</text>

  <!-- Divider -->
  <line x1="200" y1="440" x2="600" y2="440" stroke="rgba(201,162,39,0.3)" stroke-width="1"/>

  <!-- Date and site -->
  <text x="400" y="470" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.4)">${date}</text>
  <text x="400" y="500" text-anchor="middle" font-family="Georgia,serif" font-size="14" font-weight="700" fill="#c9a227">disciplegame.com</text>

  <!-- Status badge -->
  ${allCompleted
        ? `<rect x="300" y="510" width="200" height="26" rx="13" fill="rgba(39,174,96,0.2)" stroke="rgba(39,174,96,0.5)" stroke-width="1"/>
     <text x="400" y="527" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#2ecc71">✓ JORNADA COMPLETA</text>`
        : `<rect x="300" y="510" width="200" height="26" rx="13" fill="rgba(201,162,39,0.1)" stroke="rgba(201,162,39,0.3)" stroke-width="1"/>
     <text x="400" y="527" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#c9a227">${completedIds.length}/${cities.length} CIDADES</text>`
    }
</svg>`;

    return new NextResponse(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache',
        },
    });
}

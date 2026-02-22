import { NextRequest, NextResponse } from 'next/server';
import { getRankings } from '@/lib/mockDb';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const circuitId = searchParams.get('circuitId') || undefined;
        const limit = parseInt(searchParams.get('limit') || '100');

        const rankings = getRankings(circuitId, limit);

        return NextResponse.json({
            success: true,
            data: rankings,
        });
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar ranking' },
            { status: 500 }
        );
    }
}

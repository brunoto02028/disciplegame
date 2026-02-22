import { NextRequest, NextResponse } from 'next/server';
import { getCitiesByCircuit, mockStore } from '@/lib/mockDb';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const circuitId = searchParams.get('circuitId');

        let cities = circuitId
            ? getCitiesByCircuit(circuitId)
            : Array.from(mockStore.cities.values()).sort((a, b) => a.order_index - b.order_index);

        // Verificar quais cidades o usuário completou
        const sessionToken = request.cookies.get('session')?.value;
        let completedCityIds: string[] = [];

        if (sessionToken) {
            const session = getSession(sessionToken);
            if (session && circuitId) {
                const { getCompletedCityIds } = await import('@/lib/mockDb');
                completedCityIds = getCompletedCityIds(session.userId, circuitId);
            }
        }

        const citiesWithStatus = cities.map(city => ({
            ...city,
            completed: completedCityIds.includes(city.id),
        }));

        return NextResponse.json({
            success: true,
            data: citiesWithStatus,
        });
    } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        return NextResponse.json(
            { success: false, error: 'Erro ao buscar cidades' },
            { status: 500 }
        );
    }
}

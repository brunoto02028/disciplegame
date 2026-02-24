import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/mockDb';

export async function GET() {
    // Public API - returns site settings + active cities for the homepage
    const activeCities = Array.from(mockStore.cities.values())
        .filter(c => c.active)
        .sort((a, b) => a.order_index - b.order_index)
        .map(({ circuit_id, ...rest }) => ({
            ...rest,
            tourist_spots: rest.tourist_spots || [],
        }));

    return NextResponse.json({
        success: true,
        data: {
            settings: mockStore.siteSettings,
            cities: activeCities,
            gameRules: {
                time_per_question: mockStore.gameRules.time_per_question,
                questions_per_game: mockStore.gameRules.questions_per_game,
                blocks: mockStore.gameRules.blocks,
            },
        },
    });
}

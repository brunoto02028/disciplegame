import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { PLANS, getUserSubscription, getUserPlan, startTrial, startSubscription, cancelSubscription } from '@/lib/plans';

// GET: Get plans and user's current subscription
export async function GET(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    const session = sessionToken ? getSession(sessionToken) : null;

    let currentPlan = null;
    let subscription = null;

    if (session) {
        currentPlan = getUserPlan(session.userId);
        subscription = getUserSubscription(session.userId);
    }

    return NextResponse.json({
        success: true,
        data: {
            plans: PLANS,
            currentPlan: currentPlan || PLANS[0],
            subscription: subscription ? {
                planId: subscription.planId,
                status: subscription.status,
                startedAt: subscription.startedAt,
                expiresAt: subscription.expiresAt,
                churchName: subscription.churchName,
            } : null,
        },
    });
}

// POST: Subscribe, start trial, or cancel
export async function POST(request: NextRequest) {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ success: false, error: 'Não autenticado' }, { status: 401 });
    const session = getSession(sessionToken);
    if (!session) return NextResponse.json({ success: false, error: 'Sessão inválida' }, { status: 401 });

    const { action, planId, billing, churchName } = await request.json();

    if (action === 'trial') {
        if (!planId) return NextResponse.json({ success: false, error: 'planId obrigatório' }, { status: 400 });
        const existing = getUserSubscription(session.userId);
        if (existing && existing.status === 'active') {
            return NextResponse.json({ success: false, error: 'Você já tem uma assinatura ativa' }, { status: 400 });
        }
        const sub = startTrial(session.userId, planId);
        return NextResponse.json({ success: true, data: { message: 'Trial de 7 dias iniciado!', expiresAt: sub.expiresAt } });
    }

    if (action === 'subscribe') {
        if (!planId) return NextResponse.json({ success: false, error: 'planId obrigatório' }, { status: 400 });
        // In production: integrate with Stripe/PagSeguro here
        // For MVP: simulate subscription
        const months = billing === 'yearly' ? 12 : 1;
        const sub = startSubscription(session.userId, planId, months, churchName);
        return NextResponse.json({
            success: true,
            data: {
                message: 'Assinatura ativada com sucesso!',
                planId: sub.planId,
                expiresAt: sub.expiresAt,
                // In production, would return a payment URL:
                // paymentUrl: 'https://checkout.stripe.com/...'
            },
        });
    }

    if (action === 'cancel') {
        const ok = cancelSubscription(session.userId);
        if (!ok) return NextResponse.json({ success: false, error: 'Nenhuma assinatura encontrada' }, { status: 400 });
        return NextResponse.json({ success: true, data: { message: 'Assinatura cancelada' } });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
}

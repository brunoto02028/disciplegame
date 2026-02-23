'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PlansPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [currentPlan, setCurrentPlan] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/plans', { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setPlans(d.data.plans);
                    setCurrentPlan(d.data.currentPlan);
                    setSubscription(d.data.subscription);
                }
                setLoading(false);
            }).catch(() => setLoading(false));
    }, []);

    const handleAction = async (planId: string, action: 'trial' | 'subscribe' | 'cancel') => {
        setProcessing(true); setMessage('');
        const res = await fetch('/api/plans', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
            body: JSON.stringify({ action, planId, billing }),
        });
        const data = await res.json();
        if (data.success) {
            setMessage(data.data.message);
            // Refresh data
            const refresh = await fetch('/api/plans', { credentials: 'include' }).then(r => r.json());
            if (refresh.success) {
                setCurrentPlan(refresh.data.currentPlan);
                setSubscription(refresh.data.subscription);
            }
        } else {
            setMessage(data.error || 'Erro');
        }
        setProcessing(false);
    };

    const goldBorder = '1px solid rgba(201,162,39,0.35)';

    if (loading) return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#c9a227', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#0d0b2e 0%,#1a0a4a 40%,#0d1b4a 100%)', color: '#fff', fontFamily: "'Inter',system-ui,sans-serif", padding: '24px 16px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link href="/dashboard" style={{ color: '#c9a227', textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'inline-block', marginBottom: 16 }}>← Dashboard</Link>
                    <h1 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Escolha seu Plano</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
                        Desbloqueie todo o potencial da sua jornada bíblica com recursos exclusivos.
                    </p>
                </div>

                {/* Current subscription info */}
                {subscription && (
                    <div style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 12, padding: '12px 20px', marginBottom: 24, textAlign: 'center', maxWidth: 500, margin: '0 auto 24px' }}>
                        <p style={{ fontSize: 13, color: '#2ecc71' }}>
                            Plano atual: <strong>{currentPlan?.name}</strong> · Status: <strong>{subscription.status === 'active' ? 'Ativo' : subscription.status === 'trial' ? 'Trial' : subscription.status}</strong>
                            {subscription.expiresAt && <span> · Expira: {new Date(subscription.expiresAt).toLocaleDateString('pt-BR')}</span>}
                        </p>
                    </div>
                )}

                {/* Billing toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: goldBorder }}>
                        <button onClick={() => setBilling('monthly')} style={{ padding: '10px 24px', background: billing === 'monthly' ? 'rgba(201,162,39,0.15)' : 'transparent', border: 'none', color: billing === 'monthly' ? '#c9a227' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            Mensal
                        </button>
                        <button onClick={() => setBilling('yearly')} style={{ padding: '10px 24px', background: billing === 'yearly' ? 'rgba(201,162,39,0.15)' : 'transparent', border: 'none', borderLeft: goldBorder, color: billing === 'yearly' ? '#c9a227' : 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 13, cursor: 'pointer', position: 'relative' }}>
                            Anual
                            <span style={{ position: 'absolute', top: -8, right: -4, background: '#2ecc71', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 8 }}>-33%</span>
                        </button>
                    </div>
                </div>

                {message && (
                    <div style={{ background: 'rgba(201,162,39,0.1)', border: goldBorder, borderRadius: 10, padding: '10px 16px', marginBottom: 20, textAlign: 'center', maxWidth: 500, margin: '0 auto 20px' }}>
                        <p style={{ fontSize: 13, color: '#c9a227', fontWeight: 600 }}>{message}</p>
                    </div>
                )}

                {/* Plans grid */}
                <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
                    {plans.map((plan: any) => {
                        const isCurrent = currentPlan?.id === plan.id;
                        const isHighlighted = plan.highlighted;
                        const price = billing === 'yearly' ? plan.priceYearly : plan.price;
                        const monthlyEquiv = billing === 'yearly' ? (plan.priceYearly / 12).toFixed(2) : null;

                        return (
                            <div key={plan.id} style={{
                                background: isHighlighted ? 'linear-gradient(135deg,rgba(201,162,39,0.12),rgba(26,10,74,0.95))' : 'rgba(255,255,255,0.04)',
                                border: isHighlighted ? '2px solid rgba(201,162,39,0.5)' : goldBorder,
                                borderRadius: 20, padding: '28px 24px', position: 'relative', overflow: 'hidden',
                                transform: isHighlighted ? 'scale(1.02)' : 'none',
                            }}>
                                {isHighlighted && (
                                    <div style={{ position: 'absolute', top: 12, right: -28, background: 'linear-gradient(135deg,#c9a227,#8b6914)', color: '#1a0a4a', fontSize: 10, fontWeight: 800, padding: '4px 32px', transform: 'rotate(45deg)', letterSpacing: 1 }}>
                                        POPULAR
                                    </div>
                                )}

                                {/* Plan icon */}
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: plan.type === 'free' ? 'rgba(255,255,255,0.1)' : plan.type === 'premium' ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'linear-gradient(135deg,#2ecc71,#27ae60)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: 20 }}>
                                        {plan.type === 'free' ? '🚶' : plan.type === 'premium' ? '⭐' : '⛪'}
                                    </div>
                                </div>

                                <h3 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 20, fontWeight: 800, textAlign: 'center', marginBottom: 4 }}>{plan.name}</h3>

                                {/* Price */}
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    {price === 0 ? (
                                        <p style={{ fontSize: 28, fontWeight: 800, color: '#c9a227' }}>Grátis</p>
                                    ) : (
                                        <>
                                            <p style={{ fontSize: 28, fontWeight: 800, color: '#c9a227' }}>
                                                R$ {billing === 'yearly' ? monthlyEquiv : price.toFixed(2)}
                                                <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/mês</span>
                                            </p>
                                            {billing === 'yearly' && (
                                                <p style={{ fontSize: 12, color: '#2ecc71', marginTop: 2 }}>
                                                    R$ {price.toFixed(2)}/ano (economia de {((plan.price * 12 - price) / (plan.price * 12) * 100).toFixed(0)}%)
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Features */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                                    {plan.features.map((f: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                            <span style={{ color: '#2ecc71', fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>{f}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action button */}
                                {isCurrent ? (
                                    <div style={{ textAlign: 'center', padding: '12px', borderRadius: 12, background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)' }}>
                                        <p style={{ color: '#2ecc71', fontWeight: 700, fontSize: 14 }}>✓ Plano Atual</p>
                                    </div>
                                ) : plan.type === 'free' ? (
                                    <div style={{ textAlign: 'center', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Incluído</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <button onClick={() => handleAction(plan.id, 'trial')} disabled={processing}
                                            style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: goldBorder, color: '#c9a227', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                            Testar 7 dias grátis
                                        </button>
                                        <button onClick={() => handleAction(plan.id, 'subscribe')} disabled={processing}
                                            style={{ width: '100%', padding: '12px', borderRadius: 12, background: isHighlighted ? 'linear-gradient(135deg,#c9a227,#8b6914)' : 'rgba(201,162,39,0.15)', border: 'none', color: isHighlighted ? '#1a0a4a' : '#c9a227', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                                            {processing ? 'Processando...' : `Assinar ${billing === 'yearly' ? 'Anual' : 'Mensal'}`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: 600, margin: '40px auto 0', textAlign: 'center' }}>
                    <h2 style={{ fontFamily: "'Playfair Display','Georgia',serif", fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Perguntas Frequentes</h2>
                    {[
                        { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Cancele quando quiser. Seu acesso continua até o fim do período pago.' },
                        { q: 'O trial é realmente grátis?', a: 'Sim, 7 dias completos sem cobrança. Você escolhe se quer continuar.' },
                        { q: 'Como funciona o plano para igrejas?', a: 'O pastor/líder administra a conta e pode adicionar até 50 membros. Ideal para EBD e grupos de estudo.' },
                        { q: 'Quais formas de pagamento?', a: 'PIX, cartão de crédito e boleto bancário (em breve).' },
                    ].map((faq, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: goldBorder, borderRadius: 12, padding: '14px 18px', marginBottom: 10, textAlign: 'left' }}>
                            <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#c9a227' }}>{faq.q}</p>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg) } }
                @media (max-width: 768px) {
                    .plans-grid { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto; }
                }
                @media (min-width: 769px) and (max-width: 1024px) {
                    .plans-grid { grid-template-columns: 1fr 1fr !important; }
                }
            `}</style>
        </div>
    );
}

export type Locale = 'pt-BR' | 'en';

export const DEFAULT_LOCALE: Locale = 'pt-BR';

// ── UI Dictionary (fixed strings — buttons, labels, navigation) ──
const dictionaries: Record<Locale, Record<string, string>> = {
    'pt-BR': {
        // Nav
        'nav.enter': 'Entrar',
        'nav.start_free': 'Começar Grátis',
        'nav.language': 'UK',

        // Hero
        'hero.badge': 'As Viagens de Paulo',
        'hero.title': 'O Discípulo',
        'hero.subtitle': 'Onde História e Aventura se Encontram',
        'hero.description': 'Uma jornada interativa de conhecimento bíblico, geografia atual e turismo religioso.',
        'hero.cta_primary': 'Começar Jornada',
        'hero.cta_demo': '▶ Experimentar Grátis',

        // About
        'about.try_now': '▶ Experimentar Agora — Sem Cadastro',

        // Cities
        'cities.play_now': 'Jogar Agora',
        'cities.demo': 'Demo Grátis',
        'cities.view_spots': 'Ver {count} Pontos Turísticos',
        'cities.close': 'Fechar',
        'cities.spots_label': '📍 Pontos Turísticos — {city}',

        // CTA
        'cta.title': 'Pronto para Começar sua Jornada?',
        'cta.button': 'Criar Conta Gratuita',

        // Footer
        'footer.brand': 'O Discípulo',

        // Auth
        'auth.login_title': 'Entrar',
        'auth.register_title': 'Criar Conta',
        'auth.email': 'E-mail',
        'auth.password': 'Senha',
        'auth.confirm_password': 'Confirmar *',
        'auth.name': 'Nome Completo *',
        'auth.country': 'País',
        'auth.church': 'Igreja (opcional)',
        'auth.login_btn': 'Entrar',
        'auth.logging_in': 'Entrando...',
        'auth.register_btn': 'Criar Conta',
        'auth.registering': 'Criando conta...',
        'auth.no_account': 'Não tem uma conta?',
        'auth.has_account': 'Já tem uma conta?',
        'auth.register_link': 'Criar conta gratuita',
        'auth.login_link': 'Fazer login',
        'auth.or': 'ou',
        'auth.google_login': 'Entrar com Google',
        'auth.google_register': 'Cadastrar com Google',
        'auth.remember': 'Lembrar-me',
        'auth.forgot': 'Esqueceu a senha?',
        'auth.welcome_back': 'Bem-vindo de volta',
        'auth.welcome_subtitle': 'Entre para continuar sua jornada',
        'auth.start_journey': 'Comece sua Jornada',
        'auth.create_free': 'Crie sua conta gratuita',
        'auth.back_home': 'Voltar para home',
        'auth.password_min': 'Mín. 6 caracteres',
        'auth.repeat_password': 'Repita a senha',
        'auth.name_placeholder': 'João Silva',
        'auth.country_placeholder': 'Brasil',
        'auth.church_placeholder': 'Sua igreja',
        'auth.err_password_match': 'As senhas não coincidem',
        'auth.err_password_min': 'A senha deve ter pelo menos 6 caracteres',
        'auth.err_credentials': 'Credenciais inválidas',
        'auth.err_server': 'Erro ao conectar com o servidor',
        'auth.err_create': 'Erro ao criar conta',

        // Dashboard
        'dash.welcome': 'Bem-vindo, {name}!',
        'dash.level': 'Nível {level}',
        'dash.xp': '{xp} XP',
        'dash.streak': 'Sequência Diária',
        'dash.daily_challenge': 'Desafio Diário',
        'dash.rankings': 'Rankings',
        'dash.invite': 'Convidar Amigos',
        'dash.play': 'Jogar',
        'dash.choose_city': 'Escolha uma Cidade',
        'dash.profile': 'Perfil',
        'dash.settings': 'Configurações',
        'dash.logout': 'Sair',
        'dash.stats': 'Estatísticas',
        'dash.games_played': 'Partidas Jogadas',
        'dash.correct_answers': 'Respostas Corretas',
        'dash.accuracy': 'Precisão',
        'dash.best_score': 'Melhor Pontuação',

        // Game
        'game.question': 'Pergunta {n} de {total}',
        'game.time_left': 'Tempo restante',
        'game.correct': 'Correto!',
        'game.wrong': 'Errado!',
        'game.next': 'Próxima',
        'game.finish': 'Finalizar',
        'game.results': 'Resultados',
        'game.score': 'Pontuação',
        'game.play_again': 'Jogar Novamente',
        'game.back_dashboard': 'Voltar ao Dashboard',
        'game.share': 'Compartilhar',
        'game.block': 'Bloco {n}',

        // General
        'general.loading': 'Carregando...',
        'general.error': 'Erro',
        'general.save': 'Salvar',
        'general.cancel': 'Cancelar',
        'general.delete': 'Excluir',
        'general.edit': 'Editar',
        'general.close': 'Fechar',
        'general.back': 'Voltar',
        'general.confirm': 'Confirmar',
        'general.yes': 'Sim',
        'general.no': 'Não',
    },

    'en': {
        // Nav
        'nav.enter': 'Sign In',
        'nav.start_free': 'Start Free',
        'nav.language': 'BR',

        // Hero
        'hero.badge': "Paul's Journeys",
        'hero.title': 'The Disciple',
        'hero.subtitle': 'Where History and Adventure Meet',
        'hero.description': 'An interactive journey of biblical knowledge, modern geography and religious tourism.',
        'hero.cta_primary': 'Start Your Journey',
        'hero.cta_demo': '▶ Try for Free',

        // About
        'about.try_now': '▶ Try Now — No Sign-up',

        // Cities
        'cities.play_now': 'Play Now',
        'cities.demo': 'Free Demo',
        'cities.view_spots': 'View {count} Tourist Spots',
        'cities.close': 'Close',
        'cities.spots_label': '📍 Tourist Spots — {city}',

        // CTA
        'cta.title': 'Ready to Start Your Journey?',
        'cta.button': 'Create Free Account',

        // Footer
        'footer.brand': 'The Disciple',

        // Auth
        'auth.login_title': 'Sign In',
        'auth.register_title': 'Create Account',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.confirm_password': 'Confirm *',
        'auth.name': 'Full Name *',
        'auth.country': 'Country',
        'auth.church': 'Church (optional)',
        'auth.login_btn': 'Sign In',
        'auth.logging_in': 'Signing in...',
        'auth.register_btn': 'Create Account',
        'auth.registering': 'Creating account...',
        'auth.no_account': "Don't have an account?",
        'auth.has_account': 'Already have an account?',
        'auth.register_link': 'Create free account',
        'auth.login_link': 'Sign in',
        'auth.or': 'or',
        'auth.google_login': 'Sign in with Google',
        'auth.google_register': 'Sign up with Google',
        'auth.remember': 'Remember me',
        'auth.forgot': 'Forgot password?',
        'auth.welcome_back': 'Welcome Back',
        'auth.welcome_subtitle': 'Sign in to continue your journey',
        'auth.start_journey': 'Start Your Journey',
        'auth.create_free': 'Create your free account',
        'auth.back_home': 'Back to home',
        'auth.password_min': 'Min. 6 characters',
        'auth.repeat_password': 'Repeat password',
        'auth.name_placeholder': 'John Smith',
        'auth.country_placeholder': 'United States',
        'auth.church_placeholder': 'Your church',
        'auth.err_password_match': 'Passwords do not match',
        'auth.err_password_min': 'Password must be at least 6 characters',
        'auth.err_credentials': 'Invalid credentials',
        'auth.err_server': 'Error connecting to server',
        'auth.err_create': 'Error creating account',

        // Dashboard
        'dash.welcome': 'Welcome, {name}!',
        'dash.level': 'Level {level}',
        'dash.xp': '{xp} XP',
        'dash.streak': 'Daily Streak',
        'dash.daily_challenge': 'Daily Challenge',
        'dash.rankings': 'Rankings',
        'dash.invite': 'Invite Friends',
        'dash.play': 'Play',
        'dash.choose_city': 'Choose a City',
        'dash.profile': 'Profile',
        'dash.settings': 'Settings',
        'dash.logout': 'Sign Out',
        'dash.stats': 'Statistics',
        'dash.games_played': 'Games Played',
        'dash.correct_answers': 'Correct Answers',
        'dash.accuracy': 'Accuracy',
        'dash.best_score': 'Best Score',

        // Game
        'game.question': 'Question {n} of {total}',
        'game.time_left': 'Time left',
        'game.correct': 'Correct!',
        'game.wrong': 'Wrong!',
        'game.next': 'Next',
        'game.finish': 'Finish',
        'game.results': 'Results',
        'game.score': 'Score',
        'game.play_again': 'Play Again',
        'game.back_dashboard': 'Back to Dashboard',
        'game.share': 'Share',
        'game.block': 'Block {n}',

        // General
        'general.loading': 'Loading...',
        'general.error': 'Error',
        'general.save': 'Save',
        'general.cancel': 'Cancel',
        'general.delete': 'Delete',
        'general.edit': 'Edit',
        'general.close': 'Close',
        'general.back': 'Back',
        'general.confirm': 'Confirm',
        'general.yes': 'Yes',
        'general.no': 'No',
    },
};

export function getDictionary(locale: Locale) {
    return dictionaries[locale] || dictionaries['pt-BR'];
}

/**
 * Translate a key with optional interpolation.
 * Example: t('cities.view_spots', { count: 3 }) → "Ver 3 Pontos Turísticos"
 */
export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
    let text = dictionaries[locale]?.[key] || dictionaries['pt-BR']?.[key] || key;
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v));
        });
    }
    return text;
}

/**
 * Get locale-aware content from admin settings.
 * For English, looks for field_en first, falls back to field.
 */
export function localizedField(obj: Record<string, any>, field: string, locale: Locale): string {
    if (locale === 'en') {
        return obj[`${field}_en`] || obj[field] || '';
    }
    return obj[field] || '';
}

/**
 * Get locale from localStorage (client-side only).
 */
export function getStoredLocale(): Locale {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    const stored = localStorage.getItem('locale');
    if (stored === 'en' || stored === 'pt-BR') return stored;
    return DEFAULT_LOCALE;
}

/**
 * Save locale to localStorage.
 */
export function setStoredLocale(locale: Locale) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('locale', locale);
    }
}

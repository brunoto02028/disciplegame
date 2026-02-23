export interface MockUser {
    id: string; email: string; name: string; password_hash: string;
    country: string | null; church: string | null; created_at: Date;
}
export interface TouristSpot {
    name: string;
    description: string;
    image_url: string;
}
export interface MockCity {
    id: string; circuit_id: string; name: string; name_en: string;
    country: string; modern_name: string; description: string;
    description_en: string; biblical_context: string;
    latitude: number; longitude: number; image_url: string | null; order_index: number;
    flag: string; biblical_ref: string; active: boolean;
    tourist_spots?: TouristSpot[];
}
export interface MockQuestion {
    id: string; city_id: string; block: number; difficulty: number;
    question_text: string; option_a: string; option_b: string;
    option_c: string; option_d: string; correct_option: string;
    explanation: string; image_url: string | null;
}
export interface MockGameSession {
    id: string; user_id: string; circuit_id: string;
    status: 'in_progress' | 'completed' | 'abandoned';
    started_at: Date; completed_at: Date | null;
    total_points: number; accuracy_percentage: number; total_time_seconds: number;
}
export interface MockUserAnswer {
    id: string; user_id: string; question_id: string; session_id: string;
    selected_option: string; is_correct: boolean; time_taken: number; answered_at: Date;
}
export interface MockRanking {
    id: string; user_id: string; circuit_id: string;
    total_points: number; accuracy_percentage: number;
    total_time_seconds: number; completed_at: Date;
}
export interface ImageBankItem {
    id: string;
    url: string;
    name: string;
    category: string;
    size: number;
    type: string;
    usedIn: string[]; // e.g. ['city:city-jerusalem-001', 'settings:hero.image_url']
    uploaded_at: string;
}

const MVP_CIRCUIT_ID = '00000000-0000-0000-0000-000000000001';
// Hash pré-computado de 'demo123' com bcrypt (salt rounds: 10)
const TEST_PASSWORD_HASH = '$2b$10$h8HX3I5Ev7LLbTAcZbyycuEdSK7smXHaLN3Yd8eegofAHUNfWIPUS';

// Use globalThis to persist mockStore across Next.js hot reloads in dev mode
const globalForMock = globalThis as unknown as { __mockStore?: typeof _defaultStore };

const _defaultStore = {
    users: new Map<string, MockUser>([
        ['user-demo-001', {
            id: 'user-demo-001', email: 'demo@discipulo.com', name: 'Demo Discípulo',
            password_hash: TEST_PASSWORD_HASH, country: 'Brasil', church: 'Igreja Batista',
            created_at: new Date('2026-01-01'),
        }],
    ]),

    cities: new Map<string, MockCity>([
        ['city-jerusalem-001', {
            id: 'city-jerusalem-001', circuit_id: MVP_CIRCUIT_ID,
            name: 'Jerusalém', name_en: 'Jerusalem', country: 'Israel', modern_name: 'Jerusalém',
            description: 'A cidade santa, centro do judaísmo e do cristianismo primitivo.',
            description_en: 'The holy city, center of Judaism and early Christianity.',
            biblical_context: 'Jerusalém foi o centro da missão apostólica. Foi aqui que Jesus foi crucificado, ressuscitou e onde a Igreja nasceu no Pentecostes (Atos 2). Paulo visitou Jerusalém várias vezes para se reunir com os apóstolos.',
            latitude: 31.7683, longitude: 35.2137, image_url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=800&q=80', order_index: 1,
            flag: '🇮🇱', biblical_ref: 'Atos 1-7', active: true,
            tourist_spots: [
                { name: 'Igreja do Santo Sepulcro', description: 'Local da crucificação e ressurreição de Jesus, o lugar mais sagrado do cristianismo.', image_url: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=600&q=80' },
                { name: 'Muro das Lamentações', description: 'Remanescente do Segundo Templo, local de oração mais sagrado do judaísmo.', image_url: 'https://images.unsplash.com/photo-1547483238-2cbf881a559f?auto=format&fit=crop&w=600&q=80' },
                { name: 'Via Dolorosa', description: 'O caminho percorrido por Jesus carregando a cruz até o Calvário.', image_url: 'https://images.unsplash.com/photo-1558284989-30e0f90b4703?auto=format&fit=crop&w=600&q=80' },
            ],
        }],
        ['city-efeso-002', {
            id: 'city-efeso-002', circuit_id: MVP_CIRCUIT_ID,
            name: 'Éfeso', name_en: 'Ephesus', country: 'Turquia', modern_name: 'Selçuk',
            description: 'Uma das maiores cidades do Império Romano, onde Paulo pregou por 3 anos.',
            description_en: 'One of the largest cities in the Roman Empire, where Paul preached for 3 years.',
            biblical_context: 'Paulo passou cerca de 3 anos em Éfeso (Atos 19-20), tornando-a base para a evangelização da Ásia Menor. A cidade era famosa pelo Templo de Ártemis, uma das Sete Maravilhas do Mundo Antigo.',
            latitude: 37.9395, longitude: 27.3417, image_url: 'https://images.unsplash.com/photo-1589254065878-42c6b0e0a0bf?auto=format&fit=crop&w=800&q=80', order_index: 2,
            flag: '🇹🇷', biblical_ref: 'Atos 19-20', active: true,
            tourist_spots: [
                { name: 'Biblioteca de Celso', description: 'Uma das bibliotecas mais antigas do mundo, símbolo icônico de Éfeso.', image_url: 'https://images.unsplash.com/photo-1590074072786-a66914d668f1?auto=format&fit=crop&w=600&q=80' },
                { name: 'Grande Teatro', description: 'Teatro com capacidade para 25.000 pessoas onde houve o tumulto contra Paulo.', image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80' },
                { name: 'Casa da Virgem Maria', description: 'Santuário no Monte Koressos, onde tradição diz que Maria viveu seus últimos dias.', image_url: 'https://images.unsplash.com/photo-1601922046210-47ac6e9e8fbb?auto=format&fit=crop&w=600&q=80' },
            ],
        }],
        ['city-malta-003', {
            id: 'city-malta-003', circuit_id: MVP_CIRCUIT_ID,
            name: 'Malta', name_en: 'Malta', country: 'Malta', modern_name: 'Malta',
            description: 'Ilha mediterrânea onde Paulo naufragou e realizou milagres.',
            description_en: 'Mediterranean island where Paul was shipwrecked and performed miracles.',
            biblical_context: 'Paulo naufragou em Malta durante sua viagem a Roma (Atos 27-28). Na ilha, sobreviveu à picada de uma víbora e curou o pai do governador Públio, além de muitos outros habitantes.',
            latitude: 35.9375, longitude: 14.3754, image_url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80', order_index: 3,
            flag: '🇲🇹', biblical_ref: 'Atos 27-28', active: true,
            tourist_spots: [
                { name: 'Baía de São Paulo', description: 'Local tradicional do naufrágio do Apóstolo Paulo, com estátua comemorativa.', image_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80' },
                { name: 'Catedral de São João', description: 'Uma das catedrais mais impressionantes da Europa, com interior barroco em ouro.', image_url: 'https://images.unsplash.com/photo-1584466990297-eb0e1c40f0a1?auto=format&fit=crop&w=600&q=80' },
                { name: 'Gruta de São Paulo', description: 'Caverna em Rabat onde a tradição diz que Paulo orou e pregou durante sua estadia.', image_url: 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=600&q=80' },
            ],
        }],
    ]),

    questions: new Map<string, MockQuestion>([
        // Jerusalém B1
        ['q-jer-b1-1', { id: 'q-jer-b1-1', city_id: 'city-jerusalem-001', block: 1, difficulty: 1, question_text: 'Em qual cidade o Espírito Santo desceu sobre os discípulos no dia de Pentecostes?', option_a: 'Antioquia', option_b: 'Jerusalém', option_c: 'Corinto', option_d: 'Roma', correct_option: 'B', explanation: 'O Pentecostes aconteceu em Jerusalém, conforme Atos 2:1-4.', image_url: null }],
        ['q-jer-b1-2', { id: 'q-jer-b1-2', city_id: 'city-jerusalem-001', block: 1, difficulty: 2, question_text: 'Quantas pessoas foram batizadas no dia de Pentecostes em Jerusalém?', option_a: '120', option_b: '500', option_c: '3.000', option_d: '5.000', correct_option: 'C', explanation: 'Atos 2:41 relata que cerca de 3.000 pessoas foram batizadas naquele dia.', image_url: null }],
        ['q-jer-b1-3', { id: 'q-jer-b1-3', city_id: 'city-jerusalem-001', block: 1, difficulty: 3, question_text: 'Qual concílio em Jerusalém debateu a circuncisão dos gentios?', option_a: 'Concílio de Niceia', option_b: 'Concílio de Antioquia', option_c: 'Concílio de Jerusalém', option_d: 'Concílio de Éfeso', correct_option: 'C', explanation: 'O Concílio de Jerusalém (Atos 15) decidiu que os gentios não precisavam ser circuncidados.', image_url: null }],
        // Jerusalém B2
        ['q-jer-b2-1', { id: 'q-jer-b2-1', city_id: 'city-jerusalem-001', block: 2, difficulty: 1, question_text: 'Em qual país fica Jerusalém atualmente?', option_a: 'Jordânia', option_b: 'Palestina', option_c: 'Israel', option_d: 'Líbano', correct_option: 'C', explanation: 'Jerusalém é a capital declarada de Israel.', image_url: null }],
        ['q-jer-b2-2', { id: 'q-jer-b2-2', city_id: 'city-jerusalem-001', block: 2, difficulty: 2, question_text: 'Qual é o nome do muro sagrado para o judaísmo em Jerusalém?', option_a: 'Muro das Lamentações', option_b: 'Muro de Adriano', option_c: 'Muro de Berlim', option_d: 'Muro de Salomão', correct_option: 'A', explanation: 'O Muro das Lamentações é o remanescente do Segundo Templo de Jerusalém.', image_url: null }],
        ['q-jer-b2-3', { id: 'q-jer-b2-3', city_id: 'city-jerusalem-001', block: 2, difficulty: 3, question_text: 'Qual é a altitude aproximada de Jerusalém acima do nível do mar?', option_a: '200 metros', option_b: '400 metros', option_c: '800 metros', option_d: '1.200 metros', correct_option: 'C', explanation: 'Jerusalém está a cerca de 800 metros acima do nível do mar, nas montanhas da Judeia.', image_url: null }],
        // Jerusalém B3
        ['q-jer-b3-1', { id: 'q-jer-b3-1', city_id: 'city-jerusalem-001', block: 3, difficulty: 1, question_text: 'Qual é o principal atrativo turístico cristão em Jerusalém?', option_a: 'Mesquita Al-Aqsa', option_b: 'Igreja do Santo Sepulcro', option_c: 'Domo da Rocha', option_d: 'Jardim de Getsêmani', correct_option: 'B', explanation: 'A Igreja do Santo Sepulcro marca o local da crucificação e ressurreição de Jesus.', image_url: null }],
        ['q-jer-b3-2', { id: 'q-jer-b3-2', city_id: 'city-jerusalem-001', block: 3, difficulty: 2, question_text: 'Qual rota em Jerusalém é percorrida por peregrinos seguindo os passos de Jesus?', option_a: 'Via Dolorosa', option_b: 'Via Appia', option_c: 'Caminho de Santiago', option_d: 'Rota dos Apóstolos', correct_option: 'A', explanation: 'A Via Dolorosa é a rota que Jesus percorreu carregando a cruz até o Calvário.', image_url: null }],
        ['q-jer-b3-3', { id: 'q-jer-b3-3', city_id: 'city-jerusalem-001', block: 3, difficulty: 3, question_text: 'Quantos turistas Jerusalém recebe aproximadamente por ano?', option_a: '500 mil', option_b: '2 milhões', option_c: '4 milhões', option_d: '10 milhões', correct_option: 'C', explanation: 'Jerusalém recebe cerca de 4 milhões de turistas por ano.', image_url: null }],
        // Éfeso B1
        ['q-efe-b1-1', { id: 'q-efe-b1-1', city_id: 'city-efeso-002', block: 1, difficulty: 1, question_text: 'Quantos anos Paulo pregou em Éfeso?', option_a: '6 meses', option_b: '1 ano', option_c: '3 anos', option_d: '5 anos', correct_option: 'C', explanation: 'Paulo passou cerca de 3 anos em Éfeso (Atos 19-20).', image_url: null }],
        ['q-efe-b1-2', { id: 'q-efe-b1-2', city_id: 'city-efeso-002', block: 1, difficulty: 2, question_text: 'Qual deusa causou um tumulto quando Paulo pregou em Éfeso?', option_a: 'Afrodite', option_b: 'Atena', option_c: 'Ártemis', option_d: 'Hera', correct_option: 'C', explanation: 'Ártemis era a deusa padroeira de Éfeso. O ourives Demétrio incitou um tumulto (Atos 19:23-41).', image_url: null }],
        ['q-efe-b1-3', { id: 'q-efe-b1-3', city_id: 'city-efeso-002', block: 1, difficulty: 3, question_text: 'Qual escola Paulo usou para ensinar diariamente em Éfeso?', option_a: 'Escola de Gamaliel', option_b: 'Escola de Tirano', option_c: 'Academia de Atenas', option_d: 'Sinagoga de Éfeso', correct_option: 'B', explanation: 'Paulo ensinou na escola de Tirano por dois anos (Atos 19:9-10).', image_url: null }],
        // Éfeso B2
        ['q-efe-b2-1', { id: 'q-efe-b2-1', city_id: 'city-efeso-002', block: 2, difficulty: 1, question_text: 'Em qual país ficam as ruínas de Éfeso atualmente?', option_a: 'Grécia', option_b: 'Itália', option_c: 'Turquia', option_d: 'Síria', correct_option: 'C', explanation: 'As ruínas de Éfeso ficam na Turquia moderna, próximas à cidade de Selçuk.', image_url: null }],
        ['q-efe-b2-2', { id: 'q-efe-b2-2', city_id: 'city-efeso-002', block: 2, difficulty: 2, question_text: 'Qual cidade turca fica mais próxima das ruínas de Éfeso?', option_a: 'Istambul', option_b: 'Ancara', option_c: 'Izmir', option_d: 'Selçuk', correct_option: 'D', explanation: 'Selçuk fica a apenas 3 km das ruínas de Éfeso.', image_url: null }],
        ['q-efe-b2-3', { id: 'q-efe-b2-3', city_id: 'city-efeso-002', block: 2, difficulty: 3, question_text: 'Qual era a população estimada de Éfeso no tempo de Paulo?', option_a: '10.000', option_b: '50.000', option_c: '200.000 a 500.000', option_d: '1 milhão', correct_option: 'C', explanation: 'Éfeso era uma das maiores cidades do Império Romano, com 200.000 a 500.000 habitantes.', image_url: null }],
        // Éfeso B3
        ['q-efe-b3-1', { id: 'q-efe-b3-1', city_id: 'city-efeso-002', block: 3, difficulty: 1, question_text: 'Qual é a estrutura mais famosa das ruínas de Éfeso?', option_a: 'Teatro de Éfeso', option_b: 'Biblioteca de Celso', option_c: 'Templo de Ártemis', option_d: 'Ágora de Éfeso', correct_option: 'B', explanation: 'A Biblioteca de Celso é o monumento mais icônico de Éfeso.', image_url: null }],
        ['q-efe-b3-2', { id: 'q-efe-b3-2', city_id: 'city-efeso-002', block: 3, difficulty: 2, question_text: 'Éfeso é Patrimônio Mundial da UNESCO desde qual ano?', option_a: '1985', option_b: '1994', option_c: '2015', option_d: '2000', correct_option: 'C', explanation: 'As ruínas de Éfeso foram inscritas na UNESCO em 2015.', image_url: null }],
        ['q-efe-b3-3', { id: 'q-efe-b3-3', city_id: 'city-efeso-002', block: 3, difficulty: 3, question_text: 'Quantos visitantes Éfeso recebe por ano?', option_a: '500 mil', option_b: '1 milhão', option_c: '2 milhões', option_d: '3 milhões', correct_option: 'C', explanation: 'Éfeso recebe cerca de 2 milhões de visitantes por ano.', image_url: null }],
        // Malta B1
        ['q-mlt-b1-1', { id: 'q-mlt-b1-1', city_id: 'city-malta-003', block: 1, difficulty: 1, question_text: 'O que aconteceu com Paulo quando chegou à ilha de Malta?', option_a: 'Foi preso', option_b: 'Uma víbora o mordeu mas não morreu', option_c: 'Pregou no templo local', option_d: 'Fundou uma igreja', correct_option: 'B', explanation: 'Uma víbora mordeu Paulo mas ele não sofreu nenhum mal (Atos 28:3-6).', image_url: null }],
        ['q-mlt-b1-2', { id: 'q-mlt-b1-2', city_id: 'city-malta-003', block: 1, difficulty: 2, question_text: 'Qual era o nome do governador de Malta que hospedou Paulo?', option_a: 'Félix', option_b: 'Festo', option_c: 'Públio', option_d: 'Agripa', correct_option: 'C', explanation: 'Públio recebeu Paulo hospitaleiramente e Paulo curou seu pai doente (Atos 28:7-8).', image_url: null }],
        ['q-mlt-b1-3', { id: 'q-mlt-b1-3', city_id: 'city-malta-003', block: 1, difficulty: 3, question_text: 'Quantos meses Paulo ficou em Malta antes de partir para Roma?', option_a: '1 mês', option_b: '2 meses', option_c: '3 meses', option_d: '6 meses', correct_option: 'C', explanation: 'Paulo ficou em Malta por três meses, pois era inverno. Partiu na primavera (Atos 28:11).', image_url: null }],
        // Malta B2
        ['q-mlt-b2-1', { id: 'q-mlt-b2-1', city_id: 'city-malta-003', block: 2, difficulty: 1, question_text: 'Malta é um país localizado em qual mar?', option_a: 'Mar do Norte', option_b: 'Mar Negro', option_c: 'Mar Mediterrâneo', option_d: 'Mar Adriático', correct_option: 'C', explanation: 'Malta fica no centro do Mar Mediterrâneo, ao sul da Sicília.', image_url: null }],
        ['q-mlt-b2-2', { id: 'q-mlt-b2-2', city_id: 'city-malta-003', block: 2, difficulty: 2, question_text: 'Qual é a capital de Malta?', option_a: 'Valletta', option_b: 'Mdina', option_c: 'Sliema', option_d: 'Gozo', correct_option: 'A', explanation: 'Valletta é a capital de Malta e Patrimônio Mundial da UNESCO.', image_url: null }],
        ['q-mlt-b2-3', { id: 'q-mlt-b2-3', city_id: 'city-malta-003', block: 2, difficulty: 3, question_text: 'Qual é a área total de Malta?', option_a: '316 km²', option_b: '1.200 km²', option_c: '5.000 km²', option_d: '85 km²', correct_option: 'A', explanation: 'Malta tem apenas 316 km², sendo um dos menores países do mundo.', image_url: null }],
        // Malta B3
        ['q-mlt-b3-1', { id: 'q-mlt-b3-1', city_id: 'city-malta-003', block: 3, difficulty: 1, question_text: 'Qual é o principal atrativo turístico cristão de Paulo em Malta?', option_a: 'Catedral de São João', option_b: 'Gruta de São Paulo', option_c: 'Igreja de São Paulo Náufrago', option_d: 'Baía de São Paulo', correct_option: 'D', explanation: 'A Baía de São Paulo é o local tradicional do naufrágio de Paulo.', image_url: null }],
        ['q-mlt-b3-2', { id: 'q-mlt-b3-2', city_id: 'city-malta-003', block: 3, difficulty: 2, question_text: 'Malta é membro de qual organização europeia?', option_a: 'EFTA', option_b: 'União Europeia', option_c: 'Commonwealth', option_d: 'NATO apenas', correct_option: 'B', explanation: 'Malta aderiu à União Europeia em 2004 e adotou o euro em 2008.', image_url: null }],
        ['q-mlt-b3-3', { id: 'q-mlt-b3-3', city_id: 'city-malta-003', block: 3, difficulty: 3, question_text: 'Qual setor é o maior contribuinte para a economia de Malta?', option_a: 'Agricultura', option_b: 'Indústria pesada', option_c: 'Serviços financeiros e turismo', option_d: 'Pesca', correct_option: 'C', explanation: 'Malta tem economia baseada em serviços financeiros e turismo, com mais de 2 milhões de visitantes/ano.', image_url: null }],
    ]),

    gameSessions: new Map<string, MockGameSession>(),
    userAnswers: new Map<string, MockUserAnswer>(),
    rankings: new Map<string, MockRanking>(),
    imageBank: new Map<string, ImageBankItem>(),

    siteSettings: {
        hero: {
            image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=80',
            title: 'O Discípulo',
            title_en: 'The Disciple',
            subtitle: 'Onde História e Aventura se Encontram',
            subtitle_en: 'Where History and Adventure Meet',
            description: 'Uma jornada interativa de conhecimento bíblico, geografia atual e turismo religioso. Explore as cidades que transformaram o mundo.',
            description_en: 'An interactive journey of biblical knowledge, modern geography and religious tourism. Explore the cities that changed the world.',
            badge_text: 'As Viagens de Paulo',
            badge_text_en: "Paul's Journeys",
            cta_primary: 'Começar Jornada',
            cta_primary_en: 'Start Your Journey',
            cta_secondary: 'Já tenho conta',
            cta_secondary_en: 'I already have an account',
            stats: [{ number: '10+', label: 'Cidades' }, { number: '270+', label: 'Perguntas' }, { number: '3', label: 'Blocos' }],
        },
        cities_section: {
            label: 'Destinos Históricos',
            label_en: 'Historic Destinations',
            title: 'Explore as Cidades Bíblicas',
            title_en: 'Explore the Biblical Cities',
            subtitle: 'Cada cidade guarda histórias milenares esperando para serem descobertas.',
            subtitle_en: 'Each city holds ancient stories waiting to be discovered.',
        },
        map_section: {
            image_url: '/images/map.svg',
            label: 'Viagens Missionárias',
            label_en: 'Missionary Journeys',
            title: 'As Rotas do Apóstolo Paulo',
            title_en: "The Apostle Paul's Routes",
            subtitle: 'Três jornadas que transformaram o mundo. Mais de 16.000 km percorridos em 12 anos.',
            subtitle_en: 'Three journeys that changed the world. Over 16,000 km traveled in 12 years.',
            stats: [{ label: 'DISTÂNCIA', value: '16.000+ km' }, { label: 'DURAÇÃO', value: '~12 anos' }, { label: 'PAÍSES', value: '10 visitados' }, { label: 'CIDADES', value: '50+ cidades' }],
            journeys: [
                { num: '1ª', title: 'Primeira Viagem', route: 'Chipre, Turquia', date: '46-48 d.C.' },
                { num: '2ª', title: 'Segunda Viagem', route: 'Grécia, Macedônia', date: '49-52 d.C.' },
                { num: '3ª', title: 'Terceira Viagem', route: 'Éfeso, Jerusalém', date: '53-58 d.C.' },
            ],
        },
        how_it_works: {
            label: 'Como Funciona',
            label_en: 'How It Works',
            title: 'Uma experiência única de aprendizado',
            title_en: 'A unique learning experience',
            subtitle: 'Aprenda, compita e ganhe prêmios reais explorando as cidades bíblicas.',
            subtitle_en: 'Learn, compete and win real prizes exploring the biblical cities.',
            items: [
                { icon: '📖', title: 'Aprenda', desc: 'Mergulhe em perguntas sobre contexto bíblico, geografia moderna e turismo local de cada cidade histórica.' },
                { icon: '⚔️', title: 'Compita', desc: 'Responda perguntas com precisão e velocidade. Suba no ranking global e desafie jogadores do mundo todo.' },
                { icon: '🏆', title: 'Ganhe', desc: 'Os melhores colocados ganham viagens reais para explorar as cidades históricas do cristianismo.' },
            ],
        },
        cta_section: {
            title: 'Pronto para Começar sua Jornada?',
            title_en: 'Ready to Start Your Journey?',
            subtitle: 'Junte-se a milhares de discípulos ao redor do mundo na maior aventura de conhecimento bíblico e turismo religioso.',
            subtitle_en: 'Join thousands of disciples around the world in the greatest adventure of biblical knowledge and religious tourism.',
            button_text: 'Criar Conta Gratuita',
            button_text_en: 'Create Free Account',
        },
        footer: {
            text: '© 2026 O Discípulo — Ricardo Almeida — Usine Criative — Todos os direitos reservados',
            text_en: '© 2026 The Disciple — Ricardo Almeida — Usine Criative — All rights reserved',
        },
        about: {
            label: 'Sobre o Jogo',
            label_en: 'About the Game',
            title: 'O que é O Discípulo?',
            title_en: 'What is The Disciple?',
            subtitle: 'Uma experiência única que combina fé, história e aventura.',
            subtitle_en: 'A unique experience that combines faith, history and adventure.',
            paragraphs: [
                'O Discípulo é um jogo educativo interativo que te leva numa viagem pelas cidades percorridas pelo Apóstolo Paulo. Responda perguntas sobre história bíblica, geografia moderna e turismo religioso enquanto compete com jogadores do mundo todo.',
                'Cada cidade é uma fase completa com 3 blocos de conhecimento: contexto bíblico, geografia atual e turismo local. São 9 perguntas por cidade, com dificuldade progressiva e timer — teste seus conhecimentos e suba no ranking!',
                'Além de aprender, você pode desafiar amigos em duelos PvP, participar de desafios diários, ganhar XP para subir de nível e até fazer check-in GPS nas cidades reais para ganhar pontos extras.',
            ],
            features: [
                { icon: '📖', title: 'Conteúdo Bíblico', desc: 'Perguntas baseadas nas Escrituras e no contexto histórico das viagens de Paulo.' },
                { icon: '🌍', title: 'Geografia Real', desc: 'Aprenda sobre as cidades modernas que guardam a história do cristianismo primitivo.' },
                { icon: '✈️', title: 'Turismo Religioso', desc: 'Descubra pontos turísticos, monumentos e locais sagrados de cada cidade.' },
                { icon: '🏆', title: 'Competição Global', desc: 'Ranking mundial, duelos PvP, desafios diários e sistema de ligas.' },
            ],
        },
        testimonials: {
            label: 'O que Dizem',
            label_en: 'What They Say',
            title: 'Jogadores ao Redor do Mundo',
            title_en: 'Players Around the World',
            subtitle: 'Veja o que a comunidade está falando sobre O Discípulo.',
            subtitle_en: 'See what the community is saying about The Disciple.',
            items: [
                { name: 'Ana Silva', role: 'Professora de EBD', text: 'Uso O Discípulo nas aulas da Escola Bíblica Dominical. Os jovens adoram competir enquanto aprendem!', avatar: '👩‍🏫' },
                { name: 'Pastor Carlos', role: 'Igreja Batista Central', text: 'Uma ferramenta incrível para engajar a igreja no estudo bíblico de forma divertida e moderna.', avatar: '⛪' },
                { name: 'Marcos Oliveira', role: 'Jogador desde 2026', text: 'Aprendi mais sobre as viagens de Paulo jogando do que em anos de estudo. Viciante e educativo!', avatar: '🎮' },
            ],
            stats: [
                { number: '1.200+', label: 'Jogadores Ativos' },
                { number: '45.000+', label: 'Perguntas Respondidas' },
                { number: '98%', label: 'Aprovação' },
                { number: '15+', label: 'Países' },
            ],
        },
        faq: {
            label: 'Dúvidas Frequentes',
            label_en: 'FAQ',
            title: 'Perguntas Frequentes',
            title_en: 'Frequently Asked Questions',
            subtitle: 'Tudo que você precisa saber sobre O Discípulo.',
            subtitle_en: 'Everything you need to know about The Disciple.',
            items: [
                { question: 'O jogo é gratuito?', answer: 'Sim! O Discípulo é gratuito para jogar. Temos um plano Premium opcional com power-ups extras e conteúdo exclusivo.' },
                { question: 'Preciso instalar um aplicativo?', answer: 'Não! O Discípulo funciona direto no navegador do celular ou computador. Basta acessar disciplegame.com.' },
                { question: 'Como funciona o sistema de pontos?', answer: 'Cada pergunta vale pontos baseados na dificuldade: fácil (100 pts), médio (200 pts) e difícil (300 pts). Você tem 30 segundos por pergunta.' },
                { question: 'Posso jogar com amigos?', answer: 'Sim! Você pode criar salas privadas, desafiar amigos em duelos PvP e compartilhar seus resultados.' },
                { question: 'Quais cidades estão disponíveis?', answer: 'Atualmente temos Jerusalém, Éfeso e Malta. Novas cidades são adicionadas regularmente seguindo as viagens do Apóstolo Paulo.' },
                { question: 'O conteúdo é biblicamente preciso?', answer: 'Sim! Todas as perguntas são baseadas em fontes bíblicas e históricas confiáveis, com explicações detalhadas após cada resposta.' },
            ],
        },
    } as Record<string, any>,

    gameRules: {
        time_per_question: 30,
        points_easy: 100,
        points_medium: 200,
        points_hard: 300,
        penalty_wrong: 0,
        questions_per_game: 9,
        progressive_difficulty: true,
        blocks: [
            { id: 1, name: 'Bíblico', description: 'Perguntas sobre contexto bíblico e histórico' },
            { id: 2, name: 'Geografia', description: 'Perguntas sobre geografia moderna das cidades' },
            { id: 3, name: 'Turismo', description: 'Perguntas sobre turismo e cultura local' },
        ],
    } as Record<string, any>,
};

// Persist across hot reloads in dev mode
if (!globalForMock.__mockStore) {
    globalForMock.__mockStore = _defaultStore;

    // Load persisted admin data from disk (survives pm2 restart / deploys)
    if (typeof window === 'undefined') {
        try {
            const { applyPersistedData, savePersistedData, loadPersistedData } = require('./persistence');
            const loaded = applyPersistedData(globalForMock.__mockStore);
            if (!loaded) {
                // First boot: save defaults so they survive the next restart
                savePersistedData(globalForMock.__mockStore);
                console.log('[MockDb] First boot — saved defaults to disk');
            }
        } catch (e) {
            console.log('[MockDb] Persistence not available, using defaults');
        }
    }
}
export const mockStore = globalForMock.__mockStore;

// Call this after any admin write operation to persist to disk
export function persistAdminData() {
    if (typeof window === 'undefined') {
        try {
            const { savePersistedData } = require('./persistence');
            savePersistedData(mockStore);
        } catch (e) {
            console.error('[MockDb] Failed to persist:', e);
        }
    }
}

// Auto-register an image URL in the bank (called from admin APIs)
export function registerImageInBank(url: string | null, category: string = 'general') {
    if (!url || url.trim() === '') return;
    // Check if already in bank
    for (const img of mockStore.imageBank.values()) {
        if (img.url === url) return; // already registered
    }
    const id = 'img-' + generateId();
    const item: ImageBankItem = {
        id, url,
        name: extractNameFromUrl(url),
        category, size: 0,
        type: guessImageType(url),
        usedIn: [],
        uploaded_at: new Date().toISOString(),
    };
    mockStore.imageBank.set(id, item);
}

function extractNameFromUrl(url: string): string {
    try {
        const parts = url.split('/');
        const filename = parts[parts.length - 1].split('?')[0];
        return decodeURIComponent(filename).substring(0, 60) || 'imagem';
    } catch { return 'imagem'; }
}

function guessImageType(url: string): string {
    const l = url.toLowerCase();
    if (l.includes('.png')) return 'image/png';
    if (l.includes('.webp')) return 'image/webp';
    if (l.includes('.gif')) return 'image/gif';
    if (l.includes('.svg')) return 'image/svg+xml';
    return 'image/jpeg';
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function getUserByEmail(email: string): MockUser | undefined {
    for (const user of mockStore.users.values()) {
        if (user.email === email.toLowerCase()) return user;
    }
    return undefined;
}

export function getCitiesByCircuit(circuitId: string): MockCity[] {
    const cities: MockCity[] = [];
    for (const city of mockStore.cities.values()) {
        if (city.circuit_id === circuitId) cities.push(city);
    }
    return cities.sort((a, b) => a.order_index - b.order_index);
}

export function getQuestionsByCity(cityId: string): MockQuestion[] {
    const questions: MockQuestion[] = [];
    for (const q of mockStore.questions.values()) {
        if (q.city_id === cityId) questions.push(q);
    }
    return questions;
}

export function getAnswersBySession(sessionId: string): MockUserAnswer[] {
    const answers: MockUserAnswer[] = [];
    for (const a of mockStore.userAnswers.values()) {
        if (a.session_id === sessionId) answers.push(a);
    }
    return answers;
}

export function getRankings(circuitId?: string, limit = 100): Array<MockRanking & { user_name: string; country: string | null; rank: number }> {
    const results: Array<MockRanking & { user_name: string; country: string | null; rank: number }> = [];
    for (const r of mockStore.rankings.values()) {
        if (circuitId && r.circuit_id !== circuitId) continue;
        const user = mockStore.users.get(r.user_id);
        results.push({ ...r, user_name: user?.name || 'Desconhecido', country: user?.country || null, rank: 0 });
    }
    results.sort((a, b) => b.total_points - a.total_points || a.total_time_seconds - b.total_time_seconds);
    results.forEach((r, i) => { r.rank = i + 1; });
    return results.slice(0, limit);
}

export function getUserStats(userId: string) {
    let totalPoints = 0, completedSessions = 0, totalSessions = 0, totalCorrect = 0, totalAnswered = 0;
    for (const s of mockStore.gameSessions.values()) {
        if (s.user_id !== userId) continue;
        totalSessions++;
        if (s.status === 'completed') {
            completedSessions++;
            totalPoints += s.total_points;
        }
    }
    for (const a of mockStore.userAnswers.values()) {
        if (a.user_id !== userId) continue;
        totalAnswered++;
        if (a.is_correct) totalCorrect++;
    }
    const avgAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    return { totalSessions, completedSessions, totalPoints, avgAccuracy, totalAchievements: 0 };
}

export function getCompletedCityIds(userId: string, circuitId: string): string[] {
    const completedCities = new Set<string>();
    const cities = getCitiesByCircuit(circuitId);
    for (const city of cities) {
        const cityQuestions = getQuestionsByCity(city.id);
        if (cityQuestions.length === 0) continue;
        const answeredIds = new Set<string>();
        for (const a of mockStore.userAnswers.values()) {
            if (a.user_id === userId) answeredIds.add(a.question_id);
        }
        const allAnswered = cityQuestions.every(q => answeredIds.has(q.id));
        if (allAnswered) completedCities.add(city.id);
    }
    return Array.from(completedCities);
}

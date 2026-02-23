// File-based persistence for admin data (cities, questions, settings, game rules)
// This ensures data survives server restarts (pm2 restart, deploys, etc.)

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PERSIST_FILE = path.join(DATA_DIR, 'admin-data.json');

interface PersistedData {
    cities: Record<string, any>;
    questions: Record<string, any>;
    siteSettings: Record<string, any>;
    gameRules: Record<string, any>;
    imageBank?: Record<string, any>;
    savedAt: string;
}

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

export function loadPersistedData(): PersistedData | null {
    try {
        if (!fs.existsSync(PERSIST_FILE)) return null;
        const raw = fs.readFileSync(PERSIST_FILE, 'utf-8');
        const data = JSON.parse(raw) as PersistedData;
        console.log(`[Persistence] Loaded admin data from disk (saved at ${data.savedAt})`);
        return data;
    } catch (error) {
        console.error('[Persistence] Error loading persisted data:', error);
        return null;
    }
}

export function savePersistedData(store: {
    cities: Map<string, any>;
    questions: Map<string, any>;
    siteSettings: Record<string, any>;
    gameRules: Record<string, any>;
    imageBank: Map<string, any>;
}) {
    try {
        ensureDataDir();

        const data: PersistedData = {
            cities: Object.fromEntries(store.cities),
            questions: Object.fromEntries(store.questions),
            siteSettings: store.siteSettings,
            gameRules: store.gameRules,
            imageBank: Object.fromEntries(store.imageBank),
            savedAt: new Date().toISOString(),
        };

        fs.writeFileSync(PERSIST_FILE, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`[Persistence] Saved admin data to disk at ${data.savedAt}`);
    } catch (error) {
        console.error('[Persistence] Error saving data:', error);
    }
}

export function applyPersistedData(store: {
    cities: Map<string, any>;
    questions: Map<string, any>;
    siteSettings: Record<string, any>;
    gameRules: Record<string, any>;
    imageBank: Map<string, any>;
}): boolean {
    const data = loadPersistedData();
    if (!data) return false;

    // Restore cities
    if (data.cities && Object.keys(data.cities).length > 0) {
        store.cities.clear();
        for (const [id, city] of Object.entries(data.cities)) {
            store.cities.set(id, city);
        }
        console.log(`[Persistence] Restored ${store.cities.size} cities`);
    }

    // Restore questions
    if (data.questions && Object.keys(data.questions).length > 0) {
        store.questions.clear();
        for (const [id, question] of Object.entries(data.questions)) {
            store.questions.set(id, question);
        }
        console.log(`[Persistence] Restored ${store.questions.size} questions`);
    }

    // Restore site settings
    if (data.siteSettings) {
        Object.assign(store.siteSettings, data.siteSettings);
        console.log('[Persistence] Restored site settings');
    }

    // Restore game rules
    if (data.gameRules) {
        Object.assign(store.gameRules, data.gameRules);
        console.log('[Persistence] Restored game rules');
    }

    // Restore image bank
    if (data.imageBank && Object.keys(data.imageBank).length > 0) {
        store.imageBank.clear();
        for (const [id, img] of Object.entries(data.imageBank)) {
            store.imageBank.set(id, img);
        }
        console.log(`[Persistence] Restored ${store.imageBank.size} images`);
    }

    return true;
}

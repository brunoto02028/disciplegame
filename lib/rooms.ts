// Room/Group system for churches and Bible study groups

const globalForRooms = globalThis as unknown as { __rooms?: Map<string, Room> };
if (!globalForRooms.__rooms) globalForRooms.__rooms = new Map();
export const roomStore = globalForRooms.__rooms;

export interface RoomPlayer {
    userId: string;
    name: string;
    score: number;
    accuracy: number;
    answeredCount: number;
    joinedAt: Date;
}

export interface Room {
    id: string;
    code: string; // 6-char join code
    name: string;
    hostId: string;
    hostName: string;
    cityId: string;
    cityName: string;
    questionIds: string[];
    players: Map<string, RoomPlayer>;
    status: 'waiting' | 'playing' | 'finished';
    maxPlayers: number;
    createdAt: Date;
}

function generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

export function createRoom(id: string, name: string, hostId: string, hostName: string, cityId: string, cityName: string, questionIds: string[], maxPlayers = 20): Room {
    const room: Room = {
        id,
        code: generateRoomCode(),
        name,
        hostId,
        hostName,
        cityId,
        cityName,
        questionIds,
        players: new Map(),
        status: 'waiting',
        maxPlayers,
        createdAt: new Date(),
    };
    // Host auto-joins
    room.players.set(hostId, { userId: hostId, name: hostName, score: 0, accuracy: 0, answeredCount: 0, joinedAt: new Date() });
    roomStore.set(id, room);
    return room;
}

export function joinRoom(roomIdOrCode: string, userId: string, name: string): Room | null {
    // Find by ID or code
    let room = roomStore.get(roomIdOrCode);
    if (!room) {
        for (const r of roomStore.values()) {
            if (r.code === roomIdOrCode.toUpperCase()) { room = r; break; }
        }
    }
    if (!room) return null;
    if (room.status !== 'waiting') return null;
    if (room.players.size >= room.maxPlayers) return null;

    if (!room.players.has(userId)) {
        room.players.set(userId, { userId, name, score: 0, accuracy: 0, answeredCount: 0, joinedAt: new Date() });
    }
    return room;
}

export function startRoom(roomId: string, hostId: string): boolean {
    const room = roomStore.get(roomId);
    if (!room || room.hostId !== hostId || room.status !== 'waiting') return false;
    room.status = 'playing';
    return true;
}

export function submitRoomAnswer(roomId: string, userId: string, correct: boolean, points: number): boolean {
    const room = roomStore.get(roomId);
    if (!room || room.status !== 'playing') return false;
    const player = room.players.get(userId);
    if (!player) return false;

    player.answeredCount++;
    if (correct) player.score += points;
    player.accuracy = player.answeredCount > 0 ? Math.round((player.score / (player.answeredCount * 200)) * 100) : 0;

    // Check if all players finished all questions
    const allDone = Array.from(room.players.values()).every(p => p.answeredCount >= room.questionIds.length);
    if (allDone) room.status = 'finished';

    return true;
}

export function getRoom(roomId: string): Room | null {
    return roomStore.get(roomId) || null;
}

export function getRoomByCode(code: string): Room | null {
    for (const r of roomStore.values()) {
        if (r.code === code.toUpperCase()) return r;
    }
    return null;
}

export function getRoomLeaderboard(roomId: string): RoomPlayer[] {
    const room = roomStore.get(roomId);
    if (!room) return [];
    return Array.from(room.players.values()).sort((a, b) => b.score - a.score);
}

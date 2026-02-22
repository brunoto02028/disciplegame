import crypto from 'crypto';

// ── Base32 encode/decode (RFC 4648) ──
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
    let bits = '';
    for (const byte of buffer) bits += byte.toString(2).padStart(8, '0');
    let result = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.slice(i, i + 5).padEnd(5, '0');
        result += BASE32_CHARS[parseInt(chunk, 2)];
    }
    return result;
}

export function base32Decode(str: string): Buffer {
    let bits = '';
    for (const char of str.toUpperCase().replace(/=+$/, '')) {
        const idx = BASE32_CHARS.indexOf(char);
        if (idx === -1) continue;
        bits += idx.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return Buffer.from(bytes);
}

// ── Generate random TOTP secret ──
export function generateSecret(length = 20): string {
    const buffer = crypto.randomBytes(length);
    return base32Encode(buffer);
}

// ── Generate TOTP code for a given time ──
export function generateTOTP(secret: string, timeStep = 30, digits = 6, offset = 0): string {
    const time = Math.floor(Date.now() / 1000 / timeStep) + offset;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(time, 4);

    const key = base32Decode(secret);
    const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();

    const offsetByte = hmac[hmac.length - 1] & 0x0f;
    const code = (
        ((hmac[offsetByte] & 0x7f) << 24) |
        ((hmac[offsetByte + 1] & 0xff) << 16) |
        ((hmac[offsetByte + 2] & 0xff) << 8) |
        (hmac[offsetByte + 3] & 0xff)
    ) % Math.pow(10, digits);

    return code.toString().padStart(digits, '0');
}

// ── Verify TOTP code (allows ±1 time window for clock drift) ──
export function verifyTOTP(secret: string, code: string): boolean {
    for (let offset = -1; offset <= 1; offset++) {
        if (generateTOTP(secret, 30, 6, offset) === code) return true;
    }
    return false;
}

// ── Generate otpauth:// URI for QR code ──
export function generateOTPAuthURI(secret: string, account: string, issuer: string): string {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

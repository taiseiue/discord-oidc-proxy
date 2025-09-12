import { vi } from 'vitest';

/**
 * Discord API関連のモック
 */
export const discordMocks = {
	createDiscordAuthUrl: vi.fn((clientId: string, issuer: string, sessionId: string) => {
		return new URL(`https://discord.example.com/oauth2?client_id=${clientId}&redirect_uri=${issuer}/callback&state=${sessionId}`);
	}),
	exchangeDiscordCode: vi.fn(async () => ({
		access_token: 'discord-access-token',
		token_type: 'Bearer',
		expires_in: 1000,
	})),
	getDiscordUserInfo: vi.fn(async () => ({
		id: 'u1',
		username: 'testuser',
		global_name: 'Test User',
		avatar: 'avatar_hash',
		email: 'test@example.com',
		verified: true,
		locale: 'ja',
	})),
};

/**
 * JWT関連のモック
 */
export const jwtMocks = {
	generateIdToken: vi.fn(async () => 'mock-id-token'),
};

/**
 * すべてのモックをクリアする
 */
export function clearAllMocks(): void {
	Object.values(discordMocks).forEach((mock) => mock.mockClear());
	Object.values(jwtMocks).forEach((mock) => mock.mockClear());
}

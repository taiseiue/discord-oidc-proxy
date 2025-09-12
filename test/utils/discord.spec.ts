import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { createDiscordAuthUrl, getDiscordUserInfo, exchangeDiscordCode } from '../../src/utils/discord';
import { HTTPException } from 'hono/http-exception';

// fetch をモック
const originalFetch = globalThis.fetch;

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('createDiscordAuthUrl', () => {
	it('必要なクエリパラメータを含むURLを生成する', () => {
		const url = createDiscordAuthUrl('cid', 'https://issuer.example.com', 'sess123');
		expect(url.hostname).toBe('discord.com');
		expect(url.searchParams.get('client_id')).toBe('cid');
		expect(url.searchParams.get('redirect_uri')).toBe('https://issuer.example.com/callback');
		expect(url.searchParams.get('response_type')).toBe('code');
		expect(url.searchParams.get('scope')).toBe('identify email guilds');
		expect(url.searchParams.get('state')).toBe('sess123');
	});
});

describe('getDiscordUserInfo', () => {
	it('正常時 DiscordUser を返す', async () => {
		const mockUser = { id: '1', username: 'u', avatar: 'a', email: 'e@example.com' };
		globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => mockUser });
		const user = await getDiscordUserInfo('token');
		expect(user).toEqual(mockUser);
		expect(globalThis.fetch).toHaveBeenCalledWith(
			'https://discord.com/api/v10/users/@me',
			expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token' }) })
		);
	});

	it('エラー時 HTTPException を投げる', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve('err') });
		await expect(getDiscordUserInfo('bad')).rejects.toBeInstanceOf(HTTPException);
	});
});

describe('exchangeDiscordCode', () => {
	it('正常時 DiscordTokenResponse を返す', async () => {
		const mockToken = { access_token: 'atk', token_type: 'Bearer', expires_in: 3600 };
		globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => mockToken });
		const res = await exchangeDiscordCode('code', 'cid', 'secret', 'https://cb');
		expect(res).toEqual(mockToken);
		const body = new URLSearchParams({
			client_id: 'cid',
			client_secret: 'secret',
			grant_type: 'authorization_code',
			code: 'code',
			redirect_uri: 'https://cb',
		});
		expect(globalThis.fetch).toHaveBeenCalledWith(
			'https://discord.com/api/v10/oauth2/token',
			expect.objectContaining({ method: 'POST', body })
		);
	});

	it('エラー時 HTTPException を投げる', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'invalid' }) });
		await expect(exchangeDiscordCode('c', 'a', 'b', 'r')).rejects.toBeInstanceOf(HTTPException);
	});
});

// 後片付け
afterAll(() => {
	globalThis.fetch = originalFetch;
});

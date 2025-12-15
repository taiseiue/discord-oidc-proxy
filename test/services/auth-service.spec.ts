import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/services/auth-service';
import { IAppContext, StoredSessionData } from '../../src/types';
import { createTestContext } from '../test-utils';

// Discord utilsのモック
vi.mock('../../src/utils/discord', () => ({
	createDiscordAuthUrlWithOidcScope: vi.fn((clientId: string, issuer: string, sessionId: string, _oidcScope: string) => {
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
	})),
}));

// 型安全のためのimport
import { createDiscordAuthUrlWithOidcScope, exchangeDiscordCode, getDiscordUserInfo } from '../../src/utils/discord';

describe('AuthService', () => {
	let context: IAppContext;

	beforeEach(() => {
		context = createTestContext();
		vi.clearAllMocks();
	});

	describe('handleAuthorizeRequest', () => {
		it('セッションを保存しDiscord へのリダイレクトURLを返す', async () => {
			const svc = new AuthService(context);
			const res = await svc.handleAuthorizeRequest({
				response_type: 'code',
				redirect_uri: 'https://rp.example.com/cb',
				scope: 'openid',
				state: 'xyz',
			});

			expect(res.sessionId).toBeDefined();
			expect(res.redirectUrl).toContain('discord.example.com');

			const storedRaw = await context.storage.get(res.sessionId);
			expect(storedRaw).not.toBeNull();
			const stored = JSON.parse(storedRaw || '{}') as StoredSessionData;
			expect(stored.sessionState).toBe('xyz');
			expect(stored.sessionRedirectUri).toBe('https://rp.example.com/cb');
			expect(stored.sessionScope).toBe('openid');
			expect(createDiscordAuthUrlWithOidcScope).toHaveBeenCalledWith(
				context.config.discordClientId,
				context.config.oidcIssuer,
				res.sessionId,
				'openid'
			);
		});
	});

	describe('handleCallbackRequest', () => {
		it('コードを交換し最終的なリダイレクトURLを構築する', async () => {
			const svc = new AuthService(context);

			// 事前にセッション投入
			const sessionId = 'sess1';
			const session: StoredSessionData = {
				sessionState: 'orig-state',
				sessionRedirectUri: 'https://rp.example.com/cb',
				sessionScope: 'openid profile',
			};
			await context.storage.put(sessionId, JSON.stringify(session));

			const res = await svc.handleCallbackRequest({ code: 'discord-code', sessionId });

			expect(res.redirectUrl).toContain('https://rp.example.com/cb');
			const url = new URL(res.redirectUrl);
			expect(url.searchParams.get('code')).toBeDefined();
			expect(url.searchParams.get('state')).toBe('orig-state');

			// セッション削除済みを確認
			expect(await context.storage.get(sessionId)).toBeNull();
			expect(exchangeDiscordCode).toHaveBeenCalled();
			expect(getDiscordUserInfo).toHaveBeenCalled();
		});

		it('セッションが存在しないならばエラー', async () => {
			const svc = new AuthService(context);

			await expect(
				svc.handleCallbackRequest({
					code: 'x',
					sessionId: 'nope',
				})
			).rejects.toThrow('Invalid or expired state');
		});
	});
});

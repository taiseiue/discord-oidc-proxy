import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenService } from '../../src/services/token-service';
import { IAppContext, StoredTokenData } from '../../src/types';
import { createTestContext } from '../test-utils';

// JWT utilsのモック
vi.mock('../../src/utils/jwt', () => ({
	generateIdToken: vi.fn(async () => 'mock-id-token'),
}));

// jose ライブラリもモック
vi.mock('jose', () => ({
	importPKCS8: vi.fn(async () => ({ type: 'private' })),
}));

// 型安全のためのimport
import { generateIdToken } from '../../src/utils/jwt';

describe('TokenService', () => {
	let context: IAppContext;

	beforeEach(() => {
		context = createTestContext();
		vi.clearAllMocks();
	});

	describe('exchangeCodeForToken', () => {
		it('コードをトークンに交換し、JWT生成とアクセストークン保存を行う', async () => {
			const svc = new TokenService(context);
			const code = 'auth-code-1';
			const stored: StoredTokenData = {
				discordUser: { id: 'u1', username: 'u', avatar: 'av', email: 'u@example.com' },
				discordToken: 'disTok',
			};
			await context.storage.put(code, JSON.stringify(stored));

			const res = await svc.exchangeCodeForToken(code);

			expect(res.id_token).toBe('mock-id-token');
			expect(res.token_type).toBe('Bearer');
			expect(typeof res.access_token).toBe('string');
			expect(generateIdToken).toHaveBeenCalledWith(
				stored.discordUser,
				expect.any(Object), // privateKey object
				context.config.oidcIssuer,
				context.config.oidcAudience
			);

			// コードは削除済み
			expect(await context.storage.get(code)).toBeNull();

			// アクセストークンが保存されていることを確認
			const accessTokenKey = `access_token:${res.access_token}`;
			const savedDiscordToken = await context.storage.get(accessTokenKey);
			expect(savedDiscordToken).toBe('disTok');
		});

		it('不正なコードならエラー', async () => {
			const svc = new TokenService(context);

			await expect(svc.exchangeCodeForToken('missing')).rejects.toThrow('Invalid or expired code');
		});
	});
});

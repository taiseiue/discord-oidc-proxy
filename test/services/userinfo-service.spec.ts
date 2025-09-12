import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserInfoService } from '../../src/services/userinfo-service';
import { IAppContext } from '../../src/types';
import { createTestContext } from '../test-utils';
import { clearAllMocks } from '../mock-utils';

// Discord utilsのモック
vi.mock('../../src/utils/discord', () => ({
	getDiscordUserInfo: vi.fn(async () => ({
		id: 'u1',
		username: 'testuser',
		global_name: 'Test User',
		avatar: 'avatar_hash',
		email: 'test@example.com',
		verified: true,
		locale: 'ja',
	})),
}));

// 型安全のためのimport
import { getDiscordUserInfo } from '../../src/utils/discord';

describe('UserInfoService', () => {
	let context: IAppContext;

	beforeEach(() => {
		context = createTestContext();
		vi.clearAllMocks();
	});

	describe('getUserInfo', () => {
		it('アクセストークンから Discord 情報を取得しOIDC claimsを返す', async () => {
			const svc = new UserInfoService(context);
			await context.storage.put('access_token:atk1', 'discord-origin-token');

			const claims = await svc.getUserInfo('atk1');

			expect(claims.sub).toBe('u1');
			expect(claims.name).toBe('Test User');
			expect(claims.preferred_username).toBe('testuser');
			expect(claims.picture).toContain('u1');
			expect(claims.email).toBe('test@example.com');
			expect(getDiscordUserInfo).toHaveBeenCalledWith('discord-origin-token');
		});

		it('アクセストークンが無効ならエラー', async () => {
			const svc = new UserInfoService(context);

			await expect(svc.getUserInfo('invalid-token')).rejects.toThrow('Unauthorized');
		});
	});
});

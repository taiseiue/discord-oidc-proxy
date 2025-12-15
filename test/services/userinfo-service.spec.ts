import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserInfoService } from '../../src/services/userinfo-service';
import { IAppContext } from '../../src/types';
import { createTestContext } from '../test-utils';

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
	getDiscordGuildMember: vi.fn(async () => ({
		roles: ['r1', 'r2'],
	})),
}));

// 型安全のためのimport
import { getDiscordGuildMember, getDiscordUserInfo } from '../../src/utils/discord';

describe('UserInfoService', () => {
	let context: IAppContext;

	beforeEach(() => {
		context = createTestContext();
		vi.clearAllMocks();
	});

	describe('getUserInfo', () => {
		it('アクセストークンから Discord 情報を取得しOIDC claimsを返す', async () => {
			const svc = new UserInfoService(context);
			await context.storage.put(
				'access_token:atk1',
				JSON.stringify({ discordToken: 'discord-origin-token', oidcScope: 'openid profile email guild' })
			);

			const claims = await svc.getUserInfo('atk1');

			expect(claims.sub).toBe('u1');
			expect(claims.name).toBe('Test User');
			expect(claims.preferred_username).toBe('testuser');
			expect(claims.picture).toContain('u1');
			expect(claims.email).toBe('test@example.com');
			expect(claims.is_member_of_target_guild).toBe(true);
			expect(claims.roles).toEqual(['r1', 'r2']);
			expect(getDiscordUserInfo).toHaveBeenCalledWith('discord-origin-token');
			expect(getDiscordGuildMember).toHaveBeenCalledWith('discord-origin-token', context.config.targetGuildId);
		});

		it('アクセストークンが無効ならエラー', async () => {
			const svc = new UserInfoService(context);

			await expect(svc.getUserInfo('invalid-token')).rejects.toThrow('Unauthorized');
		});
	});
});

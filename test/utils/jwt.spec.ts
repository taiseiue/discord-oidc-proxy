import { describe, it, expect } from 'vitest';
import * as jose from 'jose';
import { generateIdToken } from '../../src/utils/jwt';
import { TOKEN_EXPIRATION_TTL } from '../../src/config';

const discordUser = {
	id: '1234567890',
	username: 'alice',
	global_name: 'Alice Global',
	avatar: 'abcdef',
	email: 'alice@example.com',
	verified: true,
};

describe('generateIdToken', () => {
	it('Discordユーザーから署名付きJWTを生成し、内容が期待通りである', async () => {
		const { privateKey, publicKey } = await jose.generateKeyPair('RS256');
		const issuer = 'https://issuer.example.com';
		const audience = 'my-aud';

		const token = await generateIdToken(discordUser as any, privateKey, issuer, audience);

		// 検証
		const { payload, protectedHeader } = await jose.jwtVerify(token, publicKey, { issuer, audience });
		expect(protectedHeader.alg).toBe('RS256');
		expect(payload.sub).toBe(discordUser.id);
		expect(payload.iss).toBe(issuer);
		expect(payload.aud).toBe(audience);
		expect(payload.name).toBe(discordUser.global_name);
		expect(payload.picture).toContain(discordUser.id);
		expect(payload.email).toBe(discordUser.email);
		expect(payload.email_verified).toBe(true);

		// exp と iat の相対関係確認
		expect(typeof payload.iat).toBe('number');
		expect(typeof payload.exp).toBe('number');
		if (typeof payload.iat === 'number' && typeof payload.exp === 'number') {
			expect(payload.exp - payload.iat).toBe(TOKEN_EXPIRATION_TTL);
		}
	});
});

import { describe, it, expect, beforeEach } from 'vitest';
import { DiscoveryService } from '../../src/services/discovery-service';
import { IAppContext } from '../../src/types';
import { createTestContext } from '../test-utils';

describe('DiscoveryService', () => {
	let context: IAppContext;

	beforeEach(() => {
		context = createTestContext();
	});

	it('OIDC Discovery Documentを期待通りに返す', () => {
		const svc = new DiscoveryService(context);
		const doc = svc.getOpenidConfiguration();

		expect(doc.issuer).toBe(context.config.oidcIssuer);
		expect(doc.authorization_endpoint).toBe(`${context.config.oidcIssuer}/authorize`);
		expect(doc.token_endpoint).toBe(`${context.config.oidcIssuer}/token`);
		expect(doc.jwks_uri).toBe(`${context.config.oidcIssuer}/.well-known/jwks.json`);
		expect(doc.userinfo_endpoint).toBe(`${context.config.oidcIssuer}/userinfo`);
		expect(doc.response_types_supported).toEqual(['code']);
	});

	it('JWKS を返す (kid, alg, use を含む)', async () => {
		// ランタイム生成した鍵を使う
		const ctxWithKeys = createTestContext(true);

		const svc = new DiscoveryService(ctxWithKeys);
		const jwks = await svc.getJwks();

		expect(Array.isArray(jwks.keys)).toBe(true);
		expect(jwks.keys).toHaveLength(1);

		const [key] = jwks.keys;
		expect(key.kid).toBe('main');
		expect(key.alg).toBe('RS256');
		expect(key.use).toBe('sig');
		expect(key.kty).toBe('RSA');
		expect(key.n).toBeDefined();
		expect(key.e).toBeDefined();
	});
});

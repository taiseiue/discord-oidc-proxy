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
		// モックの公開鍵を設定
		const mockContext = {
			...context,
			config: {
				...context.config,
				jwtPublicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvqMGKVCuL84WyJdRdVEA
DTrYqgiU/Gvjko4WDiIKTiBk3+OSnkFzyoivL7+ej4JMu2L0q+AJQZB3vm/6yqaV
JGOmXO7nRJDLdi/EgLgAt6CRCwAJ/oVX9BnUrWdXXN2eCp0HwdxDPkd1/xzc2ChG
jTX7Q5jWV3vqicZq4WEeOAEBnHdtDSAR2PGXpaco7ZUyzsbBIg2Sk930omgN0rb3
NG4lCyWgVw7IEod0FHuTLIc7jaSlk3fbmN76ZHidQRk/XJ8ch9fifvXzZqUs1ETE
/0l9vkDilDfDa+DzvnpYMuStx+thEvrbPnJXIQs+1OftH5+hDcPmfNg7sPUpTF66
uQIDAQAB
-----END PUBLIC KEY-----`,
			},
		};

		const svc = new DiscoveryService(mockContext);
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

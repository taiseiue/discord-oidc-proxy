import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types';
import { createAppContextFromBindings } from '../adapters/cloudflare';
import { DiscoveryService } from '../services/discovery-service';

// OIDCディスカバリー関連
export const discoveryRoutes = new Hono<{ Bindings: Bindings }>();

// OIDCディスカバリー
// エンドポイントなどの情報を自動設定できるようにする
discoveryRoutes.get('/.well-known/openid-configuration', (c) => {
	const appContext = createAppContextFromBindings(c.env);
	const discoveryService = new DiscoveryService(appContext);

	const config = discoveryService.getOpenidConfiguration();

	return c.json(config);
});

// jwks.json
// 公開鍵をJWKS形式で提供する
discoveryRoutes.get('/.well-known/jwks.json', async (c) => {
	try {
		const appContext = createAppContextFromBindings(c.env);
		const discoveryService = new DiscoveryService(appContext);

		const jwks = await discoveryService.getJwks();

		return c.json(jwks);
	} catch (e) {
		console.error('JWKS Error:', e);
		throw new HTTPException(500, { message: 'Failed to generate JWKS' });
	}
});

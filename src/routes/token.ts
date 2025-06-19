import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types';
import { createAppContextFromBindings } from '../adapters/cloudflare';
import { TokenService } from '../services/token-service';
import { timingSafeStringEqual } from '../utils/crypto';
import { vValidator } from '@hono/valibot-validator';
import { TokenRequestBodySchema } from '../schemas/token.schema';

// トークン関連
export const tokenRoutes = new Hono<{ Bindings: Bindings }>();

// トークン交換
tokenRoutes.post('/token', vValidator('form', TokenRequestBodySchema), async (c) => {
	const body = c.req.valid('form');

	const appContext = createAppContextFromBindings(c.env);
	// クライアントの検証
	// シークレットは機密なので、タイミングセーフな比較をする
	if (body.client_id !== appContext.config.oidcAudience || !timingSafeStringEqual(body.client_secret, appContext.config.oidcClientSecret)) {
		throw new HTTPException(401, { message: `Invalid client credentials.` });
	}

	try {
		const tokenService = new TokenService(appContext);
		const tokenResponse = await tokenService.exchangeCodeForToken(body.code);
		return c.json(tokenResponse);
	} catch (error) {
		if (error instanceof Error) {
			throw new HTTPException(400, { message: error.message });
		}
		throw error;
	}
});

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types';
import { createAppContextFromBindings } from '../adapters/cloudflare';
import { TokenService } from '../services/token-service';

// トークン関連
export const tokenRoutes = new Hono<{ Bindings: Bindings }>();

// トークン交換
tokenRoutes.post('/token', async (c) => {
	const body = await c.req.parseBody();

	// grant_typeの検証
	if (body.grant_type !== 'authorization_code') {
		throw new HTTPException(400, { message: 'Unsupported grant_type' });
	}

	// codeの検証
	const code = body.code as string;
	if (!code) {
		throw new HTTPException(400, { message: 'Missing code' });
	}

	try {
		const appContext = createAppContextFromBindings(c.env);
		const tokenService = new TokenService(appContext);

		const tokenResponse = await tokenService.exchangeCodeForToken(code);

		return c.json(tokenResponse);
	} catch (error) {
		if (error instanceof Error) {
			throw new HTTPException(400, { message: error.message });
		}
		throw error;
	}
});

import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types';
import { createAppContextFromBindings } from '../adapters/cloudflare';
import { AuthService } from '../services/auth-service';
import { vValidator } from '@hono/valibot-validator';
import { AuthorizeRequestBodySchema, CallbackRequestBodySchema } from '../schemas/auth.schema';

// 認証関連
export const authRoutes = new Hono<{ Bindings: Bindings }>();

// 承認
authRoutes.get('/authorize', vValidator('json', AuthorizeRequestBodySchema), async (c) => {
	const params = c.req.valid('json');

	try {
		const appContext = createAppContextFromBindings(c.env, c.executionCtx.waitUntil.bind(c.executionCtx));
		// クライアントの検証(この時点ではクライアントIDのみを検証)
		if (params.client_id !== appContext.config.oidcAudience) {
			throw new HTTPException(401, { message: `Invalid client credentials.` });
		}

		const authService = new AuthService(appContext);
		const result = await authService.handleAuthorizeRequest({
			response_type: params.response_type,
			redirect_uri: params.redirect_uri,
			scope: params.scope,
			state: params.state,
		});

		return c.redirect(result.redirectUrl);
	} catch (error) {
		if (error instanceof Error) {
			throw new HTTPException(400, { message: error.message });
		}
		throw error;
	}
});

// callback
// Discordからトークンを受け取る
authRoutes.get('/callback', vValidator('json', CallbackRequestBodySchema), async (c) => {
	const params = c.req.valid('json');

	try {
		const appContext = createAppContextFromBindings(c.env);
		const authService = new AuthService(appContext);

		const result = await authService.handleCallbackRequest({
			code: params.code,
			sessionId: params.sessionId,
		});

		return c.redirect(result.redirectUrl);
	} catch (error) {
		if (error instanceof Error) {
			throw new HTTPException(400, { message: error.message });
		}
		throw error;
	}
});

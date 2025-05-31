import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types';
import { createAppContextFromBindings } from '../adapters/cloudflare';
import { AuthService } from '../services/auth-service';

// 認証関連
export const authRoutes = new Hono<{ Bindings: Bindings }>();

// 承認
authRoutes.get('/authorize', async (c) => {
	const params = c.req.query();
	const requiredParams = ['response_type', 'client_id', 'redirect_uri', 'scope', 'state'];

	for (const param of requiredParams) {
		if (!params[param]) {
			throw new HTTPException(400, { message: `Missing required parameter: ${param}` });
		}
	}

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
authRoutes.get('/callback', async (c) => {
	const { code, state: sessionId } = c.req.query();

	// パラメータのバリデーション
	if (!code || !sessionId) {
		throw new HTTPException(400, { message: 'Missing code or state from Discord' });
	}

	try {
		const appContext = createAppContextFromBindings(c.env);
		const authService = new AuthService(appContext);

		const result = await authService.handleCallbackRequest({
			code,
			sessionId,
		});

		return c.redirect(result.redirectUrl);
	} catch (error) {
		if (error instanceof Error) {
			throw new HTTPException(400, { message: error.message });
		}
		throw error;
	}
});

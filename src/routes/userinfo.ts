import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Bindings } from '../types';
import { createAppContextFromBindings } from '../adapters/cloudflare';
import { UserInfoService } from '../services/userinfo-service';

// ユーザー情報関連
export const userinfoRoutes = new Hono<{ Bindings: Bindings }>();

// userinfo
// ユーザー情報を提供する
userinfoRoutes.get('/userinfo', async (c) => {
	// 認証ヘッダーの検証
	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new HTTPException(401, { message: 'Unauthorized: Missing Authorization header' });
	}

	const accessToken = authHeader.substring(7);

	try {
		const appContext = createAppContextFromBindings(c.env);
		const userInfoService = new UserInfoService(appContext);

		const claims = await userInfoService.getUserInfo(accessToken);

		return c.json(claims);
	} catch (error) {
		if (error instanceof Error) {
			throw new HTTPException(401, { message: error.message });
		}
		throw error;
	}
});

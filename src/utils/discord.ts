import { HTTPException } from 'hono/http-exception';
import { DiscordTokenResponse, DiscordUser } from '../types';

/**
 * Discordの認証URLを生成する
 * @param {string} clientId クライアントID
 * @param {string} oidcIssuer OIDCの発行元Url
 * @param {string} sessionId セッションID
 * @returns {URL} Discordの認証Url
 */
export const createDiscordAuthUrl = (clientId: string, oidcIssuer: string, sessionId: string): URL => {
	const url = new URL('https://discord.com/api/oauth2/authorize');
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('redirect_uri', `${oidcIssuer}/callback`);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', 'identify email guilds');
	url.searchParams.set('state', sessionId);
	url.searchParams.set('prompt', 'none');
	return url;
};

/**
 * Discordのユーザー情報を取得する
 * @param {string} token アクセストークン
 * @returns {Promise<DiscordUser>} ユーザー情報
 */
export const getDiscordUserInfo = async (token: string): Promise<DiscordUser> => {
	const response = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${token}`,
			'User-Agent': 'discord-oidc-proxy',
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Discord API Error:', errorText);
		throw new HTTPException(502, { message: 'Failed to fetch user info from Discord' });
	}

	return response.json<DiscordUser>();
};

/**
 * DiscordのOAuth2トークンを取得する
 * @returns {Promise<DiscordTokenResponse>} OAuth2トークン
 */
export const exchangeDiscordCode = async (
	code: string,
	clientId: string,
	clientSecret: string,
	redirectUri: string
): Promise<DiscordTokenResponse> => {
	const response = await fetch('https://discord.com/api/oauth2/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: redirectUri,
		}),
	});

	if (!response.ok) {
		const errorBody = await response.json().catch(() => response.text());
		console.error('Discord Token API Error:', JSON.stringify(errorBody, null, 2));
		throw new HTTPException(502, {
			message: 'Failed to fetch token from Discord',
			cause: errorBody,
		});
	}

	return response.json<DiscordTokenResponse>();
};

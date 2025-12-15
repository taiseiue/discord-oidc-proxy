import { HTTPException } from 'hono/http-exception';
import { DiscordGuildMember, DiscordTokenResponse, DiscordUser } from '../types';

/**
 * Discordの認証URLを生成する
 * @param {string} clientId クライアントID
 * @param {string} oidcIssuer OIDCの発行元Url
 * @param {string} sessionId セッションID
 * @returns {URL} Discordの認証Url
 */
export const createDiscordAuthUrl = (clientId: string, oidcIssuer: string, sessionId: string): URL => {
	const url = new URL('https://discord.com/api/v10/oauth2/authorize');
	url.searchParams.set('client_id', clientId);
	url.searchParams.set('redirect_uri', `${oidcIssuer}/callback`);
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', 'identify email guilds');
	url.searchParams.set('state', sessionId);
	url.searchParams.set('prompt', 'none');
	return url;
};

/**
 * OIDC scope に guild が含まれる場合は、Discord 側でも roles 取得に必要なスコープを追加する
 */
export const createDiscordAuthUrlWithOidcScope = (
	clientId: string,
	oidcIssuer: string,
	sessionId: string,
	oidcScope: string
): URL => {
	const url = createDiscordAuthUrl(clientId, oidcIssuer, sessionId);
	const scopes = new Set((oidcScope || '').split(/\s+/).filter(Boolean));
	if (scopes.has('guild')) {
		url.searchParams.set('scope', 'identify email guilds guilds.members.read');
	}
	return url;
};

/**
 * Discordのユーザー情報を取得する
 * @param {string} token アクセストークン
 * @returns {Promise<DiscordUser>} ユーザー情報
 */
export const getDiscordUserInfo = async (token: string): Promise<DiscordUser> => {
	const response = await fetch('https://discord.com/api/v10/users/@me', {
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
 * Discordの対象ギルドにおけるメンバー情報(roles等)を取得する
 * - 404: ギルドに所属していない(または参照できない)として null
 * - 401/403: スコープ不足などで参照不可として null
 */
export const getDiscordGuildMember = async (token: string, guildId: string): Promise<DiscordGuildMember | null> => {
	const response = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'User-Agent': 'discord-oidc-proxy',
		},
	});

	if (response.status === 404 || response.status === 401 || response.status === 403) {
		return null;
	}

	if (!response.ok) {
		const errorText = await response.text();
		console.error('Discord API Error:', errorText);
		throw new HTTPException(502, { message: 'Failed to fetch guild member info from Discord' });
	}

	return response.json<DiscordGuildMember>();
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
	const response = await fetch('https://discord.com/api/v10/oauth2/token', {
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

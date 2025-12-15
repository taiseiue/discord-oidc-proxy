import { IAppContext, StoredSessionData, StoredTokenData } from '../types';
import { SESSION_EXPIRATION_TTL } from '../config';
import { createDiscordAuthUrlWithOidcScope, exchangeDiscordCode, getDiscordUserInfo } from '../utils/discord';

export class AuthService {
	private context: IAppContext;

	constructor(context: IAppContext) {
		this.context = context;
	}

	/**
	 * 認証リクエストから認証セッションを開始する
	 */
	async handleAuthorizeRequest(params: {
		response_type: string;
		redirect_uri: string;
		scope: string;
		state: string;
	}): Promise<{ redirectUrl: string; sessionId: string }> {
		const sessionId = crypto.randomUUID();

		// Discordの認証URLを作る
		const discordAuthUrl = createDiscordAuthUrlWithOidcScope(
			this.context.config.discordClientId,
			this.context.config.oidcIssuer,
			sessionId,
			params.scope
		);

		// セッションを保存
		const sessionData: StoredSessionData = {
			sessionState: params.state,
			sessionRedirectUri: params.redirect_uri,
			sessionScope: params.scope,
		};

		const storagePromise = this.context.storage.put(sessionId, JSON.stringify(sessionData), { expirationTtl: SESSION_EXPIRATION_TTL });

		// 必要な場合、非同期処理を待機する
		if (this.context.waitUntil) {
			this.context.waitUntil(storagePromise);
		} else {
			await storagePromise;
		}

		return {
			redirectUrl: discordAuthUrl.toString(),
			sessionId,
		};
	}

	/**
	 * Discord認証コールバックから、最終的なリダイレクトURLを生成する
	 */
	async handleCallbackRequest(params: { code: string; sessionId: string }): Promise<{ redirectUrl: string }> {
		const storedStateJson = await this.context.storage.get(params.sessionId);
		if (!storedStateJson) {
			throw new Error('Invalid or expired state');
		}

		// セッションを終了させる
		await this.context.storage.delete(params.sessionId);

		const storedState = JSON.parse(storedStateJson) as StoredSessionData;
		const { sessionState, sessionRedirectUri, sessionScope } = storedState;

		const discordTokenData = await exchangeDiscordCode(
			params.code,
			this.context.config.discordClientId,
			this.context.config.discordClientSecret,
			`${this.context.config.oidcIssuer}/callback`
		);

		const discordUser = await getDiscordUserInfo(discordTokenData.access_token);

		const oidcCode = crypto.randomUUID();

		const tokenData: StoredTokenData = {
			discordUser,
			discordToken: discordTokenData.access_token,
			oidcScope: sessionScope,
		};

		await this.context.storage.put(oidcCode, JSON.stringify(tokenData), { expirationTtl: SESSION_EXPIRATION_TTL });

		const finalRedirectUrl = new URL(sessionRedirectUri);
		finalRedirectUrl.searchParams.set('code', oidcCode);
		finalRedirectUrl.searchParams.set('state', sessionState);

		return {
			redirectUrl: finalRedirectUrl.toString(),
		};
	}
}

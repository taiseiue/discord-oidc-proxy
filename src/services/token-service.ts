import * as jose from 'jose';
import { IAppContext, StoredAccessTokenData, StoredTokenData } from '../types';
import { TOKEN_EXPIRATION_TTL } from '../config';
import { generateIdToken } from '../utils/jwt';
import { getDiscordGuildMember } from '../utils/discord';

export class TokenService {
	private context: IAppContext;

	constructor(context: IAppContext) {
		this.context = context;
	}

	/**
	 * 認証コードをトークンに交換する
	 */
	async exchangeCodeForToken(code: string) {
		const storedDataJson = await this.context.storage.get(code);
		if (!storedDataJson) {
			throw new Error('Invalid or expired code');
		}

		await this.context.storage.delete(code);

		const storedData = JSON.parse(storedDataJson) as StoredTokenData;
		const { discordUser, discordToken, oidcScope } = storedData;

		const scopes = new Set((oidcScope || '').split(/\s+/).filter(Boolean));
		const shouldIncludeGuildClaims = scopes.has('guild');
		const member = shouldIncludeGuildClaims
			? await getDiscordGuildMember(discordToken, this.context.config.targetGuildId)
			: null;
		const extraClaims = shouldIncludeGuildClaims
			? {
				is_member_of_target_guild: member !== null,
				roles: member?.roles ?? [],
			}
			: {};

		// IDトークンを生成する
		const privateKey = await jose.importPKCS8(this.context.config.jwtPrivateKey, 'RS256');
		const idToken = await generateIdToken(
			discordUser,
			privateKey,
			this.context.config.oidcIssuer,
			this.context.config.oidcAudience,
			extraClaims
		);

		// アクセストークンを生成する
		const accessToken = crypto.randomUUID();
		const accessTokenData: StoredAccessTokenData = { discordToken, oidcScope };

		await this.context.storage.put(`access_token:${accessToken}`, JSON.stringify(accessTokenData), { expirationTtl: TOKEN_EXPIRATION_TTL });

		return {
			access_token: accessToken,
			token_type: 'Bearer',
			expires_in: TOKEN_EXPIRATION_TTL,
			id_token: idToken,
		};
	}
}

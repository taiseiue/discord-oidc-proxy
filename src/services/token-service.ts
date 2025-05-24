import * as jose from 'jose';
import { IAppContext, StoredTokenData } from '../types';
import { TOKEN_EXPIRATION_TTL } from '../config';
import { generateIdToken } from '../utils/jwt';

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
		const { discordUser, discordToken } = storedData;

		// IDトークンを生成する
		const privateKey = await jose.importPKCS8(this.context.config.jwtPrivateKey, 'RS256');
		const idToken = await generateIdToken(discordUser, privateKey, this.context.config.oidcIssuer, this.context.config.oidcAudience);

		// アクセストークンを生成する
		const accessToken = crypto.randomUUID();

		await this.context.storage.put(`access_token:${accessToken}`, discordToken, { expirationTtl: TOKEN_EXPIRATION_TTL });

		return {
			access_token: accessToken,
			token_type: 'Bearer',
			expires_in: TOKEN_EXPIRATION_TTL,
			id_token: idToken,
		};
	}
}

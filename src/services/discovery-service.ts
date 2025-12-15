import * as jose from 'jose';
import { IAppContext } from '../types';

export class DiscoveryService {
	private context: IAppContext;

	constructor(context: IAppContext) {
		this.context = context;
	}

	/**
	 * OpenID Connect のディスカバリー情報を取得
	 */
	getOpenidConfiguration() {
		const issuer = this.context.config.oidcIssuer;
		return {
			issuer: issuer,
			authorization_endpoint: `${issuer}/authorize`,
			token_endpoint: `${issuer}/token`,
			jwks_uri: `${issuer}/.well-known/jwks.json`,
			userinfo_endpoint: `${issuer}/userinfo`,
			response_types_supported: ['code'],
			subject_types_supported: ['public'],
			id_token_signing_alg_values_supported: ['RS256'],
			scopes_supported: ['openid', 'profile', 'email', 'guild'],
			token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
			claims_supported: ['sub', 'iss', 'aud', 'exp', 'iat', 'name', 'picture', 'email', 'is_member_of_target_guild', 'roles'],
		};
	}

	/**
	 * JWKSを生成
	 */
	async getJwks() {
		const publicKey = await jose.importSPKI(this.context.config.jwtPublicKey, 'RS256');
		const jwk = await jose.exportJWK(publicKey);
		return {
			keys: [{ ...jwk, kid: 'main', alg: 'RS256', use: 'sig' }],
		};
	}
}

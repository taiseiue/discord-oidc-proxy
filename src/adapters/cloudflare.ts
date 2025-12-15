import { Bindings, IAppConfig, IAppContext, IKeyValueStorage } from '../types';

/**
 * Cloudflare Workers KVStorage
 */
export class CloudflareKVStorage implements IKeyValueStorage {
	private kv: KVNamespace;

	constructor(kv: KVNamespace) {
		this.kv = kv;
	}

	async get(key: string): Promise<string | null> {
		return this.kv.get(key);
	}

	async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
		await this.kv.put(key, value, options);
	}

	async delete(key: string): Promise<void> {
		await this.kv.delete(key);
	}
}

/**
 * Cloudflare Workers用のアプリケーションコンテキストを生成する
 * @param {Bindings} env Cloudflare Workersの環境(環境変数とシークレット)
 * @param {Function} waitUntil Workersの非同期処理を待機するための関数
 * @return {IAppContext} アプリケーションコンテキスト
 */
export function createAppContextFromBindings(env: Bindings, waitUntil?: (promise: Promise<any>) => void): IAppContext {
	const config: IAppConfig = {
		oidcIssuer: env.OIDC_ISSUER,
		oidcAudience: env.OIDC_AUDIENCE,
		oidcClientSecret: env.OIDC_CLIENT_SECRET,
		discordClientId: env.DISCORD_CLIENT_ID,
		discordClientSecret: env.DISCORD_CLIENT_SECRET,
		targetGuildId: env.TARGET_GUILD_ID,
		jwtPrivateKey: env.JWT_PRIVATE_KEY,
		jwtPublicKey: env.JWT_PUBLIC_KEY,
	};
	const storage = new CloudflareKVStorage(env.AUTH_KV);

	return {
		config,
		storage,
		waitUntil,
	};
}

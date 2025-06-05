/**
 * Key-Valueストレージ
 */
export interface IKeyValueStorage {
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
	delete(key: string): Promise<void>;
}

/**
 * 環境設定
 * @property {string} oidcIssuer OIDC発行元
 * @property {string} oidcAudience OIDCオーディエンス
 * @property {string} oidcClientId OIDCのクライアントID
 * @property {string} oidcClientSecret OIDCのクライアントシークレット
 * @property {string} discordClientId DiscordのOAuthクライアントID
 * @property {string} discordClientSecret DiscordのOAuthクライアントシークレット
 * @property {string} jwtPrivateKey JWTの秘密鍵
 * @property {string} jwtPublicKey JWTの公開鍵
 */
export interface IAppConfig {
	oidcIssuer: string;
	oidcAudience: string;
	oidcClientSecret: string;
	discordClientId: string;
	discordClientSecret: string;
	jwtPrivateKey: string;
	jwtPublicKey: string;
}

/**
 * アプリケーションコンテキスト
 * @property {IAppConfig} config 環境設定
 * @property {IKeyValueStorage} storage Key-Valueストレージ
 * @property {Function} waitUntil 必要ならば、非同期処理を待機するための関数
 */
export interface IAppContext {
	config: IAppConfig;
	storage: IKeyValueStorage;
	waitUntil?(promise: Promise<any>): void;
}

/**
 * Cloudflare Workersの環境変数とシークレット
 */
export type Bindings = {
	// KVストア
	AUTH_KV: KVNamespace;
	// 環境変数
	OIDC_ISSUER: string;
	OIDC_AUDIENCE: string;
	// シークレット
	OIDC_CLIENT_SECRET: string;
	DISCORD_CLIENT_ID: string;
	DISCORD_CLIENT_SECRET: string;
	// JWTの秘密鍵と公開鍵
	JWT_PRIVATE_KEY: string;
	JWT_PUBLIC_KEY: string;
};

export type StoredSessionData = {
	cognitoState: string;
	cognitoRedirectUri: string;
};

export type StoredTokenData = {
	discordUser: DiscordUser;
	discordToken: string;
};

/**
 * Discordのユーザーオブジェクト
 * c.f. https://discord.com/developers/docs/resources/user#user-object
 * @property {string} id ユーザーID
 * @property {string} username ユーザー名(一意ではない)
 * @property {string|null} global_name グローバル名(一意の名前、存在しない場合はnull)
 * @property {string} avatar アバターのハッシュ
 * @property {string} email メールアドレス
 * @property {boolean} verified メールアドレスが検証済みかどうか
 * @property {string} locale ユーザーのロケール
 */
export type DiscordUser = {
	id: string;
	username: string;
	global_name?: string | null;
	avatar: string;
	email: string;
	verified?: boolean;
	locale?: string;
};

export type DiscordTokenResponse = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
	scope?: string;
};

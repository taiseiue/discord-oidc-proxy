import { IAppContext, StoredAccessTokenData } from '../types';
import { getDiscordGuildMember, getDiscordUserInfo } from '../utils/discord';

export class UserInfoService {
	private context: IAppContext;

	constructor(context: IAppContext) {
		this.context = context;
	}

	/**
	 * アクセストークンを使ってユーザー情報を取得する
	 */
	async getUserInfo(accessToken: string) {
		const storedJson = await this.context.storage.get(`access_token:${accessToken}`);
		if (!storedJson) {
			throw new Error('Unauthorized: Invalid access token');
		}
		let stored: StoredAccessTokenData;
		try {
			stored = JSON.parse(storedJson) as StoredAccessTokenData;
		} catch {
			// 互換: 以前は discordToken をそのまま保存していた
			stored = { discordToken: storedJson, oidcScope: '' };
		}
		const discordToken = stored.discordToken;
		const scopes = new Set((stored.oidcScope || '').split(/\s+/).filter(Boolean));
		const shouldIncludeGuildClaims = scopes.has('guild');

		const discordUser = await getDiscordUserInfo(discordToken);

		const member = shouldIncludeGuildClaims
			? await getDiscordGuildMember(discordToken, this.context.config.targetGuildId)
			: null;
		const isMemberOfTargetGuild = shouldIncludeGuildClaims ? member !== null : undefined;
		const roles = shouldIncludeGuildClaims ? member?.roles ?? [] : undefined;

		// OIDCクレームの生成
		const claims: Record<string, unknown> = {
			sub: discordUser.id,
			name: discordUser.global_name || discordUser.username,
			preferred_username: discordUser.username,
			picture: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
			email: discordUser.email,
			email_verified: discordUser.verified,
			locale: discordUser.locale,
		};
		if (shouldIncludeGuildClaims) {
			claims.is_member_of_target_guild = isMemberOfTargetGuild;
			claims.roles = roles;
		}

		return claims;
	}
}

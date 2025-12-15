import { IAppContext } from '../types';
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
		const discordToken = await this.context.storage.get(`access_token:${accessToken}`);
		if (!discordToken) {
			throw new Error('Unauthorized: Invalid access token');
		}

		const discordUser = await getDiscordUserInfo(discordToken);

		const member = await getDiscordGuildMember(discordToken, this.context.config.targetGuildId);
		const isMemberOfTargetGuild = member !== null;
		const roles = member?.roles ?? [];

		// OIDCクレームの生成
		const claims = {
			sub: discordUser.id,
			name: discordUser.global_name || discordUser.username,
			preferred_username: discordUser.username,
			picture: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
			email: discordUser.email,
			email_verified: discordUser.verified,
			locale: discordUser.locale,
			is_member_of_target_guild: isMemberOfTargetGuild,
			roles,
		};

		return claims;
	}
}

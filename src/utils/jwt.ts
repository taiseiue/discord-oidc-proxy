import * as jose from 'jose';
import { TOKEN_EXPIRATION_TTL } from '../config';
import { DiscordUser } from '../types';

/**
 * Discordユーザー情報からIDトークンを生成する
 */
export const generateIdToken = async (
	discordUser: DiscordUser,
	privateKey: jose.CryptoKey,
	issuer: string,
	audience: string
): Promise<string> => {
	const now = Math.floor(Date.now() / 1000);

	return new jose.SignJWT({
		name: discordUser.global_name || discordUser.username,
		picture: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
		email: discordUser.email,
		email_verified: discordUser.verified,
	})
		.setProtectedHeader({ alg: 'RS256', kid: 'main' })
		.setSubject(discordUser.id)
		.setIssuer(issuer)
		.setAudience(audience)
		.setIssuedAt(now)
		.setExpirationTime(now + TOKEN_EXPIRATION_TTL)
		.sign(privateKey);
};

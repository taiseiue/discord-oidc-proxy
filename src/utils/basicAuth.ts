/**
 * Basic認証のAuthorizationヘッダーに含まれるBase64エンコードされた認証情報をデコードする
 * @param encodedString Authorizationヘッダーの中身
 * @returns ユーザー名とパスワード
 */
export function decodeBasicAuth(authHeader: string): { user_id: string; password: string } {
	if (!authHeader.startsWith('Basic ')) {
		throw new Error('Invalid Basic Auth format');
	}
	const decodedString = atob(authHeader.substring('Basic '.length));
	const parts = decodedString.split(':');

	if (parts.length === 2) {
		return { user_id: parts[0], password: parts[1] };
	} else {
		throw new Error('Invalid Basic Auth format');
	}
}

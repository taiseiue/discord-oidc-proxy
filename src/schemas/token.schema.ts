import { object, string, literal } from 'valibot';

// トークン交換リクエストボディのスキーマを定義
export const TokenRequestBodySchema = object({
	code: string(),
	client_id: string(),
	client_secret: string(),
	grant_type: literal('authorization_code'),
});

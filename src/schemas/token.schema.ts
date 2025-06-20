import { object, string, literal, optional } from 'valibot';

export const TokenRequestBodySchema = object({
	code: string(),
	client_id: optional(string()), // client_idと client_secretが指定されていない場合は、client_secret_basicで渡されている
	client_secret: optional(string()),
	grant_type: literal('authorization_code'),
});

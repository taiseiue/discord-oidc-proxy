import { object, string, literal } from 'valibot';

export const TokenRequestBodySchema = object({
	code: string(),
	client_id: string(),
	client_secret: string(),
	grant_type: literal('authorization_code'),
});

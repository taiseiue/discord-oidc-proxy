import { object, string } from 'valibot';

export const AuthorizeRequestBodySchema = object({
	response_type: string(),
	client_id: string(),
	redirect_uri: string(),
	scope: string(),
	state: string(),
});

export const CallbackRequestBodySchema = object({
	code: string(),
	state: string(),
});

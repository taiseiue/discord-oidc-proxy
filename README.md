# Discord OIDC Wrapper
The wrapper Discord OAuth to OpenID Connect (OIDC)

Cloudflare Workers + Hono + pnpm

### What's this?

DiscordのOAuth2認証でOIDCログインできるようにするくん。

### Usage

1. このリポジトリをcloneする
2. `pnpm install`
3. `pnpx wrangler kv:namespace create "AUTH_KV"`
4. `pnpx wrangler deploy`
5. wrangler.jsoncにKVのIDとかISSUREに4で出たUrlをいれる
5. DiscordのOAuth2をとってくる
6. `ssh-keygen -t rsa -b 4096 -f jwtRS256.pem -m PKCS8`
7. `wrangler secret put DISCORD_CLIENT_ID`
8. `wrangler secret put DISCORD_CLIENT_SECRET`
9. `wrangler secret put JWT_PRIVATE_KEY`
10. `wrangler secret put JWT_PUBLIC_KEY`
11. `wrangler deploy`

よし。

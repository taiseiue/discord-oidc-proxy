# Discord OIDC Proxy
The proxy that enables applications using OpenID Connect (OIDC) authentication to authenticate users through Discord's OAuth2 system.

|       |        |
|-------|--------|
|English|[Japanese](./README-ja.md)|

Cloudflare Workers + Hono + pnpm

### What's this?

DiscordのOAuth2認証でOIDCログインできるようにするくん。

### Usage

1. `pnpx wrangler kv namespace create "AUTH_KV"`を実行してKVを作成する
2. 出てきたIDで`wrangler.jsonc`の`<YOUR_KV_NAMESPACE_ID>`を置換する。
3. `setup.sh`を実行し、指示に従ってClient IDとClient Secretを入力する
4. 一度`pnpm install && pnpm release`する
5. 出てきたデプロイ先Url(`https://hoge.workers.dev`)で`wrangler.jsonc`の`https://<YOUR_WORKERS>.workers.dev`を置換する
6.  `pnpm release`して完成

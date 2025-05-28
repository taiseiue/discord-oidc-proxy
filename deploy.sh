#!/bin/sh

echo -n DISCORD_CLIENT_ID:
read DISCORD_CLIENT_ID
echo -n DISCORD_CLIENT_SECRET:
read DISCORD_CLIENT_SECRET

pnpm install
(cd keys && ssh-keygen -q -t rsa -b 2048 -f jwtRS256 -m PKCS8)
cat keys/jwtRS256 | pnpx wrangler secret put JWT_PRIVATE_KEY
cat keys/jwtRS256.pub | pnpx wrangler secret put JWT_PUBLIC_KEY
echo $DISCORD_CLIENT_ID | pnpx wrangler secret put DISCORD_CLIENT_ID
echo DISCORD_CLIENT_SECRET | pnpx wrangler secret put DISCORD_CLIENT_SECRET 

pnpx wrangler deploy

#!/bin/sh

echo "*****************************************************************"
echo "*                                                               *"
echo "*       🚀 Discord OIDC Proxy - Automated Setup Script 🚀       *"
echo "*                                                               *"
echo "* Welcome! This script generates the encryption keys required   *"
echo "* for Cloudflare Workers to function properly and sets the keys *"
echo "* and IDs.                                                      *"
echo "*                                                               *"
echo "*---------------------------------------------------------------*"
echo "*                   ⚠️  I M P O R T A N T  ⚠️                   *"
echo "*                                                               *"
echo "* - Ensure you are logged in to Wrangler: \`wrangler login\`      *"
echo "* - Have your Discord Application's Client ID & Secret ready.   *"
echo "*                                                               *"
echo "*****************************************************************"
echo ""
echo "Press [Enter] to continue, or [Ctrl+C] to exit..."
read
echo ""

if [ -e './wrangler.jsonc' ]; then
  echo "A configuration file already exists. "
  echo -n "Would you like to continue? [y/N]: "
  read ANS
  case $ANS in
    [Yy]* )
      ;;
    * )
      exit
      ;;
  esac
fi


echo -n DISCORD_CLIENT_ID:
read DISCORD_CLIENT_ID
echo -n DISCORD_CLIENT_SECRET:
read DISCORD_CLIENT_SECRET
echo -n WORKERS_KV_NAMESPACE_ID:
read WORKERS_KV_NAMESPACE_ID

echo '[1/2] Making certificates...'
(cd keys && ssh-keygen -q -t rsa -b 2048 -f jwtRS256 -m PKCS8 -N "" && ssh-keygen -q -f jwtRS256 -e -m PKCS8 > jwtRS256.pub)
echo '[2/3] OIDC Client generating...'
OIDC_CLIENT_ID=$(openssl rand -hex 16)
OIDC_CLIENT_SECRET=$(openssl rand -base64 48)
echo 'Done!'

echo;
echo '[2/3] Configuring...'
cp -f ./wrangler.jsonc.template ./wrangler.jsonc
echo $OIDC_CLIENT_SECRET | pnpx wrangler secret put OIDC_CLIENT_SECRET
echo $DISCORD_CLIENT_ID | pnpx wrangler secret put DISCORD_CLIENT_ID
echo $DISCORD_CLIENT_SECRET | pnpx wrangler secret put DISCORD_CLIENT_SECRET
cat keys/jwtRS256 | pnpx wrangler secret put JWT_PRIVATE_KEY
cat keys/jwtRS256.pub | pnpx wrangler secret put JWT_PUBLIC_KEY

if [[ "$(uname)" == "Darwin" ]]; then
  sed -i "" 's/"id": "[^"]*"/"id": "'"${WORKERS_KV_NAMESPACE_ID}"'"/g' "wrangler.jsonc"
else
  sed -i 's/"id": "[^"]*"/"id": "'"${WORKERS_KV_NAMESPACE_ID}"'"/g' "wrangler.jsonc"
fi

if [[ "$(uname)" == "Darwin" ]]; then
  sed -i "" 's/"OIDC_AUDIENCE": "[^"]*"/"OIDC_AUDIENCE": "'"${OIDC_CLIENT_ID}"'"/g' "wrangler.jsonc"
else
  sed -i 's/"OIDC_AUDIENCE": "[^"]*"/"OIDC_AUDIENCE": "'"${OIDC_CLIENT_ID}"'"/g' "wrangler.jsonc"
fi

echo;

echo "****************************************************************************************"
echo "*                                                                                      *"
echo "*                🎉 Setup Complete! OIDC Client Credentials Issued! 🎉                 *"
echo "*                                                                                      *"
echo "* Well done! All necessary configurations have been completed.                         *"
echo "* To use this OIDC proxy, use the following credentials on the client.                 *"
echo "*                                                                                      *"
echo "* OIDC Client ID    : $OIDC_CLIENT_ID                                 *"
echo "* OIDC Client Secret: $OIDC_CLIENT_SECRET *"
echo "*                                                                                      *"
echo "*--------------------------------------------------------------------------------------*"
echo "*                              ⚠️  I M P O R T A N T  ⚠️                               *"
echo "* The Client Secret shown above is a highly sensitive piece of information,            *"
echo "*  similar to a password. Please be sure to observe the following points:              *"
echo "* - Copy this value IMMEDIATELY and store it in a secure location.                     *"
echo "* - This script will display the Client Secret ONLY THIS ONCE.                         *"
echo "* - NEVER commit it to version control systems (e.g., Git).                            *"
echo "*                                                                                      *"
echo "*--------------------------------------------------------------------------------------*"
echo "*                                   [ Next Steps ]                                     *"
echo "* 1. You will use this Client ID and Client Secret to configure your client application*"
echo "*     (e.g., in the Cloudflare ZeroTrust provider settings screen)                     *"
echo "*     that utilizes this OIDC provider.                                                *"
echo "* 2. Deploy once.                                                                      *"
echo "*     Use the command: \`pnpm install && pnpm release\`                                   *"
echo "*     Make a note of the URL of the publish target. (e.g., https://***.***.workers.dev)*"
echo "* 3. You will be to set the OIDC_ISSUER in wrangler.jsonc file.                        *"
echo "*        \"vars\": {                                                                     *"
echo "*      -   \"OIDC_ISSUER\": \"https://<YOUR_WORKERS>.workers.dev\",                        *"
echo "*      +   \"OIDC_ISSUER\": \"<NOTED_URL>\",                                               *"
echo "*        }                                                                             *"
echo "* 4. Final deploy                                                                      *"
echo "*     Use the command: \`pnpm release\`                                                  *"
echo "*                                                                                      *"
echo "* Congratulations! You are now ready to use the OIDC Proxy! 🎉                         *"
echo "****************************************************************************************"
echo ""

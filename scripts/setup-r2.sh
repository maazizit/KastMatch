#!/usr/bin/env bash
# Bootstrap Cloudflare R2 for KastMatch
# Prérequis: R2 activé une fois dans le dashboard (checkout free)
set -euo pipefail

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-f213ec774e65f74f93c4ebbac4d1cb90}"
BUCKET="${R2_BUCKET_NAME:-kastmatch-videos}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"
WRANGLER_TOML="${HOME}/Library/Preferences/.wrangler/config/default.toml"

if [[ ! -f "$WRANGLER_TOML" ]]; then
  echo "Wrangler non connecté. Lance: npx wrangler login"
  exit 1
fi

TOKEN=$(python3 - <<'PY'
import pathlib
text = pathlib.Path.home().joinpath("Library/Preferences/.wrangler/config/default.toml").read_text()
for line in text.splitlines():
    if line.startswith("oauth_token"):
        print(line.split("=",1)[1].strip().strip('"'))
        break
PY
)

api() {
  local method="$1" path="$2" data="${3:-}"
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}${path}" \
      -d "$data"
  else
    curl -sS -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}${path}"
  fi
}

echo "→ Compte: $ACCOUNT_ID"
echo "→ Bucket: $BUCKET"

LIST=$(api GET /r2/buckets)
if echo "$LIST" | grep -q 'Please enable R2'; then
  echo ""
  echo "R2 n’est pas encore activé sur ce compte."
  echo "Ouvre: https://dash.cloudflare.com/${ACCOUNT_ID}/r2/overview"
  echo "Accepte l’abonnement R2 (gratuit au démarrage), puis relance ce script."
  exit 2
fi

# Create bucket if missing
if echo "$LIST" | grep -q "\"name\":\"$BUCKET\""; then
  echo "✓ Bucket $BUCKET existe déjà"
else
  echo "→ Création bucket $BUCKET…"
  CREATE=$(api POST /r2/buckets "{\"name\":\"$BUCKET\"}")
  if echo "$CREATE" | grep -q '"success":true'; then
    echo "✓ Bucket créé"
  elif echo "$CREATE" | grep -qi 'already exists\|409\|10004'; then
    echo "✓ Bucket déjà présent"
  else
    echo "$CREATE" | python3 -m json.tool || echo "$CREATE"
    exit 1
  fi
fi

# Create Account API Token with R2 write (S3 keys derived from token)
# Permission group IDs from Cloudflare docs / permission_groups endpoint
echo "→ Recherche permission groups R2…"
PERMS=$(curl -sS -H "Authorization: Bearer $TOKEN" \
  "https://api.cloudflare.com/client/v4/user/tokens/permission_groups?name=Workers%20R2")
echo "$PERMS" | python3 -m json.tool > /tmp/r2-perms.json || true

WRITE_ID=$(python3 - <<'PY'
import json
data=json.load(open('/tmp/r2-perms.json'))
for g in data.get('result') or []:
    if g.get('name') == 'Workers R2 Storage Write':
        print(g['id']); break
PY
)

if [[ -z "${WRITE_ID:-}" ]]; then
  # fallback known id (may change) — fetch all and grep
  ALL=$(curl -sS -H "Authorization: Bearer $TOKEN" \
    "https://api.cloudflare.com/client/v4/user/tokens/permission_groups")
  WRITE_ID=$(echo "$ALL" | python3 -c "
import json,sys
data=json.load(sys.stdin)
for g in data.get('result') or []:
    if g.get('name')=='Workers R2 Storage Write':
        print(g['id']); break
")
fi

if [[ -z "${WRITE_ID:-}" ]]; then
  echo "Impossible de trouver 'Workers R2 Storage Write'. Crée un token R2 manuellement:"
  echo "https://dash.cloudflare.com/${ACCOUNT_ID}/r2/api-tokens"
  exit 1
fi

TOKEN_NAME="kastmatch-r2-$(date +%Y%m%d%H%M)"
echo "→ Création API token: $TOKEN_NAME"
CREATE_TOKEN=$(curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.cloudflare.com/client/v4/user/tokens" \
  -d "{
    \"name\": \"$TOKEN_NAME\",
    \"policies\": [{
      \"effect\": \"allow\",
      \"resources\": {
        \"com.cloudflare.api.account.${ACCOUNT_ID}\": \"*\"
      },
      \"permission_groups\": [{ \"id\": \"$WRITE_ID\" }]
    }]
  }")

echo "$CREATE_TOKEN" > /tmp/r2-token-create.json
python3 - <<'PY' > /tmp/r2-keys.env
import json, hashlib
data=json.load(open('/tmp/r2-token-create.json'))
if not data.get('success'):
    print('ERROR=' + json.dumps(data.get('errors')))
    raise SystemExit(1)
res=data['result']
token_id=res['id']
token_value=res['value']
# Secret Access Key = SHA-256 of the API token value (hex)
secret=hashlib.sha256(token_value.encode()).hexdigest()
print(f"R2_ACCESS_KEY_ID={token_id}")
print(f"R2_SECRET_ACCESS_KEY={secret}")
PY

if grep -q '^ERROR=' /tmp/r2-keys.env; then
  cat /tmp/r2-token-create.json | python3 -m json.tool
  exit 1
fi

# Enable public access via r2.dev subdomain (optional but useful)
echo "→ Activation domaine public r2.dev…"
PUBLIC=$(api PUT "/r2/buckets/${BUCKET}/domains/managed" '{"enabled":true}')
PUBLIC_URL=$(echo "$PUBLIC" | python3 -c "
import json,sys
try:
  d=json.load(sys.stdin)
  r=d.get('result') or {}
  # shape varies: domain / domainName
  print(r.get('domain') or r.get('domainName') or '')
except Exception:
  print('')
" 2>/dev/null || true)

# Upsert .env.local
python3 - <<PY
from pathlib import Path
env_path = Path("$ENV_FILE")
text = env_path.read_text() if env_path.exists() else ""
keys = {
    "R2_ACCOUNT_ID": "$ACCOUNT_ID",
    "R2_BUCKET_NAME": "$BUCKET",
}
for line in Path("/tmp/r2-keys.env").read_text().splitlines():
    k,v = line.split("=",1)
    keys[k]=v
pub = "${PUBLIC_URL}".strip()
if pub:
    if not pub.startswith("http"):
        pub = "https://" + pub
    keys["R2_PUBLIC_URL"] = pub.rstrip("/")

def upsert(text, k, v):
    import re
    pat = re.compile(rf"^{re.escape(k)}=.*$", re.M)
    line = f"{k}={v}"
    if pat.search(text):
        return pat.sub(line, text)
    if text and not text.endswith("\n"):
        text += "\n"
    return text + line + "\n"

for k,v in keys.items():
    text = upsert(text, k, v)
env_path.write_text(text)
print("✓ Écrit:", env_path)
for k in keys:
    print(f"  {k}={'***' if 'SECRET' in k else keys[k]}")
PY

echo ""
echo "Terminé. Redémarre next dev pour prendre les nouvelles vars."

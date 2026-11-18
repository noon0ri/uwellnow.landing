#!/usr/bin/env bash
# Pull photos, app screens, font and logo from the live uwellnow.com into public/.
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=https://uwellnow.com
html=$(curl -fsS "$SITE/")
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

# For each base name, download every hashed webp variant and keep the widest (desktop) and the one closest to 1600px (mobile).
fetch() { # $1 base name, $2 output name, $3 want mobile (1/0)
  local best="" bestw=0 mob="" mobd=99999
  for path in $(grep -oE "/assets/$1-[A-Za-z0-9_-]+\.webp" <<<"$html" | sort -u); do
    local f="$tmp/$(basename "$path")"
    curl -fsS "$SITE$path" -o "$f"
    local w; w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
    if (( w > bestw )); then bestw=$w; best=$f; fi
    local d=$(( w > 1600 ? w - 1600 : 1600 - w ))
    if (( d < mobd )); then mobd=$d; mob=$f; fi
  done
  [[ -n $best ]] || { echo "missing asset: $1" >&2; exit 1; }
  cp "$best" "public/img/$2.webp"
  if [[ $3 == 1 ]]; then cp "$mob" "public/img/$2-m.webp"; fi
  echo "$2: ${bestw}px"
}

mkdir -p public/img public/fonts
for s in fitness office apartment spa lounge; do fetch "space-$s" "space-$s" 1; done
fetch hero-poster hero-poster 0
fetch user-recipe user-recipe 0
for a in home customers stock cart; do fetch "admin-$a" "admin-$a" 0; done

font=$(grep -oE '/assets/FreesentationVF-[A-Za-z0-9_-]+\.woff2' <<<"$html" | head -1)
curl -fsS "$SITE$font" -o public/fonts/Freesentation.woff2
curl -fsS "$SITE/apple-touch-icon.png" -o public/apple-touch-icon.png

# Logo is an inline SVG in the header.
grep -oE '<svg viewBox="0 0 137 16[^"]*"[^>]*aria-label="uwellnow".*?</svg>' <<<"$html" | head -1 \
  | perl -pe 's#(</svg>).*#$1#; s/ class="[^"]*"//; s/fill="currentColor"/fill="currentColor" xmlns="http:\/\/www.w3.org\/2000\/svg"/' > public/img/logo.svg
[[ -s public/img/logo.svg ]] || { echo "logo not found" >&2; exit 1; }
echo done

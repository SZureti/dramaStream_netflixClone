#!/bin/sh
# Makes smaller copies of the artwork for responsive images (srcset).
#   posters 780w → posters/400/  (cards show posters ~150–230px wide)
#   hero   1920w → hero/960/     (phones, cards, episode thumbnails)
# Uses macOS's built-in sips. Run from the project root: sh scripts/make-image-sizes.sh
# Re-run after adding artwork; existing copies are skipped.
set -e
cd "$(dirname "$0")/../public/assets"

resize() { # folder width
  mkdir -p "$1/$2"
  for src in "$1"/*.jpg; do
    out="$1/$2/$(basename "$src")"
    [ -f "$out" ] && continue
    sips --resampleWidth "$2" -s format jpeg -s formatOptions 72 "$src" --out "$out" >/dev/null
  done
}

resize posters 400
resize hero 960
echo "Done: $(ls posters/400 | wc -l | tr -d ' ') posters, $(ls hero/960 | wc -l | tr -d ' ') heroes."

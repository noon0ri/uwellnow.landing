#!/usr/bin/env bash
# Compress the dispenser GLB for the web.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/models
npx -y @gltf-transform/cli optimize "디스펜서 3D 모델.glb" public/models/dispenser.glb \
  --compress meshopt --texture-compress webp --texture-size 2048
ls -la public/models/dispenser.glb

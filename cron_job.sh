#!/bin/bash

echo "----------------------------------"
echo "Starting Instagram scrape: $(date)"
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
cd ${SCRIPT_DIR}
npm run authenticate && npm run scrape
echo "Finished Instagram scrape: $(date)"

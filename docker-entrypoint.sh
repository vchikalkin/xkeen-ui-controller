#!/bin/sh
set -eu

DATA_DIR="${DATA_DIR:-/data}"

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$DATA_DIR"
  chown -R nextjs:nodejs "$DATA_DIR"
  exec su-exec nextjs:nodejs "$@"
fi

exec "$@"

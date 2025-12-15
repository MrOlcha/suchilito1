#!/bin/bash
cd /var/www/pos
export NODE_ENV=production
export PORT=3000
exec npm run dev

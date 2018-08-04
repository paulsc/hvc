#!/bin/sh
git pull
cd front
npm install
npm run build
cd ..
cd back
npm install
systemctl restart hvc

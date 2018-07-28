#!/bin/sh
git pull
cd front
npm run build
cd ..
systemctl restart hvc

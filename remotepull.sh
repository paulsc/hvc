#!/bin/sh
ssh havuc.co "cd hvc && ./pull.sh"
ssh root@havuc.co "systemctl restart hvc && systemctl status hvc"

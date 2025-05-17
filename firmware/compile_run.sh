#!/bin/bash

if [ -n "$IDF_PATH" ] && command -v idf.py >/dev/null 2>&1; then
  echo "ESP-IDF is already sourced"
else
  . $HOME/esp/esp-idf/export.sh || {
    echo "Failed to source ESP-IDF environment"
    exit 1
  }
fi

idf.py build -C program \
  && ./flash.sh program/build/emulation.bin \
  && qemu-system-xtensa \
  -nographic -M esp32 -m 4 \
  -drive file=flash.bin,if=mtd,format=raw \
  -nic user,model=open_eth,hostfwd=tcp::80-:80,hostfwd=tcp::3000-:3000

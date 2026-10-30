#!/bin/bash
# usage: run.sh name times [w] [cols]
cd C:/projects/_studio-animatzia/productions/toldot07_films/film_b
rm -rf _w/$1; mkdir -p _w/$1
PYTHONIOENCODING=utf-8 python sheet.py _w/$1 $2 ${3:-640} ${4:-3} s.jpg x 2>&1 | grep -v "^shot"
PYTHONIOENCODING=utf-8 python C:/projects/_studio-animatzia/tools/safe_view.py _w/$1/s.jpg --out _view 2>&1 | tail -1

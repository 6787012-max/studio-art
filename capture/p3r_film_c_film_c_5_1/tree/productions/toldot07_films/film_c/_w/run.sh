#!/bin/bash
# usage: run.sh <prefix> <width> <times> <cols>
cd C:/projects/_studio-animatzia/productions/toldot07_films/film_c
PYTHONIOENCODING=utf-8 python snap.py _w/$1 $2 $3 hq=1 > _w/$1.log 2>&1
python sheet.py _w/$1_sheet.jpg $4 420 _w/$1_[0-9]*.jpg >> _w/$1.log 2>&1
PYTHONIOENCODING=utf-8 python C:/projects/_studio-animatzia/tools/safe_view.py _w/$1_sheet.jpg --out _wv >> _w/$1.log 2>&1
echo DONE >> _w/$1.log

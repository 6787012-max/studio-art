#!/bin/bash
# usage: q.sh tag t1,t2,...   -> renders 640px frames, builds sheet, safe_view -> prints clean path
cd C:/projects/_studio-animatzia/productions/toldot07_films/film_d
tag=$1; ts=$2
PYTHONIOENCODING=utf-8 python snap.py _scratch/$tag 640 $ts 2>&1 | grep -v "^saved" | tail -3
files=""
for t in $(echo $ts | tr ',' ' '); do f=$(printf "_scratch/${tag}_%06.2f.jpg" $t); files="$files $f"; done
python sheet.py _scratch/${tag}_sheet.jpg 3 420 $files
python C:/projects/_studio-animatzia/tools/safe_view.py _scratch/${tag}_sheet.jpg --out _view | tail -1

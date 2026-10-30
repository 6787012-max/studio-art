cd C:/projects/_studio-animatzia/productions/toldot07_films/film_z
PYTHONIOENCODING=utf-8 python snap.py _fx/$1/f 640 $2 2>&1 | tail -2
python sheet.py "_fx/$1/f_*.jpg" _fx/$1.jpg 4
python C:/projects/_studio-animatzia/tools/safe_view.py _fx/$1.jpg --out _view | tail -1

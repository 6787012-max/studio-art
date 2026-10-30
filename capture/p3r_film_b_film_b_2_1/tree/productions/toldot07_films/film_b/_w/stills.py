import json,subprocess,sys
d=json.load(open('C:/projects/_studio-animatzia/productions/toldot07_films/film_b/timeline.json'))
ts=[]
for s in d['shots']:
    a=s['t0']; b=a+s['dur']; ts+= [a+1,a+(b-a)/3,a+2*(b-a)/3,b-1]
print(','.join('%.2f'%t for t in ts))

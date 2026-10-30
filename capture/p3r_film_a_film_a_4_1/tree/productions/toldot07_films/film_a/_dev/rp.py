import io
class P:
    def __init__(s,p):
        s.p=p; s.s=io.open(p,encoding='utf-8',newline='').read()
        s.nl='\r\n' if '\r\n' in s.s else '\n'
    def rep(s,a,b,n=1):
        a=a.replace('\r\n','\n').replace('\n',s.nl); b=b.replace('\r\n','\n').replace('\n',s.nl)
        assert s.s.count(a)==n,(a[:90],s.s.count(a))
        s.s=s.s.replace(a,b)
    def save(s): io.open(s.p,'w',encoding='utf-8',newline='').write(s.s)

// דמויות מצוירות בקוד — גרסה מקצועית (16-18/10/2026). יוסף: "כמו איור אמיתי, הכול מחובר; עוד תנועות; תלת-ממד 360".
// אותו ממשק כמו people.js (כל הסצנות הקיימות עובדות בלי שינוי), ועוד:
// PEOPLE.person(g,{x,y,s,a, up, bow, sit, legs, sad, tear, smile, hat:'hat'|'kippa'|'none', coat, skin, beard, beardLen, flip, rim,
//   yaw: מעלות (0 = פנים למצלמה, 90 = מסתכל ימינה במסך, 180 = גב), headYaw, turn:-1..1, tilt, nod,
//   t, talk:0..1, mouth:'A'|'E'|'O'|'M', look, lookY, blink, brow, angry, glasses, pants, eyeGlow,
//   gesture:<שם>, gesture2:<שם>, gmix:0..1, perform:0..1 (משחק אוטומטי בזמן דיבור), walk:<פאזה>, stride:0..1,
//   armA:{a,b,f,f2,hand,fs}, armB:{...}, onHead:(g,info)=>{} — ציור שמחובר לראש (כובע טייס, הילה...)})
// A = הזרוע בצד שמאל של המסך (במבט מלפנים), B = בצד ימין. a = הרחקה מהגוף (0 למטה, 90 הצידה, 180 למעלה),
// b = כיפוף המרפק (חיובי = האמה עולה החוצה, שלילי = נכנסת אל החזה), f/f2 = הרמה קדימה של הזרוע/האמה. hand: relax|open|point|fist|thumb.
// נקודת הייחוס (x,y) = מרכז החזה. גובה ~300 יחידות (כובע -142 עד נעליים +165).
//
// העיקרון: כל צורה עם קו מתאר אחד. הזרוע ממשיכה את קו הכתף, הקו הפנימי יוצא מבית השחי, המרפק מעוגל.
// תלת-ממד: לכל חלק יש עומק (z), ובכל זווית מחשבים מחדש מיקום, הסתרה וסדר ציור — כך הדמות מסתובבת 360.
(function(){
const D=Math.PI/180,TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t*t*(3-2*t);
function rgb(c){if(c[0]==='#'){let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return[n>>16,(n>>8)&255,n&255];}
  const m=c.match(/[\d.]+/g)||[0,0,0];return[+m[0],+m[1],+m[2]];}
function shade(hex,k){const[r,g,b]=rgb(hex);const f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return`rgb(${f(r)},${f(g)},${f(b)})`;}
function rgba(hex,a){const[r,g,b]=rgb(hex);return`rgba(${r},${g},${b},${a})`;}
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const add=(p,v,k)=>[p[0]+v[0]*k,p[1]+v[1]*k];
const LW=1.7;   // עובי קו המתאר ביחידות
const DC=26,WC=45;   // חתך הגוף: חצי עומק / חצי רוחב

// ---------------- תנוחות ידיים ----------------
const GEST={
  rest:{}, explain:{B:{a:20,b:62,hand:'open'}}, explainA:{A:{a:20,b:62,hand:'open'}},
  point:{B:{a:84,b:4,hand:'point'}}, pointA:{A:{a:84,b:4,hand:'point'}}, pointFwd:{B:{a:14,b:2,f:72,f2:80,hand:'point'}},
  finger:{B:{a:28,b:128,hand:'point'}}, heart:{B:{a:8,b:-122,hand:'open'}}, wave:{B:{a:62,b:100,hand:'open'}},
  wide:{A:{a:48,b:34,hand:'open'},B:{a:48,b:34,hand:'open'}}, think:{B:{a:16,b:-150,fs:.62,hand:'fist'}},
  thumb:{B:{a:12,b:-105,hand:'thumb'}}, pray:{A:{a:10,b:-112,hand:'relax'},B:{a:10,b:-112,hand:'relax'}},
  shrug:{A:{a:30,b:72,hand:'open'},B:{a:30,b:72,hand:'open'}}, hips:{A:{a:40,b:-95,hand:'fist'},B:{a:40,b:-95,hand:'fist'}},
  cross:{A:{a:10,b:-100,hand:'relax'},B:{a:12,b:-114,hand:'relax'}}, stop:{B:{a:40,b:72,f:20,f2:30,hand:'open'}},
  count:{A:{a:22,b:-70,hand:'open'},B:{a:24,b:-88,hand:'point'}}, offer:{B:{a:18,b:-10,f:15,f2:62,hand:'open'}},
  bless:{A:{a:60,b:30,f:30,f2:40,hand:'open'},B:{a:60,b:30,f:30,f2:40,hand:'open'}},
  up:{A:{a:140,b:28,hand:'open'},B:{a:140,b:28,hand:'open'}},
};
const PERF=['explain','rest','finger','explainA','offer','heart','shrug','point','count','explain','think','wide','rest','hips'];
const BASE=up=>up>0?{a:lerp(13,140,up),b:lerp(-12,28,up),hand:up>.45?'open':'relax'}:{a:13,b:-12,hand:'relax'};
const poseOf=(name,side,base)=>{const G=GEST[name];return G&&G[side]?Object.assign({},G[side]):Object.assign({},base);};
function mixPose(p,q,u){const r={};for(const k of['a','b','f','f2','fs','ff']){const pv=p[k]!==undefined?p[k]:(k==='fs'||k==='ff'?1:0),qv=q[k]!==undefined?q[k]:(k==='fs'||k==='ff'?1:0);r[k]=lerp(pv,qv,u);}
  r.hand=u<.5?(p.hand||'relax'):(q.hand||'relax');return r;}
function armPose(o,side,C){
  const base=BASE(C.up);let p=base;const t=C.t,sd=C.seed;
  if(o.perform>0){const per=2.5+sd*1.1,tt=t+sd*13,k=Math.floor(tt/per),u=tt/per-k,N=PERF.length,j=Math.floor(sd*N);
    const g0=PERF[(k-1+j+N*99)%N],g1=PERF[(k+j+N*99)%N];
    const q=mixPose(poseOf(g0,side,base),poseOf(g1,side,base),ease(clamp(u*per/.55,0,1)));p=mixPose(base,q,clamp(o.perform,0,1));}
  if(o.gesture){let q=poseOf(o.gesture,side,base);if(o.gesture2)q=mixPose(q,poseOf(o.gesture2,side,base),clamp(o.gmix||0,0,1));p=q;}
  if(o['arm'+side])p=Object.assign({},p,o['arm'+side]);
  p=Object.assign({},p);
  if(C.live){const ph=side==='A'?0:1.7;p.a+=1.6*Math.sin(t*1.1+sd*5+ph);p.b=(p.b||0)+2.6*Math.sin(t*1.4+sd*3+ph);
    if(o.talk>0&&(p.hand==='open'||p.hand==='point'))p.b+=7*o.talk*Math.sin(t*6.5+ph);}
  if(o.stride){const sw=o.stride*26*Math.sin((o.walk||0)+(side==='A'?Math.PI:0));p.f=(p.f||0)+sw*(o.gesture?.25:1);}
  return p;
}

// ---------------- כף יד (מערכת מקומית: ראשית בשורש כף היד, +y לכיוון האצבעות) ----------------
function hand(g,kind,ts,skin,phi){
  const ink=shade(skin,-.5),P=[];
  const cap=(x1,y1,x2,y2,w)=>P.push({c:1,x1,y1,x2,y2,w});
  P.push({c:0});
  const X=[4.6,1.55,-1.55,-4.6].map(v=>v*ts),Lf=[9.6,10.6,10,8.2];   // אצבע מורה ליד האגודל
  if(kind==='open'){X.forEach((x,i)=>{const an=(x/4.6)*10*D;cap(x,9,x+Math.sin(an)*Lf[i],9+Math.cos(an)*Lf[i],3.4);});cap(ts*6,4,ts*12.4,9.6,4.2);}
  else if(kind==='point'){X.forEach((x,i)=>i?cap(x,9,x*.9,13.2,3.5):cap(x,9,x,23.5,3.5));cap(ts*6,4,ts*1.4,9.6,4.1);}
  else if(kind==='fist'){X.forEach(x=>cap(x,9,x*.9,13.4,3.6));cap(ts*6,4,ts*.6,9.2,4.2);}
  else if(kind==='thumb'){X.forEach(x=>cap(x,9,x*.9,13.4,3.6));const u=[-Math.sin(phi),-Math.cos(phi)];cap(ts*4.6,5,ts*4.6+u[0]*11,5+u[1]*11,4.5);}
  else{X.forEach((x,i)=>cap(x,9,x*.96,9+Lf[i],3.3));cap(ts*5.6,3.5,ts*7.6,10.6,4.2);}
  const draw=(col,ex)=>{g.fillStyle=g.strokeStyle=col;
    for(const p of P){if(p.c){g.lineWidth=p.w+ex;g.beginPath();g.moveTo(p.x1,p.y1);g.lineTo(p.x2,p.y2);g.stroke();}
      else{g.beginPath();g.roundRect(-6.3-ex/2,-.5-ex/2,12.6+ex,11.5+ex,4.5+ex/2);g.fill();}}};
  draw(ink,LW*1.6);draw(skin,0);
  const hg=g.createLinearGradient(-6,0,6,12);hg.addColorStop(0,'rgba(255,255,255,.18)');hg.addColorStop(1,'rgba(120,50,30,.12)');
  g.fillStyle=hg;g.beginPath();g.roundRect(-6.3,-.5,12.6,11.5,4.5);g.fill();
  g.strokeStyle=shade(skin,-.32);g.lineWidth=.8;
  if(kind!=='open'){g.beginPath();for(const x of[3.1,0,-3.1]){g.moveTo(x*ts,kind==='relax'?11.5:10.5);g.lineTo(x*ts*.95,kind==='relax'?16.5:13);}g.stroke();}
  else{g.beginPath();g.moveTo(-ts*4,5.5);g.quadraticCurveTo(0,8.5,ts*3.5,4);g.stroke();}
}

// ---------------- זרוע: מפרקים בתלת-ממד -> הטלה -> שרוול רציף במערכת מראה (+x = החוצה מהגוף) ----------------
function armJoints(p,sd,br){
  const k=clamp((p.a-50)/100,0,1),S=[sd*37,-26-6*k-br*.6,0];
  const a=p.a*D,b=(p.b||0)*D,f=(p.f||0)*D,f2=(p.f2!==undefined?p.f2:(p.f||0))*D,L1=44*(p.fs||1),L2=40*(p.ff||1);
  const u=[sd*Math.sin(a)*Math.cos(f),Math.cos(a)*Math.cos(f),Math.sin(f)],v=[sd*Math.sin(a+b)*Math.cos(f2),Math.cos(a+b)*Math.cos(f2),Math.sin(f2)];
  const E=[S[0]+u[0]*L1,S[1]+u[1]*L1,S[2]+u[2]*L1],W=[E[0]+v[0]*L2,E[1]+v[1]*L2,E[2]+v[2]*L2];
  if(b<0)W[2]+=(DC+6)*ease(clamp(-b/95,0,1))*(1-Math.abs(Math.sin(f2)));   // אמה שנכנסת אל החזה — מלפני המעיל
  return{k,S,E,W};
}
const nO=d=>[d[1],-d[0]];
function sleevePath(G){
  const{k,S,E,W,d1,d2,b,tsc}=G,n1=nO(d1),n2=nO(d2),h1=10.8,hE=9.2,h2=8.4;
  const A1=add(S,n1,h1),A2=add(W,n2,h2),B1=add(S,n1,-h1),B2=add(W,n2,-h2);
  const T=[lerp(28,19,k)*tsc,-37.5-2*k],dT=[1,.1],Lt=.45*Math.hypot(A1[0]-T[0],A1[1]-T[1]);
  const m=[n1[0]+n2[0],n1[1]+n2[1]],mm=Math.max(.5,m[0]*m[0]+m[1]*m[1]);
  const corner=sg=>[E[0]+sg*m[0]*hE*2/mm,E[1]+sg*m[1]*hE*2/mm];
  const ang=v=>Math.atan2(v[1],v[0]);
  const arcTo=(g,from,to)=>{let s0=ang(from),s1=ang(to),dd=s1-s0;while(dd>Math.PI)dd-=TAU;while(dd<-Math.PI)dd+=TAU;g.arc(E[0],E[1],hE,s0,s0+dd,dd<0);};
  const aConvex=b<0;
  const P=add(B1,d1,h1*1.3*(1-k));   // בית השחי: כאן מתחיל הקו הפנימי
  const outer=(g,move)=>{if(move)g.moveTo(T[0],T[1]);
    g.bezierCurveTo(T[0]+dT[0]*Lt,T[1]+dT[1]*Lt,A1[0]-d1[0]*Lt,A1[1]-d1[1]*Lt,A1[0],A1[1]);
    if(aConvex){const p=add(E,n1,hE);g.lineTo(p[0],p[1]);arcTo(g,n1,n2);}else{const c=corner(1);g.lineTo(c[0],c[1]);}
    g.lineTo(A2[0],A2[1]);};
  const inner=(g,move,toP)=>{if(move)g.moveTo(B2[0],B2[1]);
    if(!aConvex){const p=add(E,n2,-hE);g.lineTo(p[0],p[1]);arcTo(g,[-n2[0],-n2[1]],[-n1[0],-n1[1]]);}else{const c=corner(-1);g.lineTo(c[0],c[1]);}
    const e=toP?P:B1;g.lineTo(e[0],e[1]);};
  const fill=g=>{g.beginPath();g.moveTo(T[0],T[1]);outer(g,false);g.lineTo(B2[0],B2[1]);inner(g,false,false);g.lineTo(S[0],S[1]);g.closePath();};
  return{fill,outer,inner,A1,A2,B1,B2,P,S,E,W,T,n1,n2,d1,d2,hE,aConvex,corner};
}
function armView(p,sd,C){
  const J=armJoints(p,sd,C.br),c=C.vc,s=C.vs,pr=q=>[q[0]*c+q[2]*s,q[1]],dp=q=>-q[0]*s+q[2]*c;
  const ms=sd*c>0.001?1:sd*c<-0.001?-1:sd;
  const S=pr(J.S),E=pr(J.E),W=pr(J.W);for(const q of[S,E,W])q[0]*=ms;
  const nrm=(a,b,fb)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return l<3?fb:[dx/l,dy/l];};
  const d2=nrm(E,W,[0,1]),d1=nrm(S,E,d2),ad=d=>Math.atan2(d[0],d[1]);
  let b=ad(d2)-ad(d1);while(b>Math.PI)b-=TAU;while(b<-Math.PI)b+=TAU;
  return{k:J.k,S,E,W,d1,d2,b,ms,tsc:Math.max(Math.abs(c),.3),depth:(dp(J.S)+dp(J.E)+dp(J.W))/3,wz:dp(J.W)};
}
function drawArm(g,p,G,C,front){
  const SP=sleevePath(G),coat=C.coat,ink=C.ink;
  g.save();g.scale(G.ms,1);
  if(front){g.save();g.beginPath();coatPath(g,C.kx);g.clip();g.filter=`blur(${Math.max(1,2.2*C.px)}px)`;g.translate(2,3.5);g.fillStyle='rgba(0,0,0,.30)';SP.fill(g);g.fill();g.restore();}
  // כף היד ושרוול החולצה — מתחת לשרוול המעיל
  const W=G.W,d2=G.d2,phi=Math.atan2(d2[1],d2[0])-Math.PI/2,ax=[Math.cos(phi),Math.sin(phi)];
  const ts=Math.sign(-ax[0]-ax[1]*.5)||1;
  g.save();g.translate(W[0]+d2[0]*2.4,W[1]+d2[1]*2.4);g.rotate(phi);hand(g,p.hand||'relax',ts,C.skin,phi);g.restore();
  g.strokeStyle=ink;g.lineCap='round';g.lineWidth=15+LW*2;g.beginPath();g.moveTo(W[0]-d2[0]*1.5,W[1]-d2[1]*1.5);g.lineTo(W[0]+d2[0]*2.2,W[1]+d2[1]*2.2);g.stroke();
  g.strokeStyle='#f4f2ee';g.lineWidth=15;g.stroke();
  const lit=G.ms<0;
  const gr=g.createLinearGradient(G.S[0]-12,0,G.S[0]+14,0);gr.addColorStop(0,shade(coat,lit?.16:-.02));gr.addColorStop(1,shade(coat,lit?-.08:-.3));
  SP.fill(g);g.fillStyle=front?gr:shade(coat,-.25);g.fill();
  g.save();SP.fill(g);g.clip();g.lineJoin='round';
  g.lineWidth=7;g.strokeStyle=rgba('#ffffff',lit?.10:.04);g.beginPath();SP.outer(g,true);g.stroke();
  g.lineWidth=8;g.strokeStyle='rgba(0,0,0,'+(lit?.16:.28)+')';g.beginPath();SP.inner(g,true,false);g.stroke();
  const cc=SP.corner(SP.aConvex?-1:1);
  if(Math.abs(G.b)>25*D){g.strokeStyle=shade(coat,-.55);g.lineWidth=1.1;g.globalAlpha*=.8;g.beginPath();
    for(const f of[.35,.6]){const q=[lerp(cc[0],G.E[0],f+.3),lerp(cc[1],G.E[1],f+.3)];g.moveTo(cc[0]*(1-f)+G.E[0]*f,cc[1]*(1-f)+G.E[1]*f);
      g.quadraticCurveTo(q[0]+G.d1[0]*3,q[1]+G.d1[1]*3,q[0]+(G.E[0]-cc[0])*.5,q[1]+(G.E[1]-cc[1])*.5);}g.stroke();}
  g.restore();
  g.strokeStyle=shade(coat,-.38);g.lineWidth=1;g.beginPath();const s0=add(add(G.S,SP.n1,9.6),G.d1,-1.5);g.moveTo(s0[0],s0[1]);
  g.quadraticCurveTo(G.S[0]+G.d1[0]*7,G.S[1]+G.d1[1]*7,SP.P[0],SP.P[1]);g.globalAlpha*=.55;g.stroke();g.globalAlpha=C.a;
  // קווי המתאר: החיצוני ממשיך את הכתף, הפנימי יוצא מבית השחי
  g.strokeStyle=ink;g.lineWidth=LW;g.beginPath();SP.outer(g,true);g.stroke();
  g.beginPath();SP.inner(g,true,true);g.stroke();
  g.beginPath();g.moveTo(SP.A2[0],SP.A2[1]);g.lineTo(SP.B2[0],SP.B2[1]);g.stroke();
  if(C.rim){g.strokeStyle=C.rim;g.lineWidth=1.1;g.globalAlpha*=.75;g.beginPath();SP.outer(g,true);g.stroke();g.globalAlpha=C.a;}
  g.restore();
}

// ---------------- המעיל (חתך אליפטי: צר בפרופיל) ----------------
function coatPath(g,kx){
  g.save();g.scale(kx||1,1);
  g.moveTo(-13,-41.5);g.lineTo(-28,-38);g.quadraticCurveTo(-40,-35,-42.5,-22);g.lineTo(-44.5,-4);g.lineTo(-47,90);
  g.quadraticCurveTo(0,96,47,90);g.lineTo(44.5,-4);g.lineTo(42.5,-22);g.quadraticCurveTo(40,-35,28,-38);g.lineTo(13,-41.5);g.closePath();
  g.restore();
}
function drawCoat(g,C){
  const coat=C.coat,ink=C.ink,kx=C.kx,c=C.vc,s=C.vs;
  const cg=g.createLinearGradient(-46*kx,0,46*kx,0);cg.addColorStop(0,shade(coat,.14));cg.addColorStop(.45,coat);cg.addColorStop(1,shade(coat,-.32));
  g.beginPath();coatPath(g,kx);g.fillStyle=cg;g.fill();
  g.save();g.beginPath();coatPath(g,kx);g.clip();
  const vg=g.createLinearGradient(0,40,0,96);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.22)');g.fillStyle=vg;g.fillRect(-50,40,100,60);
  if(c>.02){g.save();g.translate(DC*s,0);g.scale(c,1);
    g.beginPath();g.moveTo(-12.5,-42);g.lineTo(12.5,-42);g.lineTo(0,5);g.closePath();
    const sg=g.createLinearGradient(0,-42,0,5);sg.addColorStop(0,'#d9d6d0');sg.addColorStop(.35,'#f7f6f2');sg.addColorStop(1,'#e9e6e0');g.fillStyle=sg;g.fill();
    g.fillStyle='#b9b4ac';for(const by of[-22,-10])g.beginPath(),g.ellipse(0,by,1.1,1.1,0,0,TAU),g.fill();
    for(const sd of[-1,1]){g.beginPath();g.moveTo(sd*13,-42);g.lineTo(sd*4,6);g.lineTo(sd*15.5,-6);g.lineTo(sd*21,-23);g.lineTo(sd*16.5,-27);g.lineTo(sd*20.5,-38.5);g.closePath();
      g.fillStyle=shade(coat,sd<0?.12:-.14);g.fill();g.strokeStyle=shade(coat,-.6);g.lineWidth=1.05;g.stroke();
      g.strokeStyle=rgba('#ffffff',sd<0?.16:.06);g.lineWidth=.9;g.beginPath();g.moveTo(sd*12.2,-40);g.lineTo(sd*4.6,3);g.stroke();}
    g.strokeStyle=shade(coat,-.6);g.lineWidth=1.05;g.beginPath();g.moveTo(1.5,5);g.lineTo(1.5,92);g.stroke();
    g.strokeStyle=rgba('#ffffff',.07);g.beginPath();g.moveTo(3,8);g.lineTo(3,92);g.stroke();
    for(const by of[20,40]){g.fillStyle=shade(coat,-.45);g.beginPath();g.ellipse(5.5,by,2.5,2.5,0,0,TAU);g.fill();g.fillStyle=rgba('#ffffff',.25);g.beginPath();g.ellipse(4.9,by-.8,.9,.9,0,0,TAU);g.fill();}
    g.strokeStyle=shade(coat,-.55);g.lineWidth=1;for(const sd of[-1,1]){g.beginPath();g.moveTo(sd*18,59);g.quadraticCurveTo(sd*27,61,sd*36,58.5);g.stroke();}
    g.restore();}
  else if(c<-.02){g.save();g.translate(-DC*s,0);g.scale(-c,1);   // גב המעיל: תפר אמצעי ושסע
    g.strokeStyle=shade(coat,-.55);g.lineWidth=1.1;g.beginPath();g.moveTo(0,-38);g.quadraticCurveTo(-1,10,0,62);g.lineTo(-1.5,92);g.moveTo(0,62);g.lineTo(1.5,92);g.stroke();
    g.beginPath();g.moveTo(-15,-40);g.quadraticCurveTo(0,-36,15,-40);g.stroke();
    g.strokeStyle=shade(coat,-.45);for(const sd of[-1,1]){g.beginPath();g.moveTo(sd*30,-30);g.quadraticCurveTo(sd*18,-12,sd*24,10);g.stroke();}
    g.restore();}
  g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=1.4;for(const fx of[-30,-12,15,33]){g.beginPath();g.moveTo(fx*kx,68);g.quadraticCurveTo(fx*kx+1.5,80,fx*kx-.5,92);g.stroke();}
  const ao=g.createRadialGradient(0,-40,2,0,-36,22);ao.addColorStop(0,'rgba(0,0,0,.28)');ao.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=ao;g.fillRect(-25,-45,50,30);
  g.restore();
  g.beginPath();coatPath(g,kx);g.strokeStyle=ink;g.lineWidth=LW;g.stroke();
  if(C.rim){g.strokeStyle=C.rim;g.lineWidth=1.1;g.globalAlpha*=.75;g.stroke();g.globalAlpha=C.a;}
  if(c>.15){g.save();g.translate(DC*s,0);g.scale(c,1);
    for(const sd of[-1,1]){g.beginPath();g.moveTo(sd*2.5,-36.5);g.lineTo(sd*12,-44.5);g.lineTo(sd*13.5,-39);g.lineTo(sd*8,-32);g.closePath();
      g.fillStyle='#f6f5f1';g.fill();g.strokeStyle='#8f8a82';g.lineWidth=.9;g.stroke();}g.restore();}
}

// ---------------- רגליים: ירך -> ברך -> קרסול, עם צעד הליכה ----------------
function drawLegs(g,C,o,sit){
  const c=C.vc,s=C.vs,pc=C.pants,ink='#050508',st=o.stride||0,ph=o.walk||0,L=[];
  for(const sd of[-1,1]){
    const q=ph+(sd<0?0:Math.PI),sw=st*.48*Math.sin(q),kn=st*.95*Math.max(0,Math.sin(q+Math.PI/2));
    let H=[sd*15.5,80,0],K,A;
    if(sit){K=[sd*17,92,30];A=[sd*17,150,34];}
    else{K=[H[0],H[1]+40*Math.cos(sw),40*Math.sin(sw)];A=[H[0],K[1]+40*Math.cos(sw-kn),K[2]+40*Math.sin(sw-kn)];}
    const pr=v=>[v[0]*c+v[2]*s,v[1]];L.push({H:pr(H),K:pr(K),A:pr(A),az:A[2],d:-H[0]*s+K[2]*c});
  }
  L.sort((a,b)=>a.d-b.d);
  for(const l of L){
    const path=()=>{g.beginPath();g.moveTo(l.H[0],l.H[1]);g.lineTo(l.K[0],l.K[1]);g.lineTo(l.A[0],l.A[1]);};
    g.lineCap='round';g.lineJoin='round';path();g.strokeStyle=ink;g.lineWidth=23+LW*2;g.stroke();
    path();g.strokeStyle=shade(pc,l.d<0?-.15:0);g.lineWidth=23;g.stroke();
    g.save();g.translate(-4,0);path();g.strokeStyle=rgba('#ffffff',.07);g.lineWidth=6;g.stroke();g.restore();
    // נעל: מתארכת לכיוון שהדמות פונה אליו
    const hl=9.5+7*Math.abs(s),cx=l.A[0]+s*7,cy=l.A[1]+3.5;
    g.beginPath();g.ellipse(cx,cy,hl,7,0,0,TAU);g.fillStyle='#0d0d10';g.fill();g.strokeStyle=ink;g.lineWidth=LW;g.stroke();
    g.strokeStyle=rgba('#ffffff',.33);g.lineWidth=1.3;g.beginPath();g.ellipse(cx+s*3,cy-1.5,hl*.6,3.5,0,Math.PI*1.1,Math.PI*1.75);g.stroke();
  }
}

// ---------------- הראש (עם סיבוב: כל פרט לפי העומק שלו) ----------------
function beardShape(g,bl){
  const yB=-44+bl*40,pts=[];
  const bez=(p0,p1,p2,p3,u)=>{const v=1-u;return[v*v*v*p0[0]+3*v*v*u*p1[0]+3*v*u*u*p2[0]+u*u*u*p3[0],v*v*v*p0[1]+3*v*v*u*p1[1]+3*v*u*u*p2[1]+u*u*u*p3[1]];};
  const L0=[-23.5,-88],R0=[23.5,-88],Bt=[0,yB];
  for(let i=0;i<=9;i++)pts.push(bez(L0,[-30.5,-64],[-23,yB+2],Bt,i/9));
  for(let i=1;i<=9;i++)pts.push(bez(Bt,[23,yB+2],[30.5,-64],R0,i/9));
  g.moveTo(pts[0][0],pts[0][1]);
  for(let i=0;i<pts.length-1;i++){const p=pts[i],q=pts[i+1],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;let nx=q[1]-p[1],ny=-(q[0]-p[0]);const nl=Math.hypot(nx,ny)||1;
    nx/=nl;ny/=nl;if(nx*mx+ny*(my+66)<0){nx=-nx;ny=-ny;}const bu=1.6+rnd(i*3.1)*1.4;g.quadraticCurveTo(mx+nx*bu,my+ny*bu,q[0],q[1]);}
  const I=[[20,-88],[19.5,-76],[16,-65.5],[9.5,-60.5],[0,-62.5],[-9.5,-60.5],[-16,-65.5],[-19.5,-76],[-20,-88]];
  g.lineTo(I[0][0],I[0][1]);for(let i=1;i<I.length;i++){const p=I[i-1],q=I[i];g.quadraticCurveTo((p[0]+q[0])/2+(rnd(i+40)-.5)*1.4,(p[1]+q[1])/2+.8,q[0],q[1]);}
  g.closePath();return yB;
}
function drawBeard(g,C){
  const beard=C.beard,bl=C.bl,ch=C.hc,sh=C.hs;
  g.save();g.translate(14*sh,0);g.scale(Math.sqrt(ch*ch+.27*sh*sh),1);
  g.beginPath();beardShape(g,bl);
  const bg=g.createLinearGradient(0,-90,0,-44+bl*40);bg.addColorStop(0,shade(beard,.12));bg.addColorStop(.6,beard);bg.addColorStop(1,shade(beard,-.28));
  g.fillStyle=ch<0?shade(beard,-.12):bg;g.fill();
  g.save();g.beginPath();beardShape(g,bl);g.clip();const yB=-44+bl*40;
  for(let i=0;i<30;i++){const u=rnd(i+7),v=rnd(i+50),x0=lerp(-25,25,u)*(1-v*.35),y0=lerp(-84,yB-8,v),len=7+rnd(i+20)*8;
    const dx=-x0*.35,dl=Math.hypot(dx,len),ux=dx/dl,uy=len/dl,w=(rnd(i+90)-.5)*4;
    g.strokeStyle=i%2?rgba('#000000',.24):shade(beard,.3);g.globalAlpha=C.a*(i%2?1:.5);g.lineWidth=i%2?1:.75;
    g.beginPath();g.moveTo(x0,y0);g.bezierCurveTo(x0+ux*len*.3+w,y0+uy*len*.3,x0+ux*len*.7-w,y0+uy*len*.7,x0+ux*len,y0+uy*len);g.stroke();}
  g.globalAlpha=C.a;const sg=g.createRadialGradient(0,-62,0,0,-62,16);sg.addColorStop(0,'rgba(0,0,0,.35)');sg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=sg;g.fillRect(-16,-70,32,16);
  g.restore();
  g.beginPath();beardShape(g,bl);g.strokeStyle=shade(beard,-.6);g.lineWidth=LW;g.stroke();
  g.restore();
}
function drawHead(g,o,C){
  const skin=C.skin,beard=C.beard,bl=C.bl,ch=C.hc,sh=C.hs,ink=shade(skin,-.55);
  const V=(x,z)=>{const r=Math.hypot(x,z)||1;return{X:x*ch+z*sh,d:-x*sh+z*ch,f:(z/r)*ch-(x/r)*sh};};
  // צורת ראש מפוסלת: רקות, עצמות לחיים, לסת וסנטר (לא אליפסה) — הסנטר זז לכיוון שהפנים פונות אליו
  const face=()=>{const jx=6*sh;g.beginPath();g.moveTo(0,-108.5);
    g.bezierCurveTo(16,-108.5,27.6,-98.5,27.6,-83);g.bezierCurveTo(27.6,-71,24.5+jx*.3,-62,17.5+jx*.6,-55);
    g.bezierCurveTo(12.5+jx,-49.6,4.5+jx,-48,jx,-48);g.bezierCurveTo(-4.5+jx,-48,-12.5+jx,-49.6,-17.5+jx*.6,-55);
    g.bezierCurveTo(-24.5+jx*.3,-62,-27.6,-71,-27.6,-83);g.bezierCurveTo(-27.6,-98.5,-16,-108.5,0,-108.5);g.closePath();};
  const ear=sd=>{const e=V(sd*26.2,-1),rx=4.3+2.6*Math.abs(sh);g.beginPath();g.ellipse(e.X,-79,rx,7,sd*.12*ch,0,TAU);return e;};
  const back=ch<-.12;
  if(bl>0&&ch<0)drawBeard(g,C);               // גב: הזקן מאחורי הראש, רק השוליים מציצים
  // אוזניים מאחורי קו הפנים
  for(const sd of[-1,1]){const e=V(sd*26.2,-1);if(e.d<=3){g.lineWidth=LW*1.8;g.strokeStyle=ink;ear(sd);g.stroke();g.fillStyle=shade(skin,-.13);ear(sd);g.fill();}}
  g.lineWidth=LW*1.8;g.strokeStyle=ink;face();g.stroke();
  const hg=g.createRadialGradient(-9+8*sh,-92,2,4*sh,-78,36);hg.addColorStop(0,shade(skin,.2));hg.addColorStop(.6,skin);hg.addColorStop(1,shade(skin,-.14));
  g.fillStyle=hg;face();g.fill();
  g.save();face();g.clip();
  if(C.hat==='hat'){const s2=g.createLinearGradient(0,-102,0,-89);s2.addColorStop(0,'rgba(40,20,10,.42)');s2.addColorStop(1,'rgba(40,20,10,0)');g.fillStyle=s2;g.fillRect(-30,-110,60,22);}
  { const sg=g.createLinearGradient(-28,0,28,0);sg.addColorStop(0,'rgba(0,0,0,0)');sg.addColorStop(.6,'rgba(0,0,0,0)');sg.addColorStop(1,'rgba(150,70,40,.16)');   // צד מוצל חם (אור משמאל)
    g.fillStyle=sg;g.fillRect(-30,-110,60,64);
    const jg=g.createLinearGradient(0,-58,0,-48);jg.addColorStop(0,'rgba(0,0,0,0)');jg.addColorStop(1,'rgba(150,70,40,.14)');g.fillStyle=jg;g.fillRect(-30,-58,60,11); }
  if(!back)for(const sd of[-1,1]){const e=V(sd*14.5,22);if(e.f<.1)continue;const cg=g.createRadialGradient(e.X,-68.5,0,e.X,-68.5,8);
    cg.addColorStop(0,'rgba(232,112,100,'+(.32*e.f)+')');cg.addColorStop(1,'rgba(232,112,100,0)');g.fillStyle=cg;g.fillRect(e.X-9,-78,18,18);}
  // שיער בחצי האחורי של הראש: האזור שבין קו המתאר לבין "קו האמצע" (מאחורי האוזן), עד העורף
  if(ch<.97){const b=sh>=0?-1:1,R=27,rb=R*Math.abs(ch),fs=ch>=0?b:-b;
    const half=()=>{g.beginPath();g.ellipse(0,-78,27,30,0,-Math.PI/2,Math.PI/2,b>0?false:true);   // צד אחורי של קו המתאר: מלמעלה למטה
      g.ellipse(0,-78,rb,30,0,Math.PI/2,-Math.PI/2,fs>0?true:false);g.closePath();};
    g.save();half();g.clip();g.fillStyle=shade(beard,-.04);g.fillRect(-30,-112,60,52);
    g.beginPath();g.moveTo(-30,-60);g.quadraticCurveTo(0,-54,30,-60);g.lineTo(30,-64);g.lineTo(-30,-64);g.fill();
    // מתחת לקו השיער: מאחור — הזקן עוטף משני צדי הצוואר; בצד — צל צוואר
    const lb=clamp(-ch*1.6,0,1);g.fillStyle=lb>.5?shade(beard,-.1):shade(skin,-.18);g.fillRect(-30,-61,60,16);
    g.strokeStyle=shade(beard,.28);g.lineWidth=.8;g.globalAlpha=C.a*.45;g.beginPath();for(let i=0;i<10;i++){const x0=-24+i*5.3;g.moveTo(x0,-100);g.quadraticCurveTo(x0+2,-80,x0-1,-62);}g.stroke();g.globalAlpha=C.a;
    if(back){const ng=g.createLinearGradient(-10,0,10,0);ng.addColorStop(0,shade(skin,-.25));ng.addColorStop(.5,shade(skin,-.05));ng.addColorStop(1,shade(skin,-.25));
      g.fillStyle=ng;g.beginPath();g.moveTo(-8.5,-58);g.quadraticCurveTo(0,-61,8.5,-58);g.lineTo(9.5,-46);g.lineTo(-9.5,-46);g.closePath();g.fill();}
    g.restore();}
  g.restore();
  // אוזניים מלפני הפנים (בפרופיל — האוזן הקרובה על צד הראש)
  for(const sd of[-1,1]){const e=V(sd*26.2,-1);if(e.d>3){const fw=Math.sign(sh)||1,rx=3.4+1.8*Math.abs(sh);   // אוזן על צד הראש: צורת שעועית, כהה מהלחי, עם קפל פנימי
    const ep=()=>{g.beginPath();g.moveTo(e.X,-86);g.bezierCurveTo(e.X-fw*rx*1.25,-86,e.X-fw*rx*1.2,-72.5,e.X-fw*.2,-72);g.bezierCurveTo(e.X+fw*rx*.7,-72.5,e.X+fw*rx*.35,-79,e.X+fw*rx*.6,-82);g.quadraticCurveTo(e.X+fw*rx*.5,-86,e.X,-86);g.closePath();};
    ep();g.fillStyle=shade(skin,-.14);g.fill();g.strokeStyle=ink;g.lineWidth=LW*.9;g.stroke();
    g.strokeStyle=shade(skin,-.42);g.lineWidth=1.2;g.beginPath();g.moveTo(e.X-fw*rx*.15,-83.5);g.bezierCurveTo(e.X-fw*rx*.8,-82.5,e.X-fw*rx*.75,-76,e.X-fw*rx*.1,-75);g.stroke();}
    else if(!back){g.strokeStyle=shade(skin,-.38);g.lineWidth=1.1;g.beginPath();const ex=e.X;g.moveTo(ex+sd*1.6*ch,-84);g.bezierCurveTo(ex-sd*1.6*ch,-84.5,ex-sd*1.9*ch,-77,ex+sd*.6*ch,-74);g.stroke();}}
  // שיער על הראש (כשאין כובע מלא)
  if(C.hat!=='hat'&&!back){const hx=-sh*7;const hp=()=>{g.beginPath();g.moveTo(hx-27.6,-80);g.bezierCurveTo(hx-29,-104,hx-17,-110.5,hx,-110.5);
      g.bezierCurveTo(hx+17,-110.5,hx+29,-104,hx+27.6,-80);g.quadraticCurveTo(hx+24,-86,hx+19*ch+8*sh,-90);
      g.quadraticCurveTo(hx+9*ch+12*sh,-95.5,hx+12*sh,-93.5);g.quadraticCurveTo(hx-7*ch+12*sh,-96,hx-19*ch+8*sh,-90.5);g.quadraticCurveTo(hx-24,-86,hx-27.6,-80);g.closePath();};
    g.save();face();g.clip();hp();const hh=g.createLinearGradient(0,-111,0,-85);hh.addColorStop(0,shade(beard,.12));hh.addColorStop(1,shade(beard,-.15));g.fillStyle=hh;g.fill();
    g.strokeStyle=shade(beard,.3);g.lineWidth=.8;g.globalAlpha=C.a*.5;g.beginPath();for(let i=0;i<9;i++){const x0=hx-20+i*5;g.moveTo(x0,-108);g.quadraticCurveTo(x0+3,-103,x0+1.5,-97);}g.stroke();g.globalAlpha=C.a;
    g.restore();g.beginPath();g.ellipse(0,-78,27,30,0,Math.PI*1.05,Math.PI*1.95);g.strokeStyle=shade(beard,-.6);g.lineWidth=LW;g.stroke();}
  if(!back){
    // עיניים וגבות
    const lk=clamp(o.look||0,-1,1)*1.6+sh*1.2,lky=(o.lookY||0)*1.2-C.up*1.2;
    const close=clamp(Math.max(C.blink,C.sad>.6?1:C.sad*.32),0,1);
    if(o.eyeGlow){g.save();g.fillStyle=o.eyeGlow;g.shadowColor=o.eyeGlow;g.shadowBlur=7*C.px;
      for(const sd of[-1,1]){const e=V(sd*10.8,24.5);if(e.f<.15)continue;g.beginPath();g.ellipse(e.X,-82,6.2*e.f,3.4,sd*.35,0,TAU);g.fill();}g.restore();}
    // עין בצורת שקד: עפעף עליון מקומר ועבה, תחתון שטוח; פינה פנימית נמוכה, חיצונית מורמת מעט; קשתית גדולה שהעפעף מכסה חלק ממנה
    else for(const sd of[-1,1]){const e=V(sd*10.6,24.5);if(e.f<.18)continue;const fw=Math.pow(e.f,.8),ex=e.X,ey=-80.6,rx=6.1*fw,ry=4.1;
      const ic=[ex-sd*rx,ey+.5],oc=[ex+sd*rx,ey-.6],up=ey-ry*2.05,lo=ey+ry*1.3,cx=ex+sd*rx*.12;
      const lidY=lerp(up,lo,close*.98),eye=()=>{g.beginPath();g.moveTo(ic[0],ic[1]);g.quadraticCurveTo(cx,up,oc[0],oc[1]);g.quadraticCurveTo(ex-sd*rx*.05,lo,ic[0],ic[1]);g.closePath();};
      g.save();eye();g.fillStyle='#fbf7f1';g.fill();g.clip();
      const ix=ex+lk*fw,iy=ey+lky-.1;
      const ig=g.createRadialGradient(ix,iy+1,.5,ix,iy,3.5);ig.addColorStop(0,shade(o.eyes||'#6b4526',.25));ig.addColorStop(1,shade(o.eyes||'#6b4526',-.35));
      g.fillStyle=ig;g.beginPath();g.ellipse(ix,iy,3.45*fw,3.45,0,0,TAU);g.fill();
      g.fillStyle='#120a06';g.beginPath();g.ellipse(ix,iy,1.6*fw,1.6,0,0,TAU);g.fill();
      g.fillStyle='#fff';g.beginPath();g.ellipse(ix-1.1*fw,iy-1.3,.95*fw,.95,0,0,TAU);g.fill();g.globalAlpha*=.7;g.beginPath();g.ellipse(ix+1.2*fw,iy+1.1,.45,.45,0,0,TAU);g.fill();g.globalAlpha=C.a;
      const s2=g.createLinearGradient(0,ey-ry*1.2,0,ey+1);s2.addColorStop(0,'rgba(90,50,30,.42)');s2.addColorStop(1,'rgba(90,50,30,0)');g.fillStyle=s2;g.fillRect(ex-rx-1,ey-ry*1.6,rx*2+2,ry*1.6);
      g.beginPath();g.moveTo(ic[0]-sd,up-3);g.lineTo(oc[0]+sd,up-3);g.lineTo(oc[0],oc[1]);g.quadraticCurveTo(cx,lidY,ic[0],ic[1]);g.closePath();g.fillStyle=shade(skin,-.07);g.fill();
      g.restore();
      // קו העפעף העליון: עבה באמצע, עם משיכה קטנה בפינה החיצונית; קפל עפעף דק מעליו; עפעף תחתון עדין
      g.strokeStyle='#2a170c';g.lineWidth=1.55;g.beginPath();g.moveTo(ic[0],ic[1]);g.quadraticCurveTo(cx,lidY,oc[0],oc[1]);g.stroke();
      if(close<.6){g.strokeStyle=shade(skin,-.3);g.lineWidth=.9;g.beginPath();g.moveTo(ic[0]+sd*1.2,ic[1]-2.6);g.quadraticCurveTo(cx,up-2.2,oc[0]-sd*.6,oc[1]-2.2);g.stroke();
        g.strokeStyle=rgba('#8a5a45',.4);g.lineWidth=.8;g.beginPath();g.moveTo(ic[0]+sd*.8,ic[1]+.4);g.quadraticCurveTo(ex-sd*rx*.05,lo-.2,oc[0]-sd*.8,oc[1]+.6);g.stroke();}
      // גבה: עבה בפנים, מתחדדת החוצה, קשת קלה
      const raise=(o.brow||0)*3+C.up*1.1+C.smile*.6,ang=o.angry||0;
      const bi=[ex-sd*5.4*fw,ey-8.4-raise-C.sad*3.6+ang*3.4],bo=[ex+sd*7*fw,ey-8.8-raise+C.sad*1.2-ang*.6],pk=[ex+sd*2.2*fw,Math.min(bi[1],bo[1])-2.6];
      g.fillStyle=shade(beard,-.15);g.beginPath();g.moveTo(bi[0],bi[1]+1.5);g.quadraticCurveTo(bi[0],bi[1]-1.7,pk[0],pk[1]-.6);g.quadraticCurveTo(bo[0]-sd*1.6*fw,pk[1]-.2,bo[0],bo[1]);
      g.quadraticCurveTo(bo[0]-sd*2*fw,pk[1]+1.6,pk[0],pk[1]+1.9);g.quadraticCurveTo(bi[0]+sd*1.5*fw,bi[1]+.8,bi[0],bi[1]+1.5);g.closePath();g.fill();}
    if(bl>0&&ch>=0)drawBeard(g,C);
    // פה
    const mV=V(0,25.5),mx=mV.X,my=-57,talk=clamp(o.talk||0,0,1),ms=o.mouth||(talk>.05?'A':'M'),mf=Math.max(.3,ch);
    let mw=6.6*mf,mh=ms==='M'?0:talk*6.4;if(ms==='E'){mw*=1.18;mh*=.55;}if(ms==='O'){mw*=.7;mh*=1.1;}
    if(ch>.08){if(mh>.6){const mp=()=>{g.beginPath();g.moveTo(mx-mw,my-.6);g.quadraticCurveTo(mx,my-1.8,mx+mw,my-.6);
        g.bezierCurveTo(mx+mw*.9,my+mh*1.25,mx-mw*.9,my+mh*1.25,mx-mw,my-.6);g.closePath();};
      mp();g.fillStyle='#3a1410';g.fill();g.save();mp();g.clip();g.fillStyle='#f7f3ea';g.fillRect(mx-mw,my-3,mw*2,1.8+mh*.18);
      g.fillStyle='#c4544c';g.beginPath();g.ellipse(mx,my+mh*1.05,mw*.62,mh*.42,0,0,TAU);g.fill();g.restore();
      mp();g.strokeStyle='#2a0e0a';g.lineWidth=1.2;g.stroke();
      g.strokeStyle=rgba('#d07a6a',.55);g.lineWidth=1.1;g.beginPath();g.moveTo(mx-mw*.55,my+mh*1.02+1.1);g.quadraticCurveTo(mx,my+mh*1.1+1.9,mx+mw*.55,my+mh*1.02+1.1);g.stroke();}
    else{const mc=(C.smile+.25-C.sad)*4.2,w=(bl>0?6.5:5.4)*mf;g.strokeStyle=bl>0?'#2a120c':'#8a4234';g.lineWidth=bl>0?1.7:1.45;g.beginPath();g.moveTo(mx-w,my-mc*.25);g.quadraticCurveTo(mx,my+mc,mx+w,my-mc*.25);g.stroke();
      if(bl<=0){g.strokeStyle=rgba('#c9786a',.45);g.lineWidth=1.3;g.beginPath();g.moveTo(mx-w*.45,my+2.3+mc*.4);g.quadraticCurveTo(mx,my+3.4+mc*.5,mx+w*.45,my+2.3+mc*.4);g.stroke();}}}
    // שפם
    if(bl>0&&ch>.05){g.save();g.translate(V(0,26).X,0);g.scale(Math.max(.25,ch),1);
      const mus=sd=>{g.moveTo(sd*.5,-66.2);g.bezierCurveTo(sd*6,-67.6,sd*12.5,-63,sd*14,-57.2);g.quadraticCurveTo(sd*11,-59.4,sd*9.6,-58.6);g.quadraticCurveTo(sd*7.5,-61.4,sd*5.4,-60.2);g.quadraticCurveTo(sd*3,-62.4,0,-61.4);};
      g.beginPath();mus(-1);mus(1);const mg=g.createLinearGradient(0,-67,0,-58);mg.addColorStop(0,shade(beard,.16));mg.addColorStop(1,shade(beard,-.2));
      g.fillStyle=mg;g.fill();g.strokeStyle=shade(beard,-.6);g.lineWidth=1.3;g.stroke();
      g.strokeStyle=shade(beard,.34);g.lineWidth=.7;g.globalAlpha=C.a*.6;g.beginPath();for(const sd of[-1,1])for(const k of[0,1]){g.moveTo(sd*(2+k*3),-65.4+k*.6);g.quadraticCurveTo(sd*(7+k*2),-64.5,sd*(10+k*2),-60.5+k*.8);}g.stroke();g.globalAlpha=C.a;
      g.restore();}
    // אף — בפרופיל בולט מעבר לקו הפנים
    // אף מעוצב: צל לאורך צד הגשר, קצה רך עם ברק, כנפי נחיריים וקו תחתון — בלי עיגול מוקף (לא "אף של ליצן")
    if(ch>-.2){const nx=V(0,27.5).X,ny=-70,fs=Math.sign(sh)||1,side=Math.abs(sh);
      if(side>.45){g.beginPath();g.moveTo(nx-fs*3.5,-80);g.quadraticCurveTo(nx+fs*1.5,-75,nx+fs*4.2,-70.2);g.quadraticCurveTo(nx+fs*4.8,-67.2,nx+fs*1.2,-67);g.lineTo(nx-fs*2.5,-67.5);g.closePath();
        g.fillStyle=skin;g.fill();g.strokeStyle=shade(skin,-.45);g.lineWidth=1.15;g.beginPath();g.moveTo(nx-fs*1.5,-79);g.quadraticCurveTo(nx+fs*1.5,-75,nx+fs*4.2,-70.2);g.quadraticCurveTo(nx+fs*4.8,-67.2,nx+fs*1.2,-67);g.stroke();}
      g.strokeStyle=rgba(shade(skin,-.32),.55);g.lineWidth=1.8;g.beginPath();g.moveTo(nx+1.4-fs*side*2,-79.5);g.quadraticCurveTo(nx+2.4-fs*side*1.5,-74.5,nx+2.6-fs*side,-71);g.stroke();
      const ng=g.createRadialGradient(nx-.8,-71.6,.3,nx,-70.4,4.4);ng.addColorStop(0,shade(skin,.16));ng.addColorStop(1,rgba(shade(skin,-.1),0));g.fillStyle=ng;g.beginPath();g.ellipse(nx,-70.4,4.2,3.4,0,0,TAU);g.fill();
      g.fillStyle=rgba('#ffffff',.5);g.beginPath();g.ellipse(nx-1,-71.8,1,.75,0,0,TAU);g.fill();
      g.strokeStyle=shade(skin,-.42);g.lineWidth=1.25;g.beginPath();
      for(const sd of[-1,1]){const e=V(sd*3.3,26);if(e.f<.15)continue;g.moveTo(e.X,-70.6);g.quadraticCurveTo(e.X+sd*.9*e.f,-68.4,e.X-sd*.9*e.f,-67.6);}
      g.moveTo(nx-1.6,-67.4);g.quadraticCurveTo(nx,-66.6,nx+1.6,-67.4);g.stroke();}
    // משקפיים
    if(o.glasses){g.lineWidth=.95;const L=[];for(const sd of[-1,1])L.push([sd,V(sd*10.6,26)]);
      for(const[sd,e]of L){if(e.f<.12)continue;const w=Math.pow(e.f,.8);g.fillStyle=rgba('#cfe6ff',.08);g.beginPath();g.ellipse(e.X,-80.4,7*w,6.6,0,0,TAU);g.fill();
        g.strokeStyle='#2a2420';g.stroke();
        g.strokeStyle=rgba('#ffffff',.4);g.lineWidth=.8;g.beginPath();g.ellipse(e.X,-80.4,5.4*w,5,0,Math.PI*1.12,Math.PI*1.42);g.stroke();g.lineWidth=.95;
        const er=V(sd*26,0);if(er.d>-4){g.strokeStyle='#2a2420';g.beginPath();g.moveTo(e.X+sd*6.8*w*ch,-81.2);g.lineTo(er.X,-83.4);g.stroke();}}
      if(ch>.3){g.strokeStyle='#2a2420';g.beginPath();g.moveTo(L[0][1].X+6.8*ch,-80.8);g.quadraticCurveTo(V(0,27).X,-83,L[1][1].X-6.8*ch,-80.8);g.stroke();}}
    if(C.tear>0){const tx=V(-11,24).X;g.globalAlpha=C.a*C.tear;g.fillStyle='#a8dcff';g.strokeStyle='#5aa0d0';g.lineWidth=.8;g.beginPath();g.moveTo(tx,-75);g.quadraticCurveTo(tx+5.5,-65,tx,-61);
      g.quadraticCurveTo(tx-5.5,-65,tx,-75);g.fill();g.stroke();g.fillStyle='#fff';g.beginPath();g.ellipse(tx-1.4,-65,1.2,1.2,0,0,TAU);g.fill();g.globalAlpha=C.a;}
  }
  // פאות מסולסלות: הקרובה מלפנים, הרחוקה מאחור
  if(o.peyot!==false){for(const sd of[-1,1]){const e=V(sd*24.6,6),bx=e.X,dir=Math.sign(bx)||sd;let pv=null;
    if(e.d<-14&&!back)continue;
    for(let i=0;i<=40;i++){const u=i/40,th=u*TAU*2.6,r=(bl>0?1.8:1.4)*(1-u*.25),px=bx+dir*(Math.cos(th)*r+u*1.6),py=-90+u*(bl>0?21+bl*5:15)+Math.sin(th)*r*.5;
      if(pv){g.lineWidth=(bl>0?2.1:1.7)+LW*1.0;g.strokeStyle=shade(beard,-.6);g.beginPath();g.moveTo(pv[0],pv[1]);g.lineTo(px,py);g.stroke();
        g.lineWidth=bl>0?2.1:1.7;g.strokeStyle=Math.sin(th)>0?shade(beard,.16):shade(beard,-.1);g.stroke();}pv=[px,py];}}}
}
function drawHat(g,C){
  const hc=C.hatColor,ink='#000',ch=C.hc,sh=C.hs;
  if(C.hat==='hat'){
    const brim=()=>{g.beginPath();g.ellipse(0,-100.5,47,9.6,0,0,TAU);};
    g.lineWidth=LW*2;g.strokeStyle=ink;brim();g.stroke();
    const bg=g.createLinearGradient(-47,0,47,0);bg.addColorStop(0,shade(hc,.18));bg.addColorStop(1,shade(hc,-.4));g.fillStyle=bg;brim();g.fill();
    const crown=()=>{g.beginPath();g.moveTo(-27,-101.5);g.bezierCurveTo(-26.5,-114,-26,-128,-20,-134.5);g.quadraticCurveTo(-11,-138.5,0,-133.6);
      g.quadraticCurveTo(11,-138.5,20,-134.5);g.bezierCurveTo(26,-128,26.5,-114,27,-101.5);g.closePath();};
    const cg=g.createLinearGradient(-26,0,26,0);cg.addColorStop(0,shade(hc,.24));cg.addColorStop(.4,hc);cg.addColorStop(1,shade(hc,-.35));
    crown();g.fillStyle=cg;g.fill();
    g.save();crown();g.clip();g.fillStyle='#050506';g.fillRect(-30,-110,60,9);g.fillStyle=rgba('#ffffff',.12);g.fillRect(-30,-108.4,60,1.2);
    g.fillStyle=rgba('#ffffff',.09);g.fillRect(-19,-140,6,30);
    // קמט מרכזי (קדימה-אחורה) וצביטות בצדדים — זזים עם סיבוב הראש
    const cx=sh*0,dx=ch;g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=1.2;g.beginPath();g.moveTo(cx,-133.6);g.quadraticCurveTo(cx-.6,-128,cx-.3,-123);g.stroke();
    for(const sd of[-1,1]){const px=(sd*15*dx);if(Math.abs(dx)<.2)continue;g.strokeStyle='rgba(0,0,0,.35)';g.beginPath();g.moveTo(px,-133);g.quadraticCurveTo(px-sd*2*dx,-125,px-sd*.5*dx,-118);g.stroke();}
    g.restore();
    crown();g.strokeStyle=ink;g.lineWidth=LW;g.stroke();
    const bowX=-23.5*ch+8*sh,bowD=23.5*sh+8*ch;if(bowD>-8){g.fillStyle='#050506';g.strokeStyle=ink;g.lineWidth=1;g.beginPath();g.ellipse(bowX,-105.6,3.4*Math.max(.35,Math.abs(ch)),2.4,-.4,0,TAU);g.fill();g.stroke();}
    g.beginPath();g.ellipse(0,-100.5,47,9.6,0,0,Math.PI);g.closePath();g.fillStyle=bg;g.fill();
    g.beginPath();g.ellipse(0,-100.5,47,9.6,0,0,Math.PI);g.strokeStyle=ink;g.lineWidth=LW;g.stroke();
    g.strokeStyle=rgba('#ffffff',.16);g.lineWidth=1;g.beginPath();g.ellipse(0,-101.2,44.5,7.8,0,Math.PI*.1,Math.PI*.9);g.stroke();
    if(C.rim){g.strokeStyle=C.rim;g.lineWidth=1.1;g.globalAlpha*=.75;crown();g.stroke();brim();g.stroke();g.globalAlpha=C.a;}
  }else if(C.hat==='kippa'){
    const kx=-sh*6;g.beginPath();g.ellipse(kx,-99,24.5,14,0,Math.PI,TAU);g.closePath();const kg=g.createLinearGradient(-24,-112,24,-99);kg.addColorStop(0,shade(hc,.28));kg.addColorStop(1,shade(hc,-.3));
    g.fillStyle=kg;g.fill();g.strokeStyle=ink;g.lineWidth=LW;g.stroke();
    g.strokeStyle=rgba('#ffffff',.15);g.lineWidth=1.2;g.beginPath();g.ellipse(kx,-99,19,10,0,Math.PI*1.2,Math.PI*1.55);g.stroke();
    if(C.rim){g.strokeStyle=C.rim;g.lineWidth=1.1;g.globalAlpha*=.75;g.beginPath();g.ellipse(kx,-99,24.5,14,0,Math.PI,TAU);g.stroke();g.globalAlpha=C.a;}
  }
}

function person(g,o){
  const a=o.a===undefined?1:o.a;if(a<=0)return;
  const s=o.s||1,flip=o.flip||1,up=clamp(o.up||0,0,1),bow=o.bow||0,sit=!!o.sit,legs=o.legs!==false;
  const live=o.t!==undefined||typeof T==='number';
  const t=o.t!==undefined?o.t:(typeof T==='number'?T:0),seed=o.seed!==undefined?o.seed:rnd((o.coat||'').length*3.7+(o.beardLen||0)*11+(o.skin||'').length);
  let blink=o.blink;if(blink===undefined){const per=3.1+seed*2.2,ph=((t+seed*7)%per+per)%per;blink=ph<.16?1-Math.abs(ph/.08-1):0;}
  const br=live?Math.sin(t*1.8+seed*6):0,pf=clamp(o.perform||0,0,1);
  const yaw=(o.yaw||0)*D,hyaw=yaw+((o.headYaw||0)+(o.turn||0)*32+(pf?pf*14*Math.sin(t*.37+seed*9):0))*D;
  const C={a,coat:o.coat||'#22315c',skin:o.skin||'#edc9a6',beard:o.beard||'#3b2a20',bl:o.beardLen===undefined?.55:o.beardLen,
    hat:o.hat||'hat',hatColor:o.hatColor||'#141418',pants:o.pants||'#17171d',rim:o.rim||null,sad:clamp(o.sad||0,0,1),smile:clamp(o.smile||0,0,1),
    tear:o.tear||0,up,blink:clamp(blink,0,1),br,px:Math.abs(s),t,seed,live,
    vc:Math.cos(yaw),vs:Math.sin(yaw),hc:Math.cos(hyaw),hs:Math.sin(hyaw)};
  C.kx=Math.sqrt(C.vc*C.vc+Math.pow(DC/WC*C.vs,2));C.ink=shade(C.coat,-.62);
  const bob=o.stride?-Math.abs(Math.sin(o.walk||0))*3.2*o.stride:0;
  g.save();g.translate(o.x,o.y+bob*s);g.scale(s*flip,s);g.globalAlpha=a;g.lineCap='round';g.lineJoin='round';
  if(legs&&!sit&&o.shadow!==false){const sg=g.createRadialGradient(0,0,2,0,0,52);sg.addColorStop(0,'rgba(0,0,0,.32)');sg.addColorStop(1,'rgba(0,0,0,0)');
    g.save();g.translate(0,165-bob);g.scale(1,.16);g.fillStyle=sg;g.beginPath();g.arc(0,0,52,0,TAU);g.fill();g.restore();}
  if(legs)drawLegs(g,C,o,sit);
  g.translate(0,70);g.rotate(bow*.42);g.translate(0,-70);
  g.translate(0,-br*.5);
  const pA=armPose(o,'A',C),pB=armPose(o,'B',C),GA=armView(pA,-1,C),GB=armView(pB,1,C);
  const behind=G=>G.depth<-21&&G.wz<DC;   // רק כשהגוף באמת מסובב (מעל ~35°) הזרוע הרחוקה עוברת אל מאחורי הגוף
  const head=G=>G.W[1]<-25&&Math.abs(G.W[0])<34&&G.wz>-5;   // יד מול הפנים — אחרי הראש
  if(behind(GA))drawArm(g,pA,GA,C,false);if(behind(GB))drawArm(g,pB,GB,C,false);
  drawCoat(g,C);
  const front=[[pA,GA],[pB,GB]].filter(([p,G])=>!behind(G)).sort((u,v)=>u[1].depth-v[1].depth);
  for(const[p,G]of front)if(!head(G))drawArm(g,p,G,C,true);
  g.save();
  const nod=(o.nod||0)+(pf?pf*.04*Math.sin(t*2.3+seed*5):0);
  g.translate(0,-48-br*.3);g.rotate(C.sad*.14+bow*.2+(o.tilt||0)+(live?.015*Math.sin(t*.9+seed*4):0));g.translate(0,48+nod*14);
  {const ng=g.createLinearGradient(-8,0,8,0);ng.addColorStop(0,shade(C.skin,-.08));ng.addColorStop(1,shade(C.skin,-.25));g.fillStyle=ng;g.fillRect(-7.5,-54,15,17);}
  drawHead(g,o,C);drawHat(g,C);
  if(o.onHead)o.onHead(g,{yaw:hyaw/D,cos:C.hc,sin:C.hs});
  g.restore();
  for(const[p,G]of front)if(head(G))drawArm(g,p,G,C,true);
  g.restore();g.globalAlpha=1;
}
window.PEOPLE={person,shade,GEST,PERF};
})();

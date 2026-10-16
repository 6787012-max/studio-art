// דמויות מדברות — הרחבה של ספריית הדמויות של השורטים.
// המקור: D:\video-projects\kolhalashon-avshalom-schneider\_shorts_tools\anim\lib\people.js (לא שונה).
// כאן נוספו שתי אפשרויות ל-PEOPLE.person:
//    mouth: {open, wide, round, teeth, tongue}  — צורת הפה ברגע נתון (ראו PEOPLE.mouthAt)
//    blink: 0..1                                 — עיניים עצומות
// ושני עזרים:
//    PEOPLE.VISEME        — תשע צורות ההגייה ש-Rhubarb מחזיר (A–H ו-X)
//    PEOPLE.mouthAt(cues, t)  — צורת הפה בשנייה t, עם מעבר רך בין צורה לצורה
(function(){
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;
  const f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return `rgb(${f(r)},${f(g)},${f(b)})`;}

const VISEME={
  X:{open:0,  wide:0, round:0, teeth:0, tongue:0},   // מנוחה
  A:{open:0,  wide:0, round:0, teeth:0, tongue:0},   // מ, ב, פ — שפתיים סגורות
  B:{open:.22,wide:.6,round:0, teeth:1, tongue:0},   // ק, ס, ט — שיניים קרובות
  C:{open:.55,wide:.3,round:0, teeth:.8,tongue:.5},  // אֶ
  D:{open:1,  wide:.2,round:0, teeth:.6,tongue:.9},  // אָ פתוח
  E:{open:.6, wide:0, round:.5,teeth:.3,tongue:.5},  // אוֹ
  F:{open:.35,wide:0, round:1, teeth:0, tongue:0},   // אוּ, ו
  G:{open:.2, wide:.3,round:0, teeth:1, tongue:0},   // פ רפה, ו
  H:{open:.5, wide:.2,round:0, teeth:.5,tongue:1},   // ל
};
function mouthAt(cues,t,blend){
  blend=blend||.07;let i=cues.findIndex(c=>t>=c.start&&t<c.end);
  if(i<0)return VISEME.X;
  const cur=VISEME[cues[i].value]||VISEME.X,prev=VISEME[(cues[i-1]||{}).value]||VISEME.X;
  const k=Math.min(1,(t-cues[i].start)/blend),e=k*k*(3-2*k),o={};
  for(const key in cur)o[key]=prev[key]+(cur[key]-prev[key])*e;
  return o;
}

function person(g,o){
  const x=o.x,y=o.y,s=o.s||1,a=o.a===undefined?1:o.a;if(a<=0)return;
  const up=o.up||0,bow=o.bow||0,sad=o.sad||0,tear=o.tear||0,smile=o.smile||0,sit=!!o.sit,legs=o.legs!==false;
  const coat=o.coat||'#22315c',skin=o.skin||'#edc9a6',beard=o.beard||'#3b2a20',bl=o.beardLen===undefined?.55:o.beardLen;
  const hat=o.hat||'hat',rim=o.rim||'rgba(175,205,255,.6)',dark='#101730',M=o.mouth,blink=o.blink||0;
  g.save();g.translate(x,y);g.scale(s*(o.flip||1),s);g.globalAlpha=a;g.lineCap='round';g.lineJoin='round';
  if(legs){g.fillStyle=dark;g.strokeStyle=rim;g.lineWidth=2;
    if(sit){g.beginPath();g.roundRect(-30,58,96,34,14);g.fill();g.stroke();g.beginPath();g.roundRect(40,66,28,90,10);g.fill();g.stroke();
      g.fillStyle='#070a14';g.beginPath();g.ellipse(60,160,30,11,0,0,6.28);g.fill();}
    else{g.beginPath();g.roundRect(-31,66,26,92,9);g.fill();g.stroke();g.beginPath();g.roundRect(5,66,26,92,9);g.fill();g.stroke();
      g.fillStyle='#070a14';g.beginPath();g.ellipse(-21,160,23,10,0,0,6.28);g.fill();g.beginPath();g.ellipse(21,160,23,10,0,0,6.28);g.fill();}}
  g.translate(0,70);g.rotate(bow*.42);g.translate(0,-70);
  const cg=g.createLinearGradient(-44,0,44,0);cg.addColorStop(0,shade(coat,.22));cg.addColorStop(.5,coat);cg.addColorStop(1,shade(coat,-.35));
  g.fillStyle=cg;g.beginPath();g.moveTo(-42,88);g.quadraticCurveTo(-50,-18,-24,-36);g.lineTo(24,-36);g.quadraticCurveTo(50,-18,42,88);g.closePath();g.fill();
  g.strokeStyle=rim;g.lineWidth=2.5;g.stroke();
  g.fillStyle='#f4f6fb';g.beginPath();g.moveTo(-12,-36);g.lineTo(12,-36);g.lineTo(0,2);g.closePath();g.fill();
  g.strokeStyle=shade(coat,-.5);g.lineWidth=3;g.beginPath();g.moveTo(-13,-36);g.lineTo(0,4);g.lineTo(13,-36);g.moveTo(0,4);g.lineTo(0,86);g.stroke();
  g.fillStyle=shade(coat,.45);for(const by of[24,48])g.beginPath(),g.arc(6,by,3,0,6.28),g.fill();
  for(const sd of[-1,1]){const sx=sd*36,sy=-20;
    const hx=sd*(46+18*up),hy=54-170*up, ex=sd*(52+10*up),ey=18-52*up;
    g.strokeStyle=shade(coat,sd<0?.12:-.25);g.lineWidth=21;g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(ex,ey,hx,hy);g.stroke();
    g.strokeStyle=rim;g.lineWidth=1.5;
    g.fillStyle=skin;g.beginPath();g.arc(hx,hy-(up>.5?8:-6),12,0,6.28);g.fill();}
  g.fillStyle=shade(skin,-.18);g.fillRect(-10,-48,20,14);
  g.translate(0,-48);g.rotate(sad*.14+bow*.2+(o.tilt||0));g.translate(0,48);
  const hg=g.createRadialGradient(-8,-84,4,0,-76,36);hg.addColorStop(0,shade(skin,.25));hg.addColorStop(1,shade(skin,-.12));
  if(bl>0){g.fillStyle=beard;g.beginPath();g.moveTo(-28,-78);g.quadraticCurveTo(-34,-46,-16,-34-bl*14);g.quadraticCurveTo(0,-22-bl*44,16,-34-bl*14);g.quadraticCurveTo(34,-46,28,-78);g.closePath();g.fill();}
  g.fillStyle=hg;g.beginPath();g.ellipse(0,-78,27,30,0,0,6.28);g.fill();
  g.fillStyle=shade(skin,-.1);g.beginPath();g.ellipse(-27,-78,5,8,0,0,6.28);g.fill();g.beginPath();g.ellipse(27,-78,5,8,0,0,6.28);g.fill();
  g.strokeStyle=beard;g.lineWidth=5;g.beginPath();g.moveTo(-27,-90);g.quadraticCurveTo(-33,-74,-27,-62);g.moveTo(27,-90);g.quadraticCurveTo(33,-74,27,-62);g.stroke();
  // זקן קדמי — יורד מעט כשהלסת נפתחת
  const jaw=M?M.open*2.2:0;
  if(bl>0){g.fillStyle=beard;g.beginPath();g.moveTo(-25,-70);g.quadraticCurveTo(-22,-58,-10,-62);g.quadraticCurveTo(0,-66,10,-62);g.quadraticCurveTo(22,-58,25,-70);
    g.quadraticCurveTo(30,-44,14,-36-bl*12+jaw);g.quadraticCurveTo(0,-26-bl*40+jaw*1.6,-14,-36-bl*12+jaw);g.quadraticCurveTo(-30,-44,-25,-70);g.closePath();g.fill();}
  // פה: קו רגיל, או צורת הגייה
  const my=-57;
  if(M&&M.open>.04){
    const w=7.2*(1-.45*M.round)+1.2*M.wide,h=1.2+5.6*M.open,cy=my+h*.45;
    g.fillStyle=shade(skin,-.22);g.beginPath();g.ellipse(0,cy,w+1.7,h+1.7,0,0,6.28);g.fill();            // שפתיים
    g.fillStyle='#3a1418';g.beginPath();g.ellipse(0,cy,w,h,0,0,6.28);g.fill();                            // חלל הפה
    g.save();g.beginPath();g.ellipse(0,cy,w,h,0,0,6.28);g.clip();
    if(M.tongue>0){g.fillStyle=`rgba(224,108,118,${M.tongue})`;g.beginPath();g.ellipse(0,cy+h*.8,w*.72,h*.62,0,0,6.28);g.fill();}
    if(M.teeth>0){g.fillStyle=`rgba(255,255,255,${.96*M.teeth})`;g.fillRect(-w,cy-h,2*w,h*.52);}
    g.restore();
  }else{
    g.strokeStyle=bl>0?shade(skin,-.35):'#8a4a3a';g.lineWidth=2.6;g.beginPath();
    const mc=(smile-sad)*5;g.moveTo(-7,my);g.quadraticCurveTo(0,my+mc,7,my);g.stroke();
  }
  g.strokeStyle=shade(skin,-.3);g.lineWidth=2.4;g.beginPath();g.moveTo(1,-80);g.quadraticCurveTo(5,-70,-1,-68);g.stroke();
  for(const sd of[-1,1]){const ex=sd*10.5,ey=-82;
    if(sad>.6||blink>.5){g.strokeStyle='#2a1c14';g.lineWidth=2.6;g.beginPath();g.moveTo(ex-5,ey);g.quadraticCurveTo(ex,ey+4,ex+5,ey);g.stroke();}
    else{g.fillStyle='#fff';g.beginPath();g.ellipse(ex,ey,5.2,4.2+up*.8,0,0,6.28);g.fill();
      g.fillStyle='#2a1c14';g.beginPath();g.arc(ex+sd*.6,ey-up*1.6,2.7,0,6.28);g.fill();}
    g.strokeStyle=beard;g.lineWidth=3;g.beginPath();g.moveTo(ex-sd*6,ey-9+sad*4*-1-up*2);g.lineTo(ex+sd*6,ey-9+sad*5-up*2);g.stroke();}
  if(tear>0){g.globalAlpha=a*tear;g.fillStyle='#9fd8ff';g.beginPath();g.moveTo(-11,-76);g.quadraticCurveTo(-6,-66,-11,-62);g.quadraticCurveTo(-16,-66,-11,-76);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(-12,-66,1.3,0,6.28);g.fill();g.globalAlpha=a;}
  if(hat==='hat'){g.fillStyle='#0c1124';g.strokeStyle=rim;g.lineWidth=2;
    g.beginPath();g.roundRect(-27,-140,54,42,[16,16,3,3]);g.fill();g.stroke();
    g.beginPath();g.ellipse(0,-100,45,9,0,0,6.28);g.fill();g.stroke();
    g.strokeStyle='rgba(120,140,190,.7)';g.lineWidth=4;g.beginPath();g.moveTo(-26,-108);g.lineTo(26,-108);g.stroke();}
  else if(hat==='kippa'){g.fillStyle='#0c1124';g.strokeStyle=rim;g.lineWidth=2;g.beginPath();g.ellipse(0,-98,25,15,0,3.1416,6.2832);g.closePath();g.fill();g.stroke();}
  g.restore();g.globalAlpha=1;
}
window.PEOPLE={person,shade,VISEME,mouthAt};
})();

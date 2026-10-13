/* fx-lib.js — 純 Canvas 2D 戰鬥特效庫（不依賴遊戲，可由 fx-preview.html 單獨預覽）
 *
 * 用法：const fx = FXLib.create(canvasEl);
 *       fx.play('thunder', { A:()=>[x,y], B:()=>[x,y], hit:810 });
 *   A = 出手者螢幕座標、B = 目標螢幕座標（每幀重新取值，可跟隨 3D 投影）
 *   hit = 從現在起幾毫秒後命中；i/last = 這是第幾位出手/是否最後一位（法相用）
 *
 * 角色 → 特效鍵：
 *   sword 蜀山弟子（飛劍三斬）   heal 妙手醫仙（青蓮靈珠）   dog 靈犬哮天（利齒＋爪擊）
 *   talisman 葉空（飛符＋敕令法陣） thunder 凌雪（九天落雷）   dragonfire 趙烈（烈火飛龍）
 *   swordqi 散修劍客（月牙劍氣＋十字斬） fa 護法法相（萬劍天降）
 *   v0/v1/v2 神識鎖定三部位       e_claw/e_slash/e_fire/e_poison/e_dark 妖魔反擊
 */
const FXLib=(()=>{
const TAU=Math.PI*2,rnd=(a,b)=>b===undefined?Math.random()*a:a+Math.random()*(b-a);
const C=(c,a=1)=>`rgba(${c[0]},${c[1]},${c[2]},${Math.max(0,Math.min(1,a))})`;
const lerp=(a,b,t)=>a+(b-a)*t,ease=q=>q*q*(3-2*q);
const COL={cyan:[110,220,255],white:[255,255,255],jade:[90,240,160],gold:[255,214,90],red:[255,70,60],blue:[120,160,255],
 orange:[255,140,40],yellow:[255,230,120],violet:[185,120,255],green:[130,230,60],pink:[255,190,210],dust:[150,125,95]};

function create(cv){
 const g=cv.getContext('2d');let W=0,H=0,tasks=[],P=[],flash=null,run=false,last=0;
 const u=()=>H/600,now=()=>performance.now();
 function fit(){const d=window.devicePixelRatio||1,w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;
  const pw=Math.round(w*d),ph=Math.round(h*d);if(cv.width!==pw||cv.height!==ph){cv.width=pw;cv.height=ph}
  W=w;H=h;g.setTransform(cv.width/w,0,0,cv.height/h,0,0)}
 const start=()=>{if(!run){run=true;last=now();requestAnimationFrame(frame)}};
 const at=(delay,dur,fn)=>{tasks.push({t0:now()+Math.max(0,delay),dur:Math.max(1,dur),fn});start()};
 const fire=(delay,fn)=>setTimeout(()=>{try{fn()}catch(e){console.warn(e)}},Math.max(0,delay));
 const flashAt=(c,a,dur)=>{flash={c,a,t0:now(),dur};start()};

 /* ---------- 粒子 ---------- */
 function emit(x,y,n,o={}){for(let i=0;i<n;i++){if(P.length>700)P.shift();
  const a=rnd(o.a0??0,o.a1??TAU),s=rnd(...(o.sp||[1,3]))*u(),j=(o.j||0)*u();
  P.push({x:x+rnd(-j,j),y:y+rnd(-j,j),vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:(o.g||0)*u(),t0:now(),life:rnd(...(o.life||[300,600])),
   sz:rnd(...(o.sz||[2,4]))*u(),c:o.c||COL.white,sh:o.sh||'dot',add:o.add!==false,dr:o.dr??.97,rot:rnd(TAU),vr:rnd(-.25,.25)})}start()}
 function stepParticles(k,t){P=P.filter(p=>t-p.t0<p.life);
  for(const p of P){const q=(t-p.t0)/p.life;p.x+=p.vx*k;p.y+=p.vy*k;p.vy+=p.g*k;const d=Math.pow(p.dr,k);p.vx*=d;p.vy*=d;p.rot+=p.vr*k;
   g.save();g.globalCompositeOperation=p.add?'lighter':'source-over';const a=1-q*q;g.fillStyle=g.strokeStyle=C(p.c,a);
   if(p.sh=='line'){g.lineWidth=Math.max(1,p.sz*.6);g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*3.2,p.y-p.vy*3.2);g.stroke()}
   else if(p.sh=='petal'){g.translate(p.x,p.y);g.rotate(p.rot);g.beginPath();g.ellipse(0,0,p.sz*1.5,p.sz*.7,0,0,TAU);g.fill()}
   else{g.beginPath();g.arc(p.x,p.y,p.sz*(1-q*.5),0,TAU);g.fill()}g.restore()}}

 /* ---------- 繪圖原件（皆在 'lighter' 疊色下使用） ---------- */
 const glow=(x,y,r,c,a=1)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,C(c,a));gr.addColorStop(1,C(c,0));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill()};
 const ring=(x,y,r,w,c,a,sy=1)=>{g.save();g.translate(x,y);g.scale(1,sy);g.beginPath();g.arc(0,0,Math.max(.1,r),0,TAU);g.lineWidth=Math.max(.5,w);g.strokeStyle=C(c,a);g.stroke();g.restore()};
 const ringAt=(get,delay,r1,c,dur=450,sy=1,w=5)=>at(delay,dur,q=>{const[x,y]=get();ring(x,y,lerp(8,r1,ease(q))*u(),w*u()*(1-q),c,1-q,sy)});
 function slash(x,y,ang,len,w,q,c,bend=.32){ /* 月牙形劍痕：頭部先掃過，尾部消散 */
  const h=Math.min(1,q*2.2),tail=Math.max(0,(q-.3)*1.45),a=1-Math.max(0,(q-.45)*1.9);if(h<=tail)return;
  g.save();g.translate(x,y);g.rotate(ang);const N=18,pts=[];
  for(let i=0;i<=N;i++){const s=tail+(h-tail)*i/N;pts.push([(s-.5)*len,-Math.sin(s*Math.PI)*len*bend,Math.sin(i/N*Math.PI)*w])}
  g.beginPath();pts.forEach(([px,py,th],i)=>i?g.lineTo(px,py-th):g.moveTo(px,py-th));for(let i=N;i>=0;i--){const[px,py,th]=pts[i];g.lineTo(px,py+th)}
  g.closePath();g.shadowColor=C(c,1);g.shadowBlur=16*u();g.fillStyle=C(c,a*.55);g.fill();g.fillStyle=C(COL.white,a*.85);g.scale(1,.45);g.fill();g.restore()}
 function bolt(x1,y1,x2,y2,w,c,a,disp=.17,br=2){ /* 中點位移閃電，每幀重算形成閃爍 */
  const pts=[[x1,y1],[x2,y2]];let amp=Math.hypot(x2-x1,y2-y1)*disp;
  for(let k=0;k<5;k++){for(let i=pts.length-2;i>=0;i--){const[ax,ay]=pts[i],[bx,by]=pts[i+1],nx=-(by-ay),ny=bx-ax,l=Math.hypot(nx,ny)||1,o=rnd(-1,1)*amp;pts.splice(i+1,0,[(ax+bx)/2+nx/l*o,(ay+by)/2+ny/l*o])}amp*=.55}
  const path=()=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y))};
  g.lineJoin=g.lineCap='round';path();g.strokeStyle=C(c,a*.4);g.lineWidth=w*4;g.stroke();path();g.strokeStyle=C(COL.white,a);g.lineWidth=w;g.stroke();
  for(let b=0;b<br;b++){const s=pts[(rnd(4,pts.length-4))|0],L=Math.hypot(x2-x1,y2-y1)*.22;bolt(s[0],s[1],s[0]+rnd(-1,1)*L,s[1]+rnd(.2,1)*L,w*.55,c,a*.8,.25,0)}}
 function crescent(x,y,dir,r,w,c,a){const cx=x-Math.cos(dir)*r*.55,cy=y-Math.sin(dir)*r*.55;g.save();g.lineCap='round';
  g.beginPath();g.arc(cx,cy,r,dir-.95,dir+.95);g.strokeStyle=C(c,a*.55);g.lineWidth=w*2.6;g.shadowColor=C(c,1);g.shadowBlur=18*u();g.stroke();
  g.beginPath();g.arc(cx,cy,r,dir-.95,dir+.95);g.strokeStyle=C(COL.white,a);g.lineWidth=w*.8;g.stroke();g.restore()}
 const pathPos=(o,q,arc=0)=>{const[ax,ay]=o.A(),[bx,by]=o.B(),e=ease(q);return[lerp(ax,bx,e),lerp(ay,by,e)-Math.sin(q*Math.PI)*arc*u()]};
 const sparks=(get,n,c,o={})=>{const[x,y]=get();emit(x,y,n,{sp:[3,10],sh:'line',life:[200,450],g:.18,c,...o})};

 /* ================= 我方角色特效 ================= */
 const FXS={
 /* 蜀山弟子：近身飛劍三斬（青白劍痕 + 劍氣星火） */
 sword(o){[[-.95,-80,175,COL.cyan],[.85,10,175,COL.white],[0,95,215,COL.cyan]].forEach(([ang,off,len,c])=>{
   at(o.hit+off,300,q=>{const[x,y]=o.B();slash(x,y,ang,len*u(),9*u(),q,c)});
   fire(o.hit+off+50,()=>sparks(o.B,9,c))});
  fire(o.hit,()=>flashAt(COL.cyan,.2,160));ringAt(o.B,o.hit+90,95,COL.cyan,420,.6)},

 /* 妙手醫仙：聚氣青蓮靈珠 → 拋物線飛行 → 蓮瓣綻放 */
 heal(o){const t0=Math.max(40,o.hit-360);
  at(0,t0,q=>{const[x,y]=o.A();glow(x,y-20*u(),(24+26*q)*u(),COL.jade,.35+.4*q);ring(x,y-10*u(),(46-34*q)*u(),2.5*u(),COL.gold,q);
   if(Math.random()<.6)emit(x,y,1,{a0:-2.3,a1:-.85,sp:[1,2.6],c:COL.jade,life:[400,750],sz:[2,4],j:26})});
  at(t0,360,q=>{const[x,y]=pathPos(o,q,70);glow(x,y,30*u(),COL.jade,.85);glow(x,y,13*u(),COL.white,1);emit(x,y,2,{sp:[.2,1.2],c:COL.gold,life:[250,450]})});
  fire(o.hit,()=>{const[x,y]=o.B();emit(x,y,24,{sp:[2,6.5],c:COL.pink,sh:'petal',sz:[4,8],life:[700,1100],g:.07,add:false});emit(x,y,14,{sp:[1,5],c:COL.jade,life:[300,650]});flashAt(COL.jade,.2,220)});
  ringAt(o.B,o.hit,115,COL.jade,560,.55);ringAt(o.B,o.hit+120,75,COL.gold,460,.55)},

 /* 靈犬哮天：上下利齒合咬 → 三道赤紅爪痕 → 塵土血星 */
 dog(o){at(o.hit-180,200,q=>{const[x,y]=o.B(),s=u(),off=(1-ease(q))*78*s;g.fillStyle=C(COL.white,.95);g.shadowColor=C(COL.red,1);g.shadowBlur=14*s;
   for(const sg of[-1,1]){const by=y+sg*(off+14*s);g.beginPath();for(let k=-2;k<=2;k++){const fx=x+k*14*s;g.moveTo(fx-7*s,by);g.lineTo(fx+7*s,by);g.lineTo(fx,by-sg*24*s)}g.fill()}});
  for(let j=-1;j<=1;j++)at(o.hit+20+(j+1)*28,300,q=>{const[x,y]=o.B();slash(x+j*30*u(),y,.95,165*u(),6.5*u(),q,COL.red,.07)});
  fire(o.hit,()=>{sparks(o.B,12,COL.red);const[x,y]=o.B();emit(x,y+20*u(),12,{sp:[1,4],c:COL.dust,life:[350,700],sz:[3,7],g:.05,add:false});flashAt(COL.red,.16,140)})},

 /* 葉空：旋轉飛符（黃紙朱砂）→ 命中浮現「敕」字旋轉法陣 */
 talisman(o){const t0=Math.max(40,o.hit-300);
  at(0,t0,q=>{const[x,y]=o.A();glow(x,y-14*u(),(18+16*q)*u(),COL.gold,.6*q+.15);ring(x,y-14*u(),(36-22*q)*u(),2*u(),COL.red,q)});
  at(t0,300,q=>{const[x,y]=pathPos(o,q,45),s=u();emit(x,y,2,{sp:[.2,1],c:COL.red,life:[250,450]});glow(x,y,26*s,COL.red,.45);
   g.save();g.globalCompositeOperation='source-over';g.translate(x,y);g.rotate(q*14);g.fillStyle='#f3d67a';g.strokeStyle='#d33a2c';g.lineWidth=1.6*s;g.shadowColor='rgba(255,90,40,.9)';g.shadowBlur=12*s;
   g.fillRect(-8*s,-17*s,16*s,34*s);g.shadowBlur=0;g.strokeRect(-8*s,-17*s,16*s,34*s);g.beginPath();g.moveTo(-4*s,-10*s);g.lineTo(4*s,-6*s);g.lineTo(-4*s,0);g.lineTo(4*s,5*s);g.lineTo(-3*s,11*s);g.stroke();g.restore()});
  at(o.hit,620,q=>{const[x,y]=o.B(),s=u(),r=lerp(20,92,ease(Math.min(1,q*2)))*s,a=1-q;g.save();g.translate(x,y);g.scale(1,.6);g.rotate(q*3);
   g.strokeStyle=C(COL.red,a);g.lineWidth=3*s;g.shadowColor=C(COL.red,1);g.shadowBlur=14*s;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.beginPath();g.arc(0,0,r*.72,0,TAU);g.stroke();
   for(let k=0;k<8;k++){const t=k/8*TAU;g.beginPath();g.moveTo(Math.cos(t)*r*.72,Math.sin(t)*r*.72);g.lineTo(Math.cos(t)*r*1.12,Math.sin(t)*r*1.12);g.stroke()}
   g.restore();g.save();g.fillStyle=C(COL.gold,a);g.font=`bold ${Math.round(46*s)}px "Noto Serif TC","Noto Sans TC",serif`;g.textAlign='center';g.textBaseline='middle';g.shadowColor=C(COL.red,1);g.shadowBlur=12*s;g.fillText('敕',x,y);g.restore()});
  fire(o.hit,()=>{sparks(o.B,14,COL.gold,{sp:[2,8]});flashAt(COL.red,.14,160)})},

 /* 凌雪：掌心聚電 → 細雷牽引 → 九天巨雷落下 + 地面電弧 */
 thunder(o){at(0,Math.max(60,o.hit-120),q=>{const[x,y]=o.A();glow(x,y-14*u(),(20+30*q)*u(),COL.blue,.35+.5*q);if(Math.random()<.7)emit(x,y-14*u(),1,{sp:[1,3],sh:'line',c:COL.cyan,life:[150,300],j:22})});
  at(o.hit-360,240,q=>{const[ax,ay]=o.A(),[bx,by]=o.B();bolt(ax,ay-14*u(),bx,by,1.6*u(),COL.cyan,1-q*.5,.2,1)});
  fire(o.hit-120,()=>flashAt(COL.blue,.42,260));
  at(o.hit-120,340,q=>{const[x,y]=o.B(),s=u();bolt(x+rnd(-14,14)*s,-20,x,y,(5+4*(1-q))*s,COL.cyan,1-q*.6,.14,3);glow(x,y,(70+40*(1-q))*s,COL.blue,.5*(1-q))});
  at(o.hit,320,q=>{const[x,y]=o.B(),s=u();for(let k=0;k<3;k++){const t=rnd(TAU),L=rnd(50,100)*s;bolt(x,y,x+Math.cos(t)*L,y+Math.sin(t)*L*.5,1.8*s,COL.cyan,1-q,.3,0)}});
  ringAt(o.B,o.hit,130,COL.cyan,520,.5);fire(o.hit,()=>sparks(o.B,18,COL.cyan,{sp:[4,12]}))},

 /* 趙烈：四條火龍蜿蜒飛馳 → 爆裂火球 + 熱浪 + 飛灰 */
 dragonfire(o){for(let j=0;j<4;j++)at(o.hit-420+j*90,300,q=>{const[x,y]=pathPos(o,q,28*(j%2?1:-1)),s=u(),w=Math.sin(q*TAU*1.5+j)*18*s*(1-q*.3),sz=(24+q*12)*s;
   emit(x,y+w,3,{a0:0,a1:TAU,sp:[.3,1.6],c:j%2?COL.orange:COL.yellow,life:[250,520],sz:[3,8],g:-.05});glow(x,y+w,sz,COL.orange,.85);glow(x,y+w,sz*.45,COL.yellow,1)});
  at(Math.max(0,o.hit-440),Math.max(60,440),q=>{const[x,y]=o.A();glow(x,y-14*u(),(18+16*(1-q))*u(),COL.orange,.5*(1-q))});
  at(o.hit,520,q=>{const[x,y]=o.B(),s=u();glow(x,y,lerp(40,170,ease(q))*s,COL.orange,.75*(1-q));glow(x,y,lerp(20,80,q)*s,COL.yellow,.9*(1-q))});
  ringAt(o.B,o.hit,160,COL.orange,560,.5,7);ringAt(o.B,o.hit+90,110,COL.yellow,460,.5);
  fire(o.hit,()=>{const[x,y]=o.B();emit(x,y,40,{a0:-2.9,a1:-.25,sp:[2,9],c:COL.orange,life:[500,1000],sz:[2,6],g:.08});flashAt(COL.orange,.3,260)})},

 /* 散修劍客：月牙劍氣破空（殘影）→ 十字交斬 */
 swordqi(o){const t0=Math.max(40,o.hit-300);
  at(0,t0,q=>{const[x,y]=o.A();glow(x,y-10*u(),(14+12*q)*u(),COL.violet,.6)});
  at(t0,300,q=>{const[ax,ay]=o.A(),[bx,by]=o.B(),dir=Math.atan2(by-ay,bx-ax);
   for(let k=3;k>=0;k--){const qq=Math.max(0,q-k*.07),[x,y]=pathPos(o,qq,0);crescent(x,y,dir,(46+qq*30)*u(),(5-k*.8)*u(),k?COL.violet:COL.cyan,(1-k*.25))}});
  [[.78,0],[-.78,70]].forEach(([ang,off])=>at(o.hit+off,300,q=>{const[x,y]=o.B();slash(x,y,ang,190*u(),9*u(),q,COL.white,.02)}));
  fire(o.hit,()=>{sparks(o.B,16,COL.violet,{sp:[3,11]});flashAt(COL.violet,.2,180)});ringAt(o.B,o.hit+60,100,COL.violet,460,.5)},

 /* 護法法相：金色飛劍自天而降 → 末位出手時光柱沖天 */
 fa(o){const n=9;for(let j=0;j<n;j++)at(o.hit-240+j*22,260,q=>{const[x,y]=o.B(),s=u(),bx=x+(j-(n-1)/2)*(o.last?15:11)*s,hy=lerp(-40,y,ease(q));
   g.strokeStyle=C(COL.gold,1);g.lineWidth=3*s;g.lineCap='round';g.shadowColor=C(COL.gold,1);g.shadowBlur=14*s;g.beginPath();g.moveTo(bx,hy-110*s);g.lineTo(bx,hy);g.stroke();
   g.strokeStyle=C(COL.white,1);g.lineWidth=1.2*s;g.stroke()});
  fire(o.hit,()=>{sparks(o.B,o.last?30:14,COL.gold,{sp:[3,12]});flashAt(COL.gold,o.last?.38:.18,o.last?320:160)});ringAt(o.B,o.hit,o.last?190:110,COL.gold,520,.5,o.last?8:5);
  if(o.last)at(o.hit,700,q=>{const[x,y]=o.B(),s=u(),w=(70*(1-q)+8)*s,gr=g.createLinearGradient(0,0,0,y);gr.addColorStop(0,C(COL.gold,0));gr.addColorStop(1,C(COL.gold,.85*(1-q)));g.fillStyle=gr;g.fillRect(x-w/2,0,w,y);glow(x,y,150*s*(1-q*.4),COL.gold,.6*(1-q))})},

 /* 神識鎖定：命門死穴＝準星收束＋貫穿；軀幹丹田＝震盪波；四肢脈絡＝四向切痕 */
 v0(o){at(0,380,q=>{const[x,y]=o.B(),s=u(),r=lerp(80,14,ease(q))*s;ring(x,y,r,2.5*s,COL.red,1);g.strokeStyle=C(COL.red,1);g.lineWidth=2*s;
   g.beginPath();g.moveTo(x-r*1.5,y);g.lineTo(x+r*1.5,y);g.moveTo(x,y-r*1.5);g.lineTo(x,y+r*1.5);g.stroke()});
  at(360,300,q=>{const[x,y]=o.B(),s=u(),h=Math.min(1,q*3);g.strokeStyle=C(COL.white,1-q);g.lineWidth=5*s*(1-q);g.shadowColor=C(COL.red,1);g.shadowBlur=18*s;g.beginPath();g.moveTo(x-260*s,y+60*s);g.lineTo(lerp(x-260*s,x+260*s,h),lerp(y+60*s,y-60*s,h));g.stroke()});
  fire(380,()=>{sparks(o.B,22,COL.red,{sp:[4,13]});flashAt(COL.red,.3,220)});ringAt(o.B,380,120,COL.red,480,.5)},
 v1(o){[0,110,220].forEach((d,k)=>ringAt(o.B,d,100+k*45,COL.gold,520,.55,7-k*1.5));
  fire(0,()=>{const[x,y]=o.B();emit(x,y+24*u(),16,{sp:[1,5],c:COL.dust,life:[400,800],sz:[3,8],g:.05,add:false});flashAt(COL.gold,.22,200)})},
 v2(o){[[-30,-40,.9],[34,-34,-.8],[-34,36,-.7],[30,40,.85]].forEach(([dx,dy,ang],k)=>{at(k*70,280,q=>{const[x,y]=o.B(),s=u();slash(x+dx*s,y+dy*s,ang,120*s,6*s,q,COL.jade,.18)});
   fire(k*70+90,()=>{const[x,y]=o.B();emit(x+dx*u(),y+dy*u(),6,{sp:[2,7],sh:'line',c:COL.jade,life:[200,400]})})})},

 /* 歸鄉符：青金光環自腳下層層上升，光柱收束（A=B=隊伍位置） */
 warp(o){for(let k=0;k<4;k++)at(k*130,520,q=>{const[x,y]=o.B(),s=u(),r=(78-k*10)*s*(1-q*.35);ring(x,y-q*150*s,r,3*s*(1-q),k%2?COL.gold:COL.cyan,1-q*.7,.4)});
  at(0,780,q=>{const[x,y]=o.B(),s=u(),w=(54*Math.sin(Math.PI*Math.min(1,q))+6)*s,gr=g.createLinearGradient(0,y-260*s,0,y);gr.addColorStop(0,C(COL.cyan,0));gr.addColorStop(1,C(COL.white,.55));g.fillStyle=gr;g.fillRect(x-w/2,y-260*s,w,260*s);if(Math.random()<.8)emit(x,y,1,{a0:-2.1,a1:-1.05,sp:[2,5],c:Math.random()<.5?COL.gold:COL.cyan,life:[400,800],sz:[2,5],j:40})});
  fire(560,()=>flashAt(COL.white,.55,420))},

 /* 妖魔反擊：爪擊／刀斬／火焰／毒液／暗影（B=受擊同門） */
 e_claw(o){for(let j=-1;j<=1;j++)at(o.hit+(j+1)*40,300,q=>{const[x,y]=o.B();slash(x+j*24*u(),y,2.2,150*u(),6*u(),q,COL.red,.06)});fire(o.hit,()=>sparks(o.B,10,COL.red))},
 e_slash(o){at(o.hit,320,q=>{const[x,y]=o.B();slash(x,y,-.6,230*u(),11*u(),q,COL.white,.25)});fire(o.hit,()=>{sparks(o.B,14,COL.orange);flashAt(COL.red,.12,140)})},
 e_fire(o){at(o.hit-260,260,q=>{const[x,y]=pathPos(o,q,-30);glow(x,y,30*u(),COL.orange,.9);emit(x,y,3,{sp:[.3,1.5],c:COL.yellow,life:[250,450],g:-.03})});
  at(o.hit,420,q=>{const[x,y]=o.B();glow(x,y,lerp(30,110,q)*u(),COL.orange,.8*(1-q))});ringAt(o.B,o.hit,100,COL.orange,420,.55)},
 e_poison(o){at(o.hit-300,300,q=>{const[x,y]=pathPos(o,q,60);glow(x,y,20*u(),COL.green,.9);emit(x,y,2,{sp:[.2,1],c:COL.green,life:[300,500],g:.06})});
  fire(o.hit,()=>{const[x,y]=o.B();emit(x,y,22,{sp:[1,5],c:COL.green,life:[500,900],sz:[3,7],g:.1});flashAt(COL.green,.14,200)});ringAt(o.B,o.hit,85,COL.green,500,.5)},
 e_dark(o){at(o.hit-300,300,q=>{const[x,y]=pathPos(o,q,-25);glow(x,y,34*u(),COL.violet,.85);ring(x,y,(22-10*q)*u(),3*u(),COL.white,.7)});
  fire(o.hit,()=>{sparks(o.B,18,COL.violet,{sp:[2,9]});flashAt(COL.violet,.22,240)});ringAt(o.B,o.hit,120,COL.violet,520,.55,7)}
 };

 /* ---------- 主迴圈 ---------- */
 function frame(t){fit();g.clearRect(0,0,W,H);const k=Math.min(3,(t-last)/16.7||1);last=t;
  for(const T of tasks){const q=(t-T.t0)/T.dur;if(q<0)continue;g.save();g.globalCompositeOperation='lighter';try{T.fn(Math.min(1,q))}catch(e){if(!T.err){T.err=1;console.warn('fx task error',e)}}g.restore()}
  tasks=tasks.filter(T=>t<T.t0+T.dur);stepParticles(k,t);
  if(flash){const q=(t-flash.t0)/flash.dur;if(q>=1)flash=null;else{g.save();g.globalCompositeOperation='lighter';g.fillStyle=C(flash.c,flash.a*(1-q));g.fillRect(0,0,W,H);g.restore()}}
  if(tasks.length||P.length||flash)requestAnimationFrame(frame);else{run=false;g.clearRect(0,0,W,H)}}

 return{play(key,o){const f=FXS[key];if(!f)return false;fit();f(o);return true},keys:Object.keys(FXS),clear(){tasks=[];P=[];flash=null}};
}
return{create,COL};
})();

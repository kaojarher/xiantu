/* ===== 修仙 mod：隨機任務／機關萬劍法相／首領護甲 ===== */
var MS=AREAS.length,MX;
const mxNew=()=>({offers:[],area:null,fin:0,kills:0,on:0,en:0,cnt:0,nm:'',hl:0,dr:0});MX=mxNew();
const PLANETS=[
 {n:'瘴氣荒野',i:'🌳',th:'waste',ty:'field',mon:['🐀','®','狼'],boss:'®'},
 {n:'廢棄古道',i:'🚇',th:'sewer',ty:'dungeon',mon:['🐊','🪳','🧟'],boss:'🐊'},
 {n:'毒雨沼澤',i:'🌧️',th:'swamp',ty:'field',mon:['🐊','🧟','飛'],boss:'蜥'},
 {n:'赤炎荒漠',i:'🏜️',th:'desert',ty:'field',mon:['®','鷹','💀'],boss:'龍'},
 {n:'魔尊堡壘',i:'👹',th:'mutant',ty:'dungeon',mon:['👹','🥷','蝠'],boss:'💪'},
 {n:'鎮妖地宮',i:'⛩️',th:'vault',ty:'dungeon',mon:['🧟','🪳','🐀'],boss:'傀'}];
const MTYPES=[{id:'hunt',n:'斬殺魔頭'},{id:'core',n:'奪取聚靈核心'},{id:'sweep',n:'清掃妖獸'}];
const AFFIX=[{id:'calm',n:'平靜'},{id:'hot',n:'魔氣沖天（敵攻+25%）'},{id:'armor',n:'魔軀強化（敵血+30%）'},{id:'rich',n:'靈石寶箱（額外靈石）'}];
QI.core='🔋 聚靈核心';FEAT.mission='📡';
const pick=a=>a[R(a.length)];
function mxRoll(){const b=Math.min(4,(lv-1)>>1);MX.offers=[0,1,2].map(()=>({p:pick(PLANETS),t:pick(MTYPES),a:pick(AFFIX),L:Math.min(4,b+R(2))}))}
function mxStart(o){MX.area=AREAS[MS]=mkLoc({n:`${o.p.n}·${o.t.n}`,i:o.p.i,ty:o.p.ty,th:o.p.th,lv:o.L,par:0,w:40,h:30,mon:o.p.mon,boss:o.p.boss,qi:o.t.id=='core'?'core':undefined,mx:{t:o.t.id,af:o.a.id}});
 done[MS]=0;delete has.core;Object.assign(MX,{kills:0,fin:0,on:0,en:0});closeUI();enter(MS);say(`🚀 御劍出發：${MX.area.n}｜異象：${o.a.n}`)}
SV.mission=e=>{if(!MX.offers.length)mxRoll();
 const o=MX.offers.map(f=>({t:`${f.p.i} ${f.p.n}｜${f.t.n}｜${f.a.n}｜建議 練氣${f.L*2+1}層`,f:()=>mxStart(f)}));
 if(MX.area&&!MX.fin)o.unshift({t:`↩ 重返歷練場：${MX.area.n}`,f:()=>{closeUI();enter(MS)}});
 o.push({t:'📋 查看副本達成度（副本總管）',f:()=>SV.raid(e)});o.push({t:'🔄 換一批懸賞',f:()=>{mxRoll();SV.mission(e)}});
 ui('🧑‍✈️','傳功長老 艾琳',`「師弟，今日要去何處歷練？」每次出發皆為隨機洞天秘境與異象。\n已完成懸賞：${MX.cnt}`,o)};
const goalTxt=()=>{const a=AREAS[MS].mx;return a.t=='hunt'?'斬殺魔頭':a.t=='core'?'取得聚靈核心 📦':`掃蕩妖獸 ${MX.kills}/6`};
function mxDone(){MX.fin=1;MX.cnt++;MX.offers=[];const L=AREAS[MS].lv,g=40+L*30;gold+=g;pot++;const up=gainXp(30+L*20);giveItem(genItem(L+1));
 say(`🏆 懸賞完成！🪙靈石+${g} 💊回春丹+1${up}`);ui('🧑‍✈️','歷練完成',`🪙靈石+${g}｜💊回春丹 +1｜獲得法寶裝備${up}\n累計完成：${MX.cnt}`,[{t:'🔙 返回宗門',f:()=>{closeUI();enter(0)}}])}
const _render=render;render=function(){_render();bossArrow();if(ai==MS&&MX.area){$('#hud').textContent+=` ｜目標：${goalTxt()}`;
 const a=AREAS[MS].mx;if(!MX.fin&&!cur&&!busy&&(a.t=='hunt'?done[MS]:a.t=='core'?has.core:MX.kills>=6))mxDone()}};

const _fight=fight;fight=function(e,k){_fight(e,k);const a=AREAS[ai].mx;if(!cur||!a)return;
 if(a.af=='hot')cur.atk=Math.round(cur.atk*1.25);if(a.af=='armor')cur.hp=cur.mx=Math.round(cur.mx*1.3);
 if(cur.b)cur.sh=1;MX.en=40+(mats.core>0?(mats.core--,30):0);MX.on=0;fUI()};
const _win=win;win=function(){if(cur){const sc=(cur.b?6:1+R(3))*(hasP('lck')?2:1);mats.scrap+=sc;say(`🔩 靈石碎片 +${sc}`)}const a=AREAS[ai].mx;if(a&&cur){if(!cur.b)MX.kills++;if(a.af=='rich')gold+=8+DL()*8}MX.on=0;_win()};
const _wipe=wipe;wipe=function(){MX.on=0;_wipe()};
const _bd=bossDown;bossDown=function(){if(!AREAS[ai].mx)return _bd();done[ai]=1;giveItem(genItem(AREAS[ai].lv+1));say('👑 魔頭倒下！');return false};

const cropImg=key=>{const r=SP[key];if(!r||!SH[r[0]])return null;const c=document.createElement('canvas');c.width=r[3];c.height=r[4];c.getContext('2d').drawImage(SH[r[0]].canvas,r[1],r[2],r[3],r[4],0,0,r[3],r[4]);return c.toDataURL()};
function fuseCine(al,done){const V=view,H=V.clientHeight,Wd=V.clientWidth,ov=document.createElement('div');let fin=0;
 ov.style.cssText='position:absolute;inset:0;z-index:9;overflow:hidden;background:radial-gradient(circle at 50% 58%,#1c5a2c 0%,#060812 72%);cursor:pointer';
 const mk=(css,html)=>{const d=document.createElement('div');d.style.cssText='position:absolute;'+css;if(html)d.innerHTML=html;ov.appendChild(d);return d},
  A=(el,kf,o)=>el.animate(kf,Object.assign({fill:'forwards',easing:'ease-in-out'},o));
 const end=()=>{if(fin)return;fin=1;A(ov,[{opacity:1},{opacity:0}],{duration:300}).onfinish=()=>{ov.remove();done()}};
 ov.onclick=end;V.appendChild(ov);A(ov,[{opacity:0},{opacity:1}],{duration:250});
 
 const cx=Wd/2,cy=H*.52,n=al.length;
 al.forEach((p,i)=>{const x=Wd*(.14+.72*(n>1?i/(n-1):.5)),y=H*.74,sz=Math.min(H*.3,Wd*.2);
  const w=mk(`left:${x-sz/2}px;top:${y-sz/2}px;width:${sz}px;height:${sz}px`,`<div style="font-size:${sz*.78}px;line-height:${sz}px;text-align:center">${(()=>{const u=cropImg('f:'+nk(p.e));return u?`<img src="${u}" style="width:${sz}px;height:${sz}px;object-fit:contain;object-position:50% 100%;image-rendering:pixelated">`:p.e})()}</div>`);
  const ring=mk(`left:${x-sz/2}px;top:${y-sz/2}px;width:${sz}px;height:${sz}px;border-radius:50%;border:4px solid #9dffb0;box-shadow:0 0 22px #5dff86,inset 0 0 22px #5dff86;opacity:0`);
  const d=i*160;
  A(w.firstChild,[{filter:'brightness(1)'},{filter:'brightness(3) drop-shadow(0 0 12px #8f8)'}],{duration:500,delay:d});
  A(ring,[{opacity:0,transform:'scale(.2)'},{opacity:1,transform:'scale(1)'}],{duration:400,delay:350+d});
  A(w,[{opacity:1},{opacity:0}],{duration:300,delay:520+d});
  const dx=cx-x,dy=cy-y;
  A(ring,[{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx}px,${dy}px) scale(.25)`,opacity:.95}],{duration:700,delay:800+d,easing:'cubic-bezier(.6,0,.9,.4)'})});
 const t1=800+n*160+700;
 
 const fl=mk('inset:0;background:#fff;opacity:0;z-index:5');A(fl,[{opacity:0},{opacity:1},{opacity:0}],{duration:520,delay:t1-100,offset:[0,.35,1]});
 const ih=H*.92,img=document.createElement('div');{const u=cropImg('f:🤖');if(u)img.innerHTML=`<img src="${u}" style="height:80%;vertical-align:middle;image-rendering:pixelated">`;else img.textContent='🤖'}
 img.style.cssText=`position:absolute;left:0;right:0;top:${(H-ih)/2}px;height:${ih}px;line-height:${ih}px;text-align:center;font-size:${ih*.62}px;opacity:0;filter:drop-shadow(0 0 18px #5f9)`;ov.appendChild(img);
 const S=2.3,yf=H*.12-S*ih*.46,yh=-H*.02+S*ih*.46;
 A(img,[{opacity:0,transform:`translateY(${yf}px) scale(${S})`,offset:0},{opacity:1,transform:`translateY(${yf}px) scale(${S})`,offset:.08},
  {transform:`translateY(${yf}px) scale(${S})`,offset:.2},{transform:`translateY(${yh}px) scale(${S})`,offset:.68},{transform:'translateY(0) scale(1)',opacity:1,offset:1}],{duration:2600,delay:t1,easing:'linear'});
 const ln=mk(`left:0;right:0;height:26%;background:linear-gradient(transparent,rgba(120,255,160,.35),transparent);top:100%;z-index:3`);
 A(ln,[{top:'100%'},{top:'-30%'}],{duration:1500,delay:t1+520,easing:'ease-in'});
 const cap=mk('left:0;right:0;bottom:7%;text-align:center;z-index:6;opacity:0;font-weight:900;color:#fff;text-shadow:0 0 10px #4f8,0 0 24px #4f8,0 2px 0 #042');
 cap.innerHTML=`<div style="font-size:${Math.max(30,H*.085)}px">${SI('🤖','f',1.2)} 萬劍歸一！</div><div style="font-size:${Math.max(21,H*.06)}px;margin-top:4px">${MX.nm}</div>`;
 A(cap,[{opacity:0,transform:'scale(1.6)'},{opacity:1,transform:'scale(1)'}],{duration:450,delay:t1+1900});
 setTimeout(end,t1+2600+500)}
function fuse(){if(!cur||cur.lock||MX.on||MX.cine)return;const al=alive();
 if(al.length<3){say('⚙️ 至少要 3 名存活同門才能凝聚法相');return render()}
 if(MX.en<100){say('⚙️ 聚靈法陣法力尚未充滿');return render()}
 const cl=al.map(p=>p.cl),t=[];if(cl.some(c=>!c))t.push('重擊');if(cl.some(c=>c=='archer'||c=='mage'))t.push('精準');if(cl.includes('heal'))t.push('回春');if(cl.includes('dragon'))t.push('三昧真火');
 MX.hl=cl.includes('heal');MX.dr=cl.includes('dragon');MX.nm=t.join('·')+'護法法相';MX.en=0;MX.cine=1;cur.lock=true;
 fuseCine(al,()=>{MX.cine=0;if(!cur)return;cur.lock=false;MX.on=3;say(`🤖 萬劍歸一！${MX.nm} 顯聖（3 回合：仙術威力大增、受傷減半）`);syncMs();floatTxt('🤖萬劍歸一！','#8f8',false);const lp=ms[0]&&ms[0].s.position;if(lp)for(let k=0;k<6;k++){const a=lp.clone();a.x+=(Math.random()-.5)*.4;a.y=.2;const b=a.clone();b.y+=.5;addFx(etex(k%2?'✨':'⚡',null,.8),a,b,k*70,520,.1,.22,0,true)}lunge=.3;shake=.7;fUI()})}
const _round=round;round=function(){if(!cur||cur.lock)return;const E=cur,al=party.filter(p=>p.hp>0),sv=al.map(p=>[p,p.atk,p.g.w]);let k=1;
 if(MX.on)k=1.6+(MX.dr?.2:0);
 if(E.b&&E.sh){if(MX.on){E.sh=0;say('💥 法相合體重擊擊碎了魔頭的護體罡氣！');floatTxt('護體罡氣破碎！','#ffd84a')}else k=.3}
 if(k!=1)al.forEach(p=>{p.atk=Math.max(1,Math.round(p.atk*k));p.g.w=Math.round(p.g.w*k)});
 if(!MX.on)MX.en=Math.min(100,MX.en+20);_round();sv.forEach(([p,a,w])=>{p.atk=a;p.g.w=w})};
const _et=enemyTurn;enemyTurn=function(){const E=cur;if(!E)return;
 if(E.b&&!E.p2&&E.hp<E.mx/2){E.p2=1;E.atk=Math.round(E.atk*1.3);say('🔥 魔頭進入魔血狂暴！')}
 const a0=E.atk;if(MX.on)E.atk=Math.round(a0/2);if(E.cr>0){E.atk=Math.round(E.atk*.6);E.cr--}
 if(MX.on&&MX.hl){const l=alive().sort((a,b)=>a.hp/a.mx-b.hp/b.mx)[0];if(l)l.hp=Math.min(l.mx,l.hp+6)}
 _et();E.atk=a0;
 if(MX.on){MX.on--;if(!MX.on){say('🤖 護法法相消散');syncMs()}}else MX.en=Math.min(100,MX.en+15);fUI()};
syncMs=function(){ms.forEach((m,i)=>{const f=MX.on&&i==0;m.s.material.map=etex(f?'🤖':(m.p.hp>0?m.p.e:'💀'),null,.8,1,f?'b':(m.p.hp>0?'b':'dead'));m.s.material.needsUpdate=true})};
const _fUI=fUI;fUI=function(){_fUI();const E=cur;if(!E)return;let x='';
 if(E.b&&E.sh)x+='<br>🛡️ 護體罡氣完好（需法相重擊）';if(MX.on)x+=`<br>🤖 ${MX.nm}（剩 ${MX.on} 回合）`;else x+=`<br>⚙️ 聚靈法陣法力 ${Math.min(100,MX.en)}%`;
 $('#eb').innerHTML+=x;const b=$('#fz');if(b)b.textContent=MX.on?'🤖 法相中':`🤖 護法法相 ${Math.min(100,MX.en)}%`};
{const b=document.createElement('button');b.id='fz';b.textContent='🤖 萬劍歸一';b.onclick=ev=>{ev.stopPropagation();fuse()};$('#cb').insertBefore(b,$('#cb').lastElementChild)}

const _afx=attackFx;attackFx=function(m,i){if(!MX.on||!ms[0])return _afx(m,i);
 const mp=spr[cur.k].position,now=performance.now(),n=ms.filter(x=>x.p.hp>0).length,d=i*140,last=i>=n-1,V=(x,y,z)=>new THREE.Vector3(x,y,z);
 if(i==0){ms[0].s.userData.dash={t0:now,dur:560};floatTxt('法相沖撞！','#8f8',false)}
 for(let k=0;k<3;k++){const a=mp.clone().add(V((Math.random()-.5)*.25,(Math.random()-.5)*.15,(Math.random()-.5)*.25));addFx(etex(['⚡','✨','💫'][k],null,.8),a,a.clone().add(V(0,.25,0)),d+260+k*60,360,.08,.2,0,true)}
 addFx(last?etex('🔥',null,.8,1,'x'):etex('💥',null,.8),mp,mp,d+280,380,.25,last?1.6:.9,0,true);
 if(last)setTimeout(()=>{shake=1},d+280);
 return{hit:d+300,rg:false}};

const BA=document.createElement('div');BA.id='ba';
BA.style.cssText='position:absolute;top:30px;left:50%;transform:translateX(-50%);z-index:4;pointer-events:none;text-align:center;color:#ff5a4a;font-weight:700;text-shadow:0 0 4px #000,0 0 8px #000;display:none;line-height:1.1';
BA.innerHTML='<div id="bar" style="font-size:34px;display:inline-block">▲</div><div id="bat" style="font-size:20px"></div>';view.appendChild(BA);
function bossArrow(){let on=false;if(ai==MS&&MX.area&&!cur&&!busy){const S=st[ai];for(const k in S.ents){if(S.ents[k].t!='b')continue;
  const [a,b]=k.split(',').map(Number),dx=a-S.x,dy=b-S.y,deg=(Math.atan2(dx,-dy)-dirN()*Math.PI/2)*180/Math.PI;
  $('#bar').style.transform=`rotate(${deg}deg)`;$('#bat').textContent=`👑 魔頭 ${Math.abs(dx)+Math.abs(dy)} 步`;on=true;break}}
 BA.style.display=on?'block':'none'}
const _init=init;init=function(){_init();MX=mxNew();AREAS.length=MS};

/* ===== 八脈資質 / 神識鎖定 / 功法心法 / 煉丹爐 / 洞府 ===== */
const SPN=['根骨','神識','體魄','機緣','悟性','身法','氣運'],SPI=['💪','👁️','🫀','😎','🧠','🏃','🍀'],
 SPD=['攻擊 +1／2 點','神識命中 +3%','最大生命 +4','仙閣折扣 2%','修為 +3%、煉丹省料','法力 +6、遁走 +2%','會心一擊 +2%'];
let spc=[4,4,4,4,4,4,4],perks=[],pp=0,mats={scrap:6,core:0},BS={pool:{scrap:0,food:0,water:0}},VT=null,CT=null;
const hasP=id=>perks.includes(id),inTown=()=>AREAS[ai].ty=='town';
const strucs=()=>Object.values((st&&st[0]&&st[0].ents)||{}).filter(e=>e.svc=='bld'),nB=k=>strucs().filter(e=>e.bk==k).length;
const maxAP=()=>40+spc[5]*6+(hasP('agi')?20:0),critCh=()=>.05+spc[6]*.02;
const dmgBonus=p=>(p===party[0]?Math.floor(spc[0]/2):0)+(hasP('str')?Math.round((p.atk+p.g.w)*.2):0)+(hasP('cha')?1:0)+Math.min(3,nB('turret'));
const PKS=[{id:'str',n:'金剛不壞',s:0,d:'仙術傷害 +20%'},{id:'per',n:'天眼通',s:1,d:'神識鎖定命中 +10%'},{id:'end',n:'長生體',s:2,d:'隊長最大 HP +30'},{id:'cha',n:'仙風道骨',s:3,d:'全隊攻擊 +1、購買 92 折'},{id:'int',n:'慧根大開',s:4,d:'煉丹省 1 靈石碎片、修為 +10%'},{id:'agi',n:'凌波微步',s:5,d:'法力上限 +20'},{id:'lck',n:'洪福齊天',s:6,d:'靈石碎片爆率加倍'}];
const refresh=()=>{ikey='';render()};

function creUI(){CT=CT||{p:21,s:[1,1,1,1,1,1,1],n:party[0].n};creR()}
function creR(){const nm=$('#cn');if(nm)CT.n=nm.value;busy=true;$('#ov').style.display='flex';
 $('#ob').innerHTML=`<div style="font-size:48px">🧑‍🔧</div><b>締造蜀山弟子靈根</b><div style="margin:8px 0"><input id="cn" value="${esc(CT.n)}" maxlength="12" aria-label="道號" style="width:70%;font:inherit;padding:6px;border-radius:6px;border:2px solid var(--edge);background:#0004;color:var(--ink);text-align:center"></div><div>剩餘資質點 <b style="color:var(--acc)">${CT.p}</b></div>
 ${SPN.map((n,i)=>`<div class="ib" style="justify-content:space-between"><span>${SPI[i]}${n}</span><span><button onclick="creA(${i},-1)">−</button> <b>${CT.s[i]}</b> <button onclick="creA(${i},1)">＋</button></span></div>`).join('')}
 <button style="font-size:22px;padding:9px;width:100%;margin-top:8px" ${CT.p?'disabled':''} onclick="creGo()">踏入修仙界</button>`}
function creA(i,d){if(d>0&&(!CT.p||CT.s[i]>=10))return;if(d<0&&CT.s[i]<=1)return;CT.s[i]+=d;CT.p-=d;creR()}
function creGo(){const nm=$('#cn');spc=CT.s.slice();party[0].n=((nm&&nm.value)||CT.n).trim()||'蜀山弟子';party[0].mx=party[0].hp=44+(spc[2]-1)*4;CT=null;closeUI();say(`🧑‍🔧 ${party[0].n} 踏出了 蜀山宗門`)}

const VP=[{n:'命門死穴',c:20,h:35,m:2},{n:'軀幹丹田',c:15,h:65,m:1},{n:'四肢脈絡',c:10,h:55,m:.8}];
const vatsHit=i=>Math.min(95,VP[i].h+spc[1]*3+(hasP('per')?10:0));
function vatsOpen(){if(!cur||cur.lock||MX.cine||!alive().length)return;cur.lock=true;VT={ap:maxAP(),log:''};vatsUI()}
function vatsUI(){const E=cur;if(!E||!VT)return;let el=$('#vt');if(!el){el=document.createElement('div');el.id='vt';view.appendChild(el)}
 el.innerHTML=`<div class="vtb"><div class="vte">${E.e}</div><div>${esc(mn(E.e))} ${Math.max(0,E.hp)}/${E.mx}<div class="eh"><i style="width:${Math.max(0,E.hp/E.mx*100)}%"></i></div></div><div>⚡ 法力 <b>${VT.ap}</b>/${maxAP()}</div>
 <div class="vtg">${VP.map((p,i)=>`<button ${VT.ap<p.c?'disabled':''} onclick="event.stopPropagation();vatsShot(${i})">🎯 ${p.n}<br>${vatsHit(i)}\%・${p.c}MP</button>`).join('')}</div>
 <div class="vtl">${VT.log||'選擇要神識鎖定的部位'}</div><div class="vtg"><button onclick="event.stopPropagation();vatsEnd()">⏭️ 結束回合</button><button onclick="event.stopPropagation();vatsCancel()">✖ 取消</button></div></div>`}
function vatsShot(i){const E=cur;if(!E||!VT)return;const p=VP[i];if(VT.ap<p.c)return;VT.ap-=p.c;
 if(Math.random()*100>=vatsHit(i)){VT.log=`${p.n}並未擊中。`;return vatsUI()}
 let v=alive().reduce((s,m)=>s+m.atk+m.g.w+dmgBonus(m),0)*.5*p.m+R(4);const cr=Math.random()<critCh();if(cr)v*=1.8;
 if(MX.on)v*=1.6+(MX.dr?.2:0);if(E.b&&E.sh&&!MX.on)v*=.3;if(bless>0)v+=3;v=Math.max(1,Math.round(v));E.hp-=v;if(i==2)E.cr=2;hitFx(v,false);
 VT.log=`命中${p.n}${cr?'（會心一擊！）':''} -${v}${i==2?'，妖魔行動遲緩':''}`;fUI();
 if(E.hp<=0){vatsClose();setTimeout(win,300);return}vatsUI()}
function vatsClose(){const el=$('#vt');if(el)el.remove();VT=null}
function vatsEnd(){if(!cur)return;vatsClose();if(!MX.on)MX.en=Math.min(100,MX.en+10);fUI();counter()}
function vatsCancel(){vatsClose();if(cur)cur.lock=false;fUI()}

function addSp(i){if(pp<1||spc[i]>=10||cur||busy)return;spc[i]++;pp--;if(i==2){party[0].mx+=4;party[0].hp+=4}say(`${SPI[i]} ${SPN[i]} 提升到 ${spc[i]}`);refresh()}
function learn(id){const k=PKS.find(x=>x.id==id);if(!k||hasP(id)||pp<1||spc[k.s]<3||cur||busy)return;perks.push(id);pp--;if(id=='end'){party[0].mx+=30;party[0].hp+=30}say(`⭐ 領悟心法：${k.n}`);refresh()}

const cc=v=>Math.max(1,v-(spc[4]>=6?1:0)-(hasP('int')?1:0));
function modGear(sl,n){const m=party[0],it=m.it&&m.it[sl];if(!it)return;it.b+=n;it.mods=(it.mods||0)+1;m.g[sl]=score(m,it)}
const gOk=sl=>()=>{const it=party[0].it&&party[0].it[sl];return !!it&&(it.mods||0)<3},gTx=sl=>()=>{const it=party[0].it&&party[0].it[sl];return it?iTxt(it)+' 祭煉 '+(it.mods||0)+'/3':'隊長尚未裝備'};
const RCP=[{n:'回春丹',e:'💊',c:3,f:()=>{pot++}},{n:'歸鄉符（回到最近的村莊）',e:'🧧',c:5,f:()=>{mats.ret=(mats.ret|0)+1}},{n:'狂暴丹（3 場戰鬥攻擊 +3）',e:'🧪',c:4,f:()=>{bless=3}},{n:'聚靈核心（下次任務戰鬥法力 +30）',e:'🔋',c:12,f:()=>{mats.core++}},
 {n:'法寶祭煉（隊長武器 +2）',e:'🔧',c:10,ok:gOk('w'),x:gTx('w'),f:()=>modGear('w',2)},{n:'法袍銘文（隊長法袍 +1）',e:'🛡️',c:8,ok:gOk('a'),x:gTx('a'),f:()=>modGear('a',1)}];
function craft(i){const r=RCP[i],c=cc(r.c);if(!inTown()||busy||cur||mats.scrap<c||(r.ok&&!r.ok()))return;mats.scrap-=c;r.f();say(`🔧 煉製完成：${r.n}`);refresh()}

const BDS={farm:{e:'🌱',n:'靈田',c:8,p:'food',d:'每 20 秒產 1 靈芝'},purif:{e:'💧',n:'聚靈泉',c:10,p:'water',d:'每 20 秒產 1 靈泉'},junk:{e:'🔩',n:'煉器室',c:10,p:'scrap',d:'每 20 秒產 1 碎片'},bed:{e:'🛏️',n:'禪房床榻',c:6,d:'打坐打尖免費恢復全隊'},gen:{e:'⚡',n:'聚靈陣',c:14,d:'洞府產量 ×1.5（最多 2 座有效）'},turret:{e:'🔫',n:'護法劍陣',c:16,d:'全隊攻擊 +1（最多 3 座有效）'}};
const poolTxt=()=>`🔩${Math.floor(BS.pool.scrap)} 🍖${Math.floor(BS.pool.food)} 💧${Math.floor(BS.pool.water)}`;
function slot(){const S=st[0],c=[];for(const y of [7,11])for(let x=4;x<=22;x+=3)c.push([x,y]);return c.find(([x,y])=>S.g[y]&&S.g[y][x]===0&&!S.ents[x+','+y]&&!(ai==0&&S.x==x&&S.y==y))}
function buildB(k){const b=BDS[k],s=slot();if(ai!=0||busy||cur||!s||strucs().length>=8||mats.scrap<b.c)return;const key=s[0]+','+s[1],e={t:'n',e:b.e,svc:'bld',nm:b.n,bk:k,k:key};st[0].ents[key]=e;addSpr(key,e);mats.scrap-=b.c;say(`🏗️ 建造了${b.e}${b.n}`);refresh()}
function collect(){const P=BS.pool,s=Math.floor(P.scrap),f=Math.floor(P.food),w=Math.floor(P.water);if(!s&&!f&&!w)return say('📦 目前沒有可收取的產出');P.scrap-=s;P.food-=f;P.water-=w;mats.scrap+=s;const g=f*5+w*8;gold+=g;say(`📦 收取產出：靈石碎片+${s}，靈芝與靈泉賣得靈石 🪙${g}`)}
SV.bld=e=>{const b=BDS[e.bk],o=[];
 if(e.bk=='bed')o.push({t:'🛏️ 打坐打尖（全隊回復）',f:()=>{party.forEach(p=>p.hp=p.mx);say('🛏️ 全隊打坐修修完畢');SV.bld(e)}});
 else if(b.p)o.push({t:`📦 收取產出（${poolTxt()}）`,f:()=>{collect();SV.bld(e)}});
 o.push({t:`🔨 拆除（返還 靈石碎片×${b.c>>1}）`,f:()=>{mats.scrap+=b.c>>1;delEnt(e.k);closeUI();say(`🔨 拆除了${b.n}`)}});
 ui(b.e,b.n,`${b.d}\n📦 ${poolTxt()}`,o)};
setInterval(()=>{if(!st||!st[0]||busy||cur)return;const gm=1+.5*Math.min(2,nB('gen'));strucs().forEach(e=>{const p=BDS[e.bk].p;if(p)BS.pool[p]+=gm});if(tab=='bd')refresh()},20000);

function xPanel(p){const bx=cur||busy;let h='';
 if(tab=='sp')h=`<h4>🧘 ${esc(party[0].n)} · 練氣${lv}層｜悟道點 <b>${pp}</b></h4>`+SPN.map((n,i)=>`<div class="ib"><span style="flex:1">${SPI[i]} ${n} <b>${spc[i]}</b><small>${SPD[i]}</small></span><button ${pp<1||spc[i]>=10||bx?'disabled':''} onclick="addSp(${i})">＋1</button></div>`).join('')
  +'<h4>⭐ 功法心法（需對應資質 ≥3，每升一層境界獲得 1 點）</h4>'+PKS.map(k=>{const o=hasP(k.id);return`<div class="ib"><span style="flex:1">${SPI[k.s]} ${k.n}<small>${k.d}｜需${SPN[k.s]}≥3</small></span><button ${o||spc[k.s]<3||pp<1||bx?'disabled':''} onclick="learn('${k.id}')">${o?'已領悟':'領悟'}</button></div>`}).join('');
 else if(tab=='mk')h=`<h4>炼 煉丹爐｜靈石碎片 🔩${mats.scrap} 聚靈核心 🔋${mats.core}</h4>${inTown()?'':'<div style="color:var(--mut)">需要在宗門或城鎮才能使用煉丹爐。</div>'}`+RCP.map((r,i)=>{const c=cc(r.c),can=inTown()&&!bx&&mats.scrap>=c&&(!r.ok||r.ok());return`<div class="ib"><span style="flex:1">${r.e} ${r.n}<small>靈石碎片×${c}${r.x?'｜'+esc(r.x()):''}</small></span><button ${can?'':'disabled'} onclick="craft(${i})">煉製</button></div>`}).join('')+'<div style="color:var(--mut);font-size:18px">碎片來自擊敗妖魔、開寶箱與洞府煉器室。</div>';
 else{const S0=ai==0&&!bx,n=strucs().length;h=`<h4>🏯 蜀山洞府｜靈石碎片 🔩${mats.scrap}</h4><div style="color:var(--mut)">${ai==0?'':'需要回到 蜀山宗門 才能建造與收取。'}已建 ${n}/8</div>`+Object.keys(BDS).map(k=>{const b=BDS[k];return`<div class="ib"><span style="flex:1">${b.e} ${b.n}（已建 ${nB(k)}）<small>${b.d}｜碎片×${b.c}</small></span><button ${S0&&n<8&&mats.scrap>=b.c&&slot()?'':'disabled'} onclick="buildB('${k}')">建造</button></div>`}).join('')+`<h4>📦 待收取產物</h4><div class="ib"><span style="flex:1">${poolTxt()}<small>靈芝每個 🪙5、靈泉每個 🪙8 自動賣出</small></span><button ${S0?'':'disabled'} onclick="collect();refresh()">收取</button></div>`}
 if(h==ikey)return;ikey=h;const sc=p.scrollTop;p.innerHTML=h;p.scrollTop=sc}
const SK='wasteland_fp_';
const pack=()=>JSON.stringify({game:'仙途遠征',v:1,at:Date.now(),d:{party,gold,pot,xp,lv,ai,st,logs,done,has,qs,visited,hires,bless,day,SHOP,WITCH,oracle,fal,wl,bag,lid,MX,spc,perks,pp,mats,BS}},(k,v)=>v instanceof Set?{__set:[...v]}:v);
function slotInfo(k){try{const r=localStorage.getItem(SK+k);if(!r)return null;const o=JSON.parse(r);return`練氣${o.d.lv}層 第${o.d.day}天 · ${new Date(o.at).toLocaleString()}`}catch(e){return null}}
function saveSlot(k,quiet){try{localStorage.setItem(SK+k,pack());if(!quiet)say('💾 已存入欄位 '+k)}catch(e){if(!quiet)say('⚠️ 存檔失敗，請改用匯出存檔碼')}ikey='';render()}
function loadSlot(k){try{const r=localStorage.getItem(SK+k);if(!r)return say('此欄位沒有存檔');loadGame(r)}catch(e){say('⚠️ 讀取失敗')}}
setInterval(()=>{if(st&&party&&!busy&&!cur&&!MX.cine)saveSlot('auto',true)},30000);
let ONL=14;const CHN=['蜀山弟子','獵魔仙尊','白骨大仙','小藍仙','丹尊者','魏道人','赤血仙'],CHL=['誰有多的回春丹？','白骨城的散修其實很友善','有人組隊去萬寶城嗎','青竹鎮的符咒好貴','小心瘴氣毒沼 🍄','新手道友加油！','我剛突破到 練氣5層','桃源鎮的赤血蠍又來了'];
setInterval(()=>{if(!st||busy||cur)return;ONL=Math.max(8,Math.min(30,ONL+R(3)-1));if(Math.random()<.35){say(`🌐 ${CHN[R(CHN.length)]}：${CHL[R(CHL.length)]}（模擬）`);render()}},9000);

async function dlFile(name,txt,type){
 let done=false;
 try{const d=window.claude&&claude.use?await claude.use('downloads'):null;
  if(d){await d.save({filename:name,data:txt});done=true}}
 catch(err){if(err&&err.code=='declined'){say('已取消匯出');render();return}}
 if(!done){try{dl(name,txt,type);done=true}catch(e){}}
 say(done?'💾 已匯出 '+name+'（若無下載，請改用「複製存檔碼」）':'⚠️ 無法匯出檔案，請改用「複製存檔碼」');
 render()}
const exportSave=()=>dlFile(`仙途遠征_練氣${lv}層_第${day}天_${stamp()}.json`,pack(),'application/json');
const exportLog=()=>dlFile(`仙途遠征_修行手札_${stamp()}.txt`,logs.map(l=>`[第${l.d}天｜${l.a}] ${l.t}`).join('\n'),'text/plain;charset=utf-8');
const FI=document.createElement('input');FI.type='file';FI.accept='.json,application/json,text/plain';FI.style.cssText='position:fixed;left:-9999px;opacity:0';document.body.appendChild(FI);
FI.onchange=ev=>{const f=ev.target.files[0];ev.target.value='';if(!f)return;const r=new FileReader();r.onload=()=>loadGame(r.result);r.onerror=()=>say('⚠️ 無法讀取檔案');r.readAsText(f)};
async function copySave(){const s=pack();
 try{await navigator.clipboard.writeText(s);say('📋 存檔碼已複製到剪貼簿');render();return}catch(e){}
 const ta=document.getElementById('sc');if(ta){ta.value=s;ta.focus();ta.select();try{document.execCommand('copy');say('📋 存檔碼已複製')}catch(e){say('請手動複製上方文字框內容')}}render()}
function pasteLoad(){const ta=document.getElementById('sc');const s=ta&&ta.value.trim();if(!s){say('請先把存檔碼貼到文字框');return render()}loadGame(s)}
/* 戰鬥選單：出手後隱藏，待動作（含敵方回合）結束再出現 */
(function(){const cb=$('#cb');if(!cb)return;cb.style.transition='opacity .15s';
 setInterval(()=>{const on=!!cur&&!cur.lock&&!(typeof MX!='undefined'&&MX.cine);
  cb.style.opacity=on?'1':'0';cb.style.pointerEvents=on?'auto':'none';cb.style.visibility=on?'visible':'hidden'},40)})();

/* ===== 城鎮引路使 ＋ 宗門副本總管 ===== */
SVC[0].push(['guide','🧭','山門引路使'],['raid','👮','宗門執事 · 副本總管']);
[1,2,3,4].forEach(i=>SVC[i].push(['guide','🧭','引路使']));
FEAT.guide='🛻';FEAT.raid='🏛️';
const TOWNS=[0,1,2,3,4];
const townOk=t=>visited.has(t)||ROUTES.some(r=>(r.a==t&&visited.has(r.b))||(r.b==t&&visited.has(r.a)));
SV.guide=e=>{
 const o=TOWNS.filter(t=>t!=ai).map(t=>{const A=AREAS[t],n=Math.abs(t-ai),p=t==0?0:25*n,ok=townOk(t);
  return{t:`${A.i} ${A.n}｜約 ${n} 天｜${p?'🪙'+price(p):'免費'}${ok?(visited.has(t)?'':'｜首次抵達'):' 🔒 需先打通前一座城鎮'}`,d:!ok,
   f:()=>{if(pay(p)){day+=n;closeUI();say(`🧭 ${e.nm}御劍帶你前往「${A.n}」（約 ${n} 天）`);enter(t)}else SV.guide(e)}}});
 ui(e.e,e.nm,`「道友要去哪座城鎮？貧道可御劍直送，不必等車船班次。」\n（需依序打通：桃源鎮 → 青竹鎮 → 萬寶城 → 白骨城，返回蜀山宗門免費）\n今天是第 ${day} 天（${WD[(day-1)%7]}）。`,o)};
const RAID=[6,7,8,10,12,14,15];
const RAIDMS=[{k:'rc1',n:2,t:'初窺門徑',g:100,p:2,L:1},{k:'rc2',n:4,t:'小有名氣',g:220,p:3,L:2},{k:'rc3',n:7,t:'名震乾坤',g:500,p:5,L:4}];
SV.raid=e=>{
 const rows=RAID.map(i=>{const A=AREAS[i],q=QUESTS.find(q=>q.k==A.bk);return{i,A,q,ok:!!done[i]}});
 const n=rows.filter(r=>r.ok).length,tot=rows.length,pct=Math.round(n/tot*100);
 const qt=q=>{const s=qs[q.id]|0;return s==3?'已交付':s==1?(has[q.k]?'可交付':'進行中'):'未接取'};
 const L=rows.map(r=>`${r.ok?'✅':'⬜'} ${r.A.i} ${r.A.n}｜首領 ${mn(r.A.boss)}｜建議 練氣${r.A.lv*2+1}層${r.A.bk=='final'&&!oracle&&!r.ok?'｜🔒 需先推演天機':''}`+(r.q?`\n　　📜 委託「${r.q.t}」（${r.q.g}）：${qt(r.q)}`:'')).join('\n');
 const o=RAIDMS.map(m=>{const got=!!has[m.k],can=n>=m.n&&!got;
  return{t:got?`🎖️ 已領取：${m.t}（通關 ${m.n} 座副本）`:`🎖️ ${m.t}｜通關 ${m.n} 座｜🪙${m.g} 💊×${m.p} ＋法寶${n>=m.n?'':'（'+n+'/'+m.n+'）'}`,d:!can,
   f:()=>{has[m.k]=1;gold+=m.g;pot+=m.p;const up=gainXp(40*m.L+30);giveItem(genItem(m.L+1));say(`🎖️ 副本里程碑「${m.t}」：🪙+${m.g} 💊+${m.p}${up}`);SV.raid(e)}}});
 o.push({t:'🧑‍✈️ 前往領取歷練懸賞（傳功長老 艾琳）',f:()=>{const E=Object.values(st[0].ents).find(x=>x.svc=='mission');if(E)SV.mission(E);else closeUI()}});
 ui(e.e,e.nm,`「宗門所有討伐、委託皆由我登記造冊。」\n副本達成度：${n}/${tot}（${pct}%）｜隨機歷練懸賞已完成：${MX.cnt}\n\n${L}`,o)};
function ensureSvc(i){const S=st[i];if(!S||!S.ents||!S.g||!S.bd)return false;let ch=false;
 SVC[i].forEach((v,k)=>{if(v[0]!='guide'&&v[0]!='raid')return;if(Object.values(S.ents).some(x=>x.svc==v[0]))return;
  const x=3+(k%6)*4,y=3+Math.floor(k/6)*5;if(y<3||y>=S.H-3||S.g[y][x]!==0||S.ents[x+','+y])return;
  S.ents[x+','+y]={t:'n',e:v[1],svc:v[0],nm:v[2]};
  for(let d=-1;d<=1;d++){const bx=x+d,by=y-1;if(bx<1||bx>=S.W-1)continue;S.g[by][bx]=1;S.bd[bx+','+by]=d?{e:'🏠',z:1.2}:{e:FEAT[v[0]],z:1.38}}ch=true});
 return ch}
const _enter2=enter;enter=function(id){if(AREAS[id].ty=='town'&&st[id])ensureSvc(id);_enter2(id)};
const _render2=render;render=function(){if(st&&st[ai]&&AREAS[ai].ty=='town'&&!st[ai].__e2){st[ai].__e2=1;if(ensureSvc(ai))build()}_render2()};

/* 修仙城鎮不放路障：舊存檔的 🚧 改成樹木；裝備圖示 🚧 顯示為 🪞 */
(function(){const _SI=SI;SI=function(e,...a){return _SI(typeof e=='string'&&e.replace(/\uFE0F/g,'')=='🚧'?'🪞':e,...a)};
 const _rd=render;render=function(){const S=st&&st[ai];if(S&&S.bd&&!S.__nb){S.__nb=1;let ch=false;for(const k in S.bd){if(S.bd[k].e=='🚧'){const[x,y]=k.split(',').map(Number);S.bd[k]={e:TREES[(x*7+y*3)%TREES.length],z:1.3};ch=true}}if(ch)build()}_rd()}})();

/* items.js — 歸鄉符：脫離戰鬥外的任何地點，傳送回最近的村莊
 * 數量存在 mats.ret（隨存檔保存；舊存檔沒有此欄位時視為 0）。
 * 取得：妙手丹藥房購買、煉丹爐（5 靈石碎片）、木箱 12% 掉落、開局 1 張。
 * 使用：☰ 儲物袋「使用歸鄉符」、方向鍵旁 🧧 按鈕。戰鬥中與對話中不可使用。 */
const townOf=i=>{const A=AREAS[i];return A.ty=='town'?i:(A.par==null?0:A.par)};
function useReturn(){
 if(cur){say('🧧 戰鬥中無法使用歸鄉符');return render()}
 if(busy){say('🧧 請先關閉對話視窗再使用歸鄉符');return render()}
 if(AREAS[ai].ty=='town'){say('🧧 你已經在村莊裡了');return render()}
 if((mats.ret|0)<1){say('🧧 沒有歸鄉符了（丹藥房、煉丹爐或木箱可取得）');return render()}
 const to=townOf(ai);mats.ret--;busy=true;
 say(`🧧 催動歸鄉符，光華包裹全隊，返回「${AREAS[to].n}」`);render();
 try{FX.play('warp',{A:()=>[view.clientWidth/2,view.clientHeight*.8],B:()=>[view.clientWidth/2,view.clientHeight*.8],hit:0})}catch(e){}
 setTimeout(()=>{busy=false;enter(to)},850)}
if(!$('#rt')){const b=document.createElement('button');b.id='rt';b.textContent='🧧';b.title='歸鄉符：回到最近的村莊';$('#pt').after(b)}   /* 舊版 index.html 沒有按鈕時自動補上 */
$('#rt').onclick=ev=>{ev.stopPropagation();useReturn()};

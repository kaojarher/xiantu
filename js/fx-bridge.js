/* fx-bridge.js — 把 FXLib 接進遊戲戰鬥流程（不改動 core.js / features.js）
 * 掛接點：attackFx（同門出手）、vatsShot（神識鎖定）、enemyTurn（妖魔反擊）
 * 舊版 emoji 3D 投射物（addFx）在出手期間被靜音，由 Canvas 特效取代；
 * 出手者的衝刺／施法動作與命中時機（attackFx 回傳的 hit）維持原樣。 */
(()=>{
const cv=document.createElement('canvas');cv.id='fx';
cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3';
view.appendChild(cv);
const fx=FXLib.create(cv);
const pr=v=>{const p=v.clone().project(cam);return[(p.x+1)/2*cv.clientWidth,(1-p.y)/2*cv.clientHeight]};

/* 角色 → 特效（以 emoji 對應，缺省則依職業，再缺省用近戰飛劍） */
const BY_CHAR={'🧑\u200d🔧':'sword','🧑\u200d⚕':'heal','🐕':'dog','🧔':'talisman','👩':'thunder','💂':'dragonfire','🕵':'swordqi'};
const BY_CLASS={archer:'talisman',mage:'thunder',heal:'heal',dragon:'dragonfire'};
const keyOf=m=>MX.on?'fa':(BY_CHAR[nk(m.p.e)]||BY_CLASS[m.p.cl]||'sword');

/* 妖魔 → 反擊風格 */
const BY_MON={'🐀':'claw','狼':'claw','🐊':'claw','蜥':'claw','🐍':'claw','鷹':'claw','蝠':'claw','🪳':'claw','🧟':'claw',
 '🦂':'poison','蛛':'poison','飛':'poison','🥷':'slash','🦹':'slash','💀':'slash','👹':'slash','💪':'slash',
 '龍':'fire','魔':'dark','傀':'dark','🧓':'dark'};

const _attack=attackFx;
attackFx=function(m,i){
 const _add=addFx;addFx=()=>{};let r;
 try{r=_attack(m,i)}finally{addFx=_add}
 try{const to=spr[cur.k]&&spr[cur.k].position;
  if(to){const n=ms.filter(x=>x.p.hp>0).length;
   fx.play(keyOf(m),{A:()=>pr(m.s.position),B:()=>pr(to),hit:r.hit,i,last:i>=n-1})}}
 catch(e){console.warn('fx',e)}
 return r};

const _vats=vatsShot;
vatsShot=function(i){
 const E=cur,h=E&&E.hp;_vats(i);
 try{if(E&&E.hp<h&&spr[E.k]){const to=spr[E.k].position;fx.play('v'+i,{A:()=>pr(to),B:()=>pr(to),hit:0})}}
 catch(e){console.warn('fx',e)}};

const _enemy=enemyTurn;
enemyTurn=function(){
 const E=cur,hp=party.map(p=>p.hp);_enemy();
 try{if(!E)return;const from=spr[E.k]&&spr[E.k].position,style=BY_MON[nk(E.e)]||'claw';
  party.forEach((p,i)=>{if(p.hp<hp[i]){const m=ms.find(x=>x.p===p);
   if(m&&from)fx.play('e_'+style,{A:()=>pr(from),B:()=>pr(m.s.position),hit:220})}})}
 catch(e){console.warn('fx',e)}};

window.FX=fx;   /* 方便在主控台測試：FX.play('thunder',{A:()=>[100,500],B:()=>[400,250],hit:600}) */
})();

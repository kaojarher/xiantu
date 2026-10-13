(function(){var mem={},ok=true;try{localStorage.setItem('__t','1');localStorage.removeItem('__t')}catch(e){ok=false}
window.SAFE_LS=ok;
if(!ok){try{Object.defineProperty(window,'localStorage',{value:{getItem:function(k){return k in mem?mem[k]:null},setItem:function(k,v){mem[k]=String(v)},removeItem:function(k){delete mem[k]},clear:function(){mem={}}},configurable:true})}catch(e){}}})();

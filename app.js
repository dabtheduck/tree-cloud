/* Tree Cloud — local-first PWA. All data in IndexedDB on this device. No server, no cloud. */
(function(){
"use strict";
var $=function(s){return document.querySelector(s)}, $$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var P=window.TC_PROMPTS;
var DBNAME="tree-cloud", STORE="plants", db=null;
var soundOn = localStorage.getItem("tc-sound")!=="off";
var soundPreset = "mutedpixel"; /* dab, 2026-11-19: presets removed from Settings — one standard sound, a muted Pixel Rain. */
var session=null, ynAnswer=null, audioBlob=null, mediaRec=null, recChunks=[], recTimer=null, recSecs=0, recStream=null;
var calCursor=new Date(); calCursor.setDate(1);
var WORLD_LABEL={valley:"Rivers & Valleys",desert:"Desert",space:"Outer Space"};
var WORLD_KEY={valley:"valley",desert:"desert",space:"space"};
var animId=null, animTime=0;

/* ---------- audio + haptics (WebAudio, no files) ---------- */
/* One standard sound (dab, 2026-11-19): Muted Pixel Rain — Pixel Rain notes, quieter, softer, rounder (sine). No preset picker in Settings. */
var PRESETS={
  mutedpixel:{label:"Muted Pixel Rain", yes:[880,659], grow:[523,659,784], fanfare:[523,659,784,1047], type:"sine", vol:0.05}
};
var AC=null;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(AC&&AC.state==="suspended") AC.resume(); return AC; }
function tone(f,t0,d,vol,type,slideTo){ if(!soundOn) return; var c=ac(); if(!c) return; var o=c.createOscillator(),g=c.createGain(); o.type=type||"sine"; o.frequency.setValueAtTime(f,c.currentTime+t0); if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,c.currentTime+t0+d); g.gain.setValueAtTime(0.0001,c.currentTime+t0); g.gain.linearRampToValueAtTime(vol||0.1,c.currentTime+t0+0.03); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t0+d); o.connect(g); g.connect(c.destination); o.start(c.currentTime+t0); o.stop(c.currentTime+t0+d+0.05); }
/* Desert sound (dab, 2026-11-19): B + C — warm muted pluck + gentle dry leaf crinkle. No clicks, thocks or bells. */
function noiseHit(t0,d,vol,freq){ if(!soundOn) return; var c=ac(); if(!c) return; var len=Math.floor(c.sampleRate*(d+0.05)); var b=c.createBuffer(1,len,c.sampleRate); var ch=b.getChannelData(0); for(var i=0;i<len;i++) ch[i]=Math.random()*2-1; var s=c.createBufferSource(); s.buffer=b; var f=c.createBiquadFilter(); f.type="bandpass"; f.frequency.value=freq; f.Q.value=0.8; var g=c.createGain(); g.gain.setValueAtTime(0.0001,c.currentTime+t0); g.gain.linearRampToValueAtTime(vol,c.currentTime+t0+0.02); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t0+d); s.connect(f); f.connect(g); g.connect(c.destination); s.start(c.currentTime+t0); s.stop(c.currentTime+t0+d+0.05); }
function desertSound(name){ tone(196,0,.35,.14,"triangle",98); tone(98,0,.3,.08,"sine"); noiseHit(0,.12,.10,1400); noiseHit(.09,.12,.08,1100); noiseHit(.18,.14,.07,1600); if(name==="grow"){ tone(220,.25,.35,.12,"triangle",110); noiseHit(.3,.12,.07,1300); } if(name==="fanfare"){ tone(220,.25,.5,.12,"triangle",110); noiseHit(.3,.12,.07,1300); tone(147,.5,.6,.08,"sine"); } }
function sfx(name){ if(!soundOn) return;
  var pr=PRESETS[soundPreset]||PRESETS.mutedpixel;
  var layer=(session&&session.answers)?session.answers.length:0, climb=1+layer*0.04, jit=0.97+Math.random()*0.06;
  var world=(session&&session.world)||(typeof selectedWorld!=="undefined"?selectedWorld:null);
  /* Desert: B+C only. Rivers & Valleys: preset only. Outer Space: preset + twinkly blips. */
  if(world==="desert" && (name==="tap"||name==="yes"||name==="grow"||name==="fanfare")){ desertSound(name); return; }
  if(name==="yes"){ tone(pr.yes[0]*jit,0,.25,pr.vol,pr.type); tone(pr.yes[1]*jit,.09,.3,pr.vol,pr.type); }
  else if(name==="no"){ tone(330,0,.2,.05,"triangle"); }
  else if(name==="grow"){ pr.grow.forEach(function(f,i){ tone(f*climb,i*.08,.35,.11,"sine"); }); if(layer>0&&layer%3===0) tone(1568*climb,.2,.4,.05,"sine"); if(world==="space"){ tone(1047,.05,.4,.05,"sine"); tone(1319,.15,.4,.05,"sine"); tone(1568,.25,.5,.04,"sine"); } }
  else if(name==="fanfare"){ pr.fanfare.forEach(function(f,i){ tone(f,i*.12,.8,.09,"sine"); tone(f*2,i*.12,.4,.03,"sine"); }); if(world==="space"){ tone(1047,.1,.5,.05,"sine"); tone(1568,.3,.6,.04,"sine"); } }
  else if(name==="tap"){ tone(880,0,.08,.05,"sine"); }
}
function buzz(p){ try{ if(navigator.vibrate) navigator.vibrate(p||15); }catch(e){} }
function bindSoundControls(){
  var so=$("#soundOn"); if(so){ so.checked=soundOn; so.addEventListener("change",function(){ soundOn=this.checked; localStorage.setItem("tc-sound",soundOn?"on":"off"); if(soundOn) sfx("tap"); }); }
  var ts=$("#testSound"); if(ts) ts.addEventListener("click",function(){ sfx("fanfare"); buzz([20,40,20]); });
  /* No preset picker in Settings any more (dab, 2026-11-19) — one standard sound only. */
}

/* ---------- IndexedDB ---------- */
function openDB(){ return new Promise(function(res,rej){ var r=indexedDB.open(DBNAME,1);
  r.onupgradeneeded=function(){ r.result.createObjectStore(STORE,{keyPath:"id"}); };
  r.onsuccess=function(){ db=r.result; res(); }; r.onerror=function(){ rej(r.error); }; }); }
function tx(mode){ return db.transaction(STORE,mode).objectStore(STORE); }
function dbPut(p){ return new Promise(function(res,rej){ var r=tx("readwrite").put(p); r.onsuccess=function(){res()}; r.onerror=function(){rej(r.error)}; }); }
function dbAll(){ return new Promise(function(res,rej){ var r=tx("readonly").getAll(); r.onsuccess=function(){res(r.result||[])}; r.onerror=function(){rej(r.error)}; }); }
function dbDel(id){ return new Promise(function(res,rej){ var r=tx("readwrite").delete(id); r.onsuccess=function(){res()}; r.onerror=function(){rej(r.error)}; }); }

/* ---------- dates ---------- */
function dstr(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function todayStr(){ return dstr(new Date()); }
function prettyDate(s){ var p=s.split("-"); return p[2]+"-"+p[1]+"-"+p[0]; }
function dayMood(plants){ if(!plants.length) return null; var a=plants.reduce(function(s,p){return s+p.mood},0)/plants.length; return a; }
function speciesOf(p){ if(p.species) return p.species; return P.speciesFor(p.mood, p.world); }

/* ---------- pixel scene ---------- */
function drawPlant(x, cx, base, h, prog, type, species, t, color){
  var pr=P.profileFor(species, color), sway=Math.sin((t||0)*pr.speed+pr.phase)*pr.sway*prog, leaf=pr.leaf, leaf2=pr.leaf2, trunk=pr.trunk;
  /* Per-species motion signature — each of the 30 (+9 BYO) moves differently. */
  var motion=pr.motion||"sway";
  if(motion==="wobble") sway*=1.6;
  if(motion==="whip") sway*=1.4;
  if(motion==="shiver") sway+=Math.sin((t||0)*9+pr.phase)*2*prog;
  var top=base-h;
  x.fillStyle=trunk;
  if(type==="tree"){
    if(prog<=0){ x.fillRect(cx-16,base-14,32,14); x.fillStyle="#a0522d"; x.fillRect(cx-16,base-14,32,4); return; }
    var th=h;
    if(pr.shape==="palm"){
      x.fillRect(cx-5+sway*0.3,top,10,th);
      x.fillStyle=leaf;
      for(var f=0;f<5;f++){ var fx=cx+sway+Math.cos(f*1.1)*22-12, fy=top-6+Math.abs(Math.sin(f*1.3))*8; x.fillRect(fx,fy,24,6); }
      x.fillStyle="#d9a441"; x.fillRect(cx-10,top+8,8,8); x.fillRect(cx+2,top+8,8,8);
    } else if(pr.shape==="willow"){
      x.fillRect(cx-6+sway*0.2,top,12,th);
      x.fillStyle=leaf;
      for(var s2=0;s2<6;s2++){ var sx=cx-26+s2*10+Math.sin((t||0)*1.2+s2)*3*prog; x.fillRect(sx,top-14,5,34+prog*20); }
      x.fillStyle=leaf2; x.fillRect(cx-20+sway,top-20,40,10);
    } else if(pr.shape==="pine"||pr.shape==="nebula"){
      x.fillRect(cx-6,top+20,12,th-20);
      x.fillStyle=leaf;
      var pw=16+prog*30;
      x.fillRect(cx-pw,top+16,pw*2,14); x.fillRect(cx-pw*0.75,top,pw*1.5,14); x.fillRect(cx-pw*0.45,top-16,pw*0.9,14);
      x.fillStyle=leaf2; x.fillRect(cx-4,top-24,8,8);
      if(pr.shape==="nebula"){ x.fillStyle="#fff"; x.fillRect(cx-pw+6,top+4,3,3); x.fillRect(cx+pw-10,top-8,3,3); }
    } else if(pr.shape==="joshua"){
      x.fillRect(cx-5,top+30,10,th-30);
      x.fillStyle=trunk; x.fillRect(cx-22,top+18,18,6); x.fillRect(cx+4,top+10,18,6);
      x.fillStyle=leaf; x.fillRect(cx-30,top+2,20,12); x.fillRect(cx+10,top-6,20,12); x.fillRect(cx-8,top-14,16,12);
    } else if(pr.shape==="mesquite"){
      x.fillRect(cx-7,top+30,14,th-30);
      x.fillStyle=leaf; var mw=26+prog*34; x.fillRect(cx-mw+sway,top+6,mw*2,12); x.fillRect(cx-mw*0.6,top-6,mw*1.2,10);
      x.fillStyle=leaf2; x.fillRect(cx-mw+8,top+10,mw*2-16,5);
    } else { /* oak / comet oak */
      x.fillRect(cx-7+sway*0.2,top,14,th);
      x.fillStyle=leaf; var r=18+prog*40; x.fillRect(cx-r+sway,top-26,r*2,26); x.fillRect(cx-r*0.7+sway,top-48,r*1.4,24);
      x.fillStyle=leaf2; x.fillRect(cx-r+6+sway,top-20,r*2-12,8);
    }
  } else if(type==="shrub"){
    if(pr.shape==="pads"){
      x.fillStyle=leaf; var padW=16+prog*14;
      x.fillRect(cx-6,base-26-prog*30,12,26+prog*30);
      x.fillRect(cx-padW,base-44-prog*20,padW,20); x.fillRect(cx,base-44-prog*20,padW,20);
      x.fillRect(cx-padW*0.6+sway,base-62-prog*20,padW*0.7,16);
      x.fillStyle=leaf2; x.fillRect(cx-3,base-50-prog*20,6,6);
    } else if(pr.shape==="sage"){
      x.fillStyle=leaf;
      for(var sg=0;sg<7;sg++){ var gx=cx-18+sg*6+Math.sin((t||0)*2.2+sg)*4*prog; x.fillRect(gx,base-30-prog*34,3,30+prog*34); }
      x.fillStyle=leaf2; x.fillRect(cx-14+sway,base-38-prog*20,28,6);
    } else if(pr.shape==="ocotillo"){
      x.fillStyle=trunk;
      for(var oc=0;oc<5;oc++){ var ox=cx-16+oc*8+Math.sin((t||0)*1.8+oc)*3*prog; x.fillRect(ox,base-40-prog*44,3,40+prog*44); }
      x.fillStyle=leaf; for(var oc2=0;oc2<5;oc2++){ var ox2=cx-16+oc2*8+Math.sin((t||0)*1.8+oc2)*3*prog; x.fillRect(ox2-2,base-46-prog*44,7,8); }
    } else if(pr.shape==="birch"){
      x.fillStyle="#d9d9d9"; x.fillRect(cx-5,base-30-prog*40,10,30+prog*40);
      x.fillStyle=leaf; var bw=16+prog*26; x.fillRect(cx-bw+sway,base-52-prog*20,bw*2,22); x.fillStyle=leaf2; x.fillRect(cx-bw+6,base-46-prog*20,bw*2-12,8);
    } else { /* bush / holly / asteroid */
      x.fillStyle=trunk; x.fillRect(cx-4,base-24-prog*30,8,24+prog*30);
      x.fillStyle=leaf; var sr=20+prog*32; x.fillRect(cx-sr+sway,base-44-prog*18,sr*2,28);
      x.fillStyle=leaf2; x.fillRect(cx-sr+8+sway,base-38-prog*18,sr*2-16,10);
      if(species==="Holly Bush"){ x.fillStyle="#c1440e"; x.fillRect(cx-10+sway,base-40-prog*18,5,5); x.fillRect(cx+6+sway,base-34-prog*18,5,5); }
    }
  } else { /* flower / fern / succulent */
    var stemH=20+prog*90*pr.height;
    x.fillStyle=trunk; x.fillRect(cx-3+sway*0.3,base-stemH,6,stemH);
    var fr=8+prog*22;
    if(pr.shape==="bamboo"){
      x.fillStyle=leaf2;
      for(var b=0;b<4;b++){ var by=base-20-b*22*prog; if(by<base-stemH) break; x.fillRect(cx-5+sway*0.4,by,10,16); x.fillStyle=trunk; x.fillRect(cx-6,by,12,3); x.fillStyle=leaf2; }
      x.fillStyle=leaf; x.fillRect(cx-14+sway,base-stemH-8,28,8);
      if(species==="Moon Bamboo"){ x.fillStyle="#fff3b0"; x.fillRect(cx-3,base-stemH-14,6,6); }
    } else if(pr.shape==="fern"){
      x.fillStyle=leaf;
      for(var fn=0;fn<5;fn++){ var fa=fn*0.9-1.8, fx2=cx+Math.sin(fa)*fr*1.4+sway, fy2=base-stemH+Math.cos(fa)*fr*0.5; x.fillRect(fx2-4,fy2-4,8,16); }
      x.fillStyle=leaf2; x.fillRect(cx-5+sway,base-stemH-10,10,10);
      if(species==="Star Fern"){ x.fillStyle="#fff"; x.fillRect(cx-12,base-stemH-6,3,3); x.fillRect(cx+10,base-stemH-12,3,3); }
    } else if(pr.shape==="rosette"){
      x.fillStyle=leaf;
      for(var ro=0;ro<6;ro++){ var ra=ro*1.047, rx=cx+Math.cos(ra)*fr*0.7+sway*0.5, ry=base-stemH+Math.sin(ra)*fr*0.4; x.fillRect(rx-6,ry-4,12,8); }
      x.fillStyle=leaf2; x.fillRect(cx-6+sway,base-stemH-6,12,12);
      if(species==="Galaxy Succulent"){ x.fillStyle="#fff"; x.fillRect(cx-8,base-stemH-2,3,3); x.fillRect(cx+6,base-stemH-8,3,3); }
    } else if(pr.shape==="rose"){
      x.fillStyle=trunk; x.fillRect(cx-4,base-stemH-10,8,10);
      x.fillStyle=leaf; for(var rp=0;rp<5;rp++){ x.fillRect(cx-fr+Math.cos(rp*1.256)*fr*0.7-5+sway, base-stemH+Math.sin(rp*1.256)*fr*0.7-5,10,10); }
      x.fillStyle=leaf2; x.fillRect(cx-5+sway,base-stemH-5,10,10);
    } else if(pr.shape==="barrel"){
      x.fillStyle=leaf; var bw2=14+prog*16; x.fillRect(cx-bw2+sway,base-26-prog*10,bw2*2,26+prog*10);
      x.fillStyle=leaf2; x.fillRect(cx-3,base-34-prog*10,6,8); x.fillStyle="#e07a9a"; x.fillRect(cx-8+sway,base-40-prog*10,16,8);
    } else { /* generic flower */
      x.fillStyle="#d9a441"; for(var p=0;p<5;p++){ x.fillRect(cx-fr+Math.cos(p*1.256)*fr*0.7-5+sway, base-stemH+Math.sin(p*1.256)*fr*0.7-5,10,10); }
      x.fillStyle="#a0522d"; x.fillRect(cx-5+sway,base-stemH-5,10,10);
    }
  }
  /* Motion extras — twinkle / glow / bloom / flutter / ripple / unfurl, per species. */
  var tw=Math.sin((t||0)*3+pr.phase);
  if(motion==="twinkle" && tw>0.4){ x.fillStyle="#fff"; x.fillRect(cx-14+sway,base-h+8,3,3); x.fillRect(cx+12+sway,base-h+20,3,3); }
  if(motion==="glow"){ x.fillStyle="#d9a441"; if(tw>0){ x.fillRect(cx-10+sway,base-h+12,4,4); x.fillRect(cx+8+sway,base-h+4,4,4); } }
  if(motion==="bloom" && prog>0.8){ x.fillStyle=leaf2; x.fillRect(cx-18+sway,base-h+6,8,8); x.fillRect(cx+10+sway,base-h+6,8,8); }
  if(motion==="flutter"){ x.fillStyle=leaf; x.fillRect(cx-24+sway*1.4,base-h+14,16,4); x.fillRect(cx+8+sway*1.4,base-h+22,16,4); }
  if(motion==="ripple"){ x.fillStyle=leaf; x.fillRect(cx-20+Math.sin((t||0)*2+pr.phase)*4,base-h+10,6,20); }
  if(motion==="unfurl"){ x.fillStyle=leaf2; x.fillRect(cx-6+sway,base-h-6-prog*8,12,6); }
  if(pr.special && prog>0.9){ x.fillStyle="#fff3b0"; x.fillRect(cx-3,base-h-10,6,6); }
}
function drawScene(cv, plant, stage, total, world, burst, species, time, color){
  if(!cv) return; var x=cv.getContext("2d"); if(!x) return; var W=cv.width, H=cv.height, prog=total? stage/total:0;
  var t=(typeof time==="number")?time:0;
  var sp=species||P.speciesFor(5, world);
  /* sky: dark storm -> clearer -> starry at the top */
  var sky = prog<0.25 ? "#3a4a5a" : prog<0.5 ? "#5b7a8c" : prog<0.8 ? "#7fb3c8" : "#0b0b1e";
  x.fillStyle=sky; x.fillRect(0,0,W,H);
  if(prog<0.25){ x.fillStyle="#8fa8bb"; for(var i=0;i<24;i++){ var rx=(i*37)%W, ry=(i*53)%90; x.fillRect(rx,ry,2,8); } }
  if(prog>=0.8){ x.fillStyle="#fff"; for(var s=0;s<40;s++){ x.fillRect((s*97)%W,(s*41)%70,2,2); } }
  if(world==="desert"){ x.fillStyle="#ffdf6b"; x.fillRect(W-70,18,34,34); }
  if(world==="space"){ x.fillStyle="#7fb3c8"; x.fillRect(W-80,16,40,40); x.fillStyle="#2d6a4f"; x.fillRect(W-72,24,14,14); }
  if(world==="valley" && prog>=0.5){ x.fillStyle="#fff3b0"; x.fillRect(24,18,28,28); }
  var gy=H-46;
  if(world==="valley"){ x.fillStyle="#2d6a4f"; x.fillRect(0,gy,W,46); x.fillStyle="#48cae4"; x.fillRect(0,gy+18,150,10); x.fillStyle="#1b4332"; x.fillRect(30,gy-34,10,34); x.fillRect(410,gy-28,10,28); x.fillStyle="#40916c"; x.fillRect(22,gy-52,26,22); x.fillRect(402,gy-44,26,18); }
  else if(world==="desert"){ x.fillStyle="#c1440e"; x.fillRect(0,gy,W,46); x.fillStyle="#a0522d"; x.fillRect(0,gy+22,W,8); x.fillStyle="#8a5a2b"; x.fillRect(40,gy-30,60,30); x.fillRect(360,gy-18,70,18); x.fillStyle="#40916c"; x.fillRect(300,gy-36,8,36); x.fillRect(292,gy-28,24,6); }
  else { x.fillStyle="#5a5a6e"; x.fillRect(0,gy,W,46); x.fillStyle="#3a3a4a"; x.fillRect(60,gy+8,26,10); x.fillRect(330,gy+14,34,10); x.fillStyle="#d9d9d9"; x.fillRect(390,gy-14,16,14); }
  /* cloud island base: plants grow on clouds, not on flat ground */
  x.fillStyle="#ffffff"; x.fillRect(0,H-22,W,22); x.fillStyle="#dfeef5"; x.fillRect(20,H-30,90,10); x.fillRect(W-120,H-28,100,10); x.fillRect(W/2-40,H-34,80,12);
  /* plant geometry is defined BEFORE the weed loop (was a bug: weeds used `base` before it existed). */
  var cx=W/2, base=gy, h=(18+prog*150)*(P.profileFor(sp,color).height||1);
  /* dry dead weeds: brown/tan brittle stalks, bent and leafless — NOT cannabis-like. They fade as the plant grows, replaced by it. */
  var weeds=Math.max(0, 2-Math.floor(prog*4));
  x.fillStyle="#8a6d3b";
  for(var w=0;w<weeds;w++){ var wx=40+w*70+(w===1?W-140:0); x.fillRect(wx,base-28,3,28); x.fillRect(wx-8,base-18,8,3); x.fillRect(wx+3,base-24,8,3); x.fillStyle="#a08a5a"; x.fillRect(wx-2,base-34,4,8); x.fillStyle="#8a6d3b"; }
  drawPlant(x, cx, base, h, prog, plant, sp, t, color);
  if(burst){ for(var b=0;b<26;b++){ x.fillStyle=["#d9a441","#74c69d","#fff","#40916c"][b%4]; x.fillRect(cx+(Math.random()*120-60), base-h+(Math.random()*80-40),4,4); } }
}
function startSceneAnim(){
  stopSceneAnim();
  if(typeof requestAnimationFrame!=="function") return;
  var loop=function(ts){ animTime=(ts||0)/1000; if(session){ drawScene($("#scene"),session.plant,session.answers.length,session.layers.length,session.world,true,session.species,animTime,session.color); } animId=requestAnimationFrame(loop); };
  animId=requestAnimationFrame(loop);
}
function stopSceneAnim(){ if(animId&&typeof cancelAnimationFrame==="function") cancelAnimationFrame(animId); animId=null; }
function renderProgress(){ if(!session) return; var total=session.layers.length, done=session.answers.length, pct=Math.round(done/total*100);
  $("#progFill").style.width=pct+"%";
  /* Plant type and destination stay hidden until the session ends. */
  $("#progPct").textContent=pct+"%";
  $("#progLabel").textContent=done+" / "+total;
  $("#progEnd").textContent="→ "+P.ends[session.plant];
  $("#layerChip").textContent="Layer "+Math.min(done+1,total)+" / "+total; }

/* ---------- Cloud mind garden (Grow page) ---------- */
function weedsKey(){ return "tc-weeds-"+todayStr(); }
function getWeeds(){ var v=localStorage.getItem(weedsKey()); return v===null?3:+v; }
function setWeeds(n){ localStorage.setItem(weedsKey(), String(Math.max(0,n))); }
function getGifts(){ try{ return JSON.parse(localStorage.getItem("tc-gifts")||"[]"); }catch(e){ return []; } }
function gardenName(){ return (localStorage.getItem("tc-garden-name")||"").slice(0,6); }
/* Cloud grows with you: a new cloud row every 6 items, no cap. Row 0 keeps the name sign clear. */
function cloudLayout(n){ var perRow=6, rows=Math.max(1, Math.ceil(n/perRow)); return {perRow:perRow, rows:rows, rowH:90, top:20}; }
async function renderMindGarden(){ var cv=$("#mindGarden"); if(!cv) return; var x=cv.getContext("2d"); if(!x) return;
  var all=await dbAll(); var todays=all.filter(function(p){ return p.date===todayStr(); });
  var weeds=getWeeds();
  var gifts=getGifts().filter(function(g){ return g.date===todayStr(); });
  var total=Math.max(6, todays.length+weeds+gifts.length);
  var lay=cloudLayout(total), W=480, H=lay.top+lay.rows*lay.rowH+10;
  cv.width=W; cv.height=H; cv.style.height=(H* (cv.clientWidth||480)/W)+"px";
  x.fillStyle="#7fb3c8"; x.fillRect(0,0,W,H); x.fillStyle="#fff"; x.fillRect(20,18,70,14); x.fillRect(340,28,90,14); x.fillRect(180,10,60,10);
  var name=gardenName();
  for(var r=0;r<lay.rows;r++){
    var gy=lay.top+r*lay.rowH+lay.rowH-30, startX=(r===0?130:20), spacing=72;
    x.fillStyle="#ffffff"; x.fillRect(8,gy-2,W-16,20); x.fillRect(18,gy-10,W-36,10);
    if(r===0 && name){ x.fillStyle="#6b4a2b"; x.fillRect(14,gy-24,84,22); x.fillStyle="#fdf6e3"; x.fillRect(17,gy-21,78,16); x.fillStyle="#14261c"; x.font="bold 11px Nunito, sans-serif"; x.textAlign="center"; try{ x.fillText(name,56,gy-9); }catch(e){} }
    for(var i=0;i<lay.perRow;i++){
      var idx=r*lay.perRow+i, cx=startX+i*spacing;
      if(idx<todays.length){ var p=todays[idx], pr=P.profileFor(speciesOf(p), p.color);
        x.fillStyle=pr.trunk; x.fillRect(cx-3,gy-28,6,28);
        x.fillStyle=pr.leaf; x.fillRect(cx-13,gy-44,26,18); x.fillStyle=pr.leaf2; x.fillRect(cx-7,gy-40,14,8); }
      else if(idx<todays.length+weeds){ x.fillStyle="#8a6d3b"; x.fillRect(cx,gy-28,3,28); x.fillRect(cx-7,gy-18,7,3); x.fillRect(cx+3,gy-24,7,3); }
      else { var gi=idx-todays.length-weeds; if(gi<gifts.length){ x.fillStyle="#40916c"; x.fillRect(cx-2,gy-24,4,24); x.fillRect(cx-10,gy-28,20,6); x.fillStyle="#d9a441"; x.fillRect(cx-3,gy-34,6,6); } }
    }
  }
  var gn=$("#giftNote"); if(gn && !gifts.length) gn.textContent="";
  var tc=$("#todayCount"); if(tc) tc.textContent=todays.length+" plant"+(todays.length===1?"":"s")+" today";
  var tl=$("#todayLine"); if(tl) tl.textContent=prettyDate(todayStr());
}
function mindGardenClick(e){
  var cv=$("#mindGarden"); if(!cv) return; var r=cv.getBoundingClientRect(); var px=(e.clientX-r.left)*(cv.width/r.width), py=(e.clientY-r.top)*(cv.height/r.height);
  dbAll().then(function(all){ var todays=all.filter(function(p){ return p.date===todayStr(); });
    var weeds=getWeeds(); var gifts=getGifts().filter(function(g){ return g.date===todayStr(); });
    var lay=cloudLayout(Math.max(6, todays.length+weeds+gifts.length));
    var row=Math.floor((py-lay.top)/lay.rowH); if(row<0||row>=lay.rows) return;
    var startX=(row===0?130:20), spacing=72;
    var idx=row*lay.perRow+Math.floor((px-startX+spacing/2)/spacing);
    if(idx>=0 && idx<todays.length){ openPlant(todays[idx].id); return; }
    var gIdx=idx-todays.length-weeds;
    if(gIdx>=0 && gIdx<gifts.length){ var gn=$("#giftNote"); if(gn) gn.textContent=gifts[gIdx].title+": "+gifts[gIdx].note; sfx("tap"); }
  });
}

/* ---------- tabs ---------- */
function switchTab(name){ $$(".tabbar button").forEach(function(b){ b.classList.toggle("on",b.dataset.tab===name); });
  ["grow","garden","calendar","settings"].forEach(function(t){ var el=$("#tab-"+t); if(el) el.classList.toggle("hidden",t!==name); });
  if(name==="garden") renderGarden(); if(name==="calendar") renderCalendar(); if(name==="settings") renderSettings(); buzz(10); }
$$(".tabbar button").forEach(function(b){ b.addEventListener("click",function(){ sfx("tap"); switchTab(b.dataset.tab); }); });

/* ---------- Settings ---------- */
function renderSettings(){ var gn=$("#gardenName"); if(gn) gn.value=gardenName();
  var sp=$("#signPreview"); if(sp) sp.textContent=gardenName()||"Your sign";
  var ts=$("#testSoundSettings"); if(ts && !ts.dataset.done){ ts.dataset.done="1"; ts.addEventListener("click",function(){ sfx("fanfare"); buzz([20,40,20]); }); } }
function bindSettings(){
  var gn=$("#gardenName"); if(!gn) return;
  gn.addEventListener("input",function(){ var v=this.value.slice(0,6); this.value=v; localStorage.setItem("tc-garden-name",v); var sp=$("#signPreview"); if(sp) sp.textContent=v||"Your sign"; renderMindGarden(); });
  var mg=$("#mindGarden"); if(mg) mg.addEventListener("click",mindGardenClick);
}

/* ---------- Grow flow ---------- */
var mood=5;
function plantFor(m){ return P.plantForMood(m); }
function buildMoodGrid(){ var g=$("#moodGrid"); if(!g||g.children.length) return;
  for(var i=1;i<=10;i++){ (function(m){ var b=document.createElement("button"); b.type="button"; b.className="moodbtn"; b.textContent=m; b.addEventListener("click",function(){ mood=m; refreshMood(); sfx("tap"); buzz(10); }); g.appendChild(b); })(i); } }
function refreshMood(){
  $$("#moodGrid .moodbtn").forEach(function(b){ b.classList.toggle("sel", +b.textContent===mood); });
  $$(".tierchip").forEach(function(c){ c.classList.toggle("on", c.dataset.tier===P.plantForMood(mood)); });
  /* The person is NOT told tree / shrub / flower (or how many layers) until the session ends. */
  $("#moodPlant").textContent="Mood "+mood+" — answer a few prompts and grow something.";
  var br=$("#moodBranch");
  if(mood<=3){ br.classList.remove("hidden"); $("#moodBranchText").textContent="Rough day. Before you grow, want to look back at a good day first? It can help to remember one went well."; $("#toStep2").textContent="Grow anyway →"; }
  else { br.classList.add("hidden"); $("#toStep2").textContent="Next: pick a world →"; }
  /* Weed recalibration, live as the mood moves: low = more weeds, high = fewer. */
  dbAll().then(function(all){ var n=all.filter(function(p){ return p.date===todayStr(); }).length; setWeeds(P.weedsForMood(mood)-n); renderMindGarden(); }).catch(function(){});
}
$("#goodDaysBtn").addEventListener("click",function(){ switchTab("calendar"); renderGoodDays(); document.getElementById("goodDays").scrollIntoView({behavior:"smooth"}); });
async function renderGoodDays(){ var all=await dbAll(); var good=all.filter(function(p){ return p.mood>=7; }).sort(function(a,b){ return b.createdAt-a.createdAt; });
  var g=$("#goodDays"); g.innerHTML=""; $("#goodDaysEmpty").classList.toggle("hidden",good.length>0);
  good.slice(0,12).forEach(function(p){ var b=document.createElement("button"); b.className="btn secondary"; b.type="button"; b.style.margin="4px 4px 0 0"; b.textContent=speciesOf(p)+" · "+prettyDate(p.date)+" · mood "+p.mood; b.addEventListener("click",function(){ openPlant(p.id); }); g.appendChild(b); }); }
async function hasGoodDays(){ var all=await dbAll(); return all.some(function(p){ return p.mood>=7; }); }
/* mood is picked with the 10 tappable buttons (buildMoodGrid), no slider. */
function showStep(n){ [1,2,3].forEach(function(i){ $("#step"+i).classList.toggle("hidden",i!==n); $("#s"+i).classList.toggle("on",i<=n); }); $("#stepPreview").classList.add("hidden"); if(n!==3) stopSceneAnim(); }
function drawWorldThumbs(){ $$(".world").forEach(function(w){ var cv=w.querySelector("canvas"); if(!cv||cv.dataset.done) return; cv.dataset.done="1"; var wd=w.dataset.world; drawScene(cv,"tree",4,8,wd,false,P.speciesFor(5,wd),1.3); }); }
$("#toStep2").addEventListener("click",function(){ localStorage.setItem("tc-checkin-date",todayStr()); sfx("tap"); buzz(15); showStep(2); });
$("#backTo1").addEventListener("click",function(){ showStep(1); });
var selectedWorld=null;
$$(".world").forEach(function(w){ w.addEventListener("click",function(){ selectedWorld=w.dataset.world; $$(".world").forEach(function(o){o.classList.toggle("sel",o===w)}); sfx("tap"); buzz(15); }); });
var byoType="tree", byoColor=null;
function aAn(n){ return /^[aeiou]/i.test(n||"") ? "an" : "a"; }
function showPreview(){
  if(!selectedWorld){ alert("Pick a world first."); return; }
  var sp=P.speciesFor(mood,selectedWorld), pl=plantFor(mood);
  $("#step1").classList.add("hidden"); $("#step2").classList.add("hidden"); $("#step3").classList.add("hidden");
  $("#stepPreview").classList.remove("hidden"); $("#byoPanel").classList.add("hidden");
  $("#previewSpecies").textContent="You'll be growing "+aAn(sp)+" "+sp;
  $("#previewDest").textContent="Grows to "+P.ends[pl]+" · "+WORLD_LABEL[selectedWorld];
  drawScene($("#previewScene"),pl,8,8,selectedWorld,false,sp,1.3);
  buildByoColours(); renderByoPreview();
}
function buildByoColours(){ var box=$("#byoColours"); if(!box||box.children.length) return;
  var mk=function(c,label){ var b=document.createElement("button"); b.type="button"; b.title=label||c; b.style.background=c||"#eef2e4"; b.dataset.color=c||""; b.addEventListener("click",function(){ byoColor=c||null; $$("#byoColours button").forEach(function(o){o.classList.toggle("sel",o===b)}); renderByoPreview(); sfx("tap"); }); box.appendChild(b); };
  mk(null,"Natural");
  P.BYO_COLOURS.forEach(function(c){ mk(c); });
  var ci=document.createElement("input"); ci.type="color"; ci.value="#40916c"; ci.title="Any colour"; ci.addEventListener("input",function(){ byoColor=ci.value; $$("#byoColours button").forEach(function(o){o.classList.remove("sel")}); renderByoPreview(); }); box.appendChild(ci);
  var first=box.querySelector("button"); if(first) first.classList.add("sel"); }
function renderByoPreview(){ var t=($("#byoTopic").value||"").trim()||"your topic";
  var steps=P.byoSteps(byoType,t);
  $("#byoPreview").innerHTML="<b>"+P.byoSpeciesFor(byoType,selectedWorld)+"</b> · "+steps.length+" layers<br>"+steps.map(function(s,i){ return (i+1)+". "+s.q.replace(/</g,"&lt;"); }).join("<br>"); }
function startSession(byo){
  var pl, layers, sp;
  if(byo){ var topic=($("#byoTopic").value||"").trim(); if(!topic){ $("#byoTopic").focus(); alert("Type a topic first — e.g. work, family, friends."); return; }
    pl=byoType; layers=P.byoSteps(byoType,topic); sp=P.byoSpeciesFor(byoType,selectedWorld); }
  else { pl=plantFor(mood); layers=P.buildLayers(pl); sp=P.speciesFor(mood,selectedWorld); }
  session={ mood:mood, plant:pl, species:sp, world:selectedWorld, date:todayStr(), layers:layers, answers:[], usedFallbacks:[], createdAt:Date.now(), byo:!!byo, topic:byo?($("#byoTopic").value||"").trim():"", color:byo?byoColor:null };
  ynAnswer=null; audioBlob=null; $("#stepPreview").classList.add("hidden"); showStep(3); $("#doneCard").classList.add("hidden"); $("#promptCard").classList.remove("hidden");
  $("#worldChip").textContent=WORLD_LABEL[selectedWorld];
  renderPrompt(); drawScene($("#scene"),pl,0,layers.length,selectedWorld,false,sp,0,session.color); renderProgress(); sfx("grow"); buzz(20); startSceneAnim();
}
$("#toStep3").addEventListener("click",function(){ sfx("tap"); showPreview(); });
$("#backTo2").addEventListener("click",function(){ $("#stepPreview").classList.add("hidden"); showStep(2); });
$("#startGrow").addEventListener("click",function(){ startSession(false); });
$("#byoToggle").addEventListener("click",function(){ $("#byoPanel").classList.toggle("hidden"); sfx("tap"); });
$$(".typebtns button").forEach(function(b){ b.addEventListener("click",function(){ byoType=b.dataset.byoType; $$(".typebtns button").forEach(function(o){o.classList.toggle("sel",o===b)}); renderByoPreview(); sfx("tap"); }); });
$("#byoTopic").addEventListener("input",renderByoPreview);
$("#byoStart").addEventListener("click",function(){ startSession(true); });
function remarkFor(layer, answer){
  if(layer.kind!=="grounding") return "";
  if(layer.tag==="Both" || layer.tag===answer) return layer.remark;
  return "";
}
function nextFallback(){
  var pool=P.noFallbacks.filter(function(f){ return session.usedFallbacks.indexOf(f)===-1; });
  var f=pool.length?pool[Math.floor(Math.random()*pool.length)]:P.noFallbacks[Math.floor(Math.random()*P.noFallbacks.length)];
  session.usedFallbacks.push(f); return f;
}
function renderPrompt(){
  if(!session) return; var i=session.answers.length, layer=session.layers[i];
  if(!layer){ finishSession(); return; }
  $("#promptQ").textContent=layer.q;
  $("#kindChip").textContent= layer.kind==="grounding" ? "yes / no" : layer.kind==="short" ? "short answer" : "open-ended";
  $("#ynBox").classList.toggle("hidden",layer.kind!=="grounding");
  $("#textBox").classList.toggle("hidden",layer.kind==="grounding");
  ynAnswer=null; audioBlob=null; $("#answerText").value=""; $("#recPlay").classList.add("hidden"); $("#rerecord").classList.add("hidden"); $("#recStatus").textContent=""; $("#remarkLine").textContent="";
  $$("#ynBox button").forEach(function(b){ b.classList.remove("sel"); });
  renderProgress();
}
$$("#ynBox button").forEach(function(b){ b.addEventListener("click",function(){ ynAnswer=b.dataset.yn; $$("#ynBox button").forEach(function(o){o.classList.toggle("sel",o===b)}); sfx(ynAnswer==="Yes"?"yes":"no"); buzz(15);
  /* Remark AFTER the tap, as a reward — only when its tag fits the answer. Otherwise a gentle rotating line. */
  var layer=session.layers[session.answers.length]; if(!layer) return;
  var r=remarkFor(layer, ynAnswer);
  $("#remarkLine").textContent = r || (ynAnswer==="No" ? nextFallback() : "Thanks for your honest answer.");
}); });
$("#growBtn").addEventListener("click",function(){
  if(!session) return; var layer=session.layers[session.answers.length]; if(!layer) return;
  var text=layer.kind==="grounding" ? ynAnswer : $("#answerText").value.trim();
  if(layer.kind==="grounding" && !ynAnswer){ $("#growHint").textContent="Tap YES or NO first."; return; }
  if(layer.kind!=="grounding" && !text && !audioBlob){ $("#growHint").textContent="Type something, or record a voice note first."; return; }
  session.answers.push({kind:layer.kind,q:layer.q,a:text||"",audio:audioBlob});
  audioBlob=null; sfx("grow"); buzz([15,30,15]);
  var done=session.answers.length, total=session.layers.length;
  drawScene($("#scene"),session.plant,done,total,session.world,true,session.species,animTime,session.color); renderProgress();
  setTimeout(function(){ if(done>=total) finishSession(); else renderPrompt(); }, 260);
});
function feelButtons(buttons){
  var box=$("#feelButtons"); box.innerHTML="";
  buttons.forEach(function(b){ var btn=document.createElement("button"); btn.className="btn "+(b.cls||"secondary"); btn.type="button"; btn.textContent=b.label; btn.addEventListener("click",b.fn); box.appendChild(btn); });
}
function backToCloud(){ stopSceneAnim(); session=null; showStep(1); refreshMood(); renderMindGarden(); switchTab("grow"); }
function growAnotherPlant(){ stopSceneAnim(); session=null; showStep(1); refreshMood(); }
function maybeRandomEvent(totalPlants){
  /* After growing a few plants, a random event may leave a gift plant in the cloud garden. Max 2 per day. */
  if(totalPlants<3) return;
  var todaysGifts=getGifts().filter(function(g){ return g.date===todayStr(); });
  if(todaysGifts.length>=2) return;
  if(Math.random()>0.6) return;
  var gifts=getGifts(), recent=gifts.slice(-5).map(function(g){ return g.id; });
  var pool=P.randomEvents.filter(function(e){ return recent.indexOf(e.id)===-1; });
  if(!pool.length) pool=P.randomEvents;
  var ev=pool[Math.floor(Math.random()*pool.length)];
  gifts.push({id:ev.id, title:ev.title, note:ev.note, gift:ev.gift, date:todayStr()});
  localStorage.setItem("tc-gifts", JSON.stringify(gifts.slice(-10)));
  var gn=$("#giftNote"); if(gn) gn.textContent=ev.title+": "+ev.note;
}
async function finishSession(){
  stopSceneAnim();
  var p={ id:"p"+Date.now()+"_"+Math.floor(Math.random()*1e6), mood:session.mood, plant:session.plant, species:session.species, design:session.species, world:session.world, date:session.date, createdAt:session.createdAt, answers:session.answers, byo:!!session.byo, topic:session.topic||"", color:session.color||null };
  var allBefore=await dbAll();
  dbPut(p).then(function(){ sfx("fanfare"); buzz([30,50,30,50,80]);
    /* The finished plant replaces a weed on the cloud garden. */
    setWeeds(getWeeds()-1);
    maybeRandomEvent(allBefore.length+1);
    renderMindGarden();
    /* Congratulations: rotate the lines, and always name the plant grown. */
    var idx=0; try{ idx=+localStorage.getItem("tc-congrats-idx")||0; }catch(e){}
    var aAn=function(n){ return /^[aeiou]/i.test(n||"") ? "an" : "a"; };
    var line=P.congrats[idx%P.congrats.length].replace(/a \[plant\]/g, aAn(p.species)+" "+p.species).replace(/\[plant\]/g, p.species);
    try{ localStorage.setItem("tc-congrats-idx", String(idx+1)); }catch(e){}
    $("#promptCard").classList.add("hidden"); $("#doneCard").classList.remove("hidden");
    $("#doneTitle").textContent=p.species.toUpperCase()+" PLANTED!";
    $("#doneText").textContent=line+" From a stump to "+P.ends[p.plant]+". "+p.answers.length+" layers grown in "+WORLD_LABEL[p.world]+"."+(p.byo?" ★ Grown by you":"");
    /* Branches are shown immediately — only this plant's prompts + answers. */
    $("#doneBranches").innerHTML=branchesHTML(p);
    drawScene($("#scene"),p.plant,p.answers.length,p.answers.length,p.world,true,p.species,1.3,p.color); renderProgress();
    var fb=$("#feelBetter"); fb.classList.remove("hidden");
    if(p.mood>=7){
      $("#feelQuestion").textContent="Keep the ball rolling! Gather as many good memories as you can!";
      feelButtons([{label:"Grow another plant", cls:"", fn:growAnotherPlant},{label:"Back to cloud", cls:"secondary", fn:backToCloud}]);
    } else {
      $("#feelQuestion").textContent="Do you feel better?";
      feelButtons([
        {label:"Yes — I feel better", cls:"", fn:function(){ $("#feelQuestion").textContent="Let's go!! That's a win!"; feelButtons([{label:"Grow another plant", cls:"", fn:growAnotherPlant},{label:"Back to cloud", cls:"secondary", fn:backToCloud}]); sfx("fanfare"); }},
        {label:"No — not yet", cls:"secondary", fn:function(){ $("#feelQuestion").textContent="That's so real. Do you want to head back to your cloud, or keep growing another plant?";
          hasGoodDays().then(function(has){ var bs=[{label:"Back to cloud", cls:"secondary", fn:backToCloud},{label:"Grow another plant", cls:"", fn:growAnotherPlant}];
            if(has) bs.push({label:"Review your good days", cls:"secondary", fn:function(){ switchTab("calendar"); renderGoodDays(); document.getElementById("goodDays").scrollIntoView({behavior:"smooth"}); }});
            feelButtons(bs); }); }}
      ]);
    }
  }).catch(function(){ $("#growHint").textContent="Couldn't save this plant — storage is unavailable in this browser. Your answers are still on screen."; });
}
$("#seeGarden").addEventListener("click",function(){ backToCloud(); });
$("#growAnother").addEventListener("click",function(){ growAnotherPlant(); });

/* ---------- voice ---------- */
$("#recBtn").addEventListener("click",async function(){
  if(!window.isSecureContext){ $("#recStatus").textContent="Mic needs a secure page (HTTPS or localhost) — this page is not secure, so the browser blocks the mic. Typing is available, but voice will work once hosted on HTTPS."; return; }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){ $("#recStatus").textContent="Mic not supported in this browser — try Chrome / Safari on HTTPS. Typing is available for now."; return; }
  try{
    $("#recStatus").textContent="Mic: asking for permission — tap Allow when your browser asks.";
    recStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
    var mime=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg;codecs=opus",""].find(function(m){ try{ return !m||MediaRecorder.isTypeSupported(m); }catch(e){ return false; } });
    recChunks=[]; mediaRec=mime?new MediaRecorder(recStream,{mimeType:mime}):new MediaRecorder(recStream); recSecs=0; $("#recTimer").textContent="0:00";
    mediaRec.ondataavailable=function(e){ if(e.data.size) recChunks.push(e.data); };
    mediaRec.onerror=function(ev){ $("#recStatus").textContent="Mic error while recording: "+(ev.error&&ev.error.name||"unknown")+". Try again, or type instead."; };
    mediaRec.onstop=function(){ audioBlob=new Blob(recChunks,{type:mediaRec.mimeType||"audio/webm"}); var u=URL.createObjectURL(audioBlob); var pl=$("#recPlay"); pl.src=u; pl.classList.remove("hidden"); $("#rerecord").classList.remove("hidden"); $("#recStatus").textContent="Saved ("+Math.round(audioBlob.size/1024)+" KB) — play it back, or re-record."; if(recStream) recStream.getTracks().forEach(function(t){t.stop()}); };
    mediaRec.start(250); $("#recBtn").classList.add("hidden"); $("#stopRec").classList.remove("hidden"); $("#recStatus").textContent="Recording… speak now.";
    recTimer=setInterval(function(){ recSecs++; $("#recTimer").textContent=Math.floor(recSecs/60)+":"+String(recSecs%60).padStart(2,"0"); if(recSecs>=60) stopRec(); },1000);
    sfx("tap"); buzz(15);
  }catch(e){
    var msg="Mic blocked: "+(e&&e.name||"unknown");
    if(e&&e.name==="NotAllowedError") msg="Mic permission denied — tap the mic/lock icon in your browser address bar, allow the mic, then tap Record again. Typing is available for now.";
    else if(e&&e.name==="NotFoundError") msg="No microphone found on this device — check a headset / mic is connected, then try again.";
    else if(e&&e.name==="NotReadableError") msg="Mic is busy in another app/tab — close that, then try again.";
    else if(e&&e.name==="SecurityError") msg="Mic blocked for security — voice needs HTTPS. Typing is available for now.";
    $("#recStatus").textContent=msg;
  }
});
function stopRec(){ clearInterval(recTimer); if(mediaRec&&mediaRec.state!=="inactive") mediaRec.stop(); $("#recBtn").classList.remove("hidden"); $("#stopRec").classList.add("hidden"); }
$("#stopRec").addEventListener("click",stopRec);
$("#rerecord").addEventListener("click",function(){ audioBlob=null; $("#recPlay").classList.add("hidden"); $("#rerecord").classList.add("hidden"); $("#recBtn").click(); });

/* ---------- Garden (today only) ---------- */
var gardenFilter="all";
function plantCard(p){
  var d=document.createElement("button"); d.className="plantcard"; d.type="button";
  d.innerHTML='<canvas width="220" height="110"></canvas><div class="ground"></div><b>'+speciesOf(p)+(p.byo?" ★":"")+'</b><span>Mood '+p.mood+' · '+p.answers.length+' layers · '+WORLD_LABEL[p.world]+'</span>';
  d.addEventListener("click",function(){ openPlant(p.id); });
  setTimeout(function(){ drawScene(d.querySelector("canvas"),p.plant,p.answers.length,p.answers.length,p.world,false,speciesOf(p),1.3,p.color); },0);
  return d;
}
$$("#gardenFilters button").forEach(function(b){ b.addEventListener("click",function(){ gardenFilter=b.dataset.filter; $$("#gardenFilters button").forEach(function(o){o.classList.toggle("on",o===b)}); renderGarden(); sfx("tap"); }); });
function renderGarden(){ dbAll().then(function(all){
  var todays=all.filter(function(p){return p.date===todayStr()}).sort(function(a,b){return b.createdAt-a.createdAt});
  if(gardenFilter!=="all") todays=todays.filter(function(p){ return p.world===gardenFilter; });
  var g=$("#gardenGrid"); g.innerHTML=""; todays.forEach(function(p){ g.appendChild(plantCard(p)); });
  $("#gardenEmpty").classList.toggle("hidden",todays.length>0);
  $("#plantDetail").classList.add("hidden");
}); }
$("#backGarden").addEventListener("click",function(){ renderGarden(); });
$("#deletePlant").addEventListener("click",function(){
  var id=$("#deletePlant").dataset.id; if(!id) return;
  if(confirm("Delete this plant?")){ dbDel(id).then(function(){ renderGarden(); renderCalendar(); renderMindGarden(); }); }
});
function branchesHTML(p){
  return p.answers.map(function(a,i){
    var aud=a.audio? '<audio controls src="'+URL.createObjectURL(a.audio)+'"></audio>' : "";
    var txt=a.a? '<div class="a">'+a.a.replace(/</g,"&lt;")+'</div>' : (a.audio? "" : "");
    return '<div class="branch"><div class="q">'+(i+1)+'. '+a.q.replace(/</g,"&lt;")+'</div>'+txt+aud+'</div>';
  }).join("");
}
function openPlant(id){ dbAll().then(function(all){ var p=all.find(function(o){return o.id===id}); if(!p) return;
  $("#gardenGrid").innerHTML=""; $("#gardenEmpty").classList.add("hidden"); $("#plantDetail").classList.remove("hidden");
  drawScene($("#detailScene"),p.plant,p.answers.length,p.answers.length,p.world,false,speciesOf(p),1.3,p.color);
  $("#detailChips").innerHTML='<span class="chip">'+speciesOf(p)+'</span><span class="chip">'+P.plantLabel[p.plant]+'</span><span class="chip">'+WORLD_LABEL[p.world]+'</span><span class="chip">Mood '+p.mood+'</span><span class="chip">'+prettyDate(p.date)+'</span><span class="chip">to '+P.ends[p.plant]+'</span>'+(p.byo?'<span class="chip">★ Grown by you'+(p.topic?' · '+p.topic.replace(/</g,"&lt;"):"")+'</span>':"");
  $("#detailBranches").innerHTML=branchesHTML(p);
  $("#deletePlant").dataset.id=p.id; sfx("tap"); buzz(10);
  if($("#tab-calendar").classList.contains("hidden")===false){ switchTab("garden"); }
}); }

/* ---------- Calendar ---------- */
function renderCalendar(){ dbAll().then(function(all){
  var y=calCursor.getFullYear(), m=calCursor.getMonth();
  $("#calTitle").textContent=calCursor.toLocaleString("en",{month:"long",year:"numeric"});
  var first=new Date(y,m,1), startDow=(first.getDay()+6)%7, days=new Date(y,m+1,0).getDate();
  var g=$("#calGrid"); g.innerHTML="";
  ["M","T","W","T","F","S","S"].forEach(function(d){ var h=document.createElement("div"); h.className="hd"; h.textContent=d; g.appendChild(h); });
  for(var i=0;i<startDow;i++){ var e=document.createElement("div"); e.className="empty"; g.appendChild(e); }
  for(var d=1;d<=days;d++){ (function(day){
    var ds=dstr(new Date(y,m,day)), ps=all.filter(function(p){return p.date===ds});
    var c=document.createElement("div"); c.textContent=day;
    if(ds===todayStr()) c.classList.add("today");
    if(ps.length){ var av=dayMood(ps);
      /* Snapshot of that day's actual garden — a small picture of its real plants on the cloud(s). */
      var snap=document.createElement("canvas"); snap.width=220; snap.height=90; c.appendChild(snap);
      setTimeout(function(){ drawDaySnapshot(snap,ps); },0);
      var n=document.createElement("span"); n.className="n"; n.textContent=ps.length+" plant"+(ps.length>1?"s":"")+" · "+(av<=3?"rough":av<=6?"middling":"good"); c.appendChild(n);
      c.addEventListener("click",function(){ showDay(ds,ps); });
    }
    g.appendChild(c);
  })(d); }
});
}
function drawDaySnapshot(cv, ps){
  var x=cv.getContext("2d"); if(!x) return; var W=cv.width, H=cv.height;
  var av=dayMood(ps);
  x.fillStyle=av<=3?"#5b7a8c":av<=6?"#7fb3c8":"#a8d8ea"; x.fillRect(0,0,W,H);
  if(av<=3){ x.fillStyle="#8fa8bb"; for(var i=0;i<8;i++) x.fillRect((i*29)%W,10+(i*7)%20,2,7); }
  else { x.fillStyle="#fff3b0"; x.fillRect(W-30,6,18,18); }
  var perRow=6, rows=Math.max(1,Math.ceil(Math.min(ps.length,12)/perRow));
  for(var r=0;r<rows;r++){ var gy=34+r*40;
    x.fillStyle="#fff"; x.fillRect(4,gy+8,W-8,12);
    for(var i=0;i<perRow;i++){ var idx=r*perRow+i; if(idx>=ps.length||idx>=12) break;
      var p=ps[idx], cx=22+i*36, pr=P.profileFor(speciesOf(p), p.color);
      x.fillStyle=pr.trunk; x.fillRect(cx-2,gy-8,4,16);
      x.fillStyle=pr.leaf; x.fillRect(cx-9,gy-18,18,12); x.fillStyle=pr.leaf2; x.fillRect(cx-5,gy-15,10,5); } }
}
function showDay(ds,ps){ $("#dayDetail").classList.remove("hidden");
  var av=dayMood(ps); $("#dayTitle").textContent=prettyDate(ds)+" — "+(av<=3?"a rough day":av<=6?"a middling day":"a good day")+" ("+ps.length+" plant"+(ps.length>1?"s":"")+")";
  var box=$("#dayPlants"); box.innerHTML=""; ps.forEach(function(p){ box.appendChild(plantCard(p)); });
  sfx("tap"); }
$("#prevMonth").addEventListener("click",function(){ calCursor.setMonth(calCursor.getMonth()-1); renderCalendar(); });
$("#nextMonth").addEventListener("click",function(){ calCursor.setMonth(calCursor.getMonth()+1); renderCalendar(); });
/* ---------- Backup: export / import ---------- */
function download(name,text){ var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:"application/json"})); a.download=name; a.click(); }
function blobToB64(b){ return new Promise(function(res){ var r=new FileReader(); r.onload=function(){res(r.result)}; r.readAsDataURL(b); }); }
async function doExport(withVoice){ var all=await dbAll();
  var plants=JSON.parse(JSON.stringify(all.map(function(p){ var c=Object.assign({},p); c.answers=p.answers.map(function(a){ return {kind:a.kind,q:a.q,a:a.a}; }); return c; })));
  if(withVoice){ for(var i=0;i<all.length;i++){ for(var j=0;j<all[i].answers.length;j++){ var au=all[i].answers[j].audio; if(au){ plants[i].answers[j].audioData=await blobToB64(au); plants[i].answers[j].audioType=au.type; } } } }
  download("tree-cloud-backup-"+todayStr()+(withVoice?"-with-voice":"-text")+".json", JSON.stringify({app:"tree-cloud",version:2,exported:todayStr(),plants:plants},null,2));
  $("#backupStatus").textContent="Backup saved — "+(withVoice?"voice notes included":"text only")+"."; sfx("fanfare"); }
$("#exportText").addEventListener("click",function(){ doExport(false); });
$("#exportVoice").addEventListener("click",function(){ doExport(true); });
$("#importFile").addEventListener("change",async function(){
  var f=this.files[0]; if(!f) return;
  try{ var data=JSON.parse(await f.text()); var plants=data.plants||data; if(!Array.isArray(plants)) throw new Error("no plants");
    var count=0;
    for(var i=0;i<plants.length;i++){ var p=plants[i]; if(!p.id||!Array.isArray(p.answers)) continue;
      if(!p.species) p.species=P.speciesFor(p.mood,p.world);
      for(var j=0;j<p.answers.length;j++){ var a=p.answers[j]; if(a.audioData){ var res=await fetch(a.audioData); a.audio=await res.blob(); delete a.audioData; } }
      await dbPut(p); count++; }
    $("#backupStatus").textContent="Import done — "+count+" plant"+(count===1?"":"s")+" restored."; sfx("fanfare"); renderGarden(); renderCalendar(); renderMindGarden();
  }catch(e){ $("#backupStatus").textContent="Import failed — that file is not a Tree Cloud backup."; }
  this.value="";
});

/* ---------- Monthly: back up last month, or delete it ---------- */
function prevMonthStr(){ var d=new Date(); d.setDate(1); d.setMonth(d.getMonth()-1); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0"); }
function monthName(s){ var p=s.split("-"); return ["January","February","March","April","May","June","July","August","September","October","November","December"][+p[1]-1]+" "+p[0]; }
async function exportMonth(month,withVoice){ var all=(await dbAll()).filter(function(p){ return p.date.slice(0,7)===month; });
  var plants=JSON.parse(JSON.stringify(all.map(function(p){ var c=Object.assign({},p); c.answers=p.answers.map(function(a){ return {kind:a.kind,q:a.q,a:a.a}; }); return c; })));
  if(withVoice){ for(var i=0;i<all.length;i++){ for(var j=0;j<all[i].answers.length;j++){ var au=all[i].answers[j].audio; if(au){ plants[i].answers[j].audioData=await blobToB64(au); plants[i].answers[j].audioType=au.type; } } } }
  download("tree-cloud-backup-"+month+(withVoice?"-with-voice":"-text")+".json", JSON.stringify({app:"tree-cloud",version:2,exported:todayStr(),month:month,plants:plants},null,2));
  return all.length; }
async function monthlyCheck(){ var now=new Date(), cur=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0"), last=prevMonthStr();
  if(localStorage.getItem("tc-monthly-prompt")===cur) return;
  var all=await dbAll(), prev=all.filter(function(p){ return p.date.slice(0,7)===last; });
  if(!prev.length) return;
  $("#monthlyTitle").textContent=monthName(last)+" is done — back it up, or let it go?";
  $("#monthlyText").textContent=prev.length+" plant"+(prev.length===1?"":"s")+" from "+monthName(last)+". Backing up downloads a file you can keep. Deleting removes those plants from this device and can't be undone.";
  $("#monthlyCard").classList.remove("hidden");
  var done=function(msg){ localStorage.setItem("tc-monthly-prompt",cur); $("#monthlyStatus").textContent=msg; };
  $("#monthlyExportText").onclick=function(){ exportMonth(last,false).then(function(n){ done("Backed up "+n+" plant"+(n===1?"":"s")+" from "+monthName(last)+" — text only."); sfx("fanfare"); }); };
  $("#monthlyExportVoice").onclick=function(){ exportMonth(last,true).then(function(n){ done("Backed up "+n+" plant"+(n===1?"":"s")+" from "+monthName(last)+" — with voice."); sfx("fanfare"); }); };
  $("#monthlyDelete").onclick=function(){ var b=$("#monthlyDelete"); if(b.dataset.armed){ Promise.all(prev.map(function(p){ return dbDel(p.id); })).then(function(){ done("Deleted "+prev.length+" plant"+(prev.length===1?"":"s")+" from "+monthName(last)+"."); $("#monthlyCard").classList.add("hidden"); renderGarden(); renderCalendar(); }); } else { b.dataset.armed="1"; b.textContent="Tap again to delete — can't be undone"; } };
  $("#monthlyKeep").onclick=function(){ done("Kept for now — I'll ask again next month."); $("#monthlyCard").classList.add("hidden"); };
}

/* ---------- Reminders (local only) ---------- */
function showCheckinNotif(){ var msg="How are you feeling right now?";
  if("serviceWorker" in navigator && navigator.serviceWorker.controller){ navigator.serviceWorker.ready.then(function(reg){ reg.showNotification("Tree Cloud — "+msg,{body:"Tap to check in. Rough day? We'll show your good days first. Good day? Plant a flower.",tag:"tc-checkin",icon:"icons/icon-192.png"}); }); }
  else if("Notification" in window && Notification.permission==="granted"){ new Notification("Tree Cloud — "+msg,{body:"Tap to check in."}); }
  $("#remindStatus").textContent="Nudge sent — how are you feeling right now?"; }
function nextReminderMs(){ var t=(localStorage.getItem("tc-remind-time")||"19:00").split(":"); var d=new Date(); d.setHours(+t[0],+t[1],0,0); if(d<=new Date()) d.setDate(d.getDate()+1); return d-Date.now(); }
function scheduleReminder(){ if(localStorage.getItem("tc-remind")!=="on") return; setTimeout(function(){ showCheckinNotif(); scheduleReminder(); }, nextReminderMs()); }
$("#enableRemind").addEventListener("click",async function(){
  if(!("Notification" in window)){ $("#remindStatus").textContent="Notifications aren't supported in this browser."; return; }
  var perm=await Notification.requestPermission();
  if(perm!=="granted"){ $("#remindStatus").textContent="Notifications blocked — allow them in your browser / phone settings, then try again."; return; }
  localStorage.setItem("tc-remind","on"); localStorage.setItem("tc-remind-time",$("#remindTime").value||"19:00");
  $("#remindStatus").textContent="Reminders on at "+$("#remindTime").value+" — I'll nudge you when the app is open / installed. Also set a phone alarm as backup, it always works."; scheduleReminder(); });
var _tr=$("#testRemind"); if(_tr) _tr.addEventListener("click",function(){ if("Notification" in window && Notification.permission!=="granted"){ Notification.requestPermission().then(function(){ showCheckinNotif(); }); } else showCheckinNotif(); });
$("#disableRemind").addEventListener("click",function(){ localStorage.setItem("tc-remind","off"); $("#remindStatus").textContent="Reminders off."; });
$("#remindTime").addEventListener("change",function(){ localStorage.setItem("tc-remind-time",this.value); if(localStorage.getItem("tc-remind")==="on") scheduleReminder(); });
function checkReminderOnOpen(){
  if(localStorage.getItem("tc-remind")!=="on") return;
  var t=(localStorage.getItem("tc-remind-time")||"19:00").split(":"); var now=new Date(); var rem=new Date(); rem.setHours(+t[0],+t[1],0,0);
  if(now>=rem && localStorage.getItem("tc-checkin-date")!==todayStr()){ $("#moodBranch").classList.remove("hidden"); $("#moodBranchText").textContent="Reminder: how are you feeling right now? Check in above — rough days go to your good days first."; }
  if(new URLSearchParams(location.search).get("checkin")){ switchTab("grow"); showStep(1); } }

/* ---------- floating scroll button: one small button, down when at top, up when at bottom ---------- */
function initScrollBtn(){
  var b=document.createElement("button"); b.id="scrollBtn"; b.type="button"; b.setAttribute("aria-label","Scroll page");
  b.textContent="↓"; b.style.cssText="position:fixed;right:12px;bottom:84px;width:40px;height:40px;border-radius:50%;border:none;background:var(--card,#fdfcf3);color:var(--ink,#1a2416);box-shadow:0 2px 10px rgba(26,36,22,.25);font-size:18px;font-weight:800;cursor:pointer;z-index:20;";
  document.body.appendChild(b);
  var update=function(){ var nearBottom=window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-120; b.textContent=nearBottom?"↑":"↓"; };
  window.addEventListener("scroll",update,{passive:true}); update();
  b.addEventListener("click",function(){ var nearBottom=window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-120;
    if(nearBottom) window.scrollTo({top:0,behavior:"smooth"}); else window.scrollBy({top:Math.round(window.innerHeight*0.7),behavior:"smooth"}); sfx("tap"); });
}

/* ---------- init ---------- */
bindSoundControls(); bindSettings(); buildMoodGrid(); drawWorldThumbs(); initScrollBtn();
openDB().then(function(){ refreshMood(); renderGarden(); renderCalendar(); renderGoodDays(); renderMindGarden(); monthlyCheck(); if(localStorage.getItem("tc-remind-time")) $("#remindTime").value=localStorage.getItem("tc-remind-time"); scheduleReminder(); checkReminderOnOpen(); }).catch(function(){ document.body.insertAdjacentHTML("beforeend","<p style='color:#fff;padding:10px'>Storage unavailable in this browser — Tree Cloud needs IndexedDB.</p>"); });
})();

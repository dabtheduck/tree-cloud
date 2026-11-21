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
/* Desert sound — EXACTLY the mockup (dab, 2026-11-19 23:13, restored 23:40 after the 23:38 rustle change was cancelled):
   Desert B+C — warm muted pluck (low damped triangle ~196 Hz + sine sub, no ring) layered with a gentle
   dry leaf crinkle (bandpass noise, slow swell, no sharp snaps). No clicks, no thocks, no bells.
   Desert plays B+C ONLY (not the default Muted Pixel Rain notes). Rivers & Valleys = default only.
   Outer Space = default + twinkly blips. Everything muted, soothing, uplifting, never annoying. */
function desertPluck(t0,f){ tone(f||196,t0,.35,.06,"triangle"); tone((f||196)/2,t0,.4,.04,"sine"); }
function desertCrinkle(t0,d,vol){ if(!soundOn) return; var c=ac(); if(!c) return; var len=Math.floor(c.sampleRate*(d+0.05)); var b=c.createBuffer(1,len,c.sampleRate); var ch=b.getChannelData(0); for(var i=0;i<len;i++) ch[i]=Math.random()*2-1; var s=c.createBufferSource(); s.buffer=b; var f=c.createBiquadFilter(); f.type="bandpass"; f.frequency.value=1400; f.Q.value=0.8; var g=c.createGain(); g.gain.setValueAtTime(0.0001,c.currentTime+t0); g.gain.linearRampToValueAtTime(vol,c.currentTime+t0+0.25); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t0+d); s.connect(f); f.connect(g); g.connect(c.destination); s.start(c.currentTime+t0); s.stop(c.currentTime+t0+d+0.05); }
function desertSfx(name,climb){ if(name==="tap"){ desertPluck(0); desertCrinkle(0,.18,.03); }
  else if(name==="yes"){ desertPluck(0); desertCrinkle(0,.45,.035); }
  else if(name==="grow"){ desertPluck(0,196*climb); desertPluck(.25,220*climb); desertCrinkle(0,.6,.04); desertCrinkle(.25,.5,.03); }
  else if(name==="fanfare"){ desertPluck(0); desertPluck(.2,220); desertPluck(.4,262); desertCrinkle(0,1.0,.035); desertCrinkle(.4,.8,.03); } }
function sfx(name){ if(!soundOn) return;
  var pr=PRESETS[soundPreset]||PRESETS.mutedpixel;
  var layer=(session&&session.answers)?session.answers.length:0, climb=1+layer*0.04, jit=0.97+Math.random()*0.06;
  var world=(session&&session.world)||(typeof selectedWorld!=="undefined"?selectedWorld:null);
  /* Routing — mockup exactly: Desert = B+C only; Rivers & Valleys = default only; Outer Space = default + twinkly blips. */
  if(world==="desert"&&(name==="tap"||name==="yes"||name==="grow"||name==="fanfare")){ desertSfx(name,climb); return; }
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
/* ---------- fluffy pixel clouds, weeds, sign, scaled plants (mockup style) ---------- */
/* A chunky pixel circle: horizontal slices, so clouds and suns look hand-placed, not vector-smooth. */
function pxCircle(x, cx, cy, r, fill){
  x.fillStyle=fill;
  for(var dy=-r; dy<=r; dy+=3){
    var w=Math.floor(Math.sqrt(Math.max(0, r*r-dy*dy)))*2;
    if(w>0) x.fillRect(cx-w/2, cy+dy, w, 3);
  }
}
/* PUFFY pixel clouds — the fix for the rectangular home cloud (dab, 2026-11-19 23:35):
   The mockup's own code draws islands/sky as fillRects, so porting it cannot fix the
   rectangles dab saw on their phone (flat blue, hard white rectangles, brown cross weed).
   Clouds here are built from overlapping pxCircle puffs — round on every edge, never a
   rectangle — with a pale underside. Same helper is used for islands, drift clouds,
   day snapshots and the sun, so every cloud in the app reads puffy. */
function drawPuffyCloud(x, cx, cy, w, fill, under){
  fill = fill || "#ffffff"; under = under || "#dfeef5";
  /* pale underside first, slightly lower, so the white puffs sit on it */
  pxCircle(x, cx-w*0.22, cy+w*0.10, Math.round(w*0.15), under);
  pxCircle(x, cx+w*0.10, cy+w*0.12, Math.round(w*0.17), under);
  pxCircle(x, cx+w*0.30, cy+w*0.08, Math.round(w*0.12), under);
  /* main body: a low wide puff row, then domed puffs on top — no straight edges left */
  pxCircle(x, cx-w*0.30, cy+w*0.02, Math.round(w*0.13), fill);
  pxCircle(x, cx-w*0.10, cy+w*0.04, Math.round(w*0.16), fill);
  pxCircle(x, cx+w*0.12, cy+w*0.04, Math.round(w*0.16), fill);
  pxCircle(x, cx+w*0.30, cy+w*0.02, Math.round(w*0.12), fill);
  pxCircle(x, cx-w*0.22, cy-w*0.06, Math.round(w*0.14), fill);
  pxCircle(x, cx, cy-w*0.10, Math.round(w*0.18), fill);
  pxCircle(x, cx+w*0.22, cy-w*0.05, Math.round(w*0.13), fill);
  /* no fillRect seam here: the overlapping puffs already cover the middle, and a
     wide white rect inside the cloud would read as a slab again */
}
/* A small drifting cloud in the sky: overlapping puffs, white with a pale underside. */
function drawDriftCloud(x, cx, cy, w){
  drawPuffyCloud(x, cx, cy, w, "#ffffff", "#dfeef5");
}
/* Rounded-rect helper — the mockup draws almost everything with RR (3px corners). */
function RR(x, X, Y, W, H, fill){
  x.fillStyle=fill;
  if(typeof x.roundRect==="function"){ x.beginPath(); x.roundRect(X,Y,W,H,3); x.fill(); }
  else x.fillRect(X,Y,W,H);
}

/* Chunky pixel sky (dab, 2026-11-19 23:56: "i really like the chunky pixel charm"):
   NO smooth vector gradient — the sky stays stepped pixel bands, just FINER than the
   old 10 fat bands that looked like flat slabs on the phone. 48 thin bands keep the
   blocky pixel charm while the colour shifts gradually. */
function skyGradient(x, W, H, topC, horC){
  var bands=48;
  for(var band=0; band<bands; band++){ x.fillStyle=lerpColor(topC, horC, band/(bands-1)); x.fillRect(0, Math.floor(band*H/bands), W, Math.ceil(H/bands)+1); }
}
function lerpColor(a,b,t){
  var pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
  var r=Math.round(((pa>>16)&255)+(((pb>>16)&255)-((pa>>16)&255))*t);
  var g=Math.round(((pa>>8)&255)+(((pb>>8)&255)-((pa>>8)&255))*t);
  var bl=Math.round((pa&255)+((pb&255)-(pa&255))*t);
  return "rgb("+r+","+g+","+bl+")";
}
function mulberry32(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
/* A cloud island, puffy — NOT the mockup's 4 fillRects (that is what read as hard white
   rectangles on dab's phone). Domed puffs on top, a solid white body, a pale-blue
   underside made of puffs, and a small dangling puff underneath. */
function drawCloudIsland(x, cx, cy, w){
  drawPuffyCloud(x, cx, cy+2, w, "#ffffff", "#e6f0f7");
  /* underside shading: pale puffs along the bottom edge, no straight band */
  pxCircle(x, cx-w*0.28, cy+16, Math.round(w*0.07), "#e6f0f7");
  pxCircle(x, cx, cy+18, Math.round(w*0.08), "#e6f0f7");
  pxCircle(x, cx+w*0.28, cy+16, Math.round(w*0.07), "#e6f0f7");
  pxCircle(x, cx-14, cy+32, 12, "#dbe9f2");
  pxCircle(x, cx+12, cy+34, 9, "#dbe9f2");
}
/* A dry dead weed: ONE bent stalk, never a cross. The old version had horizontal
   twigs crossing the vertical stalk, which read as a brown cross on dab's phone.
   Now the stalk bends in a staircase (segments leaning one way), with two short
   twigs that angle UPWARD along the stalk — no horizontal bars, no crossing.
   Thin brown/tan brittle stalks, leafless, NO green. */
function drawWeed(x, wx, base, seed){
  var lean=(seed%2)?1:-1;
  x.fillStyle="#7a5c2e";
  /* bent stalk: 4 segments, each offset a little further in the lean direction */
  x.fillRect(wx, base-8, 4, 8);
  x.fillRect(wx+lean*2, base-15, 4, 8);
  x.fillRect(wx+lean*4, base-22, 4, 8);
  x.fillRect(wx+lean*6, base-28, 4, 7);
  /* dry tip, bent over */
  x.fillStyle="#8a6d3b"; x.fillRect(wx+lean*8, base-31, 5, 4);
  /* two upward-angled side twigs (diagonal steps, never horizontal) */
  x.fillStyle="#a0824d";
  x.fillRect(wx+lean*2+4, base-20, 4, 3); x.fillRect(wx+lean*2+7, base-23, 4, 3);
  x.fillStyle="#6b4f2a";
  x.fillRect(wx+lean*4-7, base-14, 4, 3); x.fillRect(wx+lean*4-10, base-17, 4, 3);
  /* roots at the base: two short stepped stubs, never one long horizontal bar */
  x.fillStyle="#8a6d3b"; x.fillRect(wx-2, base-3, 5, 3); x.fillRect(wx+5, base-2, 4, 2); /* gap between stubs: no long horizontal run */
}
/* Wooden sign board on two posts: rounded board (6px corners, wood grain, nail dots),
   posts visible BELOW the board down to the island, name only (max 6 chars),
   blank = no sign. First plant is kept clear of it by the slot layout. */
function drawSign(x, name, groundY){
  if(!name) return;
  var signCx=54, signBy=groundY-48;
  x.font="bold 11px monospace";
  var tw=0; try{ tw=x.measureText(name).width; }catch(e){ tw=name.length*7; }
  var signBw=Math.min(100, Math.max(78, Math.ceil(tw)+24));
  var signBx=signCx-signBw/2;
  /* posts first, behind the board, down to the island top */
  x.fillStyle="#6b4226";
  x.fillRect(signCx-23, signBy+22, 4, 26);
  x.fillRect(signCx+19, signBy+22, 4, 26);
  /* chunky pixel board: the RR helper's 3px corners, not a smooth roundRect */
  RR(x, signBx, signBy, signBw, 28, "#a9743f");
  /* wood grain + top highlight + bottom shade */
  x.fillStyle="#c89b6a"; x.fillRect(signBx+4, signBy+3, signBw-8, 3);
  x.fillStyle="#8a5a2e"; x.fillRect(signBx+4, signBy+12, signBw-8, 2);
  x.fillStyle="#7a4e2a"; x.fillRect(signBx+4, signBy+24, signBw-8, 2);
  /* nail dots at the corners */
  x.fillStyle="#3d2712"; x.fillRect(signBx+5, signBy+6, 2, 2); x.fillRect(signBx+signBw-7, signBy+6, 2, 2);
  x.fillRect(signBx+5, signBy+20, 2, 2); x.fillRect(signBx+signBw-7, signBy+20, 2, 2);
  x.fillStyle="#3d2712"; x.font="bold 11px monospace"; x.textAlign="center";
  try{ x.fillText(name, signCx, signBy+18); }catch(e){}
  x.textAlign="left";
}
/* Simplified mini plants for the cloud garden, as the mockup draws them — NOT the full plant
   drawings. One small silhouette per shape family, with sparkles on the newest plant. */
function drawMiniPlant(x, cx, gy, species, color, isNewest){
  var pr=P.profileFor(species, color);
  var leaf=pr.leaf, leaf2=pr.leaf2, trunk=pr.trunk, accent=pr.accent||leaf2;
  var shape=pr.shape;
  if(shape==="palm"){
    x.fillStyle=trunk; x.fillRect(cx-2, gy-30, 5, 30);
    x.fillStyle=leaf;
    x.fillRect(cx-16, gy-36, 16, 4); x.fillRect(cx, gy-38, 16, 4); x.fillRect(cx-12, gy-40, 24, 4);
  } else if(shape==="pine"){
    x.fillStyle=trunk; x.fillRect(cx-2, gy-14, 5, 14);
    x.fillStyle=leaf;
    x.fillRect(cx-17, gy-26, 34, 12); x.fillRect(cx-12, gy-38, 24, 12); x.fillRect(cx-7, gy-49, 14, 11);
  } else if(shape==="willow"){
    x.fillStyle=trunk; x.fillRect(cx-3, gy-30, 6, 30);
    x.fillStyle=leaf; x.fillRect(cx-18, gy-44, 36, 14);
    x.fillStyle=leaf2;
    for(var s=0;s<4;s++){ x.fillRect(cx-14+s*8, gy-34, 3, 22); }
  } else if(shape==="joshua"){
    x.fillStyle=trunk;
    x.fillRect(cx-2, gy-28, 5, 28);
    x.fillRect(cx-14, gy-22, 5, 12); x.fillRect(cx+9, gy-24, 5, 12);
    x.fillStyle=leaf;
    x.fillRect(cx-18, gy-30, 12, 8); x.fillRect(cx+6, gy-32, 12, 8); x.fillRect(cx-6, gy-38, 12, 8);
  } else if(shape==="pads"){
    x.fillStyle=leaf;
    x.fillRect(cx-8, gy-24, 16, 24);
    x.fillRect(cx-14, gy-16, 10, 14); x.fillRect(cx+4, gy-18, 10, 14);
    x.fillStyle="#ffffff";
    x.fillRect(cx-4, gy-18, 2, 2); x.fillRect(cx+3, gy-12, 2, 2);
  } else if(shape==="barrel"){
    x.fillStyle=leaf; x.fillRect(cx-14, gy-26, 28, 26);
    x.fillStyle=leaf2; x.fillRect(cx-14, gy-26, 28, 4);
    x.fillStyle=accent; x.fillRect(cx-6, gy-32, 12, 6);
  } else if(shape==="bamboo"){
    x.fillStyle=trunk; x.fillRect(cx-3, gy-52, 6, 52);
    x.fillStyle=leaf2;
    for(var b=0;b<4;b++){ x.fillRect(cx-4, gy-14-b*12, 8, 3); }
    x.fillStyle=leaf; x.fillRect(cx-12, gy-56, 24, 5);
  } else if(shape==="rosette"){
    x.fillStyle=leaf;
    x.fillRect(cx-14, gy-12, 28, 8); x.fillRect(cx-10, gy-18, 20, 8); x.fillRect(cx-5, gy-23, 10, 8);
    x.fillStyle=leaf2; x.fillRect(cx-4, gy-16, 8, 8);
  } else if(shape==="fern"){
    x.fillStyle=leaf;
    x.fillRect(cx-16, gy-30, 5, 26); x.fillRect(cx-3, gy-36, 5, 32); x.fillRect(cx+11, gy-30, 5, 26);
    x.fillStyle=leaf2; x.fillRect(cx-8, gy-22, 16, 5);
  } else if(shape==="rose"){
    x.fillStyle=trunk; x.fillRect(cx-2, gy-30, 4, 30);
    x.fillStyle=accent; x.fillRect(cx-11, gy-40, 22, 22);
    x.fillStyle="#6e4a1e"; x.fillRect(cx-4, gy-33, 8, 8);
  } else if(shape==="sage"||shape==="bush"){
    x.fillStyle=leaf; x.fillRect(cx-19, gy-21, 38, 21);
    x.fillStyle=leaf2; x.fillRect(cx-12, gy-17, 24, 10);
    x.fillStyle=accent; x.fillRect(cx-14, gy-24, 3, 3); x.fillRect(cx+10, gy-24, 3, 3);
  } else { /* tree: oak, mesquite, birch */
    x.fillStyle=trunk; x.fillRect(cx-3, gy-27, 6, 27);
    x.fillStyle=leaf; x.fillRect(cx-20, gy-59, 40, 32);
    x.fillStyle=leaf2; x.fillRect(cx-13, gy-52, 26, 13);
  }
  if(isNewest){
    x.fillStyle="#ffd94d"; x.fillRect(cx-24, gy-74, 3, 3); x.fillRect(cx+15, gy-80, 3, 3);
    x.fillStyle="#ffffff"; x.fillRect(cx+21, gy-64, 3, 3);
  }
}
/* Draw a plant at a scale that actually fits the canvas — the exact silhouette, just smaller,
   so plants are never clipped off the top of a card, thumbnail or preview. Returns the scale used. */
function drawScaledPlant(x, cx, base, h, prog, type, species, t, color){
  var avail=base-8;                 /* room above the base line */
  var total=h+56;                   /* canopy overhang above the trunk top */
  var s=Math.min(1, avail/total);
  if(!(s>0)) s=0.2;
  x.save(); x.translate(cx, base); x.scale(s,s);
  drawPlant(x, 0, 0, h, prog, type, species, t, color);
  x.restore();
  return s;
}
function drawScene(cv, plant, stage, total, world, burst, species, time, color){
  if(!cv) return; var x=cv.getContext("2d"); if(!x) return; var W=cv.width, H=cv.height, prog=total? stage/total:0;
  var t=(typeof time==="number")?time:0;
  var sp=species||P.speciesFor(5, world);
  /* sky: the mockup's 14-band system — world palettes lerped by skyP (growth progress) */
  var SKY={ valley:{top:["#3f9fd8","#060b28"], hor:["#dcf5d2","#22456b"]},
            desert:{top:["#5aa7c9","#160b31"], hor:["#ffdf9e","#7a3550"]},
            space:{top:["#0a1030","#000000"], hor:["#232f5c","#020208"]} };
  var sk=SKY[world]||SKY.valley;
  var skyP = plant==="tree" ? prog : prog*0.25;
  if(world==="space") skyP=Math.max(skyP, 0.8);
  if(world==="desert") skyP=prog*0.55;
  var phase=Math.round(prog*8);
  var topC=lerpColor(sk.top[0], sk.top[1], skyP), horC=lerpColor(sk.hor[0], sk.hor[1], skyP);
  skyGradient(x, W, H, topC, horC);
  if(prog<0.25){ x.fillStyle="#8fa8bb"; for(var i=0;i<24;i++){ var rx=(i*37)%W, ry=(i*53)%90; x.fillRect(rx,ry,2,8); } }
  /* stars: 90 in space, else 46 once the sky clears (skyP>0.45), seeded so a stage always looks the same */
  var nStars = world==="space" ? 90 : (skyP>0.45 ? 46 : 0);
  if(nStars){
    var rnd=mulberry32(1234+stage*77+(world==="valley"?31:world==="desert"?57:89));
    x.fillStyle="#fff";
    for(var s=0;s<nStars;s++){ x.fillRect(Math.floor(rnd()*W), Math.floor(rnd()*(H*0.55)), 2, 2); }
  }
  /* sun / moon / earth, drawn as soft pixel circles */
  if(world==="desert"){ pxCircle(x, W-52, 34, 17, "#ffdf6b"); pxCircle(x, W-52, 34, 11, "#ffe98f"); }
  if(world==="space"){ pxCircle(x, W-60, 36, 20, "#7fb3c8"); pxCircle(x, W-66, 30, 6, "#2d6a4f"); pxCircle(x, W-52, 42, 4, "#2d6a4f"); }
  if(world==="valley" && prog>=0.5){ pxCircle(x, 40, 34, 14, "#fff3b0"); pxCircle(x, 40, 34, 9, "#fff9cf"); }
  /* drifting fluffy clouds in the sky */
  if(prog>=0.25 && prog<0.8){
    drawDriftCloud(x, W*0.22, H*0.22, 64);
    drawDriftCloud(x, W*0.72, H*0.14, 48);
  }
  var gy=H-46;
  /* low terrain in the world's colours, as the mockup draws it */
  var ground = world==="valley" ? "#5db364" : world==="desert" ? "#f2cf7d" : "#d3d6dd";
  var ground2 = world==="valley" ? "#418f4b" : world==="desert" ? "#dda94e" : "#a7adb8";
  var ground3 = world==="valley" ? "#6e4a2a" : world==="desert" ? "#b97c2e" : "#6b7078";
  x.fillStyle=ground; x.fillRect(0,H-16,W,16);
  x.fillStyle=ground2; x.fillRect(0,H-16,W,3);
  x.fillStyle=ground3;
  for(var tx=0; tx<W; tx+=26){ x.fillRect(tx, H-9, 10, 3); }
  if(world==="valley"){
    x.fillStyle="#2c5231"; /* two small pines on the terrain, at the sides */
    x.fillRect(22,H-32,16,8); x.fillRect(25,H-40,10,8);
    x.fillRect(W-38,H-30,16,8); x.fillRect(W-35,H-38,10,8);
    x.fillStyle="#6e4a2a"; x.fillRect(28,H-24,4,8); x.fillRect(W-32,H-22,4,6);
    x.fillStyle="#4aa8dd"; x.fillRect(0,H-12,120,4); /* river */
  } else if(world==="desert"){
    x.fillStyle="#a8542f"; x.fillRect(24,H-30,44,14); x.fillRect(W-70,H-26,48,10); /* mesas */
    x.fillStyle="#c96f4a"; x.fillRect(24,H-30,44,4);
    x.fillStyle="#2f7a3e"; x.fillRect(150,H-34,4,18); x.fillRect(146,H-28,12,3); /* cactus */
    x.fillStyle="#e86a8a"; x.fillRect(149,H-38,6,4); /* cactus flower */
  } else {
    x.fillStyle="#767c88"; x.fillRect(40,H-26,26,10); x.fillRect(W-80,H-24,34,8); /* craters */
    x.fillStyle="#5d636e"; x.fillRect(48,H-24,10,4); x.fillRect(W-72,H-22,12,4);
    x.fillStyle="#d8434f"; x.fillRect(W-46,H-38,3,22); /* flag pole */
    x.fillStyle="#e8edf2"; x.fillRect(W-46,H-38,14,8); /* flag */
  }
  /* the plant grows on a fluffy cloud island above the terrain */
  var cx=W/2, base=gy, h=(18+prog*150)*(P.profileFor(sp,color).height||1);
  drawCloudIsland(x, cx, base-4, Math.min(W-24, 340));
  /* dry dead weeds: thin bent brown stalks — never a cross. They fade as the plant grows, replaced by it. */
  var weeds=Math.max(0, 2-Math.floor(prog*4));
  for(var w=0;w<weeds;w++){ var wx=44+w*70+(w===1?W-150:0); drawWeed(x, wx, base-2, w); }
  var ps=drawScaledPlant(x, cx, base, h, prog, plant, sp, t, color);
  if(burst){ for(var b=0;b<26;b++){ x.fillStyle=["#d9a441","#74c69d","#fff","#40916c"][b%4]; x.fillRect(cx+(Math.random()*120-60), base-h*ps+(Math.random()*80-40),4,4); } }
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
/* Cloud garden — the mockup's layout exactly: 600-wide canvas, 9 slots per row on 3 islands,
   sky bands by mood, wooden sign on the left island, mini plants / gifts / weeds in slot order. */
var CLOUD_ISLANDS=[{cx:100,w:196,baseY:226},{cx:300,w:216,baseY:240},{cx:500,w:196,baseY:226}];
var CLOUD_SLOTS=[[140,182,224],[270,316,362],[452,500,544]];
function cloudLayout(n){ var rows=Math.max(1, Math.ceil(n/9)); return {perRow:9, rows:rows, rowH:150}; }
async function renderMindGarden(){ var cv=$("#mindGarden"); if(!cv) return; var x=cv.getContext("2d"); if(!x) return;
  var all=await dbAll(); var todays=all.filter(function(p){ return p.date===todayStr(); });
  var weeds=getWeeds();
  var gifts=getGifts().filter(function(g){ return g.date===todayStr(); });
  var n=todays.length+weeds+gifts.length;
  var lay=cloudLayout(Math.max(9,n)), W=600, H=320+(lay.rows-1)*150;
  cv.width=W; cv.height=H; cv.style.height=(H*(cv.clientWidth||600)/W)+"px";
  /* sky: 10 bands, colour by mood (today's average, else the mood on the scale) */
  var m = todays.length ? dayMood(todays) : mood;
  var skyTop, skyBot;
  if(m===null||m===undefined){ skyTop="#7fb2d9"; skyBot="#dcefc9"; }
  else if(m<=3){ skyTop="#5d6b7a"; skyBot="#9aa7b4"; }
  else if(m<=6){ skyTop="#7fb2d9"; skyBot="#dcefc9"; }
  else { skyTop="#4db2e8"; skyBot="#eafbd8"; }
  skyGradient(x, W, H, skyTop, skyBot);
  /* sun on good days, grey clouds on rough days, white clouds otherwise */
  if(m!==null && m!==undefined && m>=7){
    pxCircle(x, W-72, 36, 19, "#ffd94d"); pxCircle(x, W-72, 36, 12, "#ffe98f");
  } else if(m!==null && m!==undefined && m<=3){
    drawPuffyCloud(x, 88, 30, 110, "rgba(82,96,110,0.9)", "rgba(62,72,84,0.9)");
    drawPuffyCloud(x, 455, 50, 100, "rgba(82,96,110,0.9)", "rgba(62,72,84,0.9)");
  } else {
    drawDriftCloud(x, 80, 30, 80);
    drawDriftCloud(x, 465, 52, 84);
  }
  /* distant islands — small puffy clouds, not rectangles */
  drawPuffyCloud(x, 177, 105, 54, "rgba(255,255,255,0.55)", "rgba(255,255,255,0.4)");
  drawPuffyCloud(x, 448, 89, 64, "rgba(255,255,255,0.5)", "rgba(255,255,255,0.35)");
  var name=gardenName();
  var items=[];
  todays.forEach(function(p){ items.push({kind:"plant", p:p}); });
  gifts.forEach(function(g){ items.push({kind:"gift", g:g}); });
  for(var wi=0; wi<weeds; wi++) items.push({kind:"weed", seed:wi});
  for(var r=0;r<lay.rows;r++){
    for(var isl=0; isl<3; isl++){
      var isle=CLOUD_ISLANDS[isl], cy=isle.baseY+r*150;
      drawCloudIsland(x, isle.cx, cy, isle.w);
      if(r===0 && isl===0) drawSign(x, name, isle.baseY);
      for(var s=0;s<3;s++){
        var idx=r*9+isl*3+s; if(idx>=items.length) break;
        var it=items[idx], sx=CLOUD_SLOTS[isl][s], sy=cy;
        if(it.kind==="plant"){ drawMiniPlant(x, sx, sy, speciesOf(it.p), it.p.color, idx===todays.length-1); }
        else if(it.kind==="weed"){ drawWeed(x, sx, sy, it.seed); }
        else { /* gift sprout */
          x.fillStyle="#40916c"; x.fillRect(sx-2, sy-22, 4, 22);
          x.fillStyle="#74c69d"; x.fillRect(sx-11, sy-26, 11, 5); x.fillRect(sx, sy-30, 11, 5);
          x.fillStyle="#d9a441"; pxCircle(x, sx, sy-32, 4, "#d9a441"); }
      }
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
    var n=todays.length+weeds+gifts.length, lay=cloudLayout(Math.max(9,n));
    var best=-1, bestDx=1e9;
    for(var row=0;row<lay.rows;row++) for(var isl=0;isl<3;isl++) for(var s=0;s<3;s++){
      var idx=row*9+isl*3+s; if(idx>=n) break;
      var sx=CLOUD_SLOTS[isl][s], sy=CLOUD_ISLANDS[isl].baseY+row*150;
      if(Math.abs(px-sx)<=32 && py>=sy-80 && py<=sy+12){
        var dx=Math.abs(px-sx);
        if(dx<bestDx){ bestDx=dx; best=idx; }
      }
    }
    if(best<0) return;
    if(best<todays.length){ openPlant(todays[best].id); return; }
    var gIdx=best-todays.length;
    if(gIdx>=0 && gIdx<gifts.length){ var gn=$("#giftNote"); if(gn) gn.textContent=P.GIFT_NOTES[Math.floor(Math.random()*P.GIFT_NOTES.length)]; sfx("tap"); }
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
  mk(null,"Natural colours");
  P.BYO_COLOURS.forEach(function(c){ mk(c); });
  var ci=document.createElement("input"); ci.type="color"; ci.value="#f06a9a"; ci.title="Any colour"; ci.addEventListener("input",function(){ byoColor=ci.value; $$("#byoColours button").forEach(function(o){o.classList.remove("sel")}); renderByoPreview(); }); box.appendChild(ci);
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
/* Garden pots, as the mockup's makePot: a 150x190 full final-stage scene, emoji + species,
   date + topic/mood, universe + "tap for branches", "★ Grown by you" for BYO specials. */
var POT_EMOJI={tree:"🌳", shrub:"🌿", flower:"🌸"};
function potDate(ds){ var d=new Date(ds+"T00:00:00"); return d.toLocaleDateString("en-GB",{day:"numeric",month:"short"}); }
function plantCard(p){
  var d=document.createElement("button"); d.className="plantcard"; d.type="button";
  d.innerHTML='<canvas width="150" height="190"></canvas><div class="ground"></div><b>'+(POT_EMOJI[p.plant]||"🌱")+" "+speciesOf(p)+'</b><span>'+potDate(p.date)+(p.topic?" · "+p.topic.replace(/</g,"&lt;"):" · mood "+p.mood)+'</span><span>'+WORLD_LABEL[p.world]+' · tap for branches</span>'+(p.byo?'<span class="badge">★ Grown by you</span>':"");
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
      var n=document.createElement("span"); n.className="n"; n.textContent=(av<=3?"⛈":av<=6?"⛅":"☀️")+" "+av.toFixed(1)+"/10 · "+dayVerdict(av); c.appendChild(n);
      c.addEventListener("click",function(){ showDay(ds,ps); });
    }
    g.appendChild(c);
  })(d); }
});
}
function drawDaySnapshot(cv, ps){
  /* The mockup's day snapshot: 8 sky bands by average mood, ground strip, first 4 plants only,
     simple tree/shrub/flower blocks. Verdict: Rough / Mixed / Good. */
  var x=cv.getContext("2d"); if(!x) return; var W=cv.width, H=cv.height;
  var av=dayMood(ps);
  var skyTop, skyBot;
  if(av<=3){ skyTop="#4a5568"; skyBot="#79879a"; }
  else if(av<=6){ skyTop="#7fb2d9"; skyBot="#dcefc9"; }
  else { skyTop="#5db9e8"; skyBot="#eafbd8"; }
  skyGradient(x, W, H, skyTop, skyBot);
  if(av<=3){
    drawPuffyCloud(x, 41, 16, 54, "#39424f", "#2c333d");
    drawPuffyCloud(x, 150, 26, 60, "#39424f", "#2c333d");
    x.fillStyle="rgba(140,185,230,0.85)";
    for(var i=0;i<10;i++) x.fillRect((i*23)%W, 26+(i*5)%16, 2, 7);
  } else {
    drawDriftCloud(x, 43, 18, 54);
    drawDriftCloud(x, 159, 28, 58);
    pxCircle(x, W-24, 16, 10, "#ffd94d");
    if(av>6){ x.fillStyle="#ffffff"; for(var s=0;s<8;s++){ x.fillRect((s*37)%W,(s*19)%24,2,2); } }
  }
  /* ground strip */
  x.fillStyle=av<=3?"#5d6b52":"#4da75e"; x.fillRect(0,H-24,W,24);
  x.fillStyle="#6e4a2a"; x.fillRect(0,H-8,W,8);
  var base=H-24;
  for(var i=0;i<Math.min(ps.length,4);i++){
    var p=ps[i], cx=Math.round(W*(0.14+i*0.24)), pr=P.profileFor(speciesOf(p), p.color);
    var accent=pr.accent||pr.leaf2;
    if(p.plant==="tree"){
      x.fillStyle=pr.trunk; x.fillRect(cx-2, base-20, 4, 20);
      x.fillStyle=pr.leaf; x.fillRect(cx-11, base-36, 22, 16);
      x.fillStyle=pr.leaf2; x.fillRect(cx-7, base-32, 14, 7);
    } else if(p.plant==="shrub"){
      x.fillStyle=pr.leaf; x.fillRect(cx-10, base-13, 20, 13);
      x.fillStyle=pr.leaf2; x.fillRect(cx-6, base-10, 12, 6);
      x.fillStyle=accent; x.fillRect(cx-12, base-16, 3, 3); x.fillRect(cx+9, base-16, 3, 3);
    } else {
      x.fillStyle=pr.trunk; x.fillRect(cx-1, base-16, 2, 16);
      x.fillStyle=accent; x.fillRect(cx-6, base-28, 12, 12);
      x.fillStyle="#6e4a1e"; x.fillRect(cx-2, base-24, 4, 4);
    }
  }
}
function dayVerdict(av){ return av<=3?"Rough":av<=6?"Mixed":"Good"; }
function showDay(ds,ps){ $("#dayDetail").classList.remove("hidden");
  var av=dayMood(ps); $("#dayTitle").textContent=prettyDate(ds)+" — a "+dayVerdict(av)+" day ("+ps.length+" plant"+(ps.length>1?"s":"")+")";
  setTimeout(function(){ drawDaySnapshot($("#daySnap"), ps); },0);
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

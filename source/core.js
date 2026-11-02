/* 星返し simulation, Apache-2.0. Pure state: no browser, clock or renderer dependency. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const W=480,H=720,RADIUS=104,CORE=5,MAX_BULLETS=360,PLAYER_SPEED=680;
// Stage 2 uses the same capture contract with a different spatial decision.
const STAGES=[Object.freeze({id:'tide-entry',name:'第1ステージ・潮の入口',sweepAt:84,sweepLimit:26,bossWarning:2.4,bossLimit:86,clearHeal:1,
  beats:[{at:0,waveGap:3.8,label:'潮の入口'},{at:30,waveGap:3.4,label:'潮流が速まる'},{at:60,waveGap:3.05,label:'星の渦へ'}]}),
  Object.freeze({id:'mirror-fork',name:'第2ステージ・鏡潮の分岐',sweepAt:86,sweepLimit:26,bossWarning:2.4,bossLimit:125,clearHeal:1,
   beats:[{at:0,waveGap:3.15,label:'鏡潮の岸'},{at:30,waveGap:2.85,label:'左右に割れる光'},{at:60,waveGap:2.55,label:'ふたつの岸'}]}),
  Object.freeze({id:'time-ring',name:'第3ステージ・時環の帰路',sweepAt:84,sweepLimit:26,bossWarning:2.4,bossLimit:120,clearHeal:1,
   beats:[{at:0,waveGap:2.95,label:'光の間合い'},{at:30,waveGap:2.65,label:'ふたつの鼓動'},{at:60,waveGap:2.4,label:'帰路の星環'}]})];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist2=(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2;
function segmentDistance2(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/d,0,1):0;return(p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;}
function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
const DIFF={easy:{hp:5,speed:.78,enemyHp:.82,label:'やさしい'},normal:{hp:4,speed:1,enemyHp:1,label:'標準'},hard:{hp:3,speed:1.16,enemyHp:1.12,label:'挑戦'},nightmare:{hp:2,speed:1.16,enemyHp:1.12,label:'ナイトメア'}};
function captureCooldown(difficulty,hasStars=true){return(hasStars?(difficulty==='nightmare'?5.2:4.6):1.35)/1.3;}
class Game{
 constructor(options={}){this.difficulty=DIFF[options.difficulty]?options.difficulty:'normal';this.d=DIFF[this.difficulty];this.hardRules=this.difficulty==='hard'||this.difficulty==='nightmare';this.practice=!!options.practice;this.seed=options.seed||20261023;this.random=rng(this.seed);this.reduced=!!options.reduced;this.itemsEnabled=options.itemsEnabled!==false;this.time=0;this.id=0;this.state='playing';this.stageIndex=0;this.stageTime=0;this.beat=0;this.stageBossSpawned=false;this.stagePhase='waves';this.sweepDeadline=0;this.warningEndsAt=0;this.bossDeadline=0;this.completedStages=0;this.events=[];this.bullets=[];this.beams=[];this.optionLasers=[];this.nextOptionLaser=0;this.hazardSeen=new Set();this.shots=[];this.enemies=[];this.scheduled=[];this.score=0;this.scoreBreakdown={defeats:0,returns:0,lifeBonus:0};this.combo=0;this.bestCombo=0;this.lastKill=-99;this.kills=0;this.returned=0;this.capturedTotal=0;this.captureUses=0;this.captureHits=0;this.damageByReturn=0;this.damageByShot=0;this.hits=0;this.heals=0;this.bulletsDropped=0;this.peakBullets=0;this.wave=0;this.waveAt=1;this.nextShot=0;this.slow=0;this.boss=null;this.bossDefeated=false;this.nextBossAttack=0;this.bossAttack=0;this.toast='';this.toastUntil=0;this.buffer=0;this.player={x:240,y:594,hp:this.d.hp,maxHp:this.d.hp,invuln:0};this.field={phase:'ready',remaining:0,cooldown:0,count:0,energy:0,stars:[]};this.item=null;this.itemPending=null;this.itemOffered=false;this.itemOfferIndex=0;this.powerUntil=0;this.twinCharge=false;this.spreadUntil=0;this.pierceUntil=0;this.extendUntil=0;this.guardUntil=0;this.itemPickups=0;this.itemActivations=0;this.emit('start');}
emit(type,data={}){this.events.push({type,...data});}
message(text,duration=2){this.toast=text;this.toastUntil=this.time+duration;this.emit('message',{text});}
 requestCapture(){if(this.state!=='playing'||this.stagePhase==='clear')return false;const f=this.field;if(f.phase==='ready'&&f.cooldown<=0){f.phase='capture';f.remaining=(this.difficulty==='nightmare'?.62:.78)+(this.extendUntil>this.time?.25:0);f.count=0;f.energy=0;f.stars=[];this.captureUses++;this.emit('field');return true;}if(f.phase==='cooldown'&&f.cooldown<=.12)this.buffer=.14;else this.emit('notready');return false;}
pause(){if(this.state==='playing'){this.state='paused';this.buffer=0;this.emit('pause');}}
resume(){if(this.state==='paused'){this.state='playing';this.emit('resume');}}
spawnBullet(x,y,vx,vy,style='thorn',r=5){const live=this.bullets.reduce((n,b)=>n+!b.dead,0);if(live>=MAX_BULLETS){this.bulletsDropped++;return;}this.bullets.push({id:++this.id,x,y,px:x,py:y,vx,vy,r,style,age:0});this.peakBullets=Math.max(this.peakBullets,live+1);}
 introduceHazard(kind){if(this.hazardSeen.has(kind))return;this.hazardSeen.add(kind);const labels={split:'分裂弾・大きな核ごと星返し！',accel:'加速弾・先に進路を空けよう',homing:'追尾弾・引きつけて外そう',beam:'ビームは星返し不可！ 予告の線から離れよう'};this.message(labels[kind],2.5);}
 specialFan(x,y,angle,count,spread,kind){this.introduceHazard(kind);const speed=(kind==='accel'?50:kind==='homing'?112:80)*this.d.speed;for(let i=0;i<count;i++){const a=angle+(count===1?0:(i/(count-1)-.5)*spread);this.spawnBullet(x,y,Math.cos(a)*speed,Math.sin(a)*speed,kind,kind==='split'?12:5);}}
 spawnBeam(x,y,angle){if(this.beams.length||this.state!=='playing'||this.stagePhase==='clear')return;this.introduceHazard('beam');this.beams.push({id:++this.id,x,y,endX:x+Math.cos(angle)*1000,endY:y+Math.sin(angle)*1000,width:18,age:0,warning:1.2,duration:.7});}
 updateBeams(world,previousPlayer){for(const b of this.beams){const previousAge=b.age;b.age+=world;if(previousAge<b.warning&&b.age>=b.warning)this.emit('beamfire',{x:b.x,y:b.y});if(b.age<b.warning||previousAge>=b.warning+b.duration)continue;const end={x:b.endX,y:b.endY},p=this.player;
  // A moving core may cross a fixed beam between ticks. Include segment intersections.
  const cross=(a,c,d)=>(c.x-a.x)*(d.y-a.y)-(c.y-a.y)*(d.x-a.x);
  const crosses=cross(b,end,previousPlayer)*cross(b,end,p)<0&&cross(previousPlayer,p,b)*cross(previousPlayer,p,end)<0;
  if(crosses||Math.min(segmentDistance2(p,b,end),segmentDistance2(previousPlayer,b,end),segmentDistance2(b,previousPlayer,p),segmentDistance2(end,previousPlayer,p))<=(CORE+b.width/2)**2)this.hurt(p.x,p.y);
 }this.beams=this.beams.filter(b=>b.age<b.warning+b.duration);}

fan(x,y,angle,count,spread,speed,style='thorn'){for(let i=0;i<count;i++){const a=angle+(count===1?0:(i/(count-1)-.5)*spread);this.spawnBullet(x,y,Math.cos(a)*speed*this.d.speed,Math.sin(a)*speed*this.d.speed,style);}}
 spawnWave(){
  const start=this.enemies.length;this.spawnCombatWave();this.offerStageItems(this.enemies.slice(start));
 }
 spawnCombatWave(){
  if(this.stageIndex===1){this.spawnMirrorWave();return;}
  if(this.stageIndex===2){this.spawnPulseWave();return;}
  const n=this.wave++,type=n%4,beat=this.beat,beatConfig=STAGES[this.stageIndex].beats[beat];
  if(type===3){
    const side=this.random()<.5?-1:1,x=side<0?160:320;
    this.enemies.push({id:++this.id,type:'skimmer',x,y:-48,baseX:x,age:0,hp:14*this.d.enemyHp,maxHp:14*this.d.enemyHp,r:19,fireAt:1.9,shots:0,offset:this.random()*6.28,pattern:3,warning:0,beat});
    for(const flank of[-1,1]){const support=flank<0?90:390,hp=8*this.d.enemyHp;
      this.enemies.push({id:++this.id,type:'ray',x:support,y:-85,baseX:support,age:-.35,hp,maxHp:hp,r:17,fireAt:1.5,shots:0,offset:this.random()*6.28,pattern:flank<0?1:2,warning:0,beat});}
  }else{
    const layouts=type===0?[72,160,240,325,410]:type===1?[65,145,240,335,415]:[90,190,290,390];
    const mirrored=this.random()<.5;
    layouts.forEach((place,i)=>{const x=clamp((mirrored?W-place:place)+(this.random()-.5)*20,55,425),jelly=type===2;
      this.enemies.push({id:++this.id,type:jelly?'jelly':'ray',x,y:-45-i*30,baseX:x,age:0,hp:(jelly?15:8)*this.d.enemyHp,maxHp:(jelly?15:8)*this.d.enemyHp,r:jelly?22:17,fireAt:1.1+i*.14,shots:0,offset:this.random()*6.28,pattern:(n+i)%3,warning:0,beat});
    });
  }
  this.waveAt=this.time+beatConfig.waveGap*(this.hardRules?.90:this.difficulty==='easy'?1.1:1);
 }
spawnMirrorWave(){
  const n=this.wave++,beat=this.beat,stage=STAGES[this.stageIndex],side=this.random()<.5?-1:1;
  const put=(type,x,delay=0)=>{const hp=(type==='courier'?5:type==='lancer'?10:type==='mirror'?13:7)*this.d.enemyHp;
    this.enemies.push({id:++this.id,type,x,y:-45-delay*95,baseX:x,age:-delay,hp,maxHp:hp,r:type==='mirror'?18:16,
      fireAt:(type==='courier'?.95:type==='lancer'?1.5:1.3)+delay,shots:0,offset:this.random()*6.28,pattern:n%3,warning:0,beat});};
  // Couriers supply catchable fans, mirrors hold the banks, and a lancer breaks a stationary lane.
  put('mirror',side<0?105:375);
  put('courier',side<0?310:170,.28);
  put('courier',side<0?390:90,.65);
  put('courier',side<0?85:395,.88);
  if(n%3===2||beat>0)put(n%4===3?'lancer':'mirror',side<0?370:110,1.05);
  this.waveAt=this.time+stage.beats[beat].waveGap*(this.hardRules?.88:this.difficulty==='easy'?1.22:1);
}
spawnPulseWave(){
  const n=this.wave++,beat=this.beat,stage=STAGES[this.stageIndex],lane=n%3===0?240:n%2===0?125:355;
  const put=(type,x,delay=0)=>{const hp=(type==='courier'?5:type==='lancer'?10:type==='pulse'?15:11)*this.d.enemyHp;
    this.enemies.push({id:++this.id,type,x,y:-45-delay*90,baseX:x,age:-delay,hp,maxHp:hp,r:type==='pulse'?19:16,
      fireAt:(type==='pulse'?2.1:type==='lancer'?1.5:1.0)+delay,shots:0,offset:this.random()*6.28,pattern:n%2,warning:0,beat});};
  // A central pulse changes timing; fragile side suppliers create a rewarding return cluster.
  put('pulse',lane);
  put('courier',lane===240?85:240,.25);
  put('courier',lane===240?395:480-lane,.60);
  put('courier',lane===240?160:lane===125?385:95,.83);
  if(n%3===2||beat>0)put(n%4===3?'lancer':'pulse',lane===240?350:480-lane,1.0);
  this.waveAt=this.time+stage.beats[beat].waveGap*(this.hardRules?.87:this.difficulty==='easy'?1.32:1);
}
startSweep(stage){
if(this.stagePhase!=='waves')return;
this.stagePhase='sweep';this.sweepDeadline=this.stageTime+stage.sweepLimit;
this.message('残る影を倒しきり、道を開こう',3);
this.emit('sweep',{remaining:this.enemies.length,deadline:this.sweepDeadline});
}
startBossWarning(stage){
if(this.stagePhase!=='sweep'||this.enemies.length)return;
this.stagePhase='warning';this.warningEndsAt=this.time+stage.bossWarning;
this.message('静かな潮の先に、暗い星が来る',stage.bossWarning);
this.emit('bosswarn',{at:this.warningEndsAt});
}
spawnBoss(){
if(this.stagePhase==='boss')return;
this.stagePhase='boss';this.stageBossSpawned=true;
this.bossAttack=0;
  const mirror=this.stageIndex===1,eclipse=this.stageIndex===2,baseHp=mirror?(this.difficulty==='easy'?260:this.hardRules?360:320):eclipse?(this.difficulty==='easy'?300:this.hardRules?450:380):(this.difficulty==='easy'?480:this.hardRules?680:600),hp=2*Math.round(baseHp*1.15);
  this.boss={id:++this.id,type:mirror?'mirror-boss':eclipse?'eclipse-boss':'boss',x:240,y:-100,hp,maxHp:hp,r:53,age:0,phase:0,warning:0,telegraphed:false,activeSide:null,telegraphSide:null};
this.bossDeadline=this.time+STAGES[this.stageIndex].bossLimit*1.5;
this.nextBossAttack=this.time+2.8;
  this.message(mirror?'鏡潮の主 · 左右の光を見極めよう':eclipse?'時環の主 · 光る瞬間を待とう':'潮の主 · 押し寄せる星を、光に返す',3);this.emit('boss');
}
queue(delay,action){this.scheduled.push({at:this.time+delay,action});}
summonBossEscort(b){
 const maxAlive=[4,6,8][this.stageIndex],living=this.enemies.filter(e=>!e.dead).length;
 if(this.boss!==b||b.dead||living>=maxAlive)return;
 const side=this.random()<.5?-1:1;
 this.emit('bosssummon',{x:b.x,y:b.y+30,side});this.message('護衛機接近！ 反撃の的にしよう',1.3);
 this.queue(.65,()=>{if(this.boss!==b||b.dead)return;
   const slots=maxAlive-this.enemies.filter(e=>!e.dead).length;
   const plan=this.stageIndex===0?[['courier',-82],['courier',82]]:
     this.stageIndex===1?[['courier',-94],['lancer',0],['courier',94]]:
       [['courier',-135],['pulse',-48],['pulse',48],['lancer',135]];
   for(const [type,offset] of plan.slice(0,Math.max(0,slots))){
     const x=clamp(b.x+offset*side,55,425),hp=(type==='courier'?5:type==='lancer'?10:15)*this.d.enemyHp;
     this.enemies.push({id:++this.id,type,x,y:b.y+35,baseX:clamp(x+Math.sign(offset)*side*26,55,425),age:0,hp,maxHp:hp,r:type==='pulse'?19:16,
       fireAt:type==='pulse'?2.1:type==='lancer'?1.5:1.1,shots:0,offset:this.random()*6.28,pattern:0,warning:0,beat:Math.max(1,this.beat),escort:true});}
 });
}

 bossFan(x,y,angle,count,spread,speed,style='thorn'){const bonus=this.difficulty==='easy'?1:this.difficulty==='normal'?2:this.difficulty==='hard'?3:4,wide=this.difficulty==='easy'?1.05:this.difficulty==='normal'?1.15:this.difficulty==='hard'?1.2:1.25;this.fan(x,y,angle,count+bonus,Math.min(2.5,spread*wide),speed,style);}
 bossCadence(seconds){return Math.max(2.45,seconds*(this.difficulty==='easy'?.95:this.difficulty==='normal'?.88:this.difficulty==='hard'?.85:.82));}
 stageOnePattern(b){const phase=b.hp/b.maxHp<.34?2:b.hp/b.maxHp<.68?1:0;return [[0,1,2,3],[3,4,0,2],[4,3,1,4]][phase][this.bossAttack%4];}
 bossPressure(){
  const b=this.boss;if(!b||b.dead||b.hp<=0)return;
  const phase=b.hp/b.maxHp<.34?2:b.hp/b.maxHp<.68?1:0,total=(this.difficulty==='easy'?[6,14,26]:this.difficulty==='normal'?[8,18,34]:[10,24,46])[phase];
  // Two catchable waves share the existing telegraph. Density rises; speed and reaction time do not.
  for(let i=0;i<2;i++)this.queue(.26+i*.28,()=>{
   if(this.boss!==b||b.dead||this.stagePhase!=='boss')return;
   this.fan(b.x,b.y+32,Math.PI/2,total/2,i===0?1.05:1.22,108,'petal');
  });
 }
 bossPattern(){this.bossPressure();if(this.stageIndex===1){this.mirrorBossPattern();return;}if(this.stageIndex===2){this.eclipseBossPattern();return;}const b=this.boss;if(!b||b.hp<=0)return;const phase=b.hp/b.maxHp<.34?2:b.hp/b.maxHp<.68?1:0;if(phase!==b.phase){b.phase=phase;this.emit('bossphase',{phase});}const pattern=b.queuedPattern??this.stageOnePattern(b),speed=100+phase*17;this.bossAttack++;if(this.bossAttack%3===0)this.summonBossEscort(b);b.queuedPattern=null;
 if(pattern===4){const side=b.telegraphSide??b.activeSide??(this.bossAttack%2===0?-1:1);b.activeMuzzleUntil=this.time+1.45;this.message('翼の順射・光る側から離れ、次の翼も見る',1.7);for(let j=0;j<2;j++){if(j===1)this.queue(.48,()=>{if(this.boss&&!this.boss.dead){this.boss.activeSide=-side;this.boss.wingFlashUntil=this.time+.48;}});this.queue(j*.92,()=>{if(!this.boss||this.boss.dead)return;const wing=j===0?side:-side;this.boss.activeSide=wing;const aim=Math.atan2(this.player.y-this.boss.y,this.player.x-(this.boss.x+wing*54));this.bossFan(this.boss.x+wing*54,this.boss.y+20,aim,7,.48,speed+24,'petal');});}}
 else if(pattern===0){this.message('星の雨・集めて、返す',1.8);for(let j=0;j<3;j++)this.queue(j*.28,()=>{if(this.boss)this.bossFan(this.boss.x,this.boss.y+38,Math.PI/2,11+phase*2,1.48,speed+j*9);});}
else if(pattern===1){this.message('星の渦 · すき間を泳ぐ',1.8);for(let j=0;j<10;j++)this.queue(j*.12,()=>{if(!this.boss)return;for(let arm=0;arm<3;arm++){const a=.35+j*.19+arm*1.05;this.spawnBullet(this.boss.x,this.boss.y+28,Math.cos(a)*(105+phase*14)*this.d.speed,Math.sin(a)*(105+phase*14)*this.d.speed,'petal',5);}});}
else if(pattern===2){this.message('ふたつの潮 · ねらいを外す',1.8);const aim=Math.atan2(this.player.y-b.y,this.player.x-b.x);for(let j=0;j<4;j++)this.queue(j*.25,()=>{if(!this.boss)return;for(const side of[-1,1])this.bossFan(this.boss.x+side*54,this.boss.y+20,aim,5+phase, .48,speed+18,'petal');});}

 else if(pattern===3){this.message('照準の槍 · 光の線から離れて星返し',1.4);
   for(let j=0;j<2;j++)this.queue(j*.48,()=>{if(!this.boss||this.boss.dead)return;
     const x=this.boss.x,y=this.boss.y+38;
     const a=Math.atan2((b.aimY??this.player.y)-y,(b.aimX??this.player.x)-x);
     this.bossFan(x,y,a,7+phase,.32,speed+62,'thorn');
   });
 }
this.nextBossAttack=this.time+this.bossCadence((phase===2?3.45:3.9)*(this.hardRules?.81:1));b.telegraphed=false;b.telegraphSide=null;}
 stageTwoPattern(b){const phase=b.hp/b.maxHp<.34?2:b.hp/b.maxHp<.68?1:0;return [[0,1,0,2],[2,0,1,2],[2,1,0,1]][phase][this.bossAttack%4];}
 mirrorBossPattern(){
  const b=this.boss;if(!b||b.hp<=0)return;
  const phase=b.hp/b.maxHp<.34?2:b.hp/b.maxHp<.68?1:0;
  if(phase!==b.phase){b.phase=phase;this.emit('bossphase',{phase});}
  const pattern=b.queuedPattern??this.stageTwoPattern(b),side=b.telegraphSide??(this.bossAttack%2===0?-1:1),speed=102+phase*11;
  this.bossAttack++;if(this.bossAttack%2===0)this.summonBossEscort(b);b.queuedPattern=null;b.telegraphed=false;b.telegraphSide=null;b.activeMuzzleUntil=this.time+1.45;
  if(pattern===0){
    b.activeSide=side;this.message('反射の列・光る側へ寄れば星を拾える',1.5);
    for(let j=0;j<2;j++)this.queue(j*.30,()=>{if(this.boss&&!this.boss.dead)this.bossFan(this.boss.x+side*56,this.boss.y+20,Math.PI/2+(side<0?.08:-.08),6+phase,.64,speed,'petal');});
  }else if(pattern===1){
    b.activeSide=0;this.message('鏡の照準・線から外れよう',1.4);
    for(let j=0;j<2;j++)this.queue(j*.34,()=>{if(!this.boss||this.boss.dead)return;const x=this.boss.x,y=this.boss.y+24,a=Math.atan2((b.aimY??this.player.y)-y,(b.aimX??this.player.x)-x);this.specialFan(x,y,a,5,.38,'accel');});
  }else{
    b.activeSide=side;this.message('左右の反射・一方を見てから反対へ',1.7);
    this.queue(.52,()=>{if(this.boss!==b||b.dead)return;b.activeSide=-side;b.wingFlashUntil=this.time+.43;});
    for(let j=0;j<2;j++)this.queue(j*.92,()=>{if(!this.boss||this.boss.dead)return;const wing=j===0?side:-side;this.boss.activeSide=wing;this.boss.wingFlashUntil=this.time+.46;if(this.difficulty==='nightmare')this.specialFan(this.boss.x+wing*56,this.boss.y+20,Math.PI/2+(wing<0?.08:-.08),j===0?1:3,j===0?0:.42,j===0?'split':'homing');else this.bossFan(this.boss.x+wing*56,this.boss.y+20,Math.PI/2+(wing<0?.08:-.08),6+phase,.55,speed+10,'petal');});
  }
  this.nextBossAttack=this.time+this.bossCadence((phase===2?3.05:3.4)*(this.hardRules?.86:1));
 }
 stageThreePattern(b){const phase=b.hp/b.maxHp<.34?2:b.hp/b.maxHp<.68?1:0,planned=[[0,1,2,0],[1,3,0,2],[2,1,3,0]][phase][this.bossAttack%4];return planned===3&&b.reflectionPhases?.includes(phase)?2:planned;}
 eclipseBossPattern(){
  const b=this.boss;if(!b||b.hp<=0)return;
  const phase=b.hp/b.maxHp<.34?2:b.hp/b.maxHp<.68?1:0;
  if(phase!==b.phase){b.phase=phase;this.emit('bossphase',{phase});}
  const pattern=b.queuedPattern??this.stageThreePattern(b),side=b.telegraphSide??(this.bossAttack%2===0?-1:1),speed=104+phase*11;
  this.bossAttack++;if(this.bossAttack%2===0)this.summonBossEscort(b);b.queuedPattern=null;b.telegraphed=false;b.telegraphSide=null;b.activeMuzzleUntil=this.time+1.55;
  if(pattern===0){
    b.activeSide=0;this.message('環の脈・集まった時に返す',1.7);
    for(let j=0;j<2;j++)this.queue(j*.34,()=>{if(!this.boss||this.boss.dead)return;if(this.difficulty==='nightmare')this.specialFan(this.boss.x,this.boss.y+26,Math.PI/2,j===0?1:3,j===0?0:.5,j===0?'split':'homing');else this.bossFan(this.boss.x,this.boss.y+26,Math.PI/2,11+phase,1.16,speed+j*7,'petal');});
  }else if(pattern===1){
    b.activeSide=side;this.message('交互の翼・静かな側へ移る',1.6);
    this.queue(.44,()=>{if(this.boss!==b||b.dead)return;b.activeSide=-side;b.wingFlashUntil=this.time+.43;});
    for(let j=0;j<2;j++)this.queue(j*.82,()=>{if(!this.boss||this.boss.dead)return;const wing=j===0?side:-side;this.boss.activeSide=wing;this.boss.wingFlashUntil=this.time+.5;this.bossFan(this.boss.x+wing*75,this.boss.y+18,Math.PI/2+(wing<0?.12:-.12),8+phase,.68,speed+10,'thorn');});
  }else if(pattern===3){
    b.activeSide=0;b.reflectionPhases??=[];b.reflectionPhases.push(phase);b.reflectUntil=this.time+1.15;b.reflected=0;b.reflectLimit=6;
    this.message('敵も星返し！ 金の返し弾を見て避けよう',1.8);
    this.queue(1.17,()=>{if(this.boss!==b||b.dead)return;const count=b.reflected;
      b.reflectUntil=0;if(count){this.bossFan(b.x,b.y+28,Math.PI/2,Math.min(9,3+count),.95,142+phase*11,'boss-return');this.emit('bossreturn',{x:b.x,y:b.y+28,count});}
      else this.emit('bossreturnempty',{x:b.x,y:b.y+28});
    });
  }else{
    b.activeSide=0;const x=b.x,y=b.y+26,a=Math.atan2((b.aimY??this.player.y)-y,(b.aimX??this.player.x)-x);this.spawnBeam(x,y,a);this.message('ビームは星返し不可！ 線から離れよう',1.9);
  }
  this.nextBossAttack=this.time+this.bossCadence((phase===2?2.7:3.0)*(this.hardRules?.86:1));
 }
 skimmerVolley(e){
   const a=Math.atan2(this.player.y-e.y,this.player.x-e.x);
   this.fan(e.x,e.y+16,a,5,.34,137+e.beat*7,'thorn');
   e.fireAt=e.age+3.75;e.shots++;e.warning=0;
   this.emit('enemyfire',{x:e.x,y:e.y,enemyType:'skimmer'});
 }
 pulseVolley(e){if(this.difficulty==='nightmare'&&this.stageIndex===2&&e.shots>0){this.specialFan(e.x,e.y+18,Math.atan2(this.player.y-e.y,this.player.x-e.x),5,.8,'accel');e.fireAt=e.age+3.45;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y});return;}if(this.stageIndex===2&&e.shots===0){this.specialFan(e.x,e.y+18,Math.PI/2,1,0,'split');e.fireAt=e.age+3.45;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y});return;}const aim=Math.atan2(this.player.y-e.y,this.player.x-e.x),speed=103+e.beat*5;this.fan(e.x,e.y+18,aim,12+Math.min(3,e.beat*2),1.06,speed,'petal');e.fireAt=e.age+3.45;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y});}
mirrorVolley(e){if(this.difficulty==='nightmare'&&this.stageIndex===1&&e.shots>0){this.specialFan(e.x,e.y+18,Math.atan2(this.player.y-e.y,this.player.x-e.x),3,.42,'homing');e.fireAt=e.age+3.7;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y});return;}if(this.stageIndex===1&&e.shots===0){this.specialFan(e.x,e.y+18,Math.PI/2,1,0,'split');e.fireAt=e.age+3.7;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y});return;}for(let j=0;j<2;j++)this.queue(j*.26,()=>{if(!e.dead)this.fan(e.x,e.y+18,Math.PI/2+(e.baseX<240?.08:-.08),5+Math.min(1,e.beat),.58,98+e.beat*5,'petal');});e.fireAt=e.age+3.7;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y});}
  prepareItemSchedule(){
  // Independent per-stage stream: offers never consume combat random numbers.
  this.itemRandom=rng((this.seed^Math.imul(this.stageIndex+1,0x9e3779b9))>>>0);
  const types=['spread','twin','pierce','extend','guard'];for(let i=types.length-1;i>0;i--){const j=Math.floor(this.itemRandom()*(i+1));[types[i],types[j]]=[types[j],types[i]];}
  this.itemSchedule=types.map((type,i)=>({type,at:12+i*14+this.itemRandom()*5}));this.itemScheduleStage=this.stageIndex;
 }
  offerStageItems(newEnemies=[]){
  if(!this.itemsEnabled||this.practice||this.stagePhase!=='waves'||!newEnemies.length)return;
  if(this.itemScheduleStage!==this.stageIndex)this.prepareItemSchedule();
  if(this.itemOfferIndex>=this.itemSchedule.length||this.item||this.itemPending||this.enemies.some(e=>!e.dead&&e.itemKind))return;
  const offer=this.itemSchedule[this.itemOfferIndex];if(this.stageTime<offer.at)return;
  const carrier=newEnemies[Math.floor(this.itemRandom()*newEnemies.length)];if(!carrier)return;
  carrier.itemKind=offer.type;this.itemOfferIndex++;
  this.emit('itemcarrier',{enemyId:carrier.id,itemKind:offer.type});
 }
  tryItemDrop(){
  const pending=this.itemPending;if(!pending||this.state!=='playing')return;
  if(this.stagePhase!=='waves'&&this.stagePhase!=='sweep'){this.itemPending=null;this.emit('itemskip');return;}
  // Rewards begin exactly where their carrier fell. Hazard visibility is a render concern.
  this.item={id:++this.id,x:pending.x,y:pending.y,r:24,age:0,type:pending.type};
  this.itemPending=null;this.itemOffered=true;
  this.emit('itemdrop',{x:this.item.x,y:this.item.y,itemKind:this.item.type});
  }

  updateOptionLasers(world,targets){
  if(this.state!=='playing'||this.stagePhase==='clear'||this.powerUntil<=this.time){this.optionLasers=[];return;}
  if(this.time>=this.nextOptionLaser){this.nextOptionLaser=this.time+1.6;this.optionLasers=[-1,1].map(side=>({id:++this.id,side,x:clamp(this.player.x+side*38,12,W-12),y:this.player.y-10,endY:0,width:8,age:0,life:.24,hitIds:[]}));this.emit('optionlaser');}
  for(const ray of this.optionLasers){ray.x=clamp(this.player.x+ray.side*38,12,W-12);ray.y=this.player.y-10;ray.age+=world;if(ray.age>ray.life)continue;
   for(const e of targets){if(e.dead||ray.hitIds.includes(e.id))continue;if(segmentDistance2(e,ray,{x:ray.x,y:ray.endY})>(e.r+ray.width/2)**2)continue;
    ray.hitIds.push(e.id);e.hp-=4;this.damageByShot+=4;this.emit('impact',{x:e.x,y:e.y,returned:false});if(e.hp<=1e-9){e.hp=0;this.kill(e,false);}if(this.state!=='playing'||this.stagePhase==='clear')return;
   }
  }this.optionLasers=this.optionLasers.filter(ray=>ray.age<=ray.life);
 }
  updateItem(dt){
  if(this.powerUntil&&this.time>=this.powerUntil){this.powerUntil=0;this.twinCharge=false;this.emit('itemexpire',{itemKind:'twin'});}
  if(this.spreadUntil&&this.time>=this.spreadUntil){this.spreadUntil=0;this.emit('itemexpire',{itemKind:'spread'});}if(this.pierceUntil&&this.time>=this.pierceUntil){this.pierceUntil=0;this.emit('itemexpire',{itemKind:'pierce'});}
  for(const [key,itemKind]of [['extendUntil','extend'],['guardUntil','guard']])if(this[key]&&this.time>=this[key]){this[key]=0;this.emit('itemexpire',{itemKind});}
  if(!this.item)return;
  this.item.age+=dt;this.item.y+=44*dt;
  if(dist2(this.item,this.player)<=(CORE+this.item.r)**2){
    const type=this.item.type;this.item=null;this.itemPickups++;
     if(['spread','twin','pierce'].includes(type)){this.powerUntil=0;this.twinCharge=false;this.spreadUntil=0;this.pierceUntil=0;this.optionLasers=[];}
     if(type==='spread'){this.spreadUntil=this.time+20;this.message('三連星！ 通常弾が三方向へ広がる',2.5);}
     else if(type==='pierce'){this.pierceUntil=this.time+20;this.message('貫星！ 通常弾が敵を二体まで貫く',2.5);}
     else if(type==='extend'){this.extendUntil=this.time+20;this.message('時星！ 20秒間、星返しの取り込みが少し長くなる',2.5);}
     else if(type==='guard'){this.guardUntil=this.time+20;this.message('護星！ 20秒以内に一度だけ被弾を防ぐ',2.5);}
     else{this.powerUntil=this.time+20;this.twinCharge=true;this.nextOptionLaser=this.time+.25;this.message('連星！ 左右レーザーと、8発以上の星返し強化',2.5);}
    this.emit('itempickup',{itemKind:type,until:this.time+20});
  }else if(this.item.age>=12||this.item.y>H+25){this.item=null;this.emit('itemlost');}
  }
 release(){const f=this.field;f.phase='cooldown';f.cooldown=captureCooldown(this.difficulty,!!f.count);const count=Math.min(24,f.count);if(count){const powered=this.powerUntil>this.time&&this.twinCharge&&f.count>=8;const damage=3*(f.count/count)*(powered?1.2:1);for(let i=0;i<count;i++){const angle=i/count*Math.PI*2;this.shots.push({id:++this.id,x:this.player.x+Math.cos(angle)*34,y:this.player.y+Math.sin(angle)*34,px:this.player.x,py:this.player.y,vx:Math.cos(angle)*180,vy:Math.sin(angle)*180,age:0,r:7,damage,returned:true,target:null});}this.returned+=f.count;this.capturedTotal+=f.count;const healAt=this.difficulty==='nightmare'?24:this.difficulty==='easy'?8:this.hardRules?16:12;if(f.count>=healAt&&this.player.hp<this.player.maxHp){const amount=Math.min(this.difficulty==='nightmare'?1:2,Math.floor(f.count/healAt),this.player.maxHp-this.player.hp);this.player.hp+=amount;this.heals++;this.message(`星の光で、ライフが${amount}回復`,1.8);this.emit('heal',{hp:this.player.hp,amount});}this.score+=f.count*12;this.scoreBreakdown.returns+=f.count*12;this.slow=.11;this.emit('release',{count:f.count,x:this.player.x,y:this.player.y});if(powered){this.twinCharge=false;this.itemActivations++;this.message('連星の光が、星返しを強めた',1.8);this.emit('itemuse',{count:f.count});}}else{this.message('近くの紫の弾を、星返しでつかまえよう',2);this.emit('empty');}f.stars=[];}
hurt(x,y){const p=this.player;if(p.invuln>0||this.practice)return;if(this.guardUntil>this.time){this.guardUntil=0;p.invuln=.35;this.emit('guardbreak',{x,y});return;}p.hp--;p.invuln=this.difficulty==='easy'?3:1.8;this.hits++;this.combo=0;this.emit('hit',{x,y,hp:p.hp});if(p.hp<=0)this.finish('lost');}
finish(result){if(this.state!=='playing')return;this.state=result;this.extendUntil=0;this.guardUntil=0;this.bullets=[];this.beams=[];this.optionLasers=[];this.nextOptionLaser=0;this.shots=[];this.scheduled=[];this.buffer=0;this.emit(result,{score:this.score,time:this.time});}
  kill(enemy,returned){if(enemy.dead)return;const bossKill=enemy===this.boss||enemy.type==='boss';enemy.dead=true;if(enemy.itemKind&&!this.item&&!this.itemPending){this.itemPending={x:enemy.x,y:enemy.y,at:this.time,type:enemy.itemKind};this.emit('itemincoming',{itemKind:enemy.itemKind});}this.kills++;this.combo=this.time-this.lastKill<4?this.combo+1:1;this.bestCombo=Math.max(this.bestCombo,this.combo);this.lastKill=this.time;const multiplier=Math.min(5,1+Math.floor(this.combo/5));const points=(bossKill?3000:enemy.type==='jelly'?220:120)*multiplier;this.score+=points;this.scoreBreakdown.defeats+=points;this.emit('destroy',{x:enemy.x,y:enemy.y,enemyType:enemy.type,returned,multiplier,combo:this.combo});if(bossKill){this.bossDefeated=true;this.bullets=[];this.score+=this.player.hp*500;this.scoreBreakdown.lifeBonus+=this.player.hp*500;this.completeStage();}}
 completeStage(){if(this.stagePhase==='clear')return;const stage=STAGES[this.stageIndex];this.completedStages++;
const amount=Math.min(stage.clearHeal,this.player.maxHp-this.player.hp);
if(amount>0){this.player.hp+=amount;this.heals++;this.emit('heal',{hp:this.player.hp,amount});}
 this.stagePhase='clear';this.extendUntil=0;this.guardUntil=0;this.twinCharge=false;this.stageClearUntil=this.time+3.2;this.boss=null;this.enemies=[];this.bullets=[];this.beams=[];this.optionLasers=[];this.nextOptionLaser=0;this.shots=[];this.scheduled=[];this.item=null;this.itemPending=null;this.buffer=0;this.field.phase='ready';this.field.remaining=0;this.field.cooldown=0;this.field.stars=[];
 this.message(`${stage.name} 突破！`,3.1);
 this.emit('stageclear',{stageIndex:this.stageIndex,hp:this.player.hp,amount});}
 advanceStage(){if(this.stagePhase!=='clear')return;
 if(this.stageIndex+1>=STAGES.length){this.finish('stage-clear');return;}
this.stageIndex++;this.stageTime=0;this.beat=0;this.stageBossSpawned=false;this.stagePhase='waves';this.sweepDeadline=0;this.warningEndsAt=0;this.bossDeadline=0;this.bossDefeated=false;
this.wave=0;this.waveAt=this.time+1;this.boss=null;this.enemies=[];this.bullets=[];this.beams=[];this.optionLasers=[];this.nextOptionLaser=0;this.shots=[];this.scheduled=[];this.item=null;this.itemPending=null;this.itemOffered=false;this.itemOfferIndex=0;this.powerUntil=0;this.twinCharge=false;this.spreadUntil=0;this.pierceUntil=0;
this.emit('stage',{stageIndex:this.stageIndex,hp:this.player.hp});}
 step(dt,input={}){this.events=[];if(this.state!=='playing')return;dt=clamp(dt,0,1/30);this.time+=dt;this.stageTime+=dt;if(this.stagePhase==='clear'){if(this.time>=this.stageClearUntil)this.advanceStage();return;}const p=this.player,f=this.field,previousPlayer={x:this.player.x,y:this.player.y};const world=dt*(this.slow>0?.45:1);this.slow=Math.max(0,this.slow-dt);p.invuln=Math.max(0,p.invuln-dt);this.buffer=Math.max(0,this.buffer-dt);let dx=Number(input.dx)||0,dy=Number(input.dy)||0;const norm=Math.hypot(dx,dy);if(norm>1){dx/=norm;dy/=norm;}if(input.target&&Number.isFinite(input.target.x)&&Number.isFinite(input.target.y)){const tx=input.target.x-p.x,ty=input.target.y-p.y,d=Math.hypot(tx,ty),speed=Math.min(d,PLAYER_SPEED*dt);if(d){p.x+=tx/d*speed;p.y+=ty/d*speed;}}else{p.x+=dx*PLAYER_SPEED*dt;p.y+=dy*PLAYER_SPEED*dt;}p.x=clamp(p.x,22,W-22);p.y=clamp(p.y,68,H-30);
if(this.practice){if(this.time>55){this.finish('practiced');return;}if(this.time>=this.waveAt){this.fan(240,100,Math.PI/2,13,1.15,110,'petal');this.waveAt=this.time+4.7;}}else{
const stage=STAGES[this.stageIndex];let beat=0;
for(let i=1;i<stage.beats.length;i++)if(this.stageTime>=stage.beats[i].at)beat=i;
if(beat!==this.beat){this.beat=beat;this.message(stage.beats[beat].label,2.5);this.emit('act',{beat,stageIndex:this.stageIndex});}
if(this.stagePhase==='waves'&&this.stageTime>=stage.sweepAt)this.startSweep(stage);
if(this.stagePhase==='warning'&&this.time>=this.warningEndsAt)this.spawnBoss();
else if(this.stagePhase==='waves'&&this.time>=this.waveAt)this.spawnWave();
}
if(f.phase==='cooldown'){f.cooldown=Math.max(0,f.cooldown-dt);if(f.cooldown===0){f.phase='ready';this.emit('ready');if(this.buffer>0)this.requestCapture();}}
if(f.phase==='capture'||f.phase==='orbit'){f.remaining-=dt;if(f.phase==='capture'&&f.remaining<=0){f.phase='orbit';f.remaining=.34;this.emit('orbit',{count:f.count});}else if(f.phase==='orbit'&&f.remaining<=0)this.release();}
if(this.time>=this.nextShot&&!this.practice){this.nextShot=this.time+.18;this.emit('shot');const aimTargets=this.boss&&!this.boss.dead?[this.boss]:this.enemies.filter(e=>!e.dead&&e.y>0&&e.y<p.y-20);const aim=aimTargets.reduce((best,e)=>!best||dist2(p,e)<dist2(p,best)?e:best,null);const angle=aim?Math.atan2(aim.y-p.y,aim.x-p.x):-Math.PI/2;if(this.spreadUntil>this.time){for(const side of[-1,0,1]){const a=angle+side*.14;this.shots.push({id:++this.id,x:p.x+side*10,y:p.y-20,px:p.x+side*10,py:p.y-20,vx:Math.cos(a)*600,vy:Math.sin(a)*600,age:0,r:3,damage:.43,returned:false,poweredShot:true});}}else for(const side of[-1,1])this.shots.push({id:++this.id,x:p.x+side*10,y:p.y-20,px:p.x+side*10,py:p.y-20,vx:Math.cos(angle+side*.025)*600,vy:Math.sin(angle+side*.025)*600,age:0,r:3,damage:.5,returned:false,piercing:this.pierceUntil>this.time,hitsLeft:this.pierceUntil>this.time?2:1,hitIds:[]});}
 for(const e of this.enemies){e.age+=world;if(this.stagePhase==='sweep'){const targetY=130+(e.id%4)*38;e.y+=clamp(targetY-e.y,-260*world,260*world);}else e.y+=world*(e.age<1.7?(e.type==='lancer'?128:96):e.age>8+e.beat*1.4?-115:(e.type==='lancer'?58:24));e.x=(e.type==='skimmer'||e.type==='lancer')?clamp(e.baseX+Math.sin(e.age*1.3+e.offset)*95,55,425):e.baseX+Math.sin(e.age*1.3+e.offset)*(e.type==='jelly'?45:e.type==='pulse'?19:27);const warnTime=e.type==='pulse'?.85:e.type==='mirror'?.8:e.type==='skimmer'||e.type==='lancer'?1:e.type==='courier'?.72:.6;e.warning=clamp((e.age-e.fireAt+warnTime)/warnTime,0,1);if(e.type==='courier'&&e.age>=e.fireAt&&e.y>25&&e.y<390&&e.shots<3&&e.age<9){this.fan(e.x,e.y+14,Math.PI/2,7+e.beat,.92,93+e.beat*7,'petal');e.fireAt=e.age+2.7;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y,enemyType:'courier'});}else if(e.type==='lancer'&&e.age>=e.fireAt&&e.y>25&&e.y<430&&e.shots<2&&e.age<9){const a=Math.atan2(p.y-e.y,p.x-e.x);if(this.stageIndex>0)this.specialFan(e.x,e.y+16,a,3,.34,this.stageIndex===1?'accel':'homing');else this.fan(e.x,e.y+16,a,5,.34,135+e.beat*8,'thorn');e.fireAt=e.age+3.0;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y,enemyType:'lancer'});}else if(e.type==='skimmer'&&e.age>=e.fireAt&&e.y>25&&e.y<390&&e.shots<2&&e.age<9){this.skimmerVolley(e);}else if(e.type==='mirror'&&e.age>=e.fireAt&&e.y>25&&e.y<390&&e.shots<2&&e.age<9){this.mirrorVolley(e);}else if(e.type==='pulse'&&e.age>=e.fireAt&&e.y>25&&e.y<390&&e.shots<2&&e.age<9){this.pulseVolley(e);}else if(e.type!=='mirror'&&e.type!=='pulse'&&e.type!=='courier'&&e.type!=='lancer'&&(this.stageIndex===0||e.type!=='skimmer')&&e.age>=e.fireAt&&e.y>25&&e.y<390&&e.shots<(e.beat===0?2:3)&&e.age<8+e.beat*1.4){const a=Math.atan2(p.y-e.y,p.x-e.x),count=e.type==='jelly'?9:5+this.beat;if(e.pattern===0)this.fan(e.x,e.y,Math.PI/2,count,1.1,105+this.beat*12);else this.fan(e.x,e.y,a,count,e.pattern===1?.64:1.35,105+this.beat*15,e.type==='jelly'?'petal':'thorn');e.fireAt=e.age+3.5;e.shots++;e.warning=0;this.emit('enemyfire',{x:e.x,y:e.y});}if(this.stagePhase!=='sweep'&&(e.y>H+60||(e.age>3&&e.y<-90)))e.dead=true;}
 if(this.boss&&!this.boss.dead){const b=this.boss;if(!this.beams.length){b.age+=world;b.y=Math.min(130,b.y+world*115);b.x=240+Math.sin(b.age*.64)*104;}const warnTime=this.stageIndex===2?1.0:this.stageIndex===1?.85:1.15;b.warning=clamp((this.time-this.nextBossAttack+warnTime)/warnTime,0,1);if(this.stageIndex===0&&!b.telegraphed&&this.time>=this.nextBossAttack-1.15){b.telegraphed=true;b.aimX=this.player.x;b.aimY=this.player.y;const pattern=this.stageOnePattern(b);b.queuedPattern=pattern;b.telegraphSide=pattern===4?(this.bossAttack%2===0?-1:1):null;this.emit('bosswarnpattern',{pattern,side:b.telegraphSide,aimX:b.aimX,aimY:b.aimY});if(pattern===3)this.message('狙いの線から離れて！',1.1);}if(this.stageIndex===1&&!b.telegraphed&&this.time>=this.nextBossAttack-.95){
  b.telegraphed=true;b.queuedPattern=this.stageTwoPattern(b);b.aimX=this.player.x;b.aimY=this.player.y;
  b.telegraphSide=b.queuedPattern===1?0:(this.bossAttack%2===0?-1:1);
  this.message(b.queuedPattern===1?'鏡の照準・線から離れて！':b.queuedPattern===2?'左右の鏡が順に光る':'光る鏡の側から弾が来る',.95);
  this.emit('mirrorwarn',{pattern:b.queuedPattern,side:b.telegraphSide,aimX:b.aimX,aimY:b.aimY});
}
if(this.stageIndex===2&&!b.telegraphed&&this.time>=this.nextBossAttack-1.15){
  b.telegraphed=true;b.queuedPattern=this.stageThreePattern(b);b.aimX=this.player.x;b.aimY=this.player.y;
  b.telegraphSide=b.queuedPattern===1?(this.bossAttack%2===0?-1:1):0;if(b.queuedPattern===3)this.emit('bossreturnwarn',{x:b.x,y:b.y+26});
  this.message(b.queuedPattern===3?'敵が星返しを構えた！ 金の輪に注意':b.queuedPattern===2?'照準予告・線から離れよう':b.queuedPattern===1?'左右の翼を見て動こう':'環の脈が集まる',1.15);
  this.emit('pulsewarn',{pattern:b.queuedPattern,side:b.telegraphSide,aimX:b.aimX,aimY:b.aimY});
}
if(this.time>=this.nextBossAttack)this.bossPattern();}
const due=this.scheduled.filter(x=>x.at<=this.time);this.scheduled=this.scheduled.filter(x=>x.at>this.time);for(const x of due)x.action();
// Capture resolves before collision, including a bullet crossing the field this tick.
const splitParents=[];
for(const b of this.bullets){if(b.dead)continue;b.px=b.x;b.py=b.y;
 if(b.style==='accel'){const speed=Math.min(205*this.d.speed,Math.hypot(b.vx,b.vy)+90*this.d.speed*world),a=Math.atan2(b.vy,b.vx);b.vx=Math.cos(a)*speed;b.vy=Math.sin(a)*speed;}
 else if(b.style==='homing'&&b.age<1.2){const a=Math.atan2(b.vy,b.vx),target=Math.atan2(p.y-b.y,p.x-b.x),diff=Math.atan2(Math.sin(target-a),Math.cos(target-a)),turn=.75*Math.min(world,1.2-b.age),next=a+clamp(diff,-turn,turn),speed=Math.hypot(b.vx,b.vy);b.vx=Math.cos(next)*speed;b.vy=Math.sin(next)*speed;}
 b.x+=b.vx*world;b.y+=b.vy*world;b.age+=world;const seg=segmentDistance2({x:0,y:0},{x:b.px-previousPlayer.x,y:b.py-previousPlayer.y},{x:b.x-p.x,y:b.y-p.y});
 if(f.phase==='capture'&&seg<=(RADIUS+b.r)**2){b.dead=true;f.count++;f.energy++;if(f.stars.length<24)f.stars.push({angle:this.random()*Math.PI*2,radius:26+this.random()*38});this.captureHits++;this.emit('capture',{x:b.x,y:b.y,count:f.count});continue;}
 if(seg<=(CORE+b.r)**2){b.dead=true;this.hurt(b.x,b.y);}
 if(this.state!=='playing')break;
 if(b.x<-50||b.x>W+50||b.y<-80||b.y>H+70||b.age>14)b.dead=true;
 if(!b.dead&&b.style==='split'&&b.age>=1.15-1e-9){b.dead=true;splitParents.push(b);}
}
if(this.state!=='playing')return;
// Children are born after traversal, so no child moves or hits on its birth tick.
this.bullets=this.bullets.filter(b=>!b.dead);
for(const b of splitParents){for(let i=0;i<8;i++){const a=i*Math.PI/4;this.spawnBullet(b.x,b.y,Math.cos(a)*116*this.d.speed,Math.sin(a)*116*this.d.speed,'petal');}this.emit('split',{x:b.x,y:b.y});}
this.updateBeams(world,previousPlayer);if(this.state!=='playing')return;
const targets=this.boss&&!this.boss.dead?[this.boss,...this.enemies.filter(e=>!e.dead)]:this.enemies.filter(e=>!e.dead);
for(const s of this.shots){s.age+=world;s.px=s.x;s.py=s.y;if(s.returned){let target=targets.find(e=>e.id===s.target);if(!target){target=targets.reduce((best,e)=>!best||dist2(s,e)<dist2(s,best)?e:best,null);s.target=target?.id||null;}const a=target?Math.atan2(target.y-s.y,target.x-s.x):-Math.PI/2,speed=s.age<.15?260:520,blend=Math.min(1,world*9);s.vx+=(Math.cos(a)*speed-s.vx)*blend;s.vy+=(Math.sin(a)*speed-s.vy)*blend;}s.x+=s.vx*world;s.y+=s.vy*world;for(const e of targets){if(e.dead||s.hitIds?.includes(e.id))continue;if(segmentDistance2(e,{x:s.px,y:s.py},s)<=(e.r+s.r)**2){if(e===this.boss&&s.returned&&this.time<(e.reflectUntil||0)&&e.reflected<e.reflectLimit){e.reflected++;s.dead=true;this.emit('bossabsorb',{x:s.x,y:s.y,count:e.reflected});break;}e.hp-=s.damage;if(s.piercing){s.hitIds.push(e.id);s.hitsLeft--;s.dead=s.hitsLeft<=0;}else s.dead=true;if(s.returned)this.damageByReturn+=s.damage;else this.damageByShot+=s.damage;this.emit('impact',{x:s.x,y:s.y,returned:s.returned});if(e.hp<=1e-9){e.hp=0;this.kill(e,s.returned);}if(s.dead)break;}}if(s.y<-70||s.y>H+80||s.x<-80||s.x>W+80||s.age>5)s.dead=true;}
if(this.state==='playing'&&this.stagePhase!=='clear')this.updateOptionLasers(world,targets);
// A fatal bullet hit ends first; a surviving player takes no post-victory body damage.
if(this.state==='playing'&&this.stagePhase!=='clear'){for(const e of targets){if(!e.dead&&dist2(p,e)<=(CORE+e.r*.75)**2)this.hurt(e.x,e.y);}}
this.bullets=this.bullets.filter(b=>!b.dead);this.shots=this.shots.filter(s=>!s.dead).slice(-280);this.enemies=this.enemies.filter(e=>!e.dead);if(this.time-this.lastKill>4)this.combo=0;
  if(!this.practice&&this.state==='playing'){this.offerStageItems();this.tryItemDrop();this.updateItem(dt);}
if(!this.practice&&this.state==='playing'){
const stage=STAGES[this.stageIndex];
if(this.stagePhase==='sweep'){
  if(this.enemies.length===0)this.startBossWarning(stage);
  else if(this.stageTime>=this.sweepDeadline){this.message('残る影を倒しきれず、潮が閉じた',4);this.finish('timeout');}
}
if(this.stagePhase==='boss'&&this.time>=this.bossDeadline&&!this.bossDefeated){this.message('暗い星を返す前に、潮が閉じた',4);this.finish('timeout');}
}
}
 summary(){return{seed:this.seed,difficulty:this.difficulty,practice:this.practice,result:this.state,stageIndex:this.stageIndex,completedStages:this.completedStages,stagePhase:this.stagePhase,stageTime:Math.round(this.stageTime*10)/10,hp:this.player.hp,maxHp:this.player.maxHp,score:Math.round(this.score),scoreBreakdown:{...this.scoreBreakdown},time:Math.round(this.time*10)/10,kills:this.kills,returned:this.returned,bestCombo:this.bestCombo,hits:this.hits,heals:this.heals,captureUses:this.captureUses,peakBullets:this.peakBullets,bulletsDropped:this.bulletsDropped,damageByReturn:Math.round(this.damageByReturn),damageByShot:Math.round(this.damageByShot),itemsEnabled:this.itemsEnabled,itemPickups:this.itemPickups,itemActivations:this.itemActivations};}
}
return{Game,W,H,RADIUS,CORE,DIFF,STAGES,segmentDistance2,captureCooldown};
});

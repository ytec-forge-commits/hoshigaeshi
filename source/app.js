/* 星返し presentation and controls. Apache-2.0. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),C=window.StarCore,SCENERY=window.StarScenery,FEEL=window.StarFeel,L=window.StarLocale,KEY=window.STAR_QA===true?'tenchan.hoshigaeshi.qa-v8':'tenchan.hoshigaeshi.v8-dev';
const media=window.STAR_ASSET_BASE||null,asset=name=>media?media+name:'assets/'+name,audio=name=>media?media+name:'audio/'+name;
 // Populated only after verified authored raster sections arrive. Each section
 // declares its actual pixel dimensions and the logical overlap with the next.
 const STAGE1_ROUTE=Array.from({length:6},(_,i)=>({key:`stage1-route-${String(i+1).padStart(2,'0')}`,path:`stage1/route/stage1-route-${String(i+1).padStart(2,'0')}.webp`,width:960,height:1440,overlapNext:i<5?120:0,softJoin:i===2||i===4}));
 const STAGE2_ROUTE=Array.from({length:6},(_,i)=>({key:`stage2-route-${String(i+1).padStart(2,'0')}`,path:`stage2/route/stage2-route-${String(i+1).padStart(2,'0')}.webp`,width:960,height:1440,overlapNext:i<5?120:0,softJoin:i===2||i===4}));
 const STAGE3_ROUTE=Array.from({length:6},(_,i)=>({key:`stage3-route-${String(i+1).padStart(2,'0')}`,path:`stage3/route/stage3-route-${String(i+1).padStart(2,'0')}.webp`,width:960,height:1440,overlapNext:i===4?240:i<5?120:0,softJoin:i>0}));
 const ROUTE_SEGMENTS=STAGE1_ROUTE;
  const ROUTE_LANDMARKS=[
    {key:'stage1-whale-v5',path:'stage1/landmark-star-whale-v5.png',at:.34,x:245,y:205,displayWidth:420,displayHeight:205,alpha:.42,parallax:1.06,textureWidth:768,textureHeight:384},
    {key:'stage1-arch-v5',path:'stage1/landmark-broken-arch-v5.png',at:.76,x:240,y:350,displayWidth:345,displayHeight:440,alpha:.28,parallax:1.10,textureWidth:512,textureHeight:768}
  ];
// Keep the authored files intact, but release their oversized GPU sources after
// Phaser loads them. The display geometry and collision rules do not change.
const textureOptimizationFailures=new Set();
function useDisplaySizedTexture(scene,key,width,height){
  if(textureOptimizationFailures.has(key)||!scene.textures.exists(key))return false;
  let source=null;
  try{
    source=scene.textures.get(key).getSourceImage();
    if(!source||source.width<=width&&source.height<=height)return false;
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d',{alpha:true});
    if(!context){textureOptimizationFailures.add(key);return false;}
    context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
    context.drawImage(source,0,0,width,height);
    scene.textures.remove(key);
    if(scene.textures.addCanvas(key,canvas))return true;
  }catch(e){/* Keep the original image on unsupported canvas paths. */}
  textureOptimizationFailures.add(key);
  if(source&&!scene.textures.exists(key)){
    try{scene.textures.addImage(key,source);}catch(e){/* Optional art may be absent. */}
  }
  return false;
}
const qaMode=window.STAR_QA===true,bossCandidate=window.STAR_BOSS_CANDIDATE===true,stage2Candidate=window.STAR_STAGE2_CANDIDATE===true;
const AUDIO_ATTEMPT_TIMEOUT_MS=qaMode&&Number.isFinite(window.STAR_QA_AUDIO_TIMEOUT_MS)?Math.max(5,Math.min(30000,window.STAR_QA_AUDIO_TIMEOUT_MS)):8000;
const BOSS_CANDIDATE_DURATION=3661492/44100,BOSS_CANDIDATE_GAIN=.27/.55;
const STAGE2_FIELD_DURATION=64,STAGE2_BOSS_DURATION=80.1,STAGE2_FIELD_GAIN=.35/.55,STAGE2_BOSS_GAIN=.27/.55;
const STAGE3_FIELD_DURATION=3907939/44100,STAGE3_BOSS_DURATION=4596480/44100,STAGE3_FIELD_GAIN=.265/.55,STAGE3_BOSS_GAIN=.263/.55;
const fieldTrackFor=index=>index===2?'stage3-field':index===1&&stage2Candidate?'stage2-field':'star-tide-loop';
const bossTrackFor=index=>index===2?'stage3-boss':index===1&&stage2Candidate?'stage2-boss':'stage1-boss';
const musicGainFor=track=>track==='stage3-field'?STAGE3_FIELD_GAIN:track==='stage3-boss'?STAGE3_BOSS_GAIN:track==='stage2-field'?STAGE2_FIELD_GAIN:track==='stage2-boss'?STAGE2_BOSS_GAIN:track==='stage1-boss'?(bossCandidate?BOSS_CANDIDATE_GAIN:.85):1;
 const mirrorMuzzleSide=(boss,nextAttack)=>boss.telegraphed&&boss.telegraphSide!=null?boss.telegraphSide:boss.activeSide??(nextAttack%2===0?-1:1);
 let qaOutput=null,qaFieldHold=false;if(qaMode){qaOutput=document.createElement('output');qaOutput.id='qa-report';qaOutput.style.cssText='position:fixed;left:5px;bottom:5px;z-index:9999;max-width:45vw;background:#001d;color:#9fe;font:10px monospace;padding:6px;pointer-events:none;white-space:pre-wrap';document.body.appendChild(qaOutput);}let qaFrames=0,qaWorst=0;
let guideInput=matchMedia('(pointer:coarse)').matches?'touch':null;
let storageOK=true,saved={schemaVersion:1,settings:{muted:false,musicVolume:40,sfxVolume:40,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,difficulty:'easy',language:'ja',controlMode:matchMedia('(pointer: coarse)').matches?'touch':'keyboard',captureSide:'left'},previewBests:{easy:0,normal:0,hard:0,nightmare:0},previewRuns:0,previewClears:0};
try{const raw=localStorage.getItem(KEY);if(raw){const x=JSON.parse(raw);if(!x||typeof x!=='object')throw Error('invalid');if(x.settings){if(['ja','en'].includes(x.settings.language))saved.settings.language=x.settings.language;for(const k of['muted','reduced'])if(typeof x.settings[k]==='boolean')saved.settings[k]=x.settings[k];for(const k of['musicVolume','sfxVolume'])if(Number.isFinite(x.settings[k]))saved.settings[k]=Math.max(0,Math.min(100,x.settings[k]));if(['keyboard','mouse','gamepad','touch'].includes(x.settings.controlMode))saved.settings.controlMode=x.settings.controlMode;if(['left','right'].includes(x.settings.captureSide))saved.settings.captureSide=x.settings.captureSide;if(Object.hasOwn(C.DIFF,x.settings.difficulty))saved.settings.difficulty=x.settings.difficulty;}for(const k of Object.keys(saved.previewBests))if(Number.isFinite(x.previewBests?.[k])&&x.previewBests[k]>=0&&x.previewBests[k]<1e9)saved.previewBests[k]=Math.floor(x.previewBests[k]);for(const k of['previewRuns','previewClears'])if(Number.isInteger(x[k])&&x[k]>=0&&x[k]<1e8)saved[k]=x[k];}}catch(e){storageOK=false;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved));storageOK=true;}catch(e){storageOK=false;}storageMessage();}
function storageMessage(){if(!storageOK){$('storage-note').textContent='記録の保存が使えません\nこの画面を開いている間だけ遊べます';$('storage-note').classList.add('warning');}else{$('storage-note').textContent='設定と端末内記録はこのブラウザに保存\n通常プレイ開始時にランキングへ接続し、名前と結果は登録ボタンで送信します';$('storage-note').classList.remove('warning');}}
 const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
 function effectiveReduced(){return settings.reduced||motionPreference.matches;}
 const settings=saved.settings;L.setLanguage(settings.language);document.body.classList.toggle('reduced-effects',effectiveReduced());let sim=null,scene=null,mode='boot',acc=0,lastUI=0,pointer=null,target=null,keys=new Set(),assetsFailed=false,finished=false,session=0,lastAnnounced='',menuTime=0,pendingFinish=0,confirmAction=null,lastFocus=null,pendingMouseRestart=null;
if(qaMode)Object.defineProperty(window,'STAR_QA_SIM',{get:()=>sim});
const format=n=>Math.round(n).toLocaleString('ja-JP');
function renderLife(hp,maxHp){const life=$('life'),key=hp+'/'+maxHp;if(life.dataset.state===key)return;life.dataset.state=key;life.setAttribute('aria-label',`ライフ ${hp} / ${maxHp}`);const slots=document.createElement('span');slots.className='life-slots';slots.setAttribute('aria-hidden','true');for(let i=0;i<maxHp;i++){const gem=document.createElement('i');gem.className=i<hp?'life-gem filled':'life-gem empty';slots.appendChild(gem);}const count=document.createElement('span');count.className='life-count';count.textContent=key;life.replaceChildren(slots,count);}
 function updateRecords(){const d=$('difficulty').value;if(mode==='menu'){renderLife(C.DIFF[d].hp,C.DIFF[d].hp);$('score-multiplier').textContent='撃破 ×1';}$('record-summary').textContent=`${C.DIFF[d].label} · 通し最高記録 ${format(saved.previewBests[d])}`;}
function screen(name){for(const n of['menu','pause','result','credits','cinematic'])$(n+'-screen').hidden=n!==name;if(name)$('boss-defeat-cut-in').hidden=true;if(name!=='cinematic'){$('ending-road').setAttribute('hidden','');if(['menu','result','credits'].includes(name))$('cinematic-stars').replaceChildren();}}
const ranking=window.StarRankingUI({qa:qaMode,openDialog});let launchGeneration=0,pendingDifficulty='normal';
function announce(text){if(text!==lastAnnounced){$('announcer').textContent=text;lastAnnounced=text;}}
const mouseMotion=new window.StarControls.RelativeMouseInput();
function clearInput(){mouseMotion.clear();touchTap.reset();keys.clear();pointer=null;target=null;if(typeof padInput!=='undefined'){padInput.reset();padFrame={dx:0,dy:0};}}
const AUDIO_FILES={
  'star-tide-loop':['stage1/stage1-flow.ogg','stage1/stage1-flow.mp3'],
  'stage1-boss':bossCandidate?['stage1/candidate-heavy-battle-2/heavy_battle_2_bpm185.ogg','stage1/candidate-heavy-battle-2/heavy_battle_2_bpm185.mp3']:['stage1/stage1-boss.ogg','stage1/stage1-boss.mp3'],
  ...(stage2Candidate?{
    'stage2-field':['stage2/candidate-frenzied-swimming/frenzied_swimming_0.ogg','stage2/candidate-frenzied-swimming/frenzied_swimming_converted.mp3'],
    'stage2-boss':['stage2/candidate-hard-boss-battle-1/hard_boss_battle_1_bpm200_0.ogg','stage2/candidate-hard-boss-battle-1/hard_boss_battle_1_bpm200.mp3']
  }:{}),
  'stage3-field':['stage3/candidate-space-battle/space_battle_bpm130_0.ogg','stage3/candidate-space-battle/space_battle_bpm130.mp3'],
  'stage3-boss':['stage3/candidate-space-boss-battle/space_boss_battle_bpm175_0.ogg','stage3/candidate-space-boss-battle/space_boss_battle_bpm175.mp3'],
  capture:['stage1/capture.ogg','stage1/capture.mp3'],
  'return-burst':['stage1/rebound.ogg','stage1/rebound.mp3'],
  hit:['stage1/hit.ogg','stage1/hit.mp3'],
  'enemy-pop':['enemy-pop.mp3'],boss:['boss.mp3'],victory:['victory.mp3'],button:['button.mp3']
};
const ARCADE_AUDIO=['chain-1','chain-2','chain-3','chain-4','pickup-spread','pickup-twin','pickup-pierce'];
for(const key of ARCADE_AUDIO)AUDIO_FILES[key]=['arcade/'+key+'.ogg','arcade/'+key+'.mp3'];
const COMMON_AUDIO=['capture','return-burst','hit','enemy-pop','boss','victory','button',...ARCADE_AUDIO,...window.StarSoundDesign.KEYS];
const CREDITS_TRACK='star-tide-loop';
const START_AUDIO=[...COMMON_AUDIO.filter(key=>!ARCADE_AUDIO.includes(key)),'star-tide-loop','stage1-boss'];
function comboAccentPlan(combo,returned,reduced){const tier=!returned?0:combo>=24?4:combo>=16?3:combo>=8?2:combo>=4?1:0;return{tier,stars:reduced?Math.min(4,tier):[0,6,10,16,22][tier]};}
const SOUND_RULES={
  hit:{priority:5,gap:.1,max:1,gain:.9},'return-burst':{priority:5,gap:.2,max:1,gain:.95},
  victory:{priority:5,gap:0,max:1},boss:{priority:4,gap:1,max:1},
  capture:{priority:2,gap:.08,max:2,gain:.6},'enemy-pop':{priority:1,gap:.125,max:1},
  'player-shot':{priority:1,gap:.16,max:1,gain:.18},'option-laser':{priority:3,gap:.5,max:1,gain:.72},'boss-beam':{priority:4,gap:1,max:1,gain:.9},'shield-break':{priority:5,gap:.2,max:1,gain:.9},
  button:{priority:1,gap:.08,max:1},'combo-accent':{priority:3,gap:.4,max:1,gain:.8},'item-pickup':{priority:5,gap:.08,max:1,gain:.9}
};
class Sound{
constructor(){this.ctx=null;this.buffers={};this.loadedPaths={};this.loading=null;this.inflight=new Map();this.wanted=new Set();this.activeMusic=new Set();this.loadVersion=0;this.music=null;this.fadingMusic=null;this.musicTrack=null;this.musicCreated=0;this.voices=[];this.last={};this.intent=0;this.ready=false;this.failedKeys=[];this.runSilent=false;}
musicLevel(){return .55*settings.musicVolume/100;}
fxLevel(){return .6*settings.sfxVolume/100;}
async timedAttempt(task,controller){let timer;try{return await Promise.race([task,new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('audio load timeout'));},AUDIO_ATTEMPT_TIMEOUT_MS);})]);}finally{clearTimeout(timer);}}
has(keys){return keys.every(key=>!!this.buffers[key]);}
cancelInflight(){this.loadVersion++;for(const request of this.inflight.values()){request.cancelled=true;request.controller?.abort();}this.inflight.clear();this.loading=null;}
releaseIdle(key){if(this.wanted.has(key)||[...this.activeMusic].some(m=>m.track===key)||this.voices.some(v=>v.key===key))return;delete this.buffers[key];delete this.loadedPaths[key];}
keep(keys){this.wanted=new Set(keys);for(const [key,request] of this.inflight)if(!this.wanted.has(key)){request.cancelled=true;request.controller?.abort();this.inflight.delete(key);}for(const key of Object.keys(this.buffers))this.releaseIdle(key);}
evict(key){this.wanted.delete(key);const request=this.inflight.get(key);if(request){request.cancelled=true;request.controller?.abort();this.inflight.delete(key);}this.releaseIdle(key);}
async loadBuffer(key,request){if(window.StarSoundDesign?.KEYS.includes(key)){const data=window.StarSoundDesign.synthesize(key,this.ctx.sampleRate),buffer=this.ctx.createBuffer(1,data.length,this.ctx.sampleRate);buffer.copyToChannel(data,0);return{decoded:buffer,path:'synth:'+key};}let lastError=null;for(const path of AUDIO_FILES[key]){try{
 if(request.cancelled)throw Error('audio request cancelled');
 if(key==='stage1-boss'&&bossCandidate&&qaMode&&window.STAR_FORCE_BOSS_MP3===true&&path.endsWith('.ogg'))throw Error('QA: forced OGG failure');
 if(qaMode&&window.STAR_FORCE_STAGE2_MP3===true&&key.startsWith('stage2-')&&path.endsWith('.ogg'))throw Error('QA: forced stage2 OGG failure');
 if(qaMode&&window.STAR_FORCE_STAGE3_MP3===true&&key.startsWith('stage3-')&&path.endsWith('.ogg'))throw Error('QA: forced stage3 OGG failure');
 if(qaMode&&key==='stage1-boss'&&Number.isInteger(window.STAR_QA_AUDIO_FAIL_COUNT)&&window.STAR_QA_AUDIO_FAIL_COUNT>0){window.STAR_QA_AUDIO_FAIL_COUNT--;throw Error('QA: forced audio load failure');}
 if(qaMode&&key==='stage2-boss'&&Number.isInteger(window.STAR_QA_STAGE2_FAIL_COUNT)&&window.STAR_QA_STAGE2_FAIL_COUNT>0){window.STAR_QA_STAGE2_FAIL_COUNT--;throw Error('QA: forced stage2 audio load failure');}
 if(qaMode&&key==='stage3-field'&&Number.isInteger(window.STAR_QA_STAGE3_FAIL_COUNT)&&window.STAR_QA_STAGE3_FAIL_COUNT>0){window.STAR_QA_STAGE3_FAIL_COUNT--;throw Error('QA: forced stage3 audio load failure');}
 const controller=typeof AbortController==='function'?new AbortController():{abort(){},signal:undefined};request.controller=controller;
 const decoded=await this.timedAttempt((async()=>{const response=await fetch(audio(path),controller.signal?{signal:controller.signal}:{});if(!response.ok)throw Error('audio HTTP '+response.status);return this.ctx.decodeAudioData(await response.arrayBuffer());})(),controller);
 if(request.cancelled)throw Error('audio request cancelled');return{decoded,path};
 }catch(e){lastError=e;if(request.cancelled)break;}finally{request.controller=null;}}throw lastError||Error('audio decode unavailable');}
loadOne(key){if(this.buffers[key])return Promise.resolve(true);if(!this.wanted.has(key))return Promise.resolve(false);if(this.inflight.has(key))return this.inflight.get(key).promise;
 const request={cancelled:false,controller:null,promise:null};this.inflight.set(key,request);
 request.promise=(async()=>{try{const {decoded,path}=await this.loadBuffer(key,request);if(request.cancelled||this.inflight.get(key)!==request||!this.wanted.has(key))return false;this.buffers[key]=decoded;this.loadedPaths[key]=path;return true;}catch(e){return false;}finally{if(this.inflight.get(key)===request)this.inflight.delete(key);}})();return request.promise;}
prefetch(key){this.wanted.add(key);return this.loadOne(key);}
openContext(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('audio unavailable');this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=settings.muted?0:.7;this.limiter=this.ctx.createDynamicsCompressor();this.limiter.threshold.value=-3;this.limiter.knee.value=6;this.limiter.ratio.value=12;this.limiter.attack.value=.003;this.limiter.release.value=.12;this.master.connect(this.limiter);this.limiter.connect(this.ctx.destination);this.musicGain=this.ctx.createGain();this.musicGain.gain.value=this.musicLevel();this.musicGain.connect(this.master);this.fxGain=this.ctx.createGain();this.fxGain.gain.value=this.fxLevel();this.fxGain.connect(this.master);}return this.ctx;}
ensure(){if(this.loading)return this.loading;this.keep([...START_AUDIO,...ARCADE_AUDIO]);try{
 this.openContext();
 for(const key of ARCADE_AUDIO)this.loadOne(key);
 const version=this.loadVersion;this.loading=Promise.all(START_AUDIO.map(key=>this.loadOne(key))).then(results=>{if(version!==this.loadVersion)return false;this.ready=true;this.failedKeys=START_AUDIO.filter((_,i)=>!results[i]);if(this.failedKeys.length){const text='一部の音を読み込めませんでした　開始前に選択してください';announce(text);if(sim)sim.message(text,5);$('audio-notice').textContent=text;}return true;}).finally(()=>{if(version===this.loadVersion)this.loading=null;});this.ctx.resume().catch(()=>{});return this.loading;
 }catch(e){this.failedKeys=[...START_AUDIO];this.loading=Promise.resolve(false);return this.loading;}}
async retryMissing(){if(!this.ctx){this.loading=null;return this.ensure();}const missing=[...this.failedKeys],results=await Promise.all(missing.map(key=>this.loadOne(key)));this.failedKeys=missing.filter((_,i)=>!results[i]);return this.failedKeys.length===0;}
setVolume(){
   if(!this.ctx||!this.master||!this.musicGain||!this.fxGain)return;const t=this.ctx.currentTime;
   this.master.gain.setTargetAtTime(settings.muted||this.runSilent?0:.7,t,.03);
  this.musicGain.gain.cancelScheduledValues(t);
  this.musicGain.gain.setTargetAtTime(this.musicLevel(),t,.03);
  this.fxGain.gain.setTargetAtTime(this.fxLevel(),t,.03);
}
createMusic(track,when,initial=1){
  const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();
  source.buffer=this.buffers[track];source.loop=true;source.loopStart=0;
   source.loopEnd=track==='stage1-boss'&&bossCandidate?Math.min(BOSS_CANDIDATE_DURATION,source.buffer.duration):track==='stage2-field'?Math.min(STAGE2_FIELD_DURATION,source.buffer.duration):track==='stage2-boss'?Math.min(STAGE2_BOSS_DURATION,source.buffer.duration):track==='stage3-field'?Math.min(STAGE3_FIELD_DURATION,source.buffer.duration):track==='stage3-boss'?Math.min(STAGE3_BOSS_DURATION,source.buffer.duration):source.buffer.duration;
  gain.gain.value=initial;source.connect(gain);gain.connect(this.musicGain);
  const handle={source,gain,track,startAt:when,onDone:null};this.activeMusic.add(handle);
  source.onended=()=>{try{source.disconnect();gain.disconnect();}catch(e){}this.activeMusic.delete(handle);if(this.fadingMusic===handle)this.fadingMusic=null;if(this.music===handle){this.music=null;this.musicTrack=null;}const done=handle.onDone;handle.onDone=null;this.releaseIdle(track);done?.();};
  source.start(when);this.musicCreated++;return handle;
}
async begin(){
  if(this.runSilent)return;
  const token=++this.intent;
  if(!this.ready||!this.ctx)return;
  try{
    await this.ctx.resume();if(token!==this.intent||mode!=='playing')return;
     const track=sim?.stageBossSpawned?bossTrackFor(sim.stageIndex):fieldTrackFor(sim?.stageIndex??0);
    if(this.music&&this.musicTrack===track)return;
     const t=this.ctx.currentTime;if(!this.buffers[track])return;this.stopMusic();this.music=this.createMusic(track,t,musicGainFor(track));this.musicTrack=track;
    this.musicGain.gain.setValueAtTime(this.musicLevel(),t);
  }catch(e){}
}
transitionToBoss(){
    const game=sim,stageIndex=sim?.stageIndex??0,track=bossTrackFor(stageIndex);
   if(this.runSilent||!this.ready||!this.ctx||!this.buffers[track]||!this.music||this.musicTrack===track)return;
  try{
     const t=this.ctx.currentTime,beat=60/112,phase=((t-this.music.startAt)%beat+beat)%beat;
     const quick=track==='stage2-boss'||track==='stage3-boss'||bossCandidate,when=quick?t:t+(phase<.08?0:beat-phase),fade=quick?.8:3,end=when+fade;
    if(this.fadingMusic){this.fadingMusic.onDone=null;try{this.fadingMusic.source.stop();}catch(e){}this.fadingMusic=null;}
     const old=this.music,next=this.createMusic(track,when,0),steps=65,oldGain=musicGainFor(old.track),newGain=musicGainFor(track);
    const fieldCurve=new Float32Array(steps),bossCurve=new Float32Array(steps);
     for(let i=0;i<steps;i++){const theta=i/(steps-1)*Math.PI/2;fieldCurve[i]=oldGain*Math.cos(theta);bossCurve[i]=newGain*Math.sin(theta);}
    old.gain.gain.cancelScheduledValues(t);old.gain.gain.setValueCurveAtTime(fieldCurve,when,fade);
    next.gain.gain.setValueCurveAtTime(bossCurve,when,fade);
    old.source.stop(end+.02);
     this.fadingMusic=old;this.music=next;this.musicTrack=track;this.evict(old.track);
      old.onDone=()=>{if(sim===game&&game&&!game.practice&&game.stageIndex===stageIndex&&stageIndex<C.STAGES.length-1&&['playing','transit','boss-defeat','paused'].includes(mode))this.prefetch(fieldTrackFor(stageIndex+1));};
  }catch(e){}
}
 transitionToStage(){
    const game=sim,stageIndex=sim?.stageIndex??0,track=fieldTrackFor(stageIndex);
    if(this.runSilent||!this.ready||!this.ctx||!this.buffers[track]||this.musicTrack===track)return;
   try{
     const t=this.ctx.currentTime,old=this.music,preloadBoss=()=>{if(sim===game&&game&&game.stageIndex===stageIndex&&stageIndex>=1&&game.stagePhase!=='clear'&&['playing','paused'].includes(mode))this.prefetch(bossTrackFor(stageIndex));};
     if(this.fadingMusic){this.fadingMusic.onDone=null;try{this.fadingMusic.source.stop();}catch(e){}this.fadingMusic=null;}
      const next=this.createMusic(track,t,old?0:musicGainFor(track));
       if(old){old.gain.gain.cancelScheduledValues(t);old.gain.gain.setValueAtTime(old.gain.gain.value,t);old.gain.gain.linearRampToValueAtTime(0,t+.65);next.gain.gain.linearRampToValueAtTime(musicGainFor(track),t+.65);old.source.stop(t+.68);this.fadingMusic=old;this.evict(old.track);old.onDone=preloadBoss;}
       this.music=next;this.musicTrack=track;if(!old)preloadBoss();if(sim?.stageIndex>=1)this.evict('stage1-boss');
   }catch(e){}
 }
async beginCredits(){
  if(this.music&&this.musicTrack===CREDITS_TRACK&&['credits','ending'].includes(mode))return;
  const token=++this.intent;
  this.stopMusic();
  if(this.runSilent||!this.ready||!this.ctx)return;
  this.keep([...COMMON_AUDIO,CREDITS_TRACK]);
  const loaded=await this.prefetch(CREDITS_TRACK);
  if(token!==this.intent||!['credits','ending'].includes(mode))return;
  if(document.hidden||(mode==='ending'&&cinematicHeld)||(mode==='credits'&&creditsHeld())){this.pause();return;}
  if(!loaded){announce('エンドロールの音楽を読み込めませんでした　クレジットはそのまま読めます');return;}
  try{
    await this.ctx.resume();
    if(token!==this.intent||!['credits','ending'].includes(mode))return;
  if(document.hidden||(mode==='ending'&&cinematicHeld)||(mode==='credits'&&creditsHeld())){this.pause();return;}
    const t=this.ctx.currentTime;
    this.music=this.createMusic(CREDITS_TRACK,t,0);this.musicTrack=CREDITS_TRACK;
    this.musicGain.gain.cancelScheduledValues(t);this.musicGain.gain.setValueAtTime(this.musicLevel(),t);
    this.music.gain.gain.linearRampToValueAtTime(.8,t+1.5);
  }catch(e){}
}
stopMusic(){
  for(const track of [this.music,this.fadingMusic])if(track){track.onDone=null;try{track.source.stop();}catch(e){}}
  this.music=null;this.fadingMusic=null;this.musicTrack=null;
}
stop(){this.intent++;this.cancelInflight();this.stopMusic();for(const v of this.voices){try{v.source.stop();}catch(e){}}this.voices=[];this.failedKeys=[];if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});}
pause(){if(this.ctx)this.ctx.suspend().catch(()=>{});}
resume(){if(this.ctx)this.ctx.resume().catch(()=>{});}
play(key,minGap=0,variant=null){
  if(this.runSilent||!this.ready||settings.muted||settings.sfxVolume===0||document.hidden||mode==='paused'||!this.ctx||this.ctx.state!=='running')return;
  const rule=SOUND_RULES[key]||{priority:1,gap:.06,max:1},t=this.ctx.currentTime;
  if(t-(this.last[key]??-999)<Math.max(rule.gap,minGap))return;
  const same=this.voices.filter(v=>v.key===key);if(same.length>=rule.max&&!(key==='combo-accent'&&same.every(v=>(v.variant||0)<variant)))return;
 const chime=key==='item-pickup'||key==='combo-accent',variantKey=key==='item-pickup'?'pickup-'+variant:'chain-'+variant;
 const buffer=chime?(this.buffers[variantKey]||this.buffers.capture):this.buffers[key];if(!buffer)return;
 if(same.length>=rule.max){for(const prior of same){this.voices=this.voices.filter(v=>v!==prior);try{prior.source.stop();}catch(e){}}}

  if(this.voices.length>=4){
    const oldest=this.voices.reduce((low,v)=>v.priority<low.priority||v.priority===low.priority&&v.started<low.started?v:low);
    if(oldest.priority>rule.priority)return;
    this.voices=this.voices.filter(v=>v!==oldest);
    try{oldest.source.stop();}catch(e){}
  }
  this.last[key]=t;const s=this.ctx.createBufferSource();s.buffer=buffer;if(rule.rate&&!chime)s.playbackRate.value=rule.rate;
  const sink=this.ctx.createGain();sink.gain.value=rule.gain??1;s.connect(sink);sink.connect(this.fxGain);
  const voice={source:s,sink,key,variant,priority:rule.priority,started:t};this.voices.push(voice);
  s.onended=()=>{this.voices=this.voices.filter(v=>v!==voice);s.disconnect();sink.disconnect();this.releaseIdle(key);};s.start();
  if(key==='return-burst'){
    const base=this.musicLevel(),gain=this.musicGain.gain;
    gain.cancelScheduledValues(t);gain.setValueAtTime(base*.64,t);gain.linearRampToValueAtTime(base,t+.5);
  }
  return true;
}
}
const sound=new Sound();
const bootClock=new window.StarStartup.Timeline(effectiveReduced());let bootReady=false,bootTrying=false,bootSilent=false,bootStamp=0;
function failBoot(){
 if(mode!=='boot')return;bootClock.cancel();$('forge-logo').style.opacity='0';$('boot-status').textContent='画面を読み込めませんでした　再読み込みしてください';$('boot-reload').hidden=false;
}
function beginBoot(silent=false){
 if(!bootReady||mode!=='boot'||bootClock.started)return;
 bootSilent=silent;bootClock.start();$('boot-options').hidden=true;$('boot-start').hidden=$('boot-silent').hidden=$('boot-reload').hidden=true;$('boot-status').textContent='';
 bootStamp=performance.now();requestAnimationFrame(tickBoot);
}
async function unlockBoot(){
 if(!bootReady||mode!=='boot'||bootTrying||bootClock.started)return;bootTrying=true;
 try{const ctx=sound.openContext();const resumed=ctx.resume().catch(()=>{});await Promise.race([resumed,new Promise(resolve=>setTimeout(resolve,300))]);
  if(ctx.state==='running')beginBoot();else{$('boot-status').textContent=settings.controlMode==='gamepad'?'音を鳴らすにはクリック / Enter　パッドBで音なし':'タップ / クリック / Enterで、星の海へ';$('boot-start').hidden=$('boot-silent').hidden=false;}
 }catch(e){$('boot-status').textContent='この環境では音声を開始できません　音なしで進めます';$('boot-silent').hidden=false;}
 finally{bootTrying=false;}
}
function prepareBoot(){
 bootReady=true;window.STAR_BOOT_READY=true;screen(null);gameColumn.appendChild($('boot-screen'));
 for(const element of document.querySelectorAll('body>header,body>main,body>footer'))element.inert=!element.contains($('boot-screen'));
 $('boot-control-recommendation').textContent=matchMedia('(pointer: coarse)').matches?'スマホ・タブレットは「タッチ」がおすすめです':'PCは「キーボード」で始められます';$('boot-control').value=settings.controlMode;$('boot-control-help').textContent=controlDescriptions[settings.controlMode];
 $('boot-options').hidden=$('boot-start').hidden=$('boot-silent').hidden=false;$('boot-status').textContent='';
 if(typeof gameColumn.requestFullscreen!=='function'){$('boot-display').disabled=true;$('boot-display-help').textContent='このブラウザは全画面表示に対応していません';}
 $('boot-language').focus({preventScroll:true});
}
function playLogoChime(){
 if(bootSilent||settings.muted||settings.sfxVolume===0||sound.ctx?.state!=='running')return;
 const ctx=sound.ctx,data=window.StarStartup.makeChime(ctx.sampleRate),buffer=ctx.createBuffer(1,data.length,ctx.sampleRate);buffer.copyToChannel(data,0);
 const source=ctx.createBufferSource();source.buffer=buffer;source.connect(sound.fxGain);const voice={key:'forge-logo',source,priority:5,started:ctx.currentTime};sound.voices.push(voice);
 source.onended=()=>{source.disconnect();sound.voices=sound.voices.filter(v=>v!==voice);};source.start();
}
function tickBoot(stamp){
 if(mode!=='boot'||!bootClock.active)return;const dt=(stamp-bootStamp)/1000;bootStamp=stamp;
 const held=document.hidden||!document.hasFocus()||(!bootSilent&&sound.ctx?.state!=='running'),frame=bootClock.step(dt,held);
 $('forge-logo').style.opacity=String(frame.opacity);$('forge-logo').style.transform=`scale(${frame.scale})`;
 if(frame.cue)playLogoChime();
 if(frame.done){
  for(const element of document.querySelectorAll('body>header,body>main,body>footer'))element.inert=false;
  beginCinematic('intro');document.documentElement.classList.remove('booting');$('boot-screen').hidden=true;clearInput();return;
 }
 requestAnimationFrame(tickBoot);
}
function chooseBoot(silent=false){
 if(!bootReady||bootClock.started||bootTrying)return;
 settings.muted=!!silent;persist();sound.setVolume();$('muted').checked=settings.muted;audioNotice();
 if($('boot-display').value==='fullscreen'&&!document.fullscreenElement&&typeof gameColumn.requestFullscreen==='function'){
  gameColumn.requestFullscreen().catch(()=>{$('boot-display-help').textContent='全画面表示を開始できませんでした　このまま遊べます';});
 }
 if(silent)beginBoot(true);else unlockBoot();
}
$('boot-control').onchange=()=>{$('control-mode').value=$('boot-control').value;$('control-mode').onchange();$('boot-control-help').textContent=controlDescriptions[settings.controlMode];};
$('boot-start').onclick=()=>chooseBoot(false);$('boot-silent').onclick=()=>chooseBoot(true);
window.addEventListener('keydown',e=>{if(mode==='boot'&&bootReady&&!bootClock.started&&['Enter',' '].includes(e.key)&&!e.repeat&&!['BUTTON','A','SELECT','INPUT'].includes(document.activeElement?.tagName)){e.preventDefault();chooseBoot(settings.muted);}},true);

function syncBootAudio(){if(mode!=='boot'||!bootClock.active||bootSilent)return;if(document.hidden||!document.hasFocus())sound.pause();else sound.resume();}
window.addEventListener('blur',syncBootAudio);window.addEventListener('focus',syncBootAudio);document.addEventListener('visibilitychange',syncBootAudio);

if(qaMode)window.STAR_QA_SOUND=sound;
if(qaMode){
  const controls=document.createElement('div');controls.id='qa-controls';
  controls.style.cssText='position:fixed;bottom:0;left:4px;z-index:9999;display:flex;flex-wrap:nowrap;max-width:calc(100vw - 8px);overflow-x:auto;gap:4px';
  const stage2=document.createElement('button');stage2.textContent='QA: STAGE 2';stage2.onclick=()=>{if(!sim||mode!=='playing'||sim.practice||sim.stageIndex!==0)return;sim.spawnBoss();sim.kill(sim.boss,true);scene?.handleEvents(sim.events);sim.events=[];};const jump=document.createElement('button');jump.textContent='QA: BOSS';jump.onclick=()=>{
    if(!sim||mode!=='playing'||sim.practice)return;
    sim.time+=Math.max(0,C.STAGES[sim.stageIndex].sweepAt-.01-sim.stageTime);sim.stageTime=C.STAGES[sim.stageIndex].sweepAt-.01;sim.player.invuln=999;
  };
  const clear=document.createElement('button');clear.textContent='QA: CLEAR';clear.onclick=()=>{
    if(!sim?.boss||mode!=='playing')return;
     sim.kill(sim.boss,true);scene?.handleEvents(sim.events);sim.events=[];
  };
  const sweep=document.createElement('button');sweep.textContent='QA: SWEEP';sweep.onclick=()=>{
    if(!sim||mode!=='playing'||sim.stagePhase!=='sweep')return;
    for(const enemy of [...sim.enemies])sim.kill(enemy,true);
  };
  const longBoss=document.createElement('button');longBoss.textContent='QA: LONG BOSS';longBoss.onclick=()=>{
    if(!sim?.boss||mode!=='playing')return;
    sim.player.invuln=999;sim.boss.hp=1e9;sim.boss.maxHp=1e9;sim.bossDeadline=sim.time+240;
  };
  const item=document.createElement('button');item.textContent='QA: ITEM';item.onclick=()=>{
    if(!sim||mode!=='playing'||sim.practice||!sim.itemsEnabled)return;
    sim.time=Math.max(sim.time,30);sim.stageTime=Math.max(sim.stageTime,30);sim.bullets=[];sim.offerStageItems();sim.tryItemDrop();
  };
  const pickup=document.createElement('button');pickup.textContent='QA: PICKUP';pickup.onclick=()=>{
    if(!sim?.item||mode!=='playing')return;
    sim.player.x=sim.item.x;sim.player.y=sim.item.y;sim.updateItem(0);scene?.handleEvents(sim.events);sim.events=[];
  };
  const routeJump=(label,seconds)=>{const button=document.createElement('button');button.textContent=label;button.onclick=()=>{
    if(!sim||mode!=='playing'||sim.practice)return;
    sim.time=seconds;sim.stageTime=seconds;sim.player.invuln=999;sim.bullets=[];
  };return button;};
   const fieldHold=document.createElement('button');fieldHold.textContent='QA: FIELD HOLD';fieldHold.onclick=()=>{if(!sim||mode!=='playing'||sim.stageIndex!==1||sim.stagePhase!=='waves')return;qaFieldHold=!qaFieldHold;if(qaFieldHold)sim.player.invuln=999;fieldHold.textContent=qaFieldHold?'QA: FIELD RELEASE':'QA: FIELD HOLD';};
   const directStage3=document.createElement('button');directStage3.textContent='QA: STAGE 3 ONLY';directStage3.onclick=()=>{
     if(!sim||mode!=='playing'||sim.practice||sim.stageIndex!==0)return;
     for(let i=0;i<2;i++){sim.spawnBoss();sim.kill(sim.boss,true);sim.advanceStage();}
     sim.events=[];sim.time=0;sim.stageTime=0;sim.waveAt=1;sim.nextShot=0;sim.nextBossAttack=0;sim.bossAttack=0;sim.lastKill=-99;sim.toast='';sim.toastUntil=0;sim.slow=0;sim.buffer=0;
     sim.score=0;sim.kills=0;sim.combo=0;sim.bestCombo=0;sim.returned=0;sim.capturedTotal=0;sim.captureUses=0;sim.captureHits=0;sim.damageByReturn=0;sim.damageByShot=0;sim.hits=0;sim.heals=0;
     sim.item=null;sim.itemPending=null;sim.itemOffered=false;sim.itemOfferIndex=0;sim.powerUntil=0;sim.twinCharge=false;sim.spreadUntil=0;sim.pierceUntil=0;sim.itemPickups=0;sim.itemActivations=0;sim.player={x:240,y:594,hp:sim.d.hp,maxHp:sim.d.hp,invuln:0};
     sim.field={phase:'ready',remaining:0,cooldown:0,count:0,energy:0,stars:[]};
     scene?.clearWorld();scene?.enterStage(2);cueGate('stage3-field',()=>sound.transitionToStage());
   };
   const twin=document.createElement('button');twin.textContent='QA: TWIN';twin.onclick=()=>{if(!sim||mode!=='playing')return;sim.item={id:++sim.id,x:sim.player.x,y:sim.player.y,r:24,age:0,type:'twin'};sim.updateItem(0);scene?.handleEvents(sim.events);sim.events=[];};
   const hazards=['split','accel','homing','beam'].map(kind=>{const button=document.createElement('button');button.textContent='QA: '+kind.toUpperCase();button.onclick=()=>{if(!sim||mode!=='playing')return;sim.bullets=[];sim.beams=[];sim.player.invuln=999;if(kind==='beam')sim.spawnBeam(240,120,Math.atan2(sim.player.y-120,sim.player.x-240));else sim.specialFan(240,140,Math.PI/2,kind==='split'?1:3,.5,kind);scene?.handleEvents(sim.events);sim.events=[];};return button;});
   const chain=document.createElement('button');chain.textContent='QA: CHAIN';let chainIndex=0;chain.onclick=()=>{if(!sim||mode!=='playing')return;const combo=[4,8,16,24][chainIndex++%4];sim.combo=combo;sim.lastKill=sim.time;scene.handleEvents([{type:'destroy',returned:true,combo,x:240,y:300,enemyType:'ray'}]);};
   const introReplay=document.createElement('button');introReplay.textContent='QA: INTRO';introReplay.onclick=()=>{if(!['menu','result'].includes(mode))return;home();cinematic.introSeen=false;beginCinematic('intro');};
   const introShots=[.12,.43,.86].map((progress,index)=>{const button=document.createElement('button');button.textContent='QA: INTRO '+(index+1);button.onclick=()=>{if(!['menu','intro','result'].includes(mode))return;home();cinematic.introSeen=false;beginCinematic('intro');cinematic.elapsed=cinematic.duration*progress;cinematicHeld=true;paintCinematic();};return button;});const moviePlay=document.createElement('button');moviePlay.textContent='QA: MOVIE PLAY';moviePlay.onclick=()=>{cinematicHeld=false;};
   controls.append(introReplay,...introShots,moviePlay,chain,twin,...hazards,stage2,directStage3,jump,sweep,longBoss,clear,item,pickup,routeJump('QA: 02/03',16.79),routeJump('QA: WHALE',28),routeJump('QA: 04/05',44.42),routeJump('QA: ARCH',64),fieldHold);document.querySelector('.game-column').appendChild(controls);
}
 function restart(){if(needsMouseLock()){clearInput();pendingMouseRestart={practice:!!sim?.practice};$('resume').disabled=true;mouseLock.request();}else start(sim?.practice);}
 function start(practice=false,keepMouseLock=false){if(!scene||assetsFailed||mode==='preparing')return;pendingMouseRestart=null;if(!keepMouseLock)mouseLock.release();pendingDifficulty=$('difficulty').value;audioGate=null;hideAudioGate();if(sound.ready&&sound.has(START_AUDIO)&&!sound.failedKeys.length){sound.stop();sound.keep(START_AUDIO);sound.runSilent=false;launch(practice);return;}return prepareStart(practice);}
 async function prepareStart(practice=false){
    mode='preparing';sound.stop();sound.runSilent=false;clearInput();screen('menu');
   $('start').disabled=true;$('practice').disabled=true;$('start').textContent='音を準備中…';
   let ready=await sound.ensure();
   while(!ready||sound.failedKeys.length){
     mouseLock.release();
     let box=$('audio-choice');
     if(!box){
       box=document.createElement('div');box.id='audio-choice';box.className='audio-choice';
       const title=document.createElement('p');title.id='audio-choice-message';box.appendChild(title);
       for(const [id,label]of [['audio-retry','再試行'],['audio-silent','音なしで続ける'],['audio-back','タイトルへ戻る']]){const button=document.createElement('button');button.id=id;button.textContent=label;box.appendChild(button);}
       $('menu-screen').querySelector('.menu-card').appendChild(box);
     }
     $('audio-choice-message').textContent='一部のBGMまたは効果音を読み込めませんでした\n音を確認してから出発します';
     box.hidden=false;
     const choice=await new Promise(resolve=>{for(const [id,value]of [['audio-retry','retry'],['audio-silent','silent'],['audio-back','back']])$(id).onclick=()=>resolve(value);});
     box.hidden=true;
     if(choice==='back'){mode='menu';$('start').disabled=false;$('practice').disabled=false;$('start').textContent='星の海へ ↗';$('start').focus({preventScroll:true});return;}
      if(choice==='silent'){sound.runSilent=true;sound.keep([]);break;}
     $('start').textContent='音を再確認中…';ready=await sound.retryMissing();
   }
   launch(practice);
 }
 async function launch(practice=false){
    readyAudioAction=null;const token=++launchGeneration,difficulty=pendingDifficulty;mode='preparing';clearInput();$('start').disabled=true;$('practice').disabled=true;$('start').textContent='出発を準備中…';
    const online=await ranking.start(difficulty,practice);if(token!==launchGeneration)return;
    cinematic.cancel();stageTransit=null;cancelBossDefeat();document.body.classList.remove('cinematic-active');
    sound.setVolume();session++;clearInput();acc=0;finished=false;pendingFinish=0;qaFieldHold=false;
   sim=new C.Game({difficulty,practice,reduced:effectiveReduced(),seed:online?.seed||(qaMode&&Number.isInteger(window.STAR_QA_SEED)?window.STAR_QA_SEED:(window.crypto?.getRandomValues?window.crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*4294967296))),itemsEnabled:window.STAR_ITEMS_OFF!==true});
   mode='playing';document.body.classList.remove('result-active','credits-active','stage-clear-active');document.body.classList.add('run-active');window.scrollTo(0,0);settings.difficulty=sim.difficulty;persist();screen(null);
   $('start').disabled=false;$('practice').disabled=false;$('start').textContent='星の海へ ↗';$('pause').disabled=false;$('capture').disabled=false;$('boss-health').hidden=true;
   scene.clearWorld();const hold=document.hidden||!document.hasFocus()||!!document.querySelector('dialog[open]');if(hold)pause('画面を離れているため、出発を一時停止しました');else if(needsMouseLock()&&!mouseLock.locked)pause('マウスを固定すると出発します　カーソルは隠れ、盤面の外へ抜けずに動けます　Escで固定を解除します');else{$('arena').focus({preventScroll:true});if(!sound.runSilent)sound.begin();}updateUI(true);
   announce(practice?'練習を始めました　紫の弾が近づいたら星返し':'出発しました　紫の弾が近づいたら星返し');
 }
 let audioGate=null,readyAudioAction=null;
 const gateBox=document.createElement('div');gateBox.className='audio-choice';gateBox.hidden=true;
 const gateMessage=document.createElement('p');gateBox.appendChild(gateMessage);
 for(const [id,label]of [['gate-retry','再試行'],['gate-silent','音なしで続ける'],['gate-home','タイトルへ戻る']]){const button=document.createElement('button');button.id=id;button.textContent=label;gateBox.appendChild(button);}
 $('pause-screen').querySelector('.menu-card').appendChild(gateBox);
 function hideAudioGate(){gateBox.hidden=true;$('resume').hidden=false;$('restart-pause').hidden=false;$('home-pause').hidden=false;}
 function cueGate(key,after){
   if(sound.runSilent||sound.buffers[key]){audioGate=null;after();return;}
   if(audioGate?.key===key&&audioGate.game===sim&&audioGate.stageIndex===sim?.stageIndex)return;
   const gate={key,after,session,game:sim,stageIndex:sim?.stageIndex};audioGate=gate;
   const attempt=async()=>{
     gateMessage.textContent='音を読み込み中…';$('gate-retry').disabled=true;
     const ok=await sound.prefetch(key);if(audioGate!==gate)return;
     if(session!==gate.session||sim!==gate.game||sim?.stageIndex!==gate.stageIndex||!['playing','paused','transit'].includes(mode)||sim?.stagePhase==='clear'){audioGate=null;return;}
     if(ok){
       audioGate=null;hideAudioGate();
       if(mode==='playing'&&!document.hidden&&document.hasFocus()&&!document.querySelector('dialog[open]')&&(!needsMouseLock()||mouseLock.locked)){after();return;}
       readyAudioAction=after;
       if(mode!=='paused')pause('画面を離れているため、一時停止しました');
       return;
     }
     pause('場面の音を読み込めませんでした');gateBox.hidden=false;$('resume').hidden=true;$('restart-pause').hidden=true;$('home-pause').hidden=true;
     gateMessage.textContent='音を読み込めませんでした\n再試行、音なし、タイトルから選んでください';$('gate-retry').disabled=false;
   };
   $('gate-retry').onclick=attempt;
   $('gate-silent').onclick=()=>{if(audioGate!==gate)return;audioGate=null;sound.stop();sound.runSilent=true;sound.keep([]);sound.setVolume();readyAudioAction=after;hideAudioGate();resume();};
   $('gate-home').onclick=home;attempt();
 }
 function pause(reason='星の時間を止めています'){if(!['playing','transit','boss-defeat','paused'].includes(mode)||!sim)return;pendingMouseRestart=null;sim.pause();mode='paused';$('boss-defeat-skip').hidden=true;mouseLock.release();clearInput();acc=0;sound.pause();screen('pause');$('pause-reason').textContent=reason.replace(/　/g,'\n');$('capture').disabled=true;$('resume').disabled=false;$('resume').textContent=resumeLabel();$('resume').focus({preventScroll:true});announce('一時停止しました');}
 function resume(mouseGesture=false){
  if(mode!=='paused'||!sim||(audioGate&&!gateBox.hidden)||document.hidden||!document.hasFocus()||document.querySelector('dialog[open]'))return;
  if(needsMouseLock()&&!mouseLock.locked){
   $('resume').textContent=sim.time===0?'マウスを固定して出発':'マウスを固定して続きへ';
   if(mouseGesture===true){$('pause-reason').textContent='マウスの固定を待っています　許可されるまでゲームは進みません';$('resume').disabled=true;mouseLock.request();}
   else $('pause-reason').textContent='下のボタンをクリックしてマウスを固定してください　Escで固定を解除できます';
   return;
  }
  $('resume').disabled=false;$('resume').textContent='続きへ';sim.resume();
  if(stageDefeat){mode='boss-defeat';clearInput();acc=0;sound.resume();screen(null);$('boss-defeat-skip').hidden=false;$('capture').disabled=true;$('arena').focus({preventScroll:true});return;}
  if(stageTransit){mode='transit';cinematicHeld=false;clearInput();acc=0;sound.resume();screen('cinematic');$('capture').disabled=true;paintCinematic();$('cinematic-skip').focus({preventScroll:true});return;}
  mode='playing';clearInput();acc=0;screen(null);$('capture').disabled=false;if(readyAudioAction){const action=readyAudioAction;readyAudioAction=null;action();}if(!sound.music)sound.begin();else sound.resume();$('arena').focus({preventScroll:true});announce('プレイを再開しました');
 }
 function home(){document.documentElement.classList.remove('opening');pendingMouseRestart=null;mouseLock.release();$('resume').disabled=false;stageTransit=null;cancelBossDefeat();readyAudioAction=null;launchGeneration++;ranking.cancel();$('start').disabled=false;$('practice').disabled=false;$('start').textContent='星の海へ ↗';cinematic.cancel();document.body.classList.remove('cinematic-active');currentResult=null;creditsRemaining=0;audioGate=null;hideAudioGate();document.body.classList.remove('run-active','result-active','credits-active','stage-clear-active');sound.stop();sound.keep(COMMON_AUDIO);clearInput();mode='menu';sim=null;finished=false;acc=0;screen('menu');$('pause').disabled=true;$('capture').disabled=true;$('boss-health').hidden=true;$('power-status').hidden=true;$('game-message').textContent='';$('act').textContent='第1ステージ・潮の入口';$('combo').hidden=true;scene?.clearWorld();updateRecords();$('start').focus({preventScroll:true});}
let currentResult=null,creditsRemaining=0,creditsElapsed=0,creditsReading=false,creditsBlurred=false,creditsSkyStamp='';
const cinematic=new window.StarCinematic.Timeline();let cinematicHeld=false,stageTransit=null,stageDefeat=null;
function cancelBossDefeat(){stageDefeat?.clock.cancel();stageDefeat=null;scene?.clearBossDefeat();$('boss-defeat-skip').hidden=true;}
function beginBossDefeat(stageIndex){
 if(!sim||sim.practice||sim.stagePhase!=='clear'||stageIndex!==sim.stageIndex)return;
 cancelBossDefeat();const clock=new window.StarCinematic.Timeline();clock.start('defeat',effectiveReduced());
 stageDefeat={game:sim,session,stageIndex,clock};mode='boss-defeat';clearInput();acc=0;screen(null);
 scene?.beginBossDefeat(stageIndex);$('stage-clear-banner').hidden=true;document.body.classList.remove('stage-clear-active');
 $('boss-defeat-skip').hidden=false;$('boss-defeat-skip').disabled=true;$('pause').disabled=false;$('capture').disabled=true;
 $('boss-defeat-skip').textContent='省略 · '+controlGuide().defeat;announce('主を撃破　星の光へ還ります　'+controlGuide().defeat+'で撃破演出を省略　'+controlGuide().pause+'で一時停止');
 if(document.hidden||!document.hasFocus())pause('画面を離れたので、一時停止しました');
}
function tickBossDefeat(dt){
 const defeat=stageDefeat;if(!defeat||defeat.game!==sim||defeat.session!==session||mode!=='boss-defeat')return;
 if(document.hidden||!document.hasFocus()||document.querySelector('dialog[open]'))return;
 defeat.clock.setReduced(effectiveReduced());const done=defeat.clock.step(dt);
 scene?.paintBossDefeat(defeat.clock.elapsed/defeat.clock.duration,effectiveReduced());$('boss-defeat-skip').disabled=defeat.clock.elapsed+1e-9<.35;
 if(done)completeBossDefeat();
}
function completeBossDefeat(){
 const defeat=stageDefeat;if(!defeat||defeat.game!==sim||defeat.session!==session||mode!=='boss-defeat')return;
 const stageIndex=defeat.stageIndex;cancelBossDefeat();mode='playing';clearInput();acc=0;
 if(stageIndex<2)beginStageTransit(stageIndex);
 else{$('stage-clear-banner').hidden=false;document.body.classList.add('stage-clear-active');$('arena').focus({preventScroll:true});}
}
function skipBossDefeat(){if(mode!=='boss-defeat'||!stageDefeat||document.hidden||!document.hasFocus()||document.querySelector('dialog[open]'))return;if(stageDefeat.clock.skip())completeBossDefeat();}
function beginStageTransit(stageIndex){
 if(!sim||sim.practice||sim.stagePhase!=='clear'||stageIndex>=2||stageIndex!==sim.stageIndex)return;
 stageTransit={game:sim,session,stageIndex,acc:0};sound.stopMusic();scene?.resetComboAccent();
 beginCinematic('transit');$('stage-clear-banner').hidden=true;$('pause').disabled=false;$('capture').disabled=true;
}
function tickStageTransit(dt){
 const passage=stageTransit;if(!passage||passage.game!==sim||passage.session!==session||mode!=='transit')return;
 if(cinematicHeld||document.hidden||document.querySelector('dialog[open]'))return;
 passage.acc+=Math.max(0,Math.min(.05,Number(dt)||0));
 while(passage.acc+1e-9>=1/60&&stageTransit===passage&&mode==='transit'){
  passage.acc-=1/60;cinematic.step(1/60);sim.step(1/60);scene.handleEvents(sim.events);
 }
 if(stageTransit===passage)paintCinematic();
}
function endStageTransit(stageIndex){
 if(!stageTransit||stageTransit.game!==sim||stageTransit.session!==session||stageIndex!==stageTransit.stageIndex+1)return;
 stageTransit=null;cinematic.cancel();cinematicHeld=false;document.body.classList.remove('cinematic-active');
 mode='playing';screen(null);clearInput();acc=0;$('pause').disabled=false;$('arena').focus({preventScroll:true});
}

function beginCinematic(kind){
 if(kind==='ending'&&currentResult?.result!=='stage-clear'||kind==='transit'&&!stageTransit)return;
 if(kind!=='transit')mouseLock.release();
 if(!cinematic.start(kind,effectiveReduced()))return;
 cinematicHeld=document.hidden||!document.hasFocus();clearInput();acc=0;mode=kind;document.body.classList.remove('result-active','credits-active','stage-clear-active');document.body.classList.add('cinematic-active');screen('cinematic');
 document.documentElement.classList.toggle('opening',kind==='intro');
 const intro=kind==='intro',transit=kind==='transit',nextStage=transit?stageTransit.stageIndex+1:0,canvas=$('cinematic-screen');canvas.dataset.kind=kind;canvas.dataset.next=String(nextStage);canvas.setAttribute('aria-label',intro?'星の海への出発':transit?`第${nextStage+1}ステージへの航路`:'三つの海からの帰還');
 $('cinematic-far').src=asset(intro?'stage1/stage1-far.webp':transit?`v7-art/stage${nextStage}-clear.webp`:'stage3/route/stage3-route-06.webp');
 $('cinematic-next').src=asset(transit?`stage${nextStage+1}/route/stage${nextStage+1}-route-01.webp`:'stage1/stage1-far.webp');
 $('cinematic-near').src=asset(intro?'v7-art/stage1-near.webp':transit?`v7-art/stage${nextStage+1}-near.webp`:'v7-art/stage3-near.webp');
 $('cinematic-ship').src=asset('player.png');$('cinematic-ring').src=$('cinematic-ring-second').src=asset('ring.png');$('cinematic-glow').src=asset('glow.png');
 const stars=$('cinematic-stars');stars.replaceChildren();for(let i=0;i<(intro?24:transit?18:0);i++){const star=document.createElement('img');star.src=asset(intro?'bullet-petal.png':'star.png');star.dataset.kind=intro?'bullet':'star';star.alt='';stars.appendChild(star);}
 paintCinematic();if(kind==='ending')sound.beginCredits();$('cinematic-skip').focus({preventScroll:true});announce((intro?'星の海への出発':transit?'次の海への航路':'三つの海を越えました')+'　'+cinematicAction()+'で'+(intro?'タイトルへ':transit?'動きを省けます':'クレジットへ進めます'));
}
function paintCinematic(){
 if(!cinematic.active&&!stageTransit)return;
 const kind=cinematic.kind,intro=kind==='intro',transit=kind==='transit',quiet=cinematic.reduced,p=cinematic.progress;
 const clamp=(v)=>Math.max(0,Math.min(1,v)),ease=v=>1-Math.pow(1-clamp(v),3),far=$('cinematic-far'),near=$('cinematic-near'),next=$('cinematic-next'),ship=$('cinematic-ship'),ring=$('cinematic-ring'),second=$('cinematic-ring-second'),glow=$('cinematic-glow'),title=$('cinematic-title');
 $('cinematic-screen').dataset.quiet=String(quiet);next.style.opacity='0';ring.style.opacity=second.style.opacity=glow.style.opacity='0';title.style.opacity='0';$('cinematic-progress').hidden=!transit;$('ending-road').toggleAttribute('hidden',kind!=='ending');
 if(intro){
  const approach=clamp(p/.28),catching=clamp((p-.28)/.32),flight=clamp((p-.6)/.4),shipY=quiet?28:flight?64-108*flight*flight:86-22*ease(approach);
  far.style.transform=`translateY(${quiet?-5:7-10*p-12*flight*flight}%) scale(${quiet?1.18:1.14+.12*flight})`;near.style.transform=`translateY(${quiet?-10:15-15*p-45*flight*flight}%) scale(1.2)`;near.style.opacity='.42';
  ship.style.left=(quiet?50:50+Math.sin(approach*Math.PI)*7-Math.sin(flight*Math.PI)*8)+'%';ship.style.top=shipY+'%';ship.style.transform=`translate(-50%,-50%) scale(${quiet?.8:1.06-.55*flight}) rotate(${quiet?0:12*Math.sin(approach*Math.PI)-16*Math.sin(flight*Math.PI)}deg)`;ship.style.opacity='1';
  const pulse=quiet?.32:Math.sin(catching*Math.PI)*.9;ring.style.left=glow.style.left='50%';ring.style.top=glow.style.top='64%';ring.style.opacity=String(pulse);ring.style.transform=`translate(-50%,-50%) scale(${quiet?1.1:.7+catching*1.5})`;glow.style.opacity=String(pulse*.65);glow.style.transform=`translate(-50%,-50%) scale(${quiet?1:1+catching*1.2})`;
  for(const [i,star]of [...$('cinematic-stars').children].entries()){
   const angle=i*Math.PI*2/24+.12,converted=quiet||p>.36,r=quiet?26:catching?20+Math.pow(catching,1.8)*70:62-42*ease(approach);const kindName=converted?'star':'bullet';if(star.dataset.kind!==kindName){star.dataset.kind=kindName;star.src=asset(converted?'star.png':'bullet-petal.png');}
   star.style.left=(50+Math.cos(angle)*r*(flight?.55:1))+'%';star.style.top=(quiet?45+Math.sin(angle)*21:flight?(i*17+flight*180)%125-15:64+Math.sin(angle)*r*.63)+'%';star.style.opacity=quiet?(i%3===0?'.6':'0'):String(flight?.65:Math.min(1,approach*2));star.style.transform=`translate(-50%,-50%) rotate(${angle*180/Math.PI}deg) scale(${quiet?.55:flight?.7:.65+.2*catching},${quiet?.55:flight?1+flight*3:.65+.2*catching})`;
  }
  const reveal=quiet?1:ease((p-.73)/.16);title.style.opacity=String(reveal);title.style.transform=`translate(-50%,-50%) scale(${quiet?1:.88+.12*reveal})`;title.style.top=quiet?'53%':'46%';$('cinematic-title-main').textContent='星返し';$('cinematic-title-sub').textContent='STAR REBOUND';$('cinematic-copy').textContent=quiet?'沈んだ星を取り戻し、\n三つの海に\n帰り道をつなごう':p<.28?'帰り道の星が、\n海に沈んだ':p<.6?'三つの主が、\n帰り道を閉ざす':'迫る弾を返し、\n星路をつなげ';
 }else if(transit){
  const stage=stageTransit.stageIndex+1,travel=clamp((p-.22)/.62),arrival=quiet?1:ease((p-.55)/.4),gather=clamp(p/.3);
  far.style.transform=`translateY(${quiet?0:-12*travel*travel}%) scale(${quiet?1.12:1.12+.14*travel})`;next.style.opacity=String(arrival);next.style.transform=`translateY(${quiet?0:10*(1-arrival)}%) scale(${quiet?1.15:1.3-.15*arrival})`;near.style.transform=`translateY(${quiet?-5:8-32*travel*travel}%) scale(1.18)`;near.style.opacity=String(.2+.25*arrival);
  ship.style.left=(quiet?50:50+(stage===1?Math.sin(travel*Math.PI)*10:-Math.sin(travel*Math.PI)*7))+'%';ship.style.top=(quiet?66:72-100*travel*travel)+'%';ship.style.transform=`translate(-50%,-50%) scale(${quiet?.8:1.1-.8*travel}) rotate(${quiet?0:(stage===1?-14:10)*Math.sin(travel*Math.PI)}deg)`;ship.style.opacity=quiet?'1':String(1-clamp((travel-.8)/.2));
  ring.style.left=second.style.left='50%';ring.style.top=second.style.top='39%';ring.style.opacity=String(quiet?.25:stage===2?arrival*.65:(1-travel)*.5);second.style.opacity=stage===2?String(quiet?.12:arrival*.3):'0';ring.style.transform=`translate(-50%,-50%) scale(${quiet?1.4:1+arrival*1.5}) rotate(${quiet?0:p*65}deg)`;second.style.transform=`translate(-50%,-50%) scale(${quiet?1.9:1.6+arrival*2}) rotate(${quiet?0:-p*45}deg)`;
  glow.style.left='50%';glow.style.top='45%';glow.style.opacity=String(quiet?.15:Math.sin(p*Math.PI)*.45);glow.style.transform='translate(-50%,-50%) scale(2)';
  for(const [i,star]of [...$('cinematic-stars').children].entries()){const angle=i*2.4,r=quiet?24:45*(1-gather)+10+travel*35;star.style.left=(50+(stage===1?(i%2?1:-1)*r:Math.cos(angle)*r))+'%';star.style.top=(quiet?20+i*3.3:stage===1?15+(i*7+travel*140)%90:45+Math.sin(angle)*r*.8+travel*55)+'%';star.style.opacity=quiet?(i%4===0?'.45':'0'):String(.35+.45*gather);star.style.transform=`translate(-50%,-50%) scale(.65,${quiet?.65:1+travel*2.5})`;}
  const celebrate=!quiet&&p<.32;title.style.opacity=celebrate?String(Math.min(1,p*16,(.32-p)*16)):quiet?'1':String(arrival);title.style.transform=`translate(-50%,-50%) scale(${quiet?1:.92+.08*arrival})`;title.style.top='43%';$('cinematic-title-main').textContent=celebrate?'突破！':stage===1?'鏡潮の分岐':'時環の帰路';$('cinematic-title-sub').textContent=celebrate?`STAGE ${stage} CLEAR`:`STAGE ${stage+1}`;$('cinematic-copy').textContent=stage===1?'最初の星が灯る\n次は、移ろう鏡の海へ':'二つの星がつながる\n最後は、時の輪へ';
  $('cinematic-progress').firstElementChild.style.width=Math.min(100,Math.max(0,(sim.time-(sim.stageClearUntil-3.2))/3.2*100))+'%';
 }else{
  const frame=window.StarCinematic.endingFrame(p,quiet);
  window.StarCinematic.paintEnding($('ending-road'),frame,ship);
  far.style.transform=`translateY(${quiet?-3:2-7*p}%) scale(1.18)`;near.style.transform=`translateY(${quiet?-5:6-18*p}%) scale(1.15)`;near.style.opacity='.12';
  ship.style.left=frame.ship.x/4.8+'%';ship.style.top=frame.ship.y/7.2+'%';ship.style.opacity='0';
  glow.style.left='52.08%';glow.style.top='20.83%';glow.style.transform='translate(-50%,-50%) scale(.8,.45)';glow.style.opacity=String(frame.glow);
  $('cinematic-copy').textContent=quiet?'返した星が、帰り道に\nおかえり、小さな星舟':p<.28?'集めた星が、\nひとつの道になる':p<.7?'煌めく星路を、\nどこまでも':'この光は、帰り道\nおかえり、小さな星舟';

 }
 $('cinematic-screen').style.setProperty('--cinematic-shade',intro?'.18':transit?'.12':'.16');$('cinematic-skip').textContent=transit&&quiet?'次の海を準備中…':(intro?'タイトルへ':transit?'動きを省く':'クレジットへ')+' · '+cinematicAction();
}
function completeCinematic(completion){if(!completion||completion.version!==cinematic.version)return;document.body.classList.remove('cinematic-active');if(completion.kind==='intro'){document.documentElement.classList.remove('opening');mode='menu';screen('menu');$('start').focus({preventScroll:true});}else if(currentResult?.result==='stage-clear')showCredits();}
function skipCinematic(){if(stageTransit){cinematic.skip();paintCinematic();return;}completeCinematic(cinematic.skip());}

function creditsHeld(){return document.hidden||creditsBlurred||$('settings').open;}
function syncCreditsAudio(){if(mode!=='credits')return;if(creditsHeld())sound.pause();else if(sound.music)sound.resume();else sound.beginCredits();}
function paintCredits(dt=0){
 if(mode!=='credits')return;
 const view=document.querySelector('.credits-window'),roll=$('credits-roll'),finale=roll.lastElementChild,frame=FEEL.creditsFrame(creditsElapsed,dt,view.clientHeight,roll.offsetHeight,creditsHeld()||creditsReading,finale.offsetHeight);
 creditsElapsed=frame.elapsed;creditsRemaining=creditsReading?Infinity:frame.remaining;
 roll.style.animation='none';roll.style.transform=creditsReading?'none':`translateY(${frame.y}px)`;
 finale.style.transform=creditsReading?'none':`translateY(${frame.finaleOffset}px)`;
 document.body.classList.toggle('credits-reading',creditsReading);const reduced=effectiveReduced();$('credits-read').disabled=reduced;$('credits-read').textContent=reduced?'スクロールで読む':creditsReading?'流して見る':'止めて読む';$('credits-read').setAttribute('aria-pressed',String(creditsReading));
 const skyTime=reduced?0:creditsElapsed,stamp=[skyTime,reduced,window.devicePixelRatio,frame.closing].join(':');
 if(stamp!==creditsSkyStamp){window.StarCinematic.paintCreditsSky($('credits-sky'),window.StarCinematic.creditsSkyFrame(skyTime,reduced,reduced?0:frame.closing));creditsSkyStamp=stamp;}
 $('credits-screen').style.setProperty('--credits-closing',reduced?0:frame.closing);
 if(!creditsReading&&frame.done)showResult();
}
function setCreditsReading(reading){
 if(mode!=='credits'||reading===creditsReading)return;
 const view=document.querySelector('.credits-window'),scroll=reading?Math.max(0,creditsElapsed*48-view.clientHeight):view.scrollTop;
 creditsReading=reading;if(!reading)creditsElapsed=FEEL.creditsResumeTime(scroll,view.clientHeight);
 paintCredits();view.scrollTop=reading?scroll:0;
}
function showCredits(){
 cinematic.cancel();document.body.classList.remove('cinematic-active');if(!currentResult||currentResult.result!=='stage-clear')return;
 mode='credits';document.body.classList.remove('result-active','stage-clear-active');document.body.classList.add('credits-active');screen('credits');
 creditsElapsed=0;creditsBlurred=!document.hasFocus();creditsReading=effectiveReduced();creditsSkyStamp='';
 document.querySelector('.credits-window').scrollTop=0;paintCredits();syncCreditsAudio();$('credits-skip').focus({preventScroll:true});announce('三つのステージをクリア　止めて読むボタンでクレジットを読み返せます');
}
function showResult(){if(!currentResult)return;document.body.classList.remove('credits-reading');mode='result';creditsRemaining=0;sound.stop();sound.keep(COMMON_AUDIO);document.body.classList.remove('credits-active','credits-dialog-open');document.body.classList.add('result-active');screen('result');$('result-title').focus({preventScroll:true});announce(`${$('result-title').textContent} 得点${currentResult.score}　返した星${currentResult.returned}個`);}
function finish(){
  mouseLock.release();
   if(finished||!sim)return;finished=true;scene?.resetComboAccent();clearInput();sound.intent++;sound.cancelInflight();sound.stopMusic();sound.keep(COMMON_AUDIO);
   $('stage-clear-banner').hidden=true;$('power-toast').hidden=true;document.body.classList.remove('stage-clear-active');
  $('pause').disabled=true;$('capture').disabled=true;$('power-status').hidden=true;
  const result=Object.freeze({...sim.summary(),remainingBossHp:sim.state==='timeout'&&sim.boss?Math.ceil(sim.boss.hp):null,bossMaxHp:sim.boss?.maxHp??null}),clear=result.result==='stage-clear',practice=result.practice;
   $('result-screen').style.backgroundImage=`linear-gradient(180deg,#06102428,#06102466),url("${resultArtPath(result)}")`;
  currentResult=result;ranking.result(result);$('post-result-x').href=resultPostUrl(result);$('share-status').textContent='';$('share-actions').hidden=practice;$('credits-replay').hidden=!clear;if(clear)sound.play('victory',0);
  $('result-kicker').textContent=practice?'PRACTICE COMPLETE':clear?'THREE STAGES CLEAR':'REBOUND AGAIN';
  $('result-title').textContent=practice?'光を返す、その感覚を':clear?'帰り道に、星が灯る':result.result==='timeout'?'帰り道は、まだ遠く':'まだ、光は残っている';
   $('result-copy').textContent=practice?'第1ステージの練習でした\n記録には残りません':clear?'三つの星が、一本の道になりました\n小さな星舟に、おかえりを':result.result==='timeout'?'制限時間になりました\n次は弾を集めて、一気に道をひらこう':'返した光は、次の旅につながる\n近づく弾を集めて、もう一度、星路へ';
  $('result-score').textContent=format(result.score);
  $('result-stats').textContent=`返した星 ${result.returned}個 · 最高連続撃破 ${result.bestCombo}回\r\n${Math.floor(result.time)}秒の旅 · ライフ ${result.hp}/${result.maxHp} · 星の回復 ${result.heals}回${practice?' · 練習のため記録なし':''}`;
  $('result-detail-values').textContent=`撃破 ${result.kills}機 · 被弾 ${result.hits}回 · 星返し使用 ${result.captureUses}回\n撃破得点（倍率込み） ${format(result.scoreBreakdown.defeats)}\n返却得点 ${format(result.scoreBreakdown.returns)}\nボス撃破時ライフ得点 ${format(result.scoreBreakdown.lifeBonus)}`;
  if(result.remainingBossHp!==null)$('result-detail-values').textContent+=`\nボス残りHP ${result.remainingBossHp} / ${result.bossMaxHp}`;
  $('result-details').open=false;
  $('result-stats').style.whiteSpace='pre-line';let best=false;
  if(!practice){
    saved.previewRuns++;if(clear)saved.previewClears++;
    if(result.score>saved.previewBests[result.difficulty]){saved.previewBests[result.difficulty]=result.score;best=true;}
    persist();
  }
   $('new-best').textContent=practice?'気楽に練習、何度でも':best?'新記録！':`ベスト ${format(saved.previewBests[result.difficulty])}`;
  $('retry').textContent=practice?'第1ステージへ出る':'もう一度、星の海へ';
  $('result-title').setAttribute('tabindex','-1');updateRecords();
  if(clear)beginCinematic('ending');else showResult();
}
function capture(){if(mode!=='playing'||!sim||document.hidden||!document.hasFocus()||document.querySelector('dialog[open]'))return;const accepted=sim.requestCapture();if(accepted){sound.play('button');scene?.pulseField();announce('星返し　近くの弾をつかまえています');}else{$('field-hint').textContent='あと少しで、次の星返し';}}
function confirm(title,copy,label,action){lastFocus=document.activeElement;$('confirm-title').textContent=title;$('confirm-copy').textContent=copy;$('confirm-yes').textContent=label;confirmAction=action;openDialog($('confirm-dialog'));$('confirm-no').focus();}
$('confirm-no').onclick=()=>{$('confirm-dialog').close();confirmAction=null;lastFocus?.focus();};$('confirm-yes').onclick=()=>{const fn=confirmAction;confirmAction=null;$('confirm-dialog').close();fn?.();};$('confirm-dialog').addEventListener('cancel',()=>{confirmAction=null;});
function resultCaption(r){
 const outcome=r.result==='practiced'?'練習完了（記録対象外）':r.result==='stage-clear'?'3ステージクリア':r.result==='timeout'?`第${r.stageIndex+1}ステージで時間切れ`:`第${r.stageIndex+1}ステージでゲームオーバー`;
 return L.text(`星返し / STAR REBOUND\n${outcome} | SCORE ${Math.round(r.score).toLocaleString('ja-JP')}\n星返し ${r.returned}発・最大連鎖 ${r.bestCombo}\n#星返し`);
}
function resultPostUrl(r){return 'https://x.com/intent/tweet?text='+encodeURIComponent(resultCaption(r));}
 function resultArtPath(r){return asset(`v7-art/${r.result==='stage-clear'?'final-clear':'gameover'}.webp`);}
async function makeResultImage(r){
 await document.fonts.ready;const img=new Image();img.decoding='async';img.src=resultArtPath(r);
 await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('art load failed'));});
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=675;const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas unavailable');
  ctx.fillStyle='#071426';ctx.fillRect(0,0,1200,675);ctx.drawImage(img,0,0,450,675);const shade=ctx.createLinearGradient(420,0,490,0);shade.addColorStop(0,'#07142600');shade.addColorStop(1,'#071426');ctx.fillStyle=shade;ctx.fillRect(420,0,80,675);
  ctx.textAlign='left';ctx.shadowColor='#020817';ctx.shadowBlur=16;ctx.fillStyle='#ffdfa0';ctx.font=L.language==='en'?'bold 58px sans-serif':'bold 74px Noto, sans-serif';ctx.fillText(L.language==='en'?'STAR REBOUND':'星返し',505,140,650);ctx.font='25px sans-serif';ctx.fillStyle='#a9e7e7';ctx.fillText(L.language==='en'?'Turn incoming fire into guiding light':'STAR REBOUND',509,180,650);
  ctx.fillStyle='#fff5df';ctx.font='bold 36px Noto, sans-serif';ctx.fillText(L.text(r.result==='practiced'?'練習完了・記録対象外':r.result==='stage-clear'?'3ステージ クリア':`第${r.stageIndex+1}ステージ ${r.result==='timeout'?'時間切れ':'ゲームオーバー'}`),505,340,650);
  ctx.font='bold 60px sans-serif';ctx.fillStyle='#ffda88';ctx.fillText(`SCORE ${Math.round(r.score).toLocaleString('ja-JP')}`,505,435);ctx.font='25px Noto, sans-serif';ctx.fillStyle='#eaf8fc';ctx.fillText(L.text(`星返し ${r.returned}発  ·  最大連鎖 ${r.bestCombo}`),505,496,650);
 return canvas;
}
$('save-result-image').onclick=async()=>{const r=currentResult;if(!r)return;const status=$('share-status');status.textContent='画像を作成中…';try{const canvas=await makeResultImage(r);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG unavailable');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`star-rebound-${r.result}-${Math.round(r.score)}.png`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);status.textContent='画像の保存を開始しました\nダウンロードを確認してください';}catch(e){status.textContent='画像を保存できませんでした\nもう一度お試しください';}};
$('cinematic-skip').onclick=skipCinematic;
$('opening-replay').onclick=()=>{if(mode!=='menu'||assetsFailed)return;home();cinematic.introSeen=false;beginCinematic('intro');};
function changeLanguage(value){
 settings.language=L.setLanguage(value);$('language').value=$('boot-language').value=settings.language;persist();
 if(currentResult)$('post-result-x').href=resultPostUrl(currentResult);
 if(mode==='credits'){creditsSkyStamp='';setCreditsReading(true);}
 L.sync();
}
$('language').value=$('boot-language').value=settings.language;
$('language').onchange=()=>changeLanguage($('language').value);
$('boot-language').onchange=()=>changeLanguage($('boot-language').value);
$('boss-defeat-skip').onclick=skipBossDefeat;
const creditsView=document.querySelector('.credits-window');for(const type of ['wheel','touchstart'])creditsView.addEventListener(type,()=>setCreditsReading(true),{passive:true});creditsView.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))setCreditsReading(true);});
$('start').onclick=()=>start(false);$('practice').onclick=()=>start(true);$('retry').onclick=()=>start(false);$('credits-skip').onclick=showResult;$('credits-replay').onclick=showCredits;$('credits-read').onclick=()=>setCreditsReading(!creditsReading);$('pause').onclick=()=>pause();$('resume').onclick=()=>resume(true);$('home-result').onclick=home;$('home-pause').onclick=()=>confirm('タイトルへ戻りますか？','今のプレイは終了します　記録は残りません','タイトルへ戻る',home);$('restart-pause').onclick=()=>confirm('最初から、もう一度？','今のプレイは終了します　記録は残りません','やり直す',restart);$('reload').onclick=()=>location.reload();
const fullscreenButton=$('fullscreen'),menuFullscreenButton=$('fullscreen-menu'),gameColumn=document.querySelector?.('.game-column')||fullscreenButton;
fullscreenButton.disabled=menuFullscreenButton.disabled=typeof gameColumn.requestFullscreen!=='function';
async function toggleFullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await gameColumn.requestFullscreen();}catch(err){announce('全画面表示を開始できませんでした　このまま遊べます');menuFullscreenButton.textContent='全画面を使えません · このまま開始';}}
fullscreenButton.onclick=toggleFullscreen;menuFullscreenButton.onclick=toggleFullscreen;
document.addEventListener('fullscreenchange',()=>{const active=document.fullscreenElement===gameColumn;fullscreenButton.textContent=active?'⤡':'⛶';fullscreenButton.setAttribute('aria-label',active?'全画面を終了':'全画面表示');fullscreenButton.title=active?'全画面を終了':'全画面表示';menuFullscreenButton.textContent=active?'⤡ 全画面を終了':'⛶ 全画面で準備';menuFullscreenButton.setAttribute('aria-label',active?'開始前の全画面を終了':'開始前に全画面表示');clearInput();if(mode==='playing')pause('画面サイズが変わったため一時停止しました');});
$('capture').addEventListener('pointerdown',e=>{e.preventDefault();capture();});$('capture').addEventListener('click',e=>{if(e.detail===0)capture();});
$('difficulty').value=settings.difficulty;$('difficulty').onchange=()=>{settings.difficulty=$('difficulty').value;persist();updateRecords();};
const openSettings=()=>{pendingMouseRestart=null;mouseLock.release();$('resume').disabled=false;clearInput();if(mode==='playing'||mode==='transit'||mode==='boss-defeat')pause('設定のあいだ、星の時間を止めています');openDialog($('settings'));document.body.classList.toggle('credits-dialog-open',mode==='credits');syncCreditsAudio();};$('settings-open').onclick=openSettings;$('menu-settings').onclick=openSettings;$('pause-settings').onclick=openSettings;$('settings').addEventListener('close',()=>{document.body.classList.remove('credits-dialog-open');syncCreditsAudio();});$('muted').checked=settings.muted;$('reduced').checked=settings.reduced;for(const [id,key] of[['music-volume','musicVolume'],['sfx-volume','sfxVolume']]){$(id).value=settings[key];$(id+'-value').textContent=settings[key]+'%';}
function audioNotice(){
  $('audio-notice').textContent=settings.muted||settings.musicVolume===0&&settings.sfxVolume===0?'音なしで出発します\n操作・音から変更できます':'出発すると音が流れます\n操作・音から変更できます';
}
$('muted').onchange=()=>{settings.muted=$('muted').checked;sound.setVolume();persist();audioNotice();};
for(const [id,key] of[['music-volume','musicVolume'],['sfx-volume','sfxVolume']]){
  $(id).oninput=()=>{settings[key]=Number($(id).value);$(id+'-value').textContent=settings[key]+'%';sound.setVolume();persist();audioNotice();};
}
 motionPreference.addEventListener?.('change',()=>{document.body.classList.toggle('reduced-effects',effectiveReduced());if(cinematic.active){cinematic.setReduced(effectiveReduced());paintCinematic();}if(mode==='credits')setCreditsReading(true);if(sim)sim.reduced=effectiveReduced();});
 $('reduced').onchange=()=>{settings.reduced=$('reduced').checked;document.body.classList.toggle('reduced-effects',effectiveReduced());if(mode==='credits')showCredits();if(cinematic.active){cinematic.setReduced(effectiveReduced());paintCinematic();}if(sim)sim.reduced=effectiveReduced();persist();};
$('reset-records').onclick=()=>{if(mode==='playing')pause();confirm('この端末の記録を消しますか？','このブラウザの最高記録を消します　オンライン登録済みの記録は消えません　音と演出の設定は残ります','記録を消す',()=>{saved.previewBests={easy:0,normal:0,hard:0,nightmare:0};saved.previewRuns=0;saved.previewClears=0;persist();updateRecords();announce('この端末の記録を消しました');});};
const padInput=new window.StarControls.GamepadInput();let padFrame={dx:0,dy:0},lastPadStatus='';
const controlDescriptions={touch:'画面を指でなぞって移動\nダブルタップか星返しボタンで発動\nⅡ ボタンで一時停止',keyboard:'矢印 / WASDで移動\nSpaceで星返し\nP / Escで一時停止',mouse:'マウスを固定して移動\n左クリックで星返し\nP / Escで固定解除・一時停止',gamepad:'左スティック / 十字キーで移動\nA / ×で星返し\nStart / Menuで一時停止\nメニューは上下で選択、左右で値変更\nA / ×で決定\nB / ○でダイアログを閉じる'};
function controlGuide(){const kind=guideInput||settings.controlMode;return{kind,...({keyboard:{move:'矢印 / WASD',action:'Space',badge:'SPACE',pause:'P / Esc',defeat:'Enter',cinematic:'Enter'},mouse:{move:'マウス固定で移動',action:'左クリック',badge:'CLICK',pause:'P / Esc',defeat:'左クリック',cinematic:'左クリック'},gamepad:{move:'左スティック / 十字キー',action:'A / ×',badge:'A / ×',pause:'Start / Menu',defeat:'B / ○',cinematic:'A / ×'},touch:{move:'盤面をなぞって移動',action:'ダブルタップ / 星返しボタン',badge:'TAP',pause:'Ⅱ ボタン',defeat:'タップ',cinematic:'タップ'}})[kind]};}
function setGuideInput(kind){if(guideInput===kind)return;guideInput=kind;updateControls();}
function resumeLabel(){return needsMouseLock()?(sim?.time===0?'マウスを固定して出発':'マウスを固定して続きへ'):controlGuide().kind==='gamepad'?'続きへ · Start / Menu':controlGuide().kind==='touch'?'タップして続きへ':'続きへ · P / Esc';}
function cinematicAction(){const guide=controlGuide();return guide.kind==='mouse'&&cinematic.kind!=='transit'?'クリック':guide.cinematic;}
function updateControlStatus(status){
 const texts={connected:'ゲームパッド接続済み',waiting:'ボタンとスティックを\n一度離してください',disconnected:'ゲームパッド未接続\n接続後、パッドのボタンを一度押してください',unsupported:'このパッドの配列には未対応です\nキーボードかマウスを選べます',unavailable:'このブラウザではパッドを利用できません\nキーボードかマウスを選べます'};
 const padUnavailable=settings.controlMode==='gamepad'&&['disconnected','unsupported','unavailable'].includes(status);
 const touchCopy=padUnavailable?'タッチで遊ぶ場合は、操作方法を\nタッチに変更してください':'タッチ：盤面をなぞって移動\nダブルタップか星返しボタンで発動';
 const message=(settings.controlMode==='gamepad'?(texts[status]||texts.disconnected)+'\n\n':'')+touchCopy;
 if(message!==lastPadStatus){$('control-status').textContent=message;lastPadStatus=message;}
}
function updateControls(){
 const guide=controlGuide();$('capture-side').value=settings.captureSide;document.body.dataset.captureSide=settings.captureSide;
 $('control-mode').value=settings.controlMode;$('control-help').textContent=controlDescriptions[settings.controlMode];
 $('menu-controls').textContent=guide.kind==='touch'?'盤面をなぞって移動\nダブルタップか下のボタンで星返し':'移動：'+guide.move+'\n星返し：'+guide.action;
 $('arena').setAttribute('aria-label','星返し　'+(guide.kind==='touch'?'盤面をなぞって移動、ダブルタップか星返しボタンで発動':controlDescriptions[settings.controlMode]));
 $('move-help').textContent=guide.move;$('capture-help').textContent=guide.action+'\n近くの紫の弾を、金色の星に';
 document.querySelector('.small-note').textContent='ねらいとショットは自動\n'+guide.pause+'で一時停止\n画面を離れると自動で一時停止します';
 $('pause').setAttribute('aria-label','一時停止 · '+guide.pause);$('boss-defeat-skip').textContent='省略 · '+guide.defeat;
 if(mode==='paused')$('resume').textContent=resumeLabel();if(sim?.field.phase==='ready')$('capture-status').textContent=guide.badge;
 updateControlStatus('disconnected');
}
$('control-mode').onchange=()=>{pendingMouseRestart=null;mouseLock.release();guideInput=null;$('resume').disabled=false;settings.controlMode=['keyboard','mouse','gamepad','touch'].includes($('control-mode').value)?$('control-mode').value:'keyboard';clearInput();padInput.release();persist();updateControls();if(mode==='paused')$('resume').textContent=resumeLabel();};
$('capture-side').onchange=()=>{settings.captureSide=$('capture-side').value==='left'?'left':'right';clearInput();persist();updateControls();};
$('settings').addEventListener('close',clearInput);
updateControls();
const dialogOpeners=new WeakMap();
function openDialog(dialog){
 dialogOpeners.set(dialog,document.activeElement);clearInput();clearPadSelection();dialog.showModal();
}
function dismissDialog(dialog){
 // A backdrop or pad B has the same semantics as Escape, including confirm cancel.
 if(dialog.dispatchEvent(new Event('cancel',{cancelable:true})))dialog.close();
}
for(const dialog of document.querySelectorAll('dialog')){
 const gesture=new window.StarControls.BackdropGesture();
 dialog.addEventListener('pointerdown',e=>gesture.down(e,dialog.getBoundingClientRect()));
 dialog.addEventListener('pointermove',e=>gesture.move(e));
 dialog.addEventListener('pointerup',e=>gesture.up(e,dialog.getBoundingClientRect()));
 dialog.addEventListener('pointercancel',()=>gesture.reset());
 dialog.addEventListener('wheel',()=>gesture.reset(),{passive:true});
 dialog.addEventListener('scroll',()=>gesture.reset(),true);
 dialog.addEventListener('click',e=>{if(dialog.open&&gesture.click(e,dialog.getBoundingClientRect())){e.preventDefault();e.stopImmediatePropagation();dismissDialog(dialog);}},true);
 dialog.addEventListener('cancel',()=>{gesture.reset();clearInput();clearPadSelection();});
 dialog.addEventListener('close',()=>{gesture.reset();clearInput();clearPadSelection();const opener=dialogOpeners.get(dialog);dialogOpeners.delete(dialog);if(opener?.isConnected&&!opener.disabled&&opener.getClientRects().length)opener.focus({preventScroll:true});});
}
let padNavigationActive=false,padSelected=null;
const padMarker=document.createElement('span');padMarker.className='pad-selection-marker';padMarker.setAttribute('aria-hidden','true');padMarker.hidden=true;document.body.appendChild(padMarker);
function clearPadSelection(){if(padSelected)padSelected.classList.remove('pad-selected');padSelected=null;padMarker.hidden=true;}
function showPadSelection(element){
 if(!padNavigationActive||!element?.getClientRects().length){clearPadSelection();return;}
 if(padSelected!==element){clearPadSelection();padSelected=element;element.classList.add('pad-selected');}
 const host=element.closest('dialog')||document.fullscreenElement||document.body;if(padMarker.parentElement!==host)host.appendChild(padMarker);
 const r=element.getBoundingClientRect();padMarker.style.left=Math.max(4,r.left-15)+'px';padMarker.style.top=(r.top+r.height/2-7)+'px';padMarker.hidden=false;
}
function pointerOrKeyboardNavigation(){padNavigationActive=false;clearPadSelection();}
window.addEventListener('pointerdown',pointerOrKeyboardNavigation,true);
window.addEventListener('pointermove',pointerOrKeyboardNavigation,true);
window.addEventListener('keydown',pointerOrKeyboardNavigation,true);
function gamepadMenu(frame){
 if(frame.navX||frame.navY||frame.primary||frame.back)padNavigationActive=true;
 if(!padNavigationActive)return;
 const dialog=document.querySelector('dialog[open]');
 if(frame.back){if(dialog){dismissDialog(dialog);clearInput();clearPadSelection();}return;}
 const root=dialog||$(mode==='boot'?'boot-screen':mode==='paused'?'pause-screen':mode==='result'?'result-screen':mode==='credits'?'credits-screen':'menu-screen');
 const choices=Array.from(root.querySelectorAll('button,select,input,a[href],summary')).filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length>0);
 if(!choices.length){clearPadSelection();return;}
 let active=document.activeElement,index=choices.indexOf(active);
 if(index<0){active=choices.find(el=>el.id===(mode==='paused'?'resume':mode==='result'?'retry':'start'))||choices[0];index=choices.indexOf(active);active.focus({preventScroll:true});}
 if(frame.navY){index=(index+frame.navY+choices.length)%choices.length;active=choices[index];active.focus({preventScroll:true});active.scrollIntoView({block:'nearest'});}
 if(frame.navX&&active.tagName==='SELECT'){active.selectedIndex=Math.max(0,Math.min(active.options.length-1,active.selectedIndex+frame.navX));active.dispatchEvent(new Event('change',{bubbles:true}));}
 if(frame.navX&&active.type==='range'){active.value=String(Math.max(Number(active.min),Math.min(Number(active.max),Number(active.value)+frame.navX*5)));active.dispatchEvent(new Event('input',{bubbles:true}));}
 if(mode==='boot'||settings.controlMode==='gamepad')showPadSelection(active);else pointerOrKeyboardNavigation();
 if(frame.primary&&active.tagName!=='SELECT'&&active.type!=='range'){clearInput();clearPadSelection();active.click();}
}
function pollGamepad(){
 let pads=null;try{if(typeof navigator.getGamepads==='function')pads=navigator.getGamepads();}catch(e){}
 const active=(mode==='boot'||settings.controlMode==='gamepad')&&!document.hidden&&document.hasFocus();
 const frame=padInput.poll(pads,active);padFrame={dx:0,dy:0};updateControlStatus(frame.status);
 if(!active){clearPadSelection();return;}
 if(mode==='boot'){if(bootReady&&!bootClock.started){if(frame.back)chooseBoot(true);else gamepadMenu(frame);}return;}
 if(frame.primary||frame.pause||frame.back||frame.navX||frame.navY||frame.dx||frame.dy)setGuideInput('gamepad');
 if(frame.lost){clearInput();pause('ゲームパッドの接続が切れました　接続し直して続きへ進むか、設定で操作方法を変えられます');return;}
 if(['disconnected','unsupported','unavailable'].includes(frame.status)&&['playing','transit','boss-defeat'].includes(mode)){pause('ゲームパッドを使えないため一時停止しました　接続後にボタンを一度押すか、操作・音で別の操作方法を選んでください');return;}
 if(document.querySelector('dialog[open]')){gamepadMenu(frame);return;}
 if(frame.pause){padNavigationActive=true;if(mode==='playing'||mode==='transit'||mode==='boss-defeat')pause();else if(mode==='paused')resume();return;}
 if(mode==='playing'){clearPadSelection();padFrame={dx:frame.dx,dy:frame.dy};if(frame.primary)capture();return;}
 if(mode==='boss-defeat'){clearPadSelection();if(frame.back)skipBossDefeat();return;}
 if(cinematic.active&&mode!=='paused'){clearPadSelection();if(frame.primary){clearInput();skipCinematic();}return;}
 gamepadMenu(frame);
}
const arena=$('arena');function point(e){const r=arena.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*C.W,y:(e.clientY-r.top)/r.height*C.H};}
const touchTap=new window.StarControls.TouchDoubleTap();
let mouseUsesTouch=false;
function needsMouseLock(){return settings.controlMode==='mouse'&&!mouseUsesTouch;}
const mouseLock=new window.StarControls.PointerLockInput(document,arena,{
 locked(){if(mode!=='paused'||!sim||(audioGate&&!gateBox.hidden)||document.hidden||!document.hasFocus()||document.querySelector('dialog[open]')||!needsMouseLock()){pendingMouseRestart=null;mouseLock.release();$('resume').disabled=false;return;}const restartRequest=pendingMouseRestart;pendingMouseRestart=null;clearInput();if(restartRequest){start(restartRequest.practice,true);return;}resume();},
 lost(){clearInput();pause('マウスの固定が解除されたので、一時停止しました　続けるときはボタンをクリックしてください');},
 error(){pendingMouseRestart=null;if(mode!=='paused')return;$('resume').disabled=false;$('pause-reason').textContent='マウスを固定できませんでした　もう一度クリックするか、「操作・音」でキーボード／ゲームパッドに切り替えてください　タッチ操作も使えます';announce('マウスを固定できませんでした　操作・音で別の操作方法を選べます');}
});
function pointerKind(e){if(e.pointerType==='touch'||e.pointerType==='pen'){if(!mouseUsesTouch){mouseUsesTouch=true;mouseLock.release();clearInput();}setGuideInput('touch');}else if(e.pointerType==='mouse'){mouseUsesTouch=false;setGuideInput(null);}}
document.addEventListener('pointerdown',e=>{pointerKind(e);if(e.pointerType!=='touch'||e.isPrimary===false||(e.target&&!arena.contains(e.target)))touchTap.reset();},true);
function gameplayInputAllowed(){return mode==='playing'&&!document.hidden&&document.hasFocus()&&!document.querySelector('dialog[open]')&&(!needsMouseLock()||mouseLock.locked);}
document.addEventListener('mousemove',e=>{if(!gameplayInputAllowed()||settings.controlMode!=='mouse'||!mouseLock.locked||pointer)return;mouseMotion.push(e,arena.getBoundingClientRect(),performance.now());target=mouseMotion.begin(sim.player,performance.now())?.target||null;});
arena.addEventListener('pointerdown',e=>{
 pointerKind(e);
 if(e.pointerType==='mouse'&&settings.controlMode==='mouse'){
  if(e.button!==0)return;
  if(mode==='boss-defeat'&&mouseLock.locked){e.preventDefault();skipBossDefeat();return;}
  if(mode==='transit'&&mouseLock.locked){e.preventDefault();skipCinematic();return;}
  if(mode==='playing'&&!mouseLock.locked&&!document.hidden&&document.hasFocus()&&!document.querySelector('dialog[open]')){e.preventDefault();pause('マウスで続けるには、固定して続きへボタンをクリックしてください');return;}
 }
 if(!gameplayInputAllowed()){touchTap.reset();return;}
 if(e.pointerType==='mouse'){
  if(settings.controlMode!=='mouse'||e.button!==0)return;
  e.preventDefault();arena.focus({preventScroll:true});capture();return;
 }
 touchTap.down(e,performance.now());
 if(pointer!==null)return;e.preventDefault();arena.focus({preventScroll:true});const q=point(e);pointer={id:e.pointerId,x:q.x,y:q.y,px:sim.player.x,py:sim.player.y};target={x:sim.player.x,y:sim.player.y};try{arena.setPointerCapture(e.pointerId);}catch(e){}
});
arena.addEventListener('pointermove',e=>{
 touchTap.move(e);
 if(!gameplayInputAllowed())return;
 if(e.pointerType==='mouse')return;
 if(!pointer||e.pointerId!==pointer.id)return;e.preventDefault();const q=point(e);target={x:pointer.px+(q.x-pointer.x)*1.25,y:pointer.py+(q.y-pointer.y)*1.25};
});
function endPointer(e){if(pointer?.id===e.pointerId){pointer=null;target=null;}}
arena.addEventListener('pointerup',e=>{const fire=gameplayInputAllowed()&&touchTap.up(e,performance.now());if(!gameplayInputAllowed())touchTap.reset();endPointer(e);if(fire)capture();});
for(const type of ['pointercancel','lostpointercapture'])arena.addEventListener(type,e=>{touchTap.cancel(e);endPointer(e);});
arena.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!pointer&&!mouseLock.locked)target=null;});
arena.addEventListener('contextmenu',e=>{if(mouseLock.locked)e.preventDefault();});
window.addEventListener('keydown',e=>{if(document.hidden||!document.hasFocus()||document.querySelector('dialog[open]'))return;const k=e.key.toLowerCase();if(settings.controlMode==='keyboard'&&['enter','escape','p','arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k))setGuideInput('keyboard');if(mode==='boss-defeat'&&k==='enter'){e.preventDefault();if(!e.repeat)skipBossDefeat();return;}if(cinematic.active&&mode!=='paused'&&['enter','escape'].includes(k)&&!(mode==='transit'&&k==='escape')){e.preventDefault();if(!e.repeat)skipCinematic();return;}if(k==='escape'||k==='p'){if(e.repeat)return;if(mode==='playing'||mode==='transit'||mode==='boss-defeat'){e.preventDefault();pause();}else if(mode==='paused'){e.preventDefault();if(k!=='escape'||!needsMouseLock())resume();}return;}if(!gameplayInputAllowed()||settings.controlMode!=='keyboard')return;if(['input','select','textarea','button'].includes(document.activeElement?.tagName.toLowerCase()))return;if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k)){e.preventDefault();if(k===' '){if(!e.repeat)capture();}else{keys.add(k);pointer=null;target=null;}}});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{creditsBlurred=true;syncCreditsAudio();clearInput();if(cinematic.active){cinematicHeld=true;if(mode==='ending')sound.pause();}pause('画面を離れたので、一時停止しました');});window.addEventListener('focus',()=>{creditsBlurred=false;syncCreditsAudio();if(cinematic.active){cinematicHeld=false;if(mode==='ending'&&!document.hidden){if(sound.music)sound.resume();else sound.beginCredits();}}});document.addEventListener('visibilitychange',()=>{syncCreditsAudio();if(cinematic.active){cinematicHeld=document.hidden;if(mode==='ending'){if(document.hidden)sound.pause();else if(sound.music)sound.resume();else sound.beginCredits();}}if(document.hidden){clearInput();pause('画面を離れたので、一時停止しました');}});window.addEventListener('resize',()=>{clearInput();if(mode==='playing'||mode==='transit'||mode==='boss-defeat')pause('画面の大きさが変わったので、一時停止しました');});
function input(){if(!gameplayInputAllowed())return{dx:0,dy:0,target:null};return{dx:settings.controlMode==='gamepad'?padFrame.dx:Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy:settings.controlMode==='gamepad'?padFrame.dy:Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),target};}
function updateUI(force=false){if(!sim)return;$('score').textContent=String(Math.round(sim.score)).padStart(6,'0');$('score').dataset.digits=String($('score').textContent.length);renderLife(sim.player.hp,sim.player.maxHp);const f=sim.field;$('capture').className=f.phase==='ready'?'':f.phase==='cooldown'?'cooling':'active';$('capture-status').textContent=f.phase==='ready'?controlGuide().badge:f.phase==='capture'?`${f.count} STARS`:f.phase==='orbit'?'REBOUND!':`${f.cooldown.toFixed(1)} SEC`;$('field-label').textContent=f.phase==='ready'?'準備できています':f.phase==='capture'?`${f.count}個の星を、つかまえた`:f.phase==='orbit'?'光に変えて、返す':'次の星返しを、準備中';$('field-hint').textContent=f.phase==='ready'?'紫の弾を、輪の中へ':f.phase==='capture'?'輪の内側に入った弾が、味方に':f.phase==='orbit'?'つかまえる時間は、ここまで':'弾をよけながら、次のひと呼吸';$('cooldown-fill').style.width=(f.phase==='cooldown'?(1-f.cooldown/C.captureCooldown(sim.difficulty,!!f.count))*100:100)+'%';const stage=C.STAGES[sim.stageIndex];
 $('act').textContent=sim.practice?`第1ステージ練習 · 残り${Math.ceil(55-sim.time)}秒`:sim.stagePhase==='sweep'?`${stage.name} · 残敵${sim.enemies.length}体 · 残り${Math.ceil(sim.sweepDeadline-sim.stageTime)}秒`:sim.stagePhase==='warning'?`${stage.name} · ボスが近づく`:sim.stageBossSpawned?`${stage.name} · ボス`:stage.name.endsWith(stage.beats[sim.beat].label)?stage.name:`${stage.name} · ${stage.beats[sim.beat].label}`;
if(sim.stagePhase==='clear')$('act').textContent=mode==='boss-defeat'?`第${sim.stageIndex+1}ステージ 突破`:`${stage.name} 突破 · 次の旅路まで ${Math.max(0,Math.ceil(sim.stageClearUntil-sim.time))}秒`;else if(sim.stageBossSpawned)$('act').textContent+=` · 残り${Math.ceil(sim.bossDeadline-sim.time)}秒`;
 $('capture').disabled=sim.stagePhase==='clear'||mode!=='playing';
 const power=$('power-status'),weapon=sim.spreadUntil>sim.time?'spread':sim.powerUntil>sim.time?'twin':sim.pierceUntil>sim.time?'pierce':null,until=weapon==='spread'?sim.spreadUntil:weapon==='twin'?sim.powerUntil:weapon==='pierce'?sim.pierceUntil:Math.max(sim.extendUntil,sim.guardUntil),support=[];
 if(sim.extendUntil>sim.time)support.push(`時星${Math.ceil(sim.extendUntil-sim.time)}s`);
 if(sim.guardUntil>sim.time)support.push(`護星1回/${Math.ceil(sim.guardUntil-sim.time)}s`);
 power.hidden=!['playing','paused'].includes(mode)||(!weapon&&!support.length);power.dataset.ending=String(until>sim.time&&until-sim.time<=3);
 if(weapon||support.length){const info=FEEL.itemInfo(weapon||(sim.extendUntil>sim.time?'extend':'guard'));$('power-active-icon').src=asset(info.icon);$('power-active-name').textContent=weapon?info.name:'支援アイテム';$('power-active-effect').textContent=weapon==='twin'&&!sim.twinCharge?'左右レーザー継続':info.effect;$('power-active-time').textContent=Math.max(0,Math.ceil(until-sim.time))+'秒';}
 $('power-support').textContent=support.join(' · ');$('power-support').style.visibility=support.length?'visible':'hidden';


 const chain=FEEL.scoreChainFrame(sim.combo,sim.lastKill,sim.time),comboTier=scene&&scene.comboAccentUntil>sim.time?scene.comboAccentTier:0;$('score-multiplier').textContent=`撃破 ×${chain.multiplier}`;$('combo').dataset.tier=String(comboTier);$('combo').hidden=chain.combo<1||mode!=='playing';$('combo-count').textContent=String(chain.combo);$('combo-label').textContent='撃破 CHAIN';$('combo-multiplier').textContent=`得点 ×${chain.multiplier}`;$('combo-next').textContent=(chain.nextKills?`あと${chain.nextKills}機で ×${chain.nextMultiplier}`:'最大倍率')+` · ${chain.remaining.toFixed(1)}秒`;$('combo-fill').style.width=chain.remaining/4*100+'%';$('combo-track').setAttribute('aria-valuenow',chain.remaining.toFixed(1));$('boss-health').hidden=!sim.boss||sim.boss.dead;if(sim.boss){$('boss-bar').style.width=sim.boss.hp>0?`max(2px,${sim.boss.hp/sim.boss.maxHp*100}%)`:'0%';$('boss-health').querySelector('span').textContent=sim.stageIndex===2?'時環の主':sim.stageIndex===1?'鏡潮の主':'潮の主';}let text=sim.time<sim.toastUntil?sim.toast:'';if(!text&&sim.time<8&&!chain.combo)text=(sim.practice?'ダメージなし\n':'')+'紫の弾が近づいたら\n'+(controlGuide().kind==='touch'?'ダブルタップか星返しボタン':controlGuide().action+'で星返し');$('game-message').textContent=text;$('game-message').style.top=chain.combo>0&&mode==='playing'?($('combo').offsetTop+$('combo').offsetHeight+8)+'px':'';}
class Ocean extends Phaser.Scene{
constructor(){super('Ocean');this.objects=new Map();this.fx=[];this.ambient=[];this.atmo=[];this.visualTime=0;this.shake=0;this.impactCooldown=0;}
  preload(){const list={'stage1-far':'stage1/stage1-far.webp','stage1-passage':'stage1/stage1-passage.webp','stage1-boss-vista':'stage1/stage1-boss-vista.webp','stage1-mid':'stage1/stage1-mid.webp','stage1-near':'stage1/stage1-near.webp',player:'player.png',ray:'enemy-ray.png',jelly:'enemy-jelly.png',boss:'boss.png','skimmer-v5':'enemy-skimmer-v5.png','stage2-mirror':'stage2/enemy-mirror.png','stage2-darter':'stage2/enemy-darter-v6-runtime.webp','stage2-boss':'stage2/boss-mirror.png','stage3-pulse':'stage3/enemy-pulse.png','stage3-lantern':'stage3/enemy-lantern-v6-runtime.webp','stage3-eclipse':'stage3/boss-eclipse.png',bolt:'bullet-petal.png',thorn:'bullet-thorn.png',star:'star.png',spark:'spark.png',ring:'ring.png',glow:'glow.png','item-twin-v5':'item-twin-v5.png','item-spread-v5':'item-spread-v5.png','item-extend':'item-extend.svg','item-guard':'item-guard.svg'};for(let stage=1;stage<=3;stage++)for(const role of ['mid','near'])list[`v7-stage${stage}-${role}`]=`v7-art/stage${stage}-${role}.webp`;for(const[k,v]of Object.entries(list))this.load.image(k,asset(v));if(STAGE1_ROUTE.length)SCENERY.RouteRenderer.preloadInitial(this,STAGE1_ROUTE,asset);this.load.on('loaderror',file=>{const key=file?.key;const owner=[this.route1,this.route2,this.route3].find(r=>r&&(r.parts.some(p=>p.key===key)||r.landmarks?.some(p=>p.key===key)));if(owner){if(owner.retired){owner.pending.delete(key);return;}if(owner===this.route){owner.failedKey(key);return;}owner.pending.delete(key);return;}if(STAGE1_ROUTE.some(p=>p.key===key)){this.routeLoadFailed=true;return;}assetsFailed=true;});}
create(){scene=this;if(qaMode)window.STAR_QA_SCENE=this;if(assetsFailed){$('load-error').hidden=false;$('start').disabled=true;failBoot();return;}// The three Stage 1 raster layers come from the verified runtime asset pack.
useDisplaySizedTexture(this,'skimmer-v5',256,213);
useDisplaySizedTexture(this,'item-twin-v5',192,192);
useDisplaySizedTexture(this,'item-spread-v5',192,192);
if(['skimmer-v5','item-twin-v5','item-spread-v5'].some(key=>!this.textures.exists(key))){
  assetsFailed=true;$('load-error').hidden=false;$('start').disabled=true;failBoot();return;
}
const farImage=this.textures.get('stage1-far').getSourceImage();
const farScale=Math.max(C.W/farImage.width,C.H/farImage.height);
const farWidth=farImage.width*farScale,farHeight=farImage.height*farScale;
this.bg=this.add.image(240,360,'stage1-far').setDisplaySize(farWidth,farHeight).setAlpha(1).setDepth(0);
this.passage=this.add.image(240,360,'stage1-passage').setDisplaySize(farWidth,farHeight).setAlpha(0).setDepth(.1);
this.vista=this.add.image(240,360,'stage1-boss-vista').setDisplaySize(farWidth,farHeight).setAlpha(0).setDepth(.2);
this.passageMix=0;this.vistaMix=0;
this.farDriftX=Math.min(12,Math.max(0,(farWidth-C.W)/2));
this.farDriftY=Math.min(8,Math.max(0,(farHeight-C.H)/2));
const layer=(key,alpha,depth)=>{
  const img=this.textures.get(key).getSourceImage();
  const scale=img.width>=C.W?C.W/img.width:1;
  return this.add.tileSprite(240,360,C.W,C.H,key).setTileScale(scale).setAlpha(alpha).setDepth(depth);
};
  this.mid=layer('stage1-mid',.30,1);this.near=layer('stage1-near',.42,2);
  this.flow=this.add.graphics().setDepth(2.5);this.cueArt=this.add.graphics().setDepth(2.8);this.powerArt=this.add.graphics().setDepth(6.5);
  // Convert the six authored transparent rasters into feathered runtime textures.
  // Their source edges are not seamless, so hard-repeating TileSprites would draw
  // a horizontal join. Adjacent images overlap by 120 logical pixels instead.
  for(let stage=1;stage<=3;stage++)for(const role of ['mid','near']){
    const key=`v7-stage${stage}-${role}`,src=this.textures.get(key).getSourceImage();
    const canvas=document.createElement('canvas');canvas.width=C.W;canvas.height=C.H;
    const context=canvas.getContext('2d');context.drawImage(src,0,0,C.W,C.H);
    context.globalCompositeOperation='destination-in';
    const edge=context.createLinearGradient(0,0,0,C.H);
    edge.addColorStop(0,'#0000');edge.addColorStop(120/C.H,'#000');edge.addColorStop(600/C.H,'#000');edge.addColorStop(1,'#0000');
    context.fillStyle=edge;context.fillRect(0,0,C.W,C.H);
    this.textures.addCanvas(`${key}-soft`,canvas);this.textures.remove(key);
  }
  const artPair=(role,depth)=>({role,phase:0,sprites:[0,1].map(()=>this.add.image(240,360,`v7-stage1-${role}-soft`).setDisplaySize(500,C.H).setDepth(depth))});
  this.artMid=artPair('mid',1.4);this.artNear=artPair('near',2.4);
  if(STAGE1_ROUTE.length){this.route1=new SCENERY.RouteRenderer(this,STAGE1_ROUTE,asset,ROUTE_LANDMARKS,useDisplaySizedTexture);this.route=this.route1;this.route2=null;this.route3=null;if(this.routeLoadFailed)this.route.failed=true;}
for(let i=0;i<35;i++){
  const s=this.add.image((i*137.3)%480,(i*211.7)%720,'spark').setDisplaySize(i%5===0?6:3,i%5===0?6:3).setAlpha(.1+(i%4)*.05).setDepth(2);
  this.ambient.push(s);
}
for(let i=0;i<3;i++)this.atmo.push(this.add.image(i%2?385:95,170+i*170,'glow').setDisplaySize(210+i*55,310+i*40).setBlendMode(Phaser.BlendModes.ADD).setDepth(2.2).setAlpha(0));
this.flightTexture=this.textures.createCanvas('player-flight',256,256);this.flightImage=this.textures.get('player').getSourceImage();this.flight=null;this.lastFlightPosition=null;this.player=this.add.image(240,594,'player').setOrigin(.5,.34).setDisplaySize(70,70).setDepth(7);this.playerGlow=this.add.image(240,594,'glow').setDisplaySize(65,65).setAlpha(.15).setBlendMode(Phaser.BlendModes.ADD).setDepth(6);this.bossMuzzle=this.add.image(0,0,'glow').setDisplaySize(34,34).setBlendMode(Phaser.BlendModes.ADD).setDepth(6).setVisible(false);this.bossReturnRing=this.add.image(0,0,'ring').setDisplaySize(175,175).setTint(0xffd989).setBlendMode(Phaser.BlendModes.ADD).setDepth(6).setVisible(false);this.core=this.add.graphics().setDepth(8);this.fieldRing=this.add.image(240,594,'ring').setDisplaySize(C.RADIUS*2,C.RADIUS*2).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(5);this.checkScreenArt();}
   async checkScreenArt(){
     try{
       for(const name of ['title','stage1-clear','stage2-clear','final-clear','gameover']){
         const image=new Image();image.src=asset(`v7-art/${name}.webp`);await image.decode();
       }
       if(assetsFailed){failBoot();return;}
       $('start').disabled=false;$('start').textContent='星の海へ ↗';$('practice').disabled=false;if(mode==='boot')prepareBoot();else if(mode==='menu')beginCinematic('intro');
     }catch(e){assetsFailed=true;$('load-error-text').textContent='画面の絵を読み込めませんでした　再読み込みしてください';$('load-error').hidden=false;failBoot();}
   }
   setArtStage(index){for(const pair of [this.artMid,this.artNear])for(const sprite of pair.sprites)sprite.setTexture(`v7-stage${index+1}-${pair.role}-soft`);}
   drawArtPair(pair,alpha,stage){
     const offset=effectiveReduced()?0:Math.sin(this.visualTime*(pair.role==='mid'?.17:.23)+stage)*8;
     const phase=pair.phase%600;
     pair.sprites[0].setPosition(240+offset,360+phase).setAlpha(alpha);
     pair.sprites[1].setPosition(240+offset,-240+phase).setAlpha(alpha);
   }
   drawBossCue(){
    this.cueArt.clear();const el=$('boss-cue');
    if(!this.bossCue||!sim||!['playing','paused'].includes(mode)){el.hidden=true;return;}
    const quiet=effectiveReduced(),age=sim.time-this.bossCue.at,frame=FEEL.cueFrame(this.bossCue.kind,age,quiet);
    el.hidden=!frame.visible;if(!frame.visible)return;
    el.dataset.kind=this.bossCue.kind;el.style.opacity=String(frame.opacity);el.style.transform=`translateX(-50%) scale(${frame.scale}) rotate(${frame.rotation}deg)`;
    $('boss-cue-kicker').textContent=this.bossCue.kind==='warning'?'BOSS APPROACHING':'ENCOUNTER';
    $('boss-cue-name').textContent=this.bossCue.kind==='warning'?'大きな影が、近づく':['潮の主','鏡潮の主','時環の主'][sim.stageIndex];
    if(this.bossCue.kind==='entry'){const g=this.cueArt,y=150,r=55*frame.ring;g.lineStyle(4,0xffd37e,frame.opacity*.35);g.strokeEllipse(240,y,r*2,r*.85);g.lineStyle(2,0xffebad,frame.opacity*.65);for(const side of [-1,1])g.lineBetween(240+side*(r+8),y,240+side*220,y);}
   }
   drawPowerArt(p){
    if(!sim||!['playing','paused','finishing'].includes(mode))return;
    const kind=sim.spreadUntil>sim.time?'spread':sim.powerUntil>sim.time?'twin':sim.pierceUntil>sim.time?'pierce':null;
    if(!kind)return;
    const until=kind==='spread'?sim.spreadUntil:kind==='twin'?sim.powerUntil:sim.pierceUntil;
    const remaining=Math.max(0,until-sim.time),quiet=effectiveReduced();
    const phase=quiet?0:this.visualTime*1.8,g=this.powerArt,color=kind==='spread'?0x8fffe0:kind==='twin'?0x99e8ff:0xffdc80;
    // All marks stay on the wings: the white collision core remains exposed.
    g.lineStyle(3,color,.72);const distance=kind==='twin'?38:26;
    for(const side of [-1,1]){const x=p.x+side*distance,y=p.y+8;
     if(kind==='twin'){if(sim.twinCharge){g.fillStyle(0xffdf88,.95);g.fillCircle(x,y-18,4);}g.strokeEllipse(x,y-18,22,30);g.lineBetween(x,y+3,x,y+18);}
     else if(kind==='spread'){for(let i=0;i<3;i++){const ox=x+side*i*5,oy=y+i*9;g.lineBetween(ox,oy,ox+side*8,oy+7);g.lineBetween(ox+side*8,oy+7,ox,oy+14);}}
     else{g.beginPath();g.moveTo(x,y-12);g.lineTo(x+8,y);g.lineTo(x,y+18);g.lineTo(x-8,y);g.closePath();g.strokePath();g.lineBetween(x,y+23,x,y+34);}
    }
    // A short rear arc reports remaining time without resembling capture radius.
    g.lineStyle(3,color,remaining<=3?.85:.5);g.beginPath();g.arc(p.x,p.y+8,43,Math.PI*.2,Math.PI*.2+Math.PI*.6*Math.min(1,remaining/20));g.strokePath();
    if(!quiet){g.fillStyle(color,.25+.12*Math.sin(phase));for(const side of [-1,1])g.fillEllipse(p.x+side*distance,p.y+24,8,22);}
   }
   resetComboAccent(){this.comboAccentTier=0;this.comboAccentUntil=0;this.comboSoundTier=0;this.comboSoundUntil=0;$('combo').dataset.tier='0';$('combo').dataset.pop='';$('combo').hidden=true;}
   clearBossDefeat(){for(const sprite of this.defeatSprites||[])sprite.destroy();this.defeatSprites=[];$('boss-defeat-cut-in').hidden=true;}
   beginBossDefeat(stageIndex){this.clearBossDefeat();$('boss-cut-portrait').src=asset(['boss.png','stage2/boss-mirror.png','stage3/boss-eclipse.png'][stageIndex]);$('boss-cut-name').textContent=['潮の主','鏡潮の主','時環の主'][stageIndex];$('boss-cut-stage').textContent=`STAGE ${stageIndex+1} / LIBERATED`;const point=this.lastBossDestroy||{x:240,y:160};this.lastBossDestroy=null;const key=['boss','stage2-boss','stage3-eclipse'][stageIndex];this.defeatSprites=[this.add.image(point.x,point.y,key).setDisplaySize(190,190).setDepth(8),this.add.image(point.x,point.y,'ring').setDisplaySize(200,200).setTint(0xffdf9c).setDepth(9).setBlendMode(Phaser.BlendModes.ADD)];this.paintBossDefeat(0,effectiveReduced());}
   paintBossDefeat(progress,quiet){const [ghost,ring]=this.defeatSprites||[];if(!ghost)return;const p=Math.max(0,Math.min(1,progress));ghost.setAlpha(.95*(1-p)).setDisplaySize(190*(quiet?1:1-.14*p),190*(quiet?1:1-.14*p));ring.setVisible(!quiet).setAlpha(.6*(1-p)).setDisplaySize(200+180*p,200+180*p);const frame=window.StarCinematic.defeatFrame(p,quiet),cut=$('boss-defeat-cut-in');cut.hidden=false;cut.style.opacity=String(frame.opacity);$('boss-cut-band').style.transform=`translateX(${frame.x}%) rotate(-7deg)`;$('boss-cut-portrait').style.transform=`scale(${frame.portraitScale}) rotate(7deg)`;cut.dataset.quiet=String(quiet);}
   clearWorld(){this.clearBossDefeat();this.lastBossDestroy=null;this.bossCue=null;$('boss-cue').hidden=true;this.cueArt?.clear();this.resetComboAccent();document.body.classList.remove('stage-clear-active');$('stage-clear-banner').hidden=true;$('power-toast').hidden=true;for(const s of this.objects.values())s.destroy();this.objects.clear();for(const f of this.fx)f.sprite.destroy();this.fx=[];this.fieldRing?.setAlpha(0);this.itemLabel?.setVisible(false);this.itemGlow?.setVisible(false);this.itemSprite?.setVisible(false);this.bossReturnRing?.setVisible(false);this.cameras.main.setScroll(0,0);this.shake=0;this.passageMix=0;this.vistaMix=0;this.route2?.unload();this.route3?.unload();this.route=this.route1;this.route?.reset();this.passage?.setAlpha(0);this.vista?.setAlpha(0);this.mid?.setAlpha(.30);this.near?.setAlpha(.42);if(this.mid)this.mid.tilePositionY=0;if(this.near)this.near.tilePositionY=0;this.setArtStage(0);this.artMid.phase=0;this.artNear.phase=0;this.bg?.setVisible(true);}
  enterStage(index){if(index===1){this.route1?.unload();if(!this.route2)this.route2=new SCENERY.RouteRenderer(this,STAGE2_ROUTE,asset);else this.route2.reset();this.route=this.route2;}else if(index===2){this.route1?.unload();this.route2?.unload();if(!this.route3)this.route3=new SCENERY.RouteRenderer(this,STAGE3_ROUTE,asset);else this.route3.reset();this.route=this.route3;}else return;this.setArtStage(index);this.passageMix=1;this.vistaMix=0;this.bg?.setVisible(false);this.passage?.setAlpha(1).setVisible(true);this.vista?.setAlpha(0).setVisible(false);}
 pulseField(){if(!this.player)return;this.burst(this.player.x,this.player.y,5,'spark',.25,80);}
burst(x,y,count,key='spark',life=.45,speed=150){const quiet=effectiveReduced(),max=quiet?70:220;count=quiet?Math.min(5,count):count;for(let i=0;i<count&&this.fx.length<max;i++){const angle=Math.random()*Math.PI*2,v=speed*(.3+Math.random()*.7),size=key==='glow'?50:5+Math.random()*10;const sprite=this.add.image(x,y,key).setDisplaySize(size,size).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);this.fx.push({sprite,vx:Math.cos(angle)*v,vy:Math.sin(angle)*v,life,maxLife:life,size,baseAlpha:key==='glow'?.35:.65});}}
ringBurst(x,y,color=0xffdc87){if(effectiveReduced()||this.fx.length>=220)return;const sprite=this.add.image(x,y,'ring').setDisplaySize(36,36).setTint(color).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);this.fx.push({sprite,vx:0,vy:0,life:.7,maxLife:.7,size:36,grow:180,baseAlpha:.65});}
object(entity,key,size,depth){let s=this.objects.get(entity.id);if(!s){s=this.add.image(entity.x,entity.y,key).setDepth(depth);this.objects.set(entity.id,s);}s.setPosition(entity.x,entity.y);s.setDisplaySize(size,size);return s;}
handleEvents(events){const tier=Math.max(0,...events.filter(e=>e.type==='destroy'&&e.returned).map(e=>comboAccentPlan(e.combo||0,true,effectiveReduced()).tier));if(tier&&(tier>(this.comboSoundTier||0)||sim.time>(this.comboSoundUntil||0))&&sound.play('combo-accent',.4,tier)){this.comboSoundTier=tier;this.comboSoundUntil=sim.time+4;}for(const e of events){if(e.type==='destroy'&&e.returned){const accent=comboAccentPlan(e.combo||0,true,effectiveReduced());if(accent.tier){const fresh=accent.tier>(this.comboAccentTier||0)||sim.time>(this.comboAccentUntil||0);if(fresh){this.burst(e.x,e.y,accent.stars,'star',.55,80+accent.tier*18);this.comboPopSerial=(this.comboPopSerial||0)+1;$('combo').dataset.pop=this.comboPopSerial%2?'a':'b';}this.comboAccentTier=accent.tier;this.comboAccentUntil=sim.time+1.1;}}if(e.type==='hit')this.resetComboAccent();if(e.type==='capture'){sound.play('capture',.1);this.burst(e.x,e.y,2,'star',.25,60);}else if(e.type==='release'){sound.play('return-burst',.2);this.burst(e.x,e.y,Math.min(28,e.count+8),'spark',.55,220);this.burst(e.x,e.y,1,'glow',.4,0);if(!effectiveReduced())this.shake=.1;}else if(e.type==='destroy'){if(['boss','mirror-boss','eclipse-boss'].includes(e.enemyType))this.lastBossDestroy={x:e.x,y:e.y};sound.play('enemy-pop',.12);this.burst(e.x,e.y,(e.enemyType==='boss'||e.enemyType==='mirror-boss'||e.enemyType==='eclipse-boss')?60:e.returned?20:10,'spark',(e.enemyType==='boss'||e.enemyType==='mirror-boss'||e.enemyType==='eclipse-boss')?1.2:.5,(e.enemyType==='boss'||e.enemyType==='mirror-boss'||e.enemyType==='eclipse-boss')?260:150);this.burst(e.x,e.y,(e.enemyType==='boss'||e.enemyType==='mirror-boss'||e.enemyType==='eclipse-boss')?3:1,'glow',.4,30);}else if(e.type==='impact'){if(this.impactCooldown<=0){this.burst(e.x,e.y,2,e.returned?'star':'spark',.2,70);this.impactCooldown=.035;}}else if(e.type==='hit'){sound.play('hit',.1);this.burst(e.x,e.y,10,'spark',.4,150);if(!effectiveReduced())this.shake=.15;announce(`ライフ ${e.hp}`);}else if(e.type==='heal'){this.burst(sim.player.x,sim.player.y,8,'star',.65,70);announce(`星の光でライフが${e.amount}回復　ライフ${e.hp}`);}else if(e.type==='shot')sound.play('player-shot');else if(e.type==='optionlaser'){sound.play('option-laser');for(const side of [-1,1])this.burst(sim.player.x+side*38,sim.player.y-10,effectiveReduced()?2:5,'spark',.25,80);}else if(e.type==='beamfire'){sound.play('boss-beam');this.burst(e.x,e.y,effectiveReduced()?3:12,'spark',.5,120);}else if(e.type==='guardbreak'){sound.play('shield-break');this.ringBurst(sim.player.x,sim.player.y,0x9bf0d9);this.burst(sim.player.x,sim.player.y,effectiveReduced()?3:12,'spark',.45,120);announce('護星が一度、被弾を防ぎました');}else if(e.type==='sweep')announce('残る敵を倒しきると、ボスが現れます');else if(e.type==='bosswarn'){this.bossCue={kind:'warning',at:sim.time};announce('残る敵を倒しました　ボスが近づきます');if(sim?.stageIndex>=1)cueGate(bossTrackFor(sim.stageIndex),()=>{if(sim.stageBossSpawned)sound.transitionToBoss();});}else if(e.type==='boss'){this.bossCue={kind:'entry',at:sim.time};this.burst(240,150,20,'star',1,140);sound.transitionToBoss();sound.play('boss',1);}else if(e.type==='bossphase')sound.play('boss',1);else if(e.type==='itemcarrier')announce('光る敵が'+FEEL.itemInfo(e.itemKind).name+'を運んでいます　倒すと出現します');else if(e.type==='itemincoming')announce(FEEL.itemInfo(e.itemKind).name+'が間もなく現れます');
 else if(e.type==='itemdrop')announce(FEEL.itemInfo(e.itemKind).name+'が現れました');
 else if(e.type==='itempickup'){this.ringBurst(sim.player.x,sim.player.y,e.itemKind==='pierce'?0xffdc87:0x9dffe8);this.burst(sim.player.x,sim.player.y,26,'star',.85,130);this.burst(sim.player.x,sim.player.y,3,'glow',.55,35);sound.play('item-pickup',0,e.itemKind);const v=FEEL.itemInfo(e.itemKind);$('power-toast-icon').src=asset(v.icon);$('power-toast-title').textContent=v.name;$('power-toast-copy').textContent=v.effect;$('power-toast').hidden=false;this.powerToastUntil=sim.time+4;announce(v.name+'を取得　'+v.effect+'　残り20秒');
} else if(e.type==='itemuse'){this.ringBurst(sim.player.x,sim.player.y);this.burst(sim.player.x,sim.player.y,18,'star',.7,170);$('power-toast-icon').src=asset('item-twin-v5.png');$('power-toast-title').textContent='連星 · 反撃強化！';$('power-toast-copy').textContent='左右レーザーは、そのまま継続';$('power-toast').hidden=false;this.powerToastUntil=sim.time+2;announce('連星の反撃強化を使いました　左右レーザーは続きます');}
 else if(e.type==='itemexpire'){const label=FEEL.itemInfo(e.itemKind).name;$('power-toast-icon').src=asset(FEEL.itemInfo(e.itemKind).icon);$('power-toast-title').textContent=label+' · 効果終了';$('power-toast-copy').textContent=['extend','guard'].includes(e.itemKind)?'支援効果が終わりました':'通常ショットに戻りました';$('power-toast').hidden=false;this.powerToastUntil=sim.time+1.8;announce(label+'の効果が終わりました');}
  else if(e.type==='ready')announce('星返しの準備ができました');else if(e.type==='act')announce(C.STAGES[e.stageIndex].beats[e.beat].label+'');else if(e.type==='stageclear'){this.bossCue=null;this.burst(240,300,60,'star',1.15,230);clearInput();$('stage-clear-kicker').textContent=`STAGE ${e.stageIndex+1} CLEAR`;$('stage-clear-name').textContent=e.stageIndex===2?'星路が、\nつながった':C.STAGES[e.stageIndex].name;$('stage-clear-stats').textContent=`SCORE ${String(Math.round(sim.score)).padStart(6,'0')} · LIFE ${e.hp}/${sim.player.maxHp}`;$('stage-clear-banner').style.backgroundImage=`linear-gradient(180deg,#07152b38,#07152ba8),url("${asset('v7-art/'+(e.stageIndex===2?'final-clear':'stage'+(e.stageIndex+1)+'-clear')+'.webp')}")`;$('stage-clear-banner').hidden=false;document.body.classList.add('stage-clear-active');announce(C.STAGES[e.stageIndex].name+'突破　ライフを引き継ぎます');beginBossDefeat(e.stageIndex);}else if(e.type==='stage'){endStageTransit(e.stageIndex);document.body.classList.remove('stage-clear-active');$('stage-clear-banner').hidden=true;this.enterStage(e.stageIndex);cueGate(fieldTrackFor(sim.stageIndex),()=>sound.transitionToStage());announce(C.STAGES[e.stageIndex].name+'へ');}else if(e.type==='bosssummon'){this.burst(e.x,e.y,14,'spark',.65,95);announce('ボスが護衛機を呼んだ　星返しでまとめて返そう');}else if(e.type==='bossreturnwarn'){announce('敵も星返しを構える　金の輪に注意');}else if(e.type==='bossabsorb'){this.burst(e.x,e.y,3,'star',.28,45);}else if(e.type==='bossreturn'){sound.play('return-burst',.3);this.burst(e.x,e.y,18,'star',.55,120);announce('敵の星返し　軌道を見て捕ろう');}else if(e.type==='pulsewarn')announce(e.pattern===3?'敵が星返しを構えた　金の輪と返し弾に注意':'時環の予告　敵の攻撃を見て動こう');else if(e.type==='mirrorwarn')announce(e.side<0?'左の鏡が光ります':'右の鏡が光ります');}}
  update(t,delta){if(assetsFailed)return;pollGamepad();if(sim&&this.powerToastUntil&&sim.time>=this.powerToastUntil)$('power-toast').hidden=true;qaFrames++;qaWorst=Math.max(qaWorst,delta);const dt=Math.min(delta/1000,.05),wasDefeat=mode==='boss-defeat',wasTransit=mode==='transit';if(wasDefeat)tickBossDefeat(dt);else if(wasTransit)tickStageTransit(dt);else if(cinematic.active&&!stageTransit){const done=cinematic.step(dt,cinematicHeld||document.hidden||$('settings').open);if(done)completeCinematic(done);else paintCinematic();}this.visualTime+=mode==='paused'||document.hidden?0:dt;this.impactCooldown=Math.max(0,this.impactCooldown-dt);menuTime+=mode==='paused'?0:dt;if(mode==='playing'&&sim&&!wasTransit&&!wasDefeat){const relativeMouse=settings.controlMode==='mouse'&&mouseLock.locked&&!pointer,mouseFrame=relativeMouse?mouseMotion.begin(sim.player,performance.now()):null;if(relativeMouse)target=mouseFrame?.target||null;acc+=Math.min(delta/1000,.1);let steps=0;while(acc>=1/60&&steps<6){sim.step(1/60,input());if(qaFieldHold&&sim.stageIndex===1&&sim.stagePhase==='waves')sim.stageTime=Math.min(sim.stageTime,70);this.handleEvents(sim.events);acc-=1/60;steps++;if(mode!=='playing'||sim.state==='paused')break;if(sim.state!=='playing'){mode='finishing';mouseLock.release();pendingFinish=sim.state==='stage-clear'?1.15:.4;clearInput();$('pause').disabled=true;$('capture').disabled=true;break;}}if(steps>0&&relativeMouse){if(mouseFrame&&mode==='playing'&&sim.state==='playing')mouseMotion.consume(mouseFrame,sim.player,performance.now());else mouseMotion.clear();target=null;}}else acc=0;if(mode==='finishing'){pendingFinish-=dt;if(pendingFinish<=0)finish();}if(mode==='credits')paintCredits(dt);
 const playing=mode==='playing',vdt=mode==='paused'||document.hidden?0:dt;const beat=sim?.beat||0,boss=!!sim?.stageBossSpawned;
 this.flow.clear();for(const path of FEEL.backgroundFrame(sim?.stageIndex||0,this.visualTime,effectiveReduced()).paths){this.flow.lineStyle(path.width,path.color,path.alpha);this.flow.beginPath();path.points.forEach((p,i)=>i?this.flow.lineTo(p.x,p.y):this.flow.moveTo(p.x,p.y));this.flow.strokePath();}
 this.powerArt.clear();this.drawBossCue();
  const routeWanted=!!(this.route&&sim&&!sim.practice&&(!effectiveReduced()||sim.stageIndex>=1));
  const routeFrame=routeWanted?this.route.update(effectiveReduced()?0:sim.stageTime,C.STAGES[sim.stageIndex].sweepAt):null;
 const routeActive=!!routeFrame?.active;
 if(!routeWanted)this.route?.hide();
if(mode==='playing'&&sim&&!sim.practice){
  if(sim.stageTime>=30)this.passageMix=Math.min(1,this.passageMix+dt/6);
  if(sim.stagePhase==='warning'||sim.stagePhase==='boss')this.vistaMix=Math.min(1,this.vistaMix+dt/6);
}
const bgX=240+(effectiveReduced()?0:Math.sin(this.visualTime*.07)*this.farDriftX);
const bgY=360+(effectiveReduced()?0:Math.sin(this.visualTime*.05)*this.farDriftY);
 this.bg.setPosition(bgX,bgY).setVisible(!routeActive&&this.passageMix<1);
 this.passage.setPosition(bgX,bgY).setAlpha(this.passageMix).setVisible(!routeActive&&this.passageMix>0&&this.vistaMix<1);
 this.vista.setPosition(bgX,bgY).setAlpha(this.vistaMix).setVisible(!routeActive&&this.vistaMix>0);
const midAlpha=.30+(.12-.30)*this.passageMix,nearAlpha=.42+(.22-.42)*this.passageMix;
 this.mid.setAlpha(routeActive ? .11 : midAlpha+(.05-midAlpha)*this.vistaMix);
 this.near.setAlpha(routeActive ? .18 : nearAlpha+(.10-nearAlpha)*this.vistaMix);
 const artStage=sim?.stageIndex||0,artLight=effectiveReduced()?1:.88+.12*Math.sin(this.visualTime*.29+artStage);
 this.drawArtPair(this.artMid,(artStage===1?.12:.10)*artLight,artStage);
 this.drawArtPair(this.artNear,(artStage===1?.18:artStage===2?.075:.13)*(effectiveReduced()?1:.92+.08*Math.sin(this.visualTime*.47+1)),artStage);
if(!effectiveReduced()&&mode!=='paused'){
   const midSpeed=routeActive ? routeFrame.speed*1.25+12 : 28+beat*4+(boss?6:0);
   const nearSpeed=routeActive ? routeFrame.speed*2+26 : 74+beat*12+(boss?18:0);
  this.mid.tilePositionY+=vdt*midSpeed/this.mid.tileScaleY;this.mid.tilePositionX+=vdt*(routeActive?8:4)/this.mid.tileScaleX;
  this.near.tilePositionY+=vdt*nearSpeed/this.near.tileScaleY;this.near.tilePositionX-=vdt*(routeActive?17:8)/this.near.tileScaleX;
   this.artMid.phase+=vdt*(11+beat*2+artStage*1.7);
   this.artNear.phase+=vdt*(24+beat*3+artStage*2);
  for(let i=0;i<this.ambient.length;i++){
    const s=this.ambient[i];s.y=(s.y+vdt*(22+beat*9+(boss?15:0)+i%3*5))%720;
  }
}
for(let i=0;i<this.atmo.length;i++){const a=this.atmo[i],stage=sim?.stageIndex??0,t=this.visualTime;a.setPosition((i%2?385:95)+Math.sin(t*(.10+i*.025)+i*2)*35,170+i*170+Math.sin(t*(.07+i*.015)+i)*42).setTint(stage===2?0x9b8dff:stage===1?0x60d7de:0x7cbaff).setAlpha(effectiveReduced()?0:routeActive?.055+.025*Math.sin(t*.31+i):.035);}
const p=sim?sim.player:{x:240+Math.sin(menuTime*.4)*25,y:575+Math.sin(menuTime*.8)*8,invuln:0};const flying=playing&&!!sim,quiet=effectiveReduced(),last=this.lastFlightPosition,elapsed=flying&&last?sim.time-last.time:0;
if(mode!=='paused'&&!document.hidden){this.flight=FEEL.flightPose(this.flight,elapsed>0?(p.x-last.x)/elapsed:0,elapsed>0?(p.y-last.y)/elapsed:0,flying?dt:dt,quiet);}
this.lastFlightPosition=flying?{x:p.x,y:p.y,time:sim.time}:null;
const pose=this.flight||FEEL.flightPose(null,0,0,0,true);
if(!quiet&&(Math.abs(pose.lean)+Math.abs(pose.tail)+Math.abs(pose.thrust)+pose.energy)>.003){FEEL.paintFlight(this.flightTexture.canvas,this.flightImage,pose);this.flightTexture.refresh();this.player.setTexture('player-flight');}else this.player.setTexture('player');
this.player.setPosition(p.x,p.y).setDisplaySize(70*(1-.025*pose.thrust),70*(1+.045*pose.thrust)).setRotation(pose.lean*.11).setAlpha(p.invuln>0?.6:1);this.playerGlow.setPosition(p.x,p.y).setAlpha(p.invuln>0?.28:.10);this.core.clear();this.core.lineStyle(1.5,0x061828,1);this.core.fillStyle(0xffffff,1);this.core.fillCircle(p.x,p.y,C.CORE-1);this.core.strokeCircle(p.x,p.y,C.CORE-1);if(sim?.boss&&sim.stageIndex===0&&sim.boss.queuedPattern===3&&sim.boss.warning>0){const b=sim.boss;this.core.lineStyle(2,0xffd084,.18+.5*b.warning);this.core.lineBetween(b.x,b.y+38,b.aimX??p.x,b.aimY??p.y);this.core.strokeCircle(b.aimX??p.x,b.aimY??p.y,15);}if(sim?.boss&&sim.boss.warning>0&&((sim.stageIndex===1&&sim.boss.queuedPattern===1)||(sim.stageIndex===2&&sim.boss.queuedPattern===2))){
  const b=sim.boss,x=b.x,y=b.y+(sim.stageIndex===1?24:26);
  this.core.lineStyle(2,0xffd084,.18+.5*b.warning);
  this.core.lineBetween(x,y,b.aimX??p.x,b.aimY??p.y);
  this.core.strokeCircle(b.aimX??p.x,b.aimY??p.y,15);
}
this.drawPowerArt(p);
if(sim&&sim.guardUntil>sim.time){this.core.lineStyle(2,0x9bf0d9,.8);for(let i=0;i<4;i++){const a=i*Math.PI/2+.15;this.core.beginPath();this.core.arc(p.x,p.y,21,a,a+.85);this.core.strokePath();}}
if(sim&&sim.extendUntil>sim.time){this.core.lineStyle(2,0xb4c9ff,.5);this.core.strokeCircle(p.x,p.y,C.RADIUS+5);}

if(sim&&(sim.field.phase==='capture'||sim.field.phase==='ready')){this.core.lineStyle(1,0x9debd8,sim.field.phase==='capture'?.45:.14);this.core.strokeCircle(p.x,p.y,C.RADIUS);} if(sim?.item){
   const type=sim.item.type;
   if(!this.itemGlow)this.itemGlow=this.add.image(0,0,'glow').setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
   this.itemGlow.setPosition(sim.item.x,sim.item.y).setDisplaySize(72,72).setAlpha(.3).setVisible(true);
   if(!this.itemSprite)this.itemSprite=this.add.image(0,0,FEEL.itemInfo(type).texture).setDepth(6);
   this.itemSprite.setTexture(FEEL.itemInfo(type).texture).setDisplaySize(50,50).setPosition(sim.item.x,sim.item.y).setVisible(true);
   if(!this.itemLabel)this.itemLabel=this.add.text(0,0,'',{fontFamily:'sans-serif',fontSize:'14px',color:'#fff3d5',backgroundColor:'#102238dd',padding:{x:6,y:3}}).setOrigin(.5).setDepth(7);
   this.itemLabel.setText(L.text(FEEL.itemInfo(type).name)).setPosition(sim.item.x,sim.item.y+33).setVisible(true);
 }else{this.itemGlow?.setVisible(false);this.itemSprite?.setVisible(false);this.itemLabel?.setVisible(false);}
  const used=new Set();if(sim){for(const e of sim.enemies){const art=e.type==='mirror'?'stage2-mirror':e.type==='pulse'?'stage3-pulse':(e.type==='skimmer'||e.type==='lancer')?(sim.stageIndex===1?'stage2-darter':'skimmer-v5'):e.type==='courier'?(sim.stageIndex===2?'stage3-lantern':'ray'):e.type==='jelly'&&sim.stageIndex===2?'stage3-lantern':e.type;const s=this.object(e,art,e.type==='jelly'?76:e.type==='skimmer'?72:e.type==='mirror'||e.type==='pulse'?64:58,3);used.add(e.id);if(e.itemKind){const quiet=effectiveReduced(),glowId='carrier-glow-'+e.id,iconId='carrier-icon-'+e.id;const glow=this.object({id:glowId,x:e.x,y:e.y},'glow',100,2.9);used.add(glowId);glow.setTint(0x83fff0).setBlendMode(Phaser.BlendModes.ADD).setAlpha(quiet?.35:.38+.08*Math.sin(this.visualTime*2.4));const icon=this.object({id:iconId,x:e.x,y:e.y-42},FEEL.itemInfo(e.itemKind).texture,24,6);used.add(iconId);icon.setTint(0xcafff1);this.core.lineStyle(2.5,0x9dffe8,.9);for(const side of [-1,1]){const x=e.x+side*39;this.core.lineBetween(x,e.y-17,x+side*7,e.y);this.core.lineBetween(x+side*7,e.y,x,e.y+17);}this.core.lineBetween(e.x-13,e.y-43,e.x-7,e.y-49);this.core.lineBetween(e.x+13,e.y-43,e.x+7,e.y-49);}s.setTint(e.type==='courier'?0x9ef8ff:e.type==='lancer'?0xff9bbc:0xffffff);const canFire=e.y>25&&e.y<390&&(e.type==='mirror'||e.type==='pulse'||e.type==='skimmer'||e.type==='lancer'||e.type==='courier'?e.shots<(e.type==='courier'?3:2)&&e.age<9:e.shots<(e.beat===0?2:3)&&e.age<8+e.beat*1.4);const cue=sim.stageIndex>0&&!canFire?0:e.warning;s.setRotation(Math.sin(e.age)*.1).setAlpha(cue>.2?.8+cue*.2:1);if(cue>.2)s.setScale(s.scaleX*(1+cue*.08),s.scaleY*(1+cue*.08));if(sim.stageIndex>0&&cue>.15){this.core.lineStyle(3,0xffddaa,.20+.75*cue);this.core.strokeCircle(e.x,e.y+12,32+cue*10);}}if(sim.boss&&!sim.boss.dead){const b=sim.boss,s=this.object(b,b.type==='mirror-boss'?'stage2-boss':b.type==='eclipse-boss'?'stage3-eclipse':'boss',190,3);used.add(b.id);s.setRotation(Math.sin(b.age*.25)*.1).setAlpha(.95);}
if(sim?.boss&&!sim.boss.dead&&(sim.stageIndex===1||sim.stageIndex===2||sim.stageIndex===0&&(sim.boss.queuedPattern===4||sim.time<(sim.boss.activeMuzzleUntil||0)))){
  const b=sim.boss,side=sim.stageIndex===0?(b.telegraphed?b.telegraphSide:b.activeSide):(b.telegraphed?b.telegraphSide:b.activeSide)??0;
  const offset=sim.stageIndex===2?75:sim.stageIndex===1?56:54;
  const muzzleY=sim.stageIndex===2?(side===0?26:18):sim.stageIndex===1?(side===0?24:20):20;
  this.bossMuzzle.setPosition(b.x+(side??0)*offset,b.y+muzzleY)
    .setAlpha(sim.time<(b.wingFlashUntil||0)?.9:.3+.55*b.warning).setVisible(true);
}else this.bossMuzzle.setVisible(false);if(this.bossReturnRing){const b=sim?.boss;this.bossReturnRing.setVisible(!!b&&!b.dead&&sim.stageIndex===2&&(b.queuedPattern===3&&b.warning>0||sim.time<(b.reflectUntil||0)));if(b){this.bossReturnRing.setPosition(b.x,b.y+8).setAlpha(sim.time<(b.reflectUntil||0)?.68:.18+.5*b.warning).setRotation(this.visualTime*.8);}}
if(sim.powerUntil>sim.time){for(const side of [-1,1]){const option={id:side===-1?-201:-202,x:Math.max(12,Math.min(468,p.x+side*38)),y:p.y-10};const sprite=this.object(option,'star',24,6);used.add(option.id);sprite.setTint(0xa6fff1).setRotation(side*.2).setAlpha(.95);}}
for(const ray of sim.optionLasers){if(!effectiveReduced()){this.core.lineStyle(ray.width+14,0x63dcff,.13);this.core.lineBetween(ray.x,ray.y,ray.x,ray.endY);this.core.lineStyle(ray.width+6,0x8dfff1,.3);this.core.lineBetween(ray.x,ray.y,ray.x,ray.endY);}this.core.lineStyle(ray.width,0x8dfff1,.9);this.core.lineBetween(ray.x,ray.y,ray.x,ray.endY);this.core.lineStyle(3,0xffffff,1);this.core.lineBetween(ray.x,ray.y,ray.x,ray.endY);}
for(const beam of sim.beams){const active=beam.age>=beam.warning,dx=beam.endX-beam.x,dy=beam.endY-beam.y,len=Math.hypot(dx,dy),nx=-dy/len*beam.width/2,ny=dx/len*beam.width/2;
 if(active&&!effectiveReduced()){this.core.lineStyle(beam.width+28,0xff5b9f,.12);this.core.lineBetween(beam.x,beam.y,beam.endX,beam.endY);this.core.lineStyle(beam.width+12,0xff7ab6,.28);this.core.lineBetween(beam.x,beam.y,beam.endX,beam.endY);this.core.lineStyle(2,0xffefb2,.8);this.core.strokeCircle(beam.x,beam.y,24+9*Math.sin(Math.min(1,(beam.age-beam.warning)/.2)*Math.PI/2));}
 this.core.lineStyle(beam.width,active?0xff8ab8:0xffc481,active?.95:.16);this.core.lineBetween(beam.x,beam.y,beam.endX,beam.endY);
 this.core.lineStyle(active?2:1,active?0xffffff:0xffd39a,1);this.core.lineBetween(beam.x,beam.y,beam.endX,beam.endY);
 if(!active){for(const side of [-1,1])this.core.lineBetween(beam.x+nx*side,beam.y+ny*side,beam.endX+nx*side,beam.endY+ny*side);this.core.strokeCircle(beam.x,beam.y,15);}
}
for(const b of sim.bullets){const special=['split','accel','homing'].includes(b.style),s=this.object(b,b.style==='petal'||b.style==='split'?'bolt':'thorn',b.style==='split'?36:b.style==='boss-return'?25:20,7.5);used.add(b.id);if(b.style==='petal'||b.style==='split')s.setTintFill(0xdc8cff);else if(b.style==='boss-return')s.setTintFill(0xffd987);else if(special)s.setTintFill(b.style==='accel'?0xffa1db:0xbfa3ff);else s.setTint(0xffffff);const angle=Math.atan2(b.vy,b.vx);s.setRotation(angle+Math.PI/2);
 if(b.style==='split'){this.core.lineStyle(2,0xf9d9ff,1);this.core.strokeCircle(b.x,b.y,18);this.core.strokeCircle(b.x,b.y,8+8*Math.max(0,1-b.age/1.15));for(let i=0;i<8;i++){const a=i*Math.PI/4;this.core.lineBetween(b.x+Math.cos(a)*15,b.y+Math.sin(a)*15,b.x+Math.cos(a)*22,b.y+Math.sin(a)*22);}}
 if(b.style==='accel'||b.style==='homing'){const length=b.style==='accel'?12+Math.min(22,b.age*14):26;this.core.lineStyle(b.style==='accel'?3:1.5,b.style==='accel'?0xffb4df:0xe5d5ff,.9);this.core.lineBetween(b.x-Math.cos(angle)*8,b.y-Math.sin(angle)*8,b.x-Math.cos(angle)*length,b.y-Math.sin(angle)*length);if(b.style==='homing'&&b.age<1.2)this.core.strokeCircle(b.x,b.y,10);}
}
for(const s of sim.shots){const sprite=this.object(s,s.returned?'star':'bolt',s.returned?25:s.poweredShot?15:12,4);used.add(s.id);sprite.setRotation(s.returned?s.age*3:Math.atan2(s.vy,s.vx)+Math.PI/2).setBlendMode(s.returned?Phaser.BlendModes.ADD:Phaser.BlendModes.NORMAL);if(s.poweredShot)sprite.setTint(0x94ffe8);else if(s.piercing)sprite.setTint(0xffd486);if(!s.returned&&(s.poweredShot||s.piercing)){const speed=Math.hypot(s.vx,s.vy)||1,tail=s.piercing?34:18;this.powerArt.lineStyle(s.piercing?4:3,s.piercing?0xffd486:0x94ffe8,.48);this.powerArt.lineBetween(s.x,s.y,s.x-s.vx/speed*tail,s.y-s.vy/speed*tail);if(s.piercing){this.powerArt.lineStyle(1.5,0xfff5d8,.9);this.powerArt.lineBetween(s.x,s.y,s.x-s.vx/speed*tail,s.y-s.vy/speed*tail);}}if(!effectiveReduced()&&playing&&s.returned&&Math.random()<.12)this.burst(s.x,s.y,1,'spark',.18,10);}
const f=sim.field;this.fieldRing.setPosition(p.x,p.y).setRotation(this.visualTime*.25).setAlpha(f.phase==='capture'?.48:f.phase==='ready'?.10:0);if(f.phase==='capture'||f.phase==='orbit'){for(let i=0;i<f.stars.length;i++){const a=f.stars[i],angle=a.angle+this.visualTime*4,entity={id:-100-i,x:p.x+Math.cos(angle)*a.radius,y:p.y+Math.sin(angle)*a.radius};const s=this.object(entity,'star',16,8);used.add(entity.id);s.setRotation(angle);}}}else this.fieldRing.setAlpha(0);
for(const[id,s]of this.objects)if(!used.has(id)){s.destroy();this.objects.delete(id);}for(const f of this.fx){f.life-=vdt;f.sprite.x+=f.vx*vdt;f.sprite.y+=f.vy*vdt;f.sprite.setAlpha(Math.max(0,f.life/f.maxLife)*f.baseAlpha);f.sprite.rotation+=vdt*.8;if(f.grow)f.sprite.setDisplaySize(f.size+(f.maxLife-f.life)*f.grow,f.size+(f.maxLife-f.life)*f.grow);}this.fx=this.fx.filter(f=>{if(f.life<=0){f.sprite.destroy();return false;}return true;});if(this.shake>0&&playing&&!effectiveReduced()){this.shake-=dt;this.cameras.main.setScroll(Math.sin(this.visualTime*80)*1.1,Math.cos(this.visualTime*65)*1.1);}else this.cameras.main.setScroll(0,0);if(t-lastUI>70){updateUI();lastUI=t;if(qaOutput)qaOutput.textContent=JSON.stringify({mode,session,seed:sim?.seed,time:sim?Math.round(sim.time*100)/100:0,hp:sim?.player.hp,x:sim?Math.round(sim.player.x):0,y:sim?Math.round(sim.player.y):0,pointer:pointer?.id??null,phase:sim?.field.phase,caught:sim?.field.count,bullets:sim?.bullets.length,hazardKinds:sim?[...new Set(sim.bullets.map(b=>b.style))]:[],beams:sim?.beams.map(b=>({age:Math.round(b.age*100)/100,active:b.age>=b.warning,width:b.width,x:b.x,y:b.y,endX:b.endX,endY:b.endY})),enemyCount:sim?.enemies.length,bulletPeak:sim?.peakBullets,bulletDrops:sim?.bulletsDropped,nearestBullet:sim?Math.round(sim.bullets.reduce((d,b)=>Math.min(d,Math.hypot(b.x-sim.player.x,b.y-sim.player.y)),Infinity)):null,stageIndex:sim?.stageIndex,stageTime:sim?Math.round(sim.stageTime*100)/100:0,bossHp:sim?.boss?.hp??null,shots:sim?.shots.length,fx:this.fx.length,frames:qaFrames,worstFrameMs:Math.round(qaWorst),musicVolume:settings.musicVolume,sfxVolume:settings.sfxVolume,audio:sound.ctx?.state||'not-started',audioTime:sound.ctx?Math.round(sound.ctx.currentTime*10)/10:0,music:!!sound.music,musicTrack:sound.musicTrack,musicSeconds:sound.buffers['star-tide-loop']?.duration||0,stage2FieldPath:sound.loadedPaths['stage2-field']||null,stage2FieldSeconds:sound.buffers['stage2-field']?.duration||0,stage2BossPath:sound.loadedPaths['stage2-boss']||null,stage2BossSeconds:sound.buffers['stage2-boss']?.duration||0,stage3FieldPath:sound.loadedPaths['stage3-field']||null,stage3FieldSeconds:sound.buffers['stage3-field']?.duration||0,stage3BossPath:sound.loadedPaths['stage3-boss']||null,stage3BossSeconds:sound.buffers['stage3-boss']?.duration||0,midY:Math.round(this.mid.tilePositionY),nearY:Math.round(this.near.tilePositionY),passageMix:Math.round(this.passageMix*100)/100,vistaMix:Math.round(this.vistaMix*100)/100,item:sim?.item?{x:Math.round(sim.item.x),y:Math.round(sim.item.y)}:null,powerSeconds:sim?Math.max(0,Math.ceil(sim.powerUntil-sim.time)):0,itemsEnabled:sim?.itemsEnabled,itemOffered:sim?.itemOffered,itemPickups:sim?.itemPickups,itemActivations:sim?.itemActivations,returnCount:sim?.returned,captureUses:sim?.captureUses,hits:sim?.hits,stagePhase:sim?.stagePhase,qaFieldHold,bossCandidate,stage2Candidate,bossAudioPath:sound.loadedPaths['stage1-boss']||null,bossSeconds:sound.buffers['stage1-boss']?.duration||0,bossRate:sound.buffers['stage1-boss']?.sampleRate||0,musicLoopEnd:sound.music?.source.loopEnd||0,musicAge:sound.music&&sound.ctx?Math.round((sound.ctx.currentTime-sound.music.startAt)*10)/10:0,musicCreated:sound.musicCreated,decodedAudioCount:Object.values(sound.buffers).filter(Boolean).length,decodedAudioMiB:Math.round(Object.values(sound.buffers).filter(Boolean).reduce((total,b)=>total+b.length*b.numberOfChannels*4,0)/1048576*100)/100,storageOK,routeActive,routeVisible:routeFrame?.visible?.map(i=>(sim?.stageIndex===2?STAGE3_ROUTE:sim?.stageIndex===1?STAGE2_ROUTE:STAGE1_ROUTE)[i].key)||[],routeResident:[...STAGE1_ROUTE,...STAGE2_ROUTE,...STAGE3_ROUTE].filter(part=>this.textures.exists(part.key)).map(part=>part.key),routeRawMiB:Math.round([...STAGE1_ROUTE,...STAGE2_ROUTE,...STAGE3_ROUTE].filter(part=>this.textures.exists(part.key)).reduce((bytes,part)=>{const src=this.textures.get(part.key).getSourceImage();return bytes+src.width*src.height*4;},0)/1048576*100)/100});}}
}
try{new Phaser.Game({type:Phaser.AUTO,parent:'arena',width:C.W,height:C.H,backgroundColor:'#071326',transparent:false,antialias:true,roundPixels:false,audio:{noAudio:true},scene:Ocean,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},fps:{target:60,forceSetTimeOut:false},render:{powerPreference:'low-power',maxTextures:8}});}catch(e){$('load-error').hidden=false;$('load-error-text').textContent='このブラウザでは描画を開始できませんでした　対応ブラウザで開き直してください';failBoot();}
$('studio-link').hidden=true;$('start').disabled=true;$('practice').disabled=true;storageMessage();audioNotice();updateRecords();
})();




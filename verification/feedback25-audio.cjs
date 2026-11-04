const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const S=require('../source/sound-design.js'),code=fs.readFileSync(path.join(__dirname,'../source/app.js'),'utf8'),results=[];
function context(){
 const started=[],param=()=>({value:1,setTargetAtTime(v){this.value=v;},cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
 const ctx={state:'running',currentTime:1,sampleRate:24000,started,
  resume:async()=>{ctx.state='running';},suspend:async()=>{ctx.state='suspended';},
  createGain:()=>({gain:param(),connect(){},disconnect(){}}),
  createBuffer:(channels,length,rate)=>({name:'procedural',duration:length/rate,copyToChannel(){}}),
  decodeAudioData:async bytes=>({name:Buffer.from(bytes).toString(),duration:3}),
  createBufferSource:()=>({playbackRate:{value:1},connect(){},disconnect(){},start(){started.push(this);},stop(){this.onended?.();}})};
 return ctx;
}
function fixture(){
 const ctx=context(),uiContexts=[],requests=[];
 const env={window:{StarSoundDesign:S,AudioContext:function(){const c=context();uiContexts.push(c);return c;}},
  settings:{muted:false,sfxVolume:40,musicVolume:40,reduced:false},mode:'playing',sim:{stageIndex:0},document:{hidden:false},cinematicHeld:false,
  qaMode:false,bossCandidate:false,stage2Candidate:false,AUDIO_ATTEMPT_TIMEOUT_MS:40,console,setTimeout,clearTimeout,AbortController,
  audio:p=>p,announce(){},$:()=>({}),effectiveReduced:()=>false,
  fetch:async url=>{requests.push(url);return{ok:true,arrayBuffer:async()=>Buffer.from(url)};}};
 vm.createContext(env);vm.runInContext(code.slice(code.indexOf('const AUDIO_FILES='),code.indexOf('const sound=new Sound();'))+';globalThis.sound=new Sound();',env);
 const sound=env.sound;Object.assign(sound,{ctx,ready:true,master:ctx.createGain(),fxGain:ctx.createGain(),musicGain:ctx.createGain()});
 for(const name of ['button','player-shot','enemy-pop','boss-defeat','stage-transit','opening-ambience','capture','chain-1','chain-2','chain-3','chain-4'])sound.buffers[name]={name,duration:.25};
 return{env,sound,ctx,uiContexts,requests};
}
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
module.exports=(async()=>{
 await test('starting a second run retains chain cues and retries any previously missing optional sample',async()=>{
  const h=fixture();h.sound.buffers={};await h.sound.ensure();await Promise.resolve();
  Object.assign(h.env,{scene:{},assetsFailed:false,mouseLock:{release(){}},hideAudioGate(){},launch(){h.env.mode='playing';},prepareStart(){throw Error('expected cached start');},pendingMouseRestart:null,pendingDifficulty:null,audioGate:null});
  vm.runInContext(code.slice(code.indexOf(' function start('),code.indexOf(' async function prepareStart(')),h.env);
  delete h.sound.buffers['chain-2'];h.env.mode='menu';h.env.start();await new Promise(r=>setImmediate(r));
  for(const key of ['chain-1','chain-2','chain-3','chain-4'])assert.equal(h.sound.buffers[key]?.name,'selected/'+key.replace('chain-','chain-bell-')+'.ogg');
  h.ctx.currentTime++;h.sound.queueChain(5);h.sound.flushChain();assert.equal(h.ctx.started.at(-1).buffer.name,'selected/chain-bell-1.ogg');
 });
 await test('starting a run actually decodes the selected shot, enemy, boss and passage cues',async()=>{
  const h=fixture();h.sound.buffers={};await h.sound.ensure();
  for(const key of ['player-shot','enemy-pop','boss-defeat','stage-transit'])assert.equal(h.sound.buffers[key]?.name,'selected/'+key+'.ogg');
 });
 await test('approved sample effects load the chosen files instead of procedural replacements',async()=>{
  const h=fixture();h.sound.buffers={};
  for(const key of ['button','player-shot','enemy-pop','boss-defeat','stage-transit','chain-1','chain-2','chain-3','chain-4']){
   assert(await h.sound.prefetch(key));assert.equal(h.sound.buffers[key].name,'selected/'+key.replace('chain-','chain-bell-')+'.ogg');
  }
 });
 await test('sample loading tries the MP3 alternative and never substitutes an unchosen tone',async()=>{
  const h=fixture();h.sound.buffers={};h.env.fetch=async url=>({ok:url.endsWith('.mp3'),status:404,arrayBuffer:async()=>Buffer.from(url)});
  assert(await h.sound.prefetch('player-shot'));assert.equal(h.sound.buffers['player-shot'].name,'selected/player-shot.mp3');
  h.sound.buffers={};h.env.fetch=async()=>({ok:false,status:404});assert.equal(await h.sound.prefetch('player-shot'),false);assert.equal(h.sound.buffers['player-shot'],undefined);
 });
 await test('five-kill milestones use four bell voicings and cap pitch after twenty',()=>{
  const h=fixture();for(const [combo,want]of [[5,'chain-1'],[9,'chain-1'],[10,'chain-2'],[14,'chain-2'],[15,'chain-3'],[19,'chain-3'],[20,'chain-4'],[500,'chain-4']]){
   h.ctx.currentTime++;assert(h.sound.play('combo-accent',0,combo));const voice=h.ctx.started.at(-1);assert.equal(voice.buffer.name,want);assert.equal(voice.playbackRate.value,1);voice.stop();
  }
 });
 await test('every fifth kill emits a bell including after twenty; a broken chain restarts the voicing',()=>{
  const h=fixture();for(let n=1;n<=50;n++){h.sound.queueChain(n);h.sound.flushChain();h.ctx.currentTime+=.2;h.sound.voices.slice().forEach(v=>v.source.stop());}
  assert.deepEqual(h.ctx.started.map(v=>v.buffer.name),['chain-1','chain-2','chain-3','chain-4','chain-4','chain-4','chain-4','chain-4','chain-4','chain-4']);
  for(let n=1;n<=5;n++){h.sound.queueChain(n);h.sound.flushChain();h.ctx.currentTime+=.2;}
  assert.equal(h.ctx.started.length,11);assert.equal(h.ctx.started.at(-1).buffer.name,'chain-1');
 });
 await test('a simultaneous kill storm emits just its highest reached tier, with no long note backlog',()=>{
  const h=fixture();for(let n=1;n<=100;n++)h.sound.queueChain(n);h.sound.flushChain();
  assert.equal(h.ctx.started.length,1);assert.equal(h.ctx.started[0].buffer.name,'chain-4');
  h.ctx.currentTime+=.3;h.sound.flushChain();assert.equal(h.ctx.started.length,1);
 });
 await test('suppressed or expired milestone cues do not return when sound becomes available',()=>{
  for(const flag of ['muted','zero','paused','hidden','silent','suspended']){
   const h=fixture();if(flag==='muted')h.env.settings.muted=true;if(flag==='zero')h.env.settings.sfxVolume=0;if(flag==='paused')h.env.mode='paused';if(flag==='hidden')h.env.document.hidden=true;if(flag==='silent')h.sound.runSilent=true;if(flag==='suspended')h.ctx.state='suspended';
   h.sound.queueChain(5);h.sound.flushChain();assert.equal(h.ctx.started.length,0);
   Object.assign(h.env.settings,{muted:false,sfxVolume:40});h.env.mode='playing';h.env.document.hidden=false;h.sound.runSilent=false;h.ctx.state='running';h.sound.queueChain(6);h.sound.flushChain();assert.equal(h.ctx.started.length,0);
  }
  const h=fixture();h.sound.queueChain(10);h.ctx.currentTime+=1;h.sound.flushChain();assert.equal(h.ctx.started.length,0);
 });
 await test('a missing chain sample stays silent instead of using a capture sound',()=>{
  const h=fixture();delete h.sound.buffers['chain-1'];h.sound.play('combo-accent',0,5);assert.equal(h.ctx.started.length,0);
 });
 await test('pause and resume UI use the selected metal sample while gameplay context is suspended',async()=>{
  const h=fixture();h.ctx.state='suspended';h.env.mode='paused';h.sound.ui('ui-pause');await Promise.resolve();
  assert.equal(h.ctx.state,'suspended');assert.equal(h.uiContexts.length,1);assert.equal(h.uiContexts[0].started[0].buffer.name,'button');assert.equal(h.uiContexts[0].started[0].playbackRate.value,1);
  h.uiContexts[0].currentTime+=.1;h.sound.ui('ui-resume');assert.equal(h.uiContexts[0].started[1].buffer.name,'button');
 });
 await test('mute, silent play and hidden page prevent even a delayed UI resume from sounding',async()=>{
  for(const flag of ['muted','silent','hidden']){
   const h=fixture(),ui=context();ui.state='suspended';let resume;ui.resume=()=>new Promise(resolve=>resume=resolve);h.sound.uiCtx=ui;h.sound.uiGain=ui.createGain();h.sound.ui();
   if(flag==='muted')h.env.settings.muted=true;if(flag==='silent')h.sound.runSilent=true;if(flag==='hidden')h.env.document.hidden=true;ui.state='running';resume();await Promise.resolve();assert.equal(ui.started.length,0);
  }
 });
 await test('the opening loads the selected track and a delayed load cannot play after skip',async()=>{
  const h=fixture();h.sound.buffers={};h.env.mode='intro';await h.sound.beginIntro();await Promise.resolve();assert.equal(h.sound.music.source.buffer.name,'selected/opening-ambience.ogg');
  const j=fixture();j.sound.buffers={};j.env.mode='intro';let complete;j.sound.loadBuffer=key=>key==='opening-ambience'?new Promise(resolve=>complete=resolve):Promise.resolve({decoded:{name:key},path:key});
  const pending=j.sound.beginIntro();await Promise.resolve();j.env.mode='menu';j.sound.finishIntro();complete({decoded:{name:'opening',duration:12},path:'opening'});await pending;await Promise.resolve();assert.equal(j.sound.music,null);
 });
 await test('an opening load completed while muted does not start and can retry after unmuting',async()=>{
  const h=fixture();h.sound.buffers={};h.env.mode='intro';let complete;h.sound.loadBuffer=key=>key==='opening-ambience'?new Promise(resolve=>complete=resolve):Promise.resolve({decoded:{name:key},path:key});
  const pending=h.sound.beginIntro();await Promise.resolve();h.env.settings.muted=true;complete({decoded:{name:'opening',duration:12},path:'opening'});await pending;await Promise.resolve();assert.equal(h.sound.music,null);
  h.env.settings.muted=false;await h.sound.beginIntro();assert(h.sound.music);
 });
 return{failed:results.filter(r=>r.status==='FAIL').length,results};
})();
if(require.main===module)module.exports.then(r=>{console.log(JSON.stringify(r,null,2));process.exitCode=r.failed?1:0;});

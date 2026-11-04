const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'../source/app.js'),'utf8'),results=[];
// Changing the ending back to the field track must fail the playback assertion.
// Only browser I/O is replaced; loading, source lifetime and routing use Sound itself.
function fixture(){
 const started=[],requests=[],notices=[],param=()=>({value:1,setTargetAtTime(v){this.value=v;},cancelScheduledValues(){},setValueAtTime(v){this.value=v;},linearRampToValueAtTime(v){this.value=v;}});
 const ctx={state:'running',currentTime:1,sampleRate:44100,
  resume:async()=>{ctx.state='running';},suspend:async()=>{ctx.state='suspended';},
  createGain:()=>({gain:param(),connect(){},disconnect(){}}),
  decodeAudioData:async bytes=>({name:Buffer.from(bytes).toString(),duration:39.285714}),
  createBufferSource:()=>({connect(){},disconnect(){},start(){started.push(this);},stop(){this.onended?.();}})};
 const env={window:{StarSoundDesign:{KEYS:[]}},settings:{muted:false,sfxVolume:40,musicVolume:40},mode:'ending',sim:{stageIndex:0},document:{hidden:false},cinematicHeld:false,creditsHeld:()=>false,
  qaMode:false,bossCandidate:false,stage2Candidate:false,AUDIO_ATTEMPT_TIMEOUT_MS:200,console,setTimeout,clearTimeout,AbortController,
  audio:p=>p,announce:s=>notices.push(s),
  fetch:async url=>{requests.push(url);return{ok:true,arrayBuffer:async()=>Buffer.from(url)};}};
 vm.createContext(env);
 vm.runInContext(code.slice(code.indexOf('const fieldTrackFor='),code.indexOf(' const mirrorMuzzleSide='))+code.slice(code.indexOf('const AUDIO_FILES='),code.indexOf('const sound=new Sound();'))+';globalThis.sound=new Sound();',env);
 const sound=env.sound;Object.assign(sound,{ctx,ready:true,master:ctx.createGain(),fxGain:ctx.createGain(),musicGain:ctx.createGain()});
 return{env,sound,ctx,started,requests,notices};
}
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
module.exports=(async()=>{
 await test('ending plays the approved flute, continues into credits once, and releases it on exit',async()=>{
  const h=fixture();await h.sound.beginCredits();assert.equal(h.started[0]?.buffer.name,'credits/credits-flute-v1.ogg');
  const source=h.started[0];assert(source.loop);assert.equal(source.loopEnd,source.buffer.duration);
  h.env.mode='credits';await h.sound.beginCredits();assert.equal(h.started.length,1);
  h.sound.pause();assert.equal(h.ctx.state,'suspended');h.sound.resume();assert.equal(h.ctx.state,'running');assert.equal(h.started.length,1);
  h.env.settings.muted=true;h.sound.setVolume();assert.equal(h.sound.master.gain.value,0);
  h.env.mode='result';h.sound.stop();assert.equal(h.sound.activeMusic.size,0);assert.equal(h.sound.music,null);
 });
 await test('first stage retains its original music and does not preload the ending',async()=>{
  const h=fixture();h.env.mode='playing';await h.sound.ensure();await h.sound.begin();
  assert.equal(h.started[0]?.buffer.name,'stage1/stage1-flow.ogg');assert(!h.requests.some(p=>p.startsWith('credits/')));
 });
 await test('a failed OGG decode selects the approved MP3 instead',async()=>{
  const h=fixture();h.ctx.decodeAudioData=async bytes=>{const name=Buffer.from(bytes).toString();if(name.endsWith('.ogg'))throw Error('unsupported codec');return{name,duration:39.285714};};
  await h.sound.beginCredits();assert.equal(h.started[0]?.buffer.name,'credits/credits-flute-v1.mp3');
 });
 await test('a slow ending load cannot restart music after returning to results',async()=>{
  const h=fixture();let release;h.env.fetch=()=>new Promise(r=>release=r);
  const pending=h.sound.beginCredits();h.env.mode='result';h.sound.stop();
  release({ok:true,arrayBuffer:async()=>Buffer.from('late')});await pending;assert.equal(h.started.length,0);assert.equal(h.sound.activeMusic.size,0);
 });
 await test('unavailable ending audio leaves credits usable without substituting another tune',async()=>{
  const h=fixture();h.env.mode='credits';h.env.fetch=async()=>({ok:false,status:404});await h.sound.beginCredits();
  assert.equal(h.started.length,0);assert.equal(h.env.mode,'credits');assert.equal(h.notices.length,1);
 });
 return{failed:results.filter(r=>r.status==='FAIL').length,results};
})();

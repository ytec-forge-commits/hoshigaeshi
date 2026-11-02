const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),results=[];
const target=path.join(__dirname,'../source/startup.js');
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
test('startup sequence exists independently of the game renderer',()=>assert(fs.existsSync(target)));
if(fs.existsSync(target)){
 const {Timeline,makeChime}=require(target);
 test('black precedes one logo cue, followed by a complete fade to black',()=>{
  const t=new Timeline();assert(t.start());assert.equal(t.frame.opacity,0);
  let cues=0,done=0,lit=false,faded=false;
  for(let i=0;i<250;i++){const f=t.step(1/60);if(f.cue)cues++;if(f.done)done++;if(f.opacity>.99)lit=true;if(lit&&f.opacity===0)faded=true;}
  assert.equal(cues,1);assert.equal(done,1);assert(lit&&faded);assert.equal(t.start(),false);
 });
 test('hidden time cannot advance the logo or its sound cue',()=>{
  const t=new Timeline();t.start();t.step(.05);const before=t.elapsed;
  for(let i=0;i<600;i++)assert.equal(t.step(.05,true).cue,false);
  assert.equal(t.elapsed,before);assert.equal(t.frame.opacity,0);
 });
 test('reduced motion keeps the logo still and preserves a readable hold',()=>{
  const t=new Timeline(true);t.start();let lit=0,cues=0;
  for(let i=0;i<180;i++){const f=t.step(1/60);assert.equal(f.scale,1);if(f.opacity>.99)lit++;if(f.cue)cues++;}
  assert(lit>=60);assert.equal(cues,1);assert.equal(t.active,false);
 });
 test('cancellation cannot emit a late cue or completion',()=>{
  const t=new Timeline();t.start();t.cancel();for(let i=0;i<300;i++){const f=t.step(.05);assert(!f.cue&&!f.done);}
 });
 test('original logo chime is finite, deterministic, bounded and fades to silence',()=>{
  const a=makeChime(48000),b=makeChime(48000);assert.deepEqual(a,b);assert.equal(a.length,96000);
  let peak=0,energy=0;for(const v of a){assert(Number.isFinite(v));peak=Math.max(peak,Math.abs(v));energy+=v*v;}
  assert(peak>.5&&peak<=.8);assert(energy/a.length>.0001);assert.equal(a[0],0);assert(Math.abs(a.at(-1))<.00001);
 });
}
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};
if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

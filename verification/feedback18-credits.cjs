const assert=require('node:assert/strict'),F=require('../source/feel.js'),C=require('../source/cinematic.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
// Catch an early result transition, or a farewell that scrolls off before it can be read.
test('only the farewell stays centred until the player chooses the result',()=>{
 const entering=F.creditsFrame(13,0,400,1200,false,200);
 assert.equal(entering.y,-848);assert.equal(entering.finaleOffset,0);assert.equal(entering.done,false);
 const held=F.creditsFrame(14.5,0,400,1200,false,200);
 assert.equal(held.y,-992);assert.equal(held.y+held.finaleOffset,-900);assert.equal(held.done,false);
 const late=F.creditsFrame(600,0,400,1200,false,200);
 assert.equal(late.y,-1200);assert.equal(late.y+late.finaleOffset,-900);assert.equal(late.done,false);assert.equal(late.remaining,Infinity);
 assert.deepEqual(F.creditsFrame(14.5,10,400,1200,true,200),held);
});
test('credits can resume from a reading position before the farewell',()=>{
 const t=F.creditsResumeTime(600,400),f=F.creditsFrame(t,0,400,1200,false,200);
 assert.equal(f.y,-600);assert.equal(f.done,false);
});
// Catch an unbounded emitter or decorative state that runs during reduced motion.
test('credits sky stays bounded and finite through a complete long roll',()=>{
 assert.equal(typeof C.creditsSkyFrame,'function','credits sky presentation is available');
 for(let t=0;t<=600;t+=.25){const f=C.creditsSkyFrame(t);assert(f.stars.length<=180);assert(f.dust.length<=40);assert(f.meteors.length<=3);for(const p of [...f.stars,...f.dust,...f.meteors]){assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert(p.opacity>=0&&p.opacity<=1);}}
});
test('falling stars appear intermittently and travel downward with a fading tail',()=>{
 assert.equal(typeof C.creditsSkyFrame,'function','credits sky presentation is available');
 const first=C.creditsSkyFrame(3),next=C.creditsSkyFrame(3.2),rest=C.creditsSkyFrame(8);
 assert(first.meteors.length>0);const a=first.meteors[0],b=next.meteors.find(m=>m.id===a.id);
 assert(b&&b.y>a.y);assert(a.tail>0);assert.equal(rest.meteors.length,0);
});
test('reduced credits sky is completely still without meteor or dust movement',()=>{
 assert.equal(typeof C.creditsSkyFrame,'function','credits sky presentation is available');
 const a=C.creditsSkyFrame(0,true),b=C.creditsSkyFrame(150,true);
 assert.deepEqual(a,b);assert.equal(a.meteors.length,0);assert(a.stars.length>0);
});
test('credits sky clock is deterministic and does not consume combat randomness',()=>{
 assert.equal(typeof C.creditsSkyFrame,'function','credits sky presentation is available');
 const old=Math.random;Math.random=()=>{throw Error('presentation consumed shared random state');};
 try{assert.deepEqual(C.creditsSkyFrame(33),C.creditsSkyFrame(33));assert.notDeepEqual(C.creditsSkyFrame(33),C.creditsSkyFrame(34));}finally{Math.random=old;}
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};
if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

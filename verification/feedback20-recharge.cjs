const assert=require('node:assert/strict'),C=require('../source/core.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
test('capture gauge charges thirty percent faster for all difficulties and empty catches',()=>{
 for(const difficulty of Object.keys(C.DIFF))for(const count of [0,12]){
  const g=new C.Game({difficulty,practice:true});g.field.count=count;g.release();const expected=(count?(difficulty==='nightmare'?5.2:4.6):1.35)/1.3;
  assert(Math.abs(g.field.cooldown-expected)<1e-9);assert.equal(C.captureCooldown(difficulty,!!count),expected);
  for(let i=0;i<Math.ceil(expected*60)+1;i++)g.step(1/60);assert.equal(g.field.phase,'ready');assert(g.requestCapture());
 }
});
test('recharge speed does not change capture duration or the four-second combo deadline',()=>{const g=new C.Game({difficulty:'normal'});g.waveAt=Infinity;g.requestCapture();assert.equal(g.field.remaining,.78);g.combo=3;g.lastKill=0;g.time=3.99;g.step(0);assert.equal(g.combo,3);g.time=4.01;g.step(0);assert.equal(g.combo,0);});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

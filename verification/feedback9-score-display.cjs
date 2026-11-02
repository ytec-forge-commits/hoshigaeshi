const assert=require('node:assert/strict'),C=require('../source/core.js'),F=require('../source/feel.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
function frame(...args){assert.equal(typeof F.scoreChainFrame,'function','score display must expose the actual chain state');return F.scoreChainFrame(...args);}
test('chain display covers first tier, each edge and the maximum without changing scoring',()=>{
 for(const [combo,multiplier,nextKills,nextMultiplier]of [[0,1,5,2],[4,1,1,2],[5,2,5,3],[9,2,1,3],[10,3,5,4],[14,3,1,4],[15,4,5,5],[19,4,1,5],[20,5,0,5],[25,5,0,5]]){
  const f=frame(combo,10,11);assert.deepEqual({combo:f.combo,multiplier:f.multiplier,nextKills:f.nextKills,nextMultiplier:f.nextMultiplier},{combo,multiplier,nextKills,nextMultiplier});assert.equal(f.remaining,combo?3:0);
 }
});
test('display matches real ordinary and returned kill scores across all multiplier boundaries',()=>{
 const g=new C.Game({seed:431});for(let n=1;n<=25;n++){g.time=n*.1;const before=g.score;g.kill({id:n,x:200,y:200,type:'ray',dead:false},n%2===0);const e=g.events.at(-1),f=frame(g.combo,g.lastKill,g.time);assert.equal(f.multiplier,e.multiplier);assert.equal(g.score-before,120*f.multiplier);assert.equal(f.combo,n);assert.equal(f.remaining,4);}
});
test('four-second deadline and damage show a reset instead of a stale multiplier',()=>{
 const g=new C.Game({seed:431});for(let n=1;n<=5;n++){g.time=n*.1;g.kill({id:n,x:200,y:200,type:'ray',dead:false},false);}let f=frame(g.combo,g.lastKill,g.time+3.9);assert.equal(f.multiplier,2);assert(f.remaining>0&&f.remaining<.11);f=frame(g.combo,g.lastKill,g.time+4);assert.equal(f.combo,0);assert.equal(f.multiplier,1);assert.equal(f.remaining,0);assert.equal(f.nextKills,5);g.hurt(200,200);f=frame(g.combo,g.lastKill,g.time);assert.equal(f.combo,0);assert.equal(f.remaining,0);
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

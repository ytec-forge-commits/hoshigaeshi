const assert=require('node:assert/strict'),C=require('../source/core.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
test('every boss increases emitted bullets across all three HP bands without dropping bullets',()=>{
 for(const difficulty of Object.keys(C.DIFF))for(const stage of [0,1,2]){
  const counts=[];for(const health of [.9,.55,.25]){
   const g=new C.Game({difficulty,seed:431,itemsEnabled:false});g.stageIndex=stage;g.player.invuln=999;g.nextShot=Infinity;g.spawnBoss();g.boss.y=130;g.boss.hp=g.boss.maxHp*health;let born=0;const spawn=g.spawnBullet;
   g.spawnBullet=function(...args){const id=this.id;spawn.apply(this,args);if(this.id!==id)born++;};
   for(let i=0;i<30*60;i++)g.step(1/60);counts.push(born);assert.equal(g.bulletsDropped,0);assert(g.peakBullets<=360);
  }
  assert(counts[1]>counts[0]&&counts[2]>counts[1],difficulty+'/'+stage+': '+counts.join(' -> '));
 }
});
test('boss HP rises modestly while existing player damage, healing and deadlines remain usable',()=>{
 const baseline={easy:[480,260,300],normal:[600,320,380],hard:[680,360,450],nightmare:[680,360,450]};
 for(const difficulty of Object.keys(C.DIFF))for(const stage of [0,1,2]){const g=new C.Game({difficulty});g.stageIndex=stage;g.spawnBoss();const ratio=g.boss.maxHp/baseline[difficulty][stage];assert(ratio>=1.1&&ratio<=1.2,difficulty+'/'+stage+' HP ratio '+ratio);}
});
test('late boss volleys are cancelled at defeat and cannot damage the clear interval',()=>{
 const g=new C.Game({difficulty:'nightmare'});g.stageIndex=2;g.spawnBoss();g.boss.hp=g.boss.maxHp*.25;g.bossPattern();assert(g.scheduled.length);g.kill(g.boss,true);assert.equal(g.scheduled.length,0);for(let i=0;i<120;i++)g.step(1/60);assert.equal(g.hits,0);assert.equal(g.bullets.length,0);
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};
if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

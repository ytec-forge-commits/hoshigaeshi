const assert=require('node:assert/strict'),C=require('../source/core.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
test('exactly lethal fractional damage on the deadline cannot leave an invisible positive HP residue',()=>{
 const g=new C.Game({difficulty:'nightmare',seed:431});g.stageIndex=2;g.completedStages=2;g.spawnBoss();
 // 1125 ordinary 0.4-damage hits total exactly 450; JS subtraction used to leave ~8e-12 HP.
 g.boss.hp=450;g.boss.maxHp=450;g.boss.y=130;g.player.invuln=999;g.nextShot=Infinity;g.nextBossAttack=Infinity;g.time=g.bossDeadline-1125/60;
 for(let i=0;i<1125;i++){const b=g.boss;assert(b);g.shots.push({id:++g.id,x:b.x,y:b.y,px:b.x,py:b.y,vx:0,vy:0,age:0,r:3,damage:.4,returned:false});g.step(1/60);}
 assert.equal(g.stagePhase,'clear');assert.equal(g.completedStages,3);assert(g.events.some(e=>e.type==='stageclear'&&e.stageIndex===2));
 for(let i=0;i<200;i++)g.step(1/60);assert.equal(g.state,'stage-clear');
});
test('all difficulties and bosses complete from shot, return or laser on their deadline',()=>{
 for(const difficulty of Object.keys(C.DIFF))for(const stage of [0,1,2])for(const kind of ['shot','return','laser']){
  const g=new C.Game({difficulty,seed:431});g.stageIndex=stage;g.completedStages=stage;g.spawnBoss();g.boss.y=130;g.boss.hp=kind==='laser'?2:.4;g.player.invuln=999;g.nextShot=Infinity;g.time=g.bossDeadline-1/60;g.nextBossAttack=Infinity;
  if(kind==='laser'){g.player.x=240;g.powerUntil=999;g.nextOptionLaser=0;}else g.shots.push({id:++g.id,x:g.boss.x,y:g.boss.y,px:g.boss.x,py:g.boss.y,vx:0,vy:0,age:0,r:7,damage:.4,returned:kind==='return',target:g.boss.id});
  g.step(1/60);assert.equal(g.stagePhase,'clear',difficulty+'/'+stage+'/'+kind);assert.equal(g.events.filter(e=>e.type==='stageclear').length,1);assert(!g.events.some(e=>e.type==='timeout'));
  if(stage===2){for(let i=0;i<200;i++)g.step(1/60);assert.equal(g.state,'stage-clear');}
 }
});
test('real remaining HP still produces a timeout, never a false clear',()=>{
 const g=new C.Game({difficulty:'nightmare'});g.stageIndex=2;g.completedStages=2;g.spawnBoss();g.boss.hp=.01;g.nextShot=Infinity;g.time=g.bossDeadline;g.step(1/60);assert.equal(g.state,'timeout');assert.equal(g.completedStages,2);
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};
if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

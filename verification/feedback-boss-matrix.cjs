// Diagnostic only: invulnerable stationary player, no player shooting.
// This is not a playthrough or evidence of human difficulty/fairness.
const C=require('../source/core.js'),assert=require('node:assert/strict');
const results=[];
for(const difficulty of ['easy','normal','hard'])for(const stageIndex of [0,1,2])for(const health of [.9,.55,.25]){
  const g=new C.Game({difficulty,seed:431});g.stageIndex=stageIndex;g.player.invuln=9999;g.nextShot=Infinity;g.spawnBoss();g.boss.y=130;g.boss.hp=g.boss.maxHp*health;
  for(let tick=0;tick<30*60;tick++){
    g.step(1/60);
    for(const b of g.bullets)assert.ok([b.x,b.y,b.vx,b.vy].every(Number.isFinite),'non-finite bullet');
  }
  assert.equal(g.bulletsDropped,0,'silent bullet cap');assert.ok(g.peakBullets<=360);assert.ok(g.bossAttack>=4,'boss stopped attacking');assert.equal(g.stagePhase,'boss');
  results.push({difficulty,stage:stageIndex+1,health,attacks:g.bossAttack,peak:g.peakBullets,dropped:g.bulletsDropped});
}
module.exports={status:'PASS',diagnostic:true,cases:results.length,results};
if(require.main===module)console.log(JSON.stringify(module.exports,null,2));

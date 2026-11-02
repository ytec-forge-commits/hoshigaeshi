const assert=require('node:assert/strict');
const C=require('../source/core.js');
const results=[];
for(const difficulty of ['easy','normal','hard']){
  const g=new C.Game({difficulty,seed:7});g.spawnBoss();g.boss.y=130;g.boss.hp=.1;g.nextShot=Infinity;g.player.hp=1;
  g.enemies=[{id:++g.id,type:'courier',x:240,y:594,baseX:240,age:0,hp:100,maxHp:100,r:16,fireAt:999,shots:0,offset:0,pattern:0,warning:0,beat:0,escort:true}];
  g.shots=[{id:++g.id,x:240,y:130,px:240,py:130,vx:0,vy:0,age:0,r:7,damage:1,returned:true,target:g.boss.id}];
  g.step(1/60);
  try{assert.equal(g.stagePhase,'clear');assert.equal(g.hits,0,'no escort collision after victory');assert.equal(g.player.hp,2);results.push('PASS '+difficulty);}catch(e){results.push('FAIL '+difficulty+': '+e.message);}
}
module.exports=results;
if(require.main===module){console.log(results.join('\n'));process.exitCode=results.some(x=>x.startsWith('FAIL'))?1:0;}

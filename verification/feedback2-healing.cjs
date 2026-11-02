const assert=require('node:assert/strict'),C=require('../source/core.js');
const cases=[
 ['easy',7,0],['easy',8,1],['easy',15,1],['easy',16,2],
 ['normal',11,0],['normal',12,1],['normal',23,1],['normal',24,2],
 ['hard',15,0],['hard',16,1],['hard',31,1],['hard',32,2]
];
const results=[];
for(const [difficulty,count,want] of cases){
 const g=new C.Game({difficulty,seed:431});g.player.hp=1;g.field.count=count;g.field.phase='orbit';g.release();
 try{assert.equal(g.player.hp,1+want);assert.equal(g.heals,want?1:0);assert.equal(g.returned,count);results.push({difficulty,count,want,status:'PASS'});}catch(e){results.push({difficulty,count,want,status:'FAIL',message:e.message});}
}
for(const difficulty of ['easy','normal','hard']){
 const large=new C.Game({difficulty,seed:431});large.player.hp=1;large.field.count=100;large.release();assert.equal(large.player.hp,3,'large catch heals at most two');assert.equal(large.heals,1,'heal count records events, not HP');assert.equal(large.shots.length,24,'projectile count stays capped');
 const g=new C.Game({difficulty,seed:431});g.player.hp=g.player.maxHp-1;g.field.count=100;g.release();assert.equal(g.player.hp,g.player.maxHp,'cannot overheal');
 g.player.hp=1;g.completeStage();assert.equal(g.player.hp,2,'stage clear heal unchanged');
}
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};
if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

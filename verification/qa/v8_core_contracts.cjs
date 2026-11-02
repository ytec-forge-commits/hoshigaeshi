const assert=require('node:assert/strict');const C=require('../../source/core.js');
{
 const s=new C.Game({seed:99});s.item={id:++s.id,x:s.player.x,y:s.player.y,type:'pierce',r:24,age:0};s.updateItem(1/60);
 assert(s.pierceUntil>s.time);s.step(1/60);assert(s.shots.every(x=>x.piercing));
 const shot=s.shots[0];s.enemies=[{id:++s.id,x:shot.x,y:shot.y-3,r:20,hp:5,type:'ray',age:1,baseX:shot.x,beat:0,fireAt:99,shots:0,offset:0,pattern:0},{id:++s.id,x:shot.x,y:shot.y-6,r:20,hp:5,type:'ray',age:1,baseX:shot.x,beat:0,fireAt:99,shots:0,offset:0,pattern:0}];s.step(1/60);assert.equal(s.enemies[0].hp,5-.5);assert.equal(s.enemies[1].hp,5-.5);
}
{
 const s=new C.Game({difficulty:'hard',seed:112});s.stageIndex=2;s.player.invuln=999;s.spawnBoss();s.boss.y=130;s.boss.hp=s.boss.maxHp*.6;s.bossAttack=1;s.eclipseBossPattern();assert(s.boss.reflectUntil>s.time);
 s.shots.push({id:++s.id,x:s.boss.x,y:s.boss.y,px:s.boss.x,py:s.boss.y,vx:0,vy:0,age:0,r:7,damage:3,returned:true,target:s.boss.id});
 const oldHp=s.boss.hp;s.step(1/60);assert.equal(s.boss.reflected,1);assert.equal(s.boss.hp,oldHp);
 for(let i=0;i<90;i++)s.step(1/60);assert(s.bullets.some(b=>b.style==='boss-return'));
}
{
 const s=new C.Game({seed:17});s.stageIndex=1;s.beat=2;s.waveAt=999;s.player.invuln=999;
 s.enemies=[{id:++s.id,type:'lancer',x:240,y:120,baseX:240,age:4,hp:10,maxHp:10,r:16,fireAt:3,shots:2,offset:0,pattern:0,warning:0,beat:2}];
 s.step(1/60);assert.equal(s.bullets.length,0,'lancer must not fire an untelegraphed third volley');
}
for(const stageIndex of [0,1,2]){
 const s=new C.Game({seed:23,difficulty:'hard'});s.stageIndex=stageIndex;s.player.invuln=9999;
 for(let i=0;i<80*60;i++)s.step(1/60);
 assert.equal(s.bulletsDropped,0,`stage ${stageIndex} silently hit bullet cap`);
 assert(s.peakBullets<=360);
}
console.log('v7 contracts: pierce, bounded boss counter, no silent bullet cap on seeded hard stages OK');

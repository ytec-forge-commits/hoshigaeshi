const assert=require('node:assert/strict'),api=require('../source/cinematic.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
test('the return road is fine luminous grains with a bounded drawing budget',()=>{
 const f=api.endingFrame(.5);assert(Array.isArray(f.dust),'fine dust is absent');
 assert(f.dust.length>200&&f.dust.length+f.stars.length<=768);
 for(const grain of [...f.dust,...f.stars]){assert(Number.isFinite(grain.radius)&&grain.radius>0&&grain.radius<=2.2,'a large icon replaced a fine grain');assert(grain.opacity>=0&&grain.opacity<=1);}
 const foreground=f.dust.filter(s=>s.y>400);assert(Math.max(...foreground.map(s=>s.x))-Math.min(...foreground.map(s=>s.x))>150,'the stream collapsed into a line');
});
test('swimming wings alternate smoothly while the ship recedes without abrupt jumps',()=>{
 const frames=Array.from({length:101},(_,i)=>api.endingFrame(i/100).ship);
 assert(frames.some(s=>s.wing>3)&&frames.some(s=>s.wing< -3),'wing stroke does not alternate');
 for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i];assert(Math.hypot(b.x-a.x,b.y-a.y)<15,'flight path jumps');assert(Math.abs(b.tilt)<=20);assert(Math.abs(b.wing-a.wing)<5,'wing stroke jumps');}
 assert(frames[80].scale<frames[20].scale&&frames[80].y<frames[20].y);
});
test('the cut-in arrives, holds, and leaves within the existing defeat interval',()=>{
 assert.equal(typeof api.defeatFrame,'function');const start=api.defeatFrame(0),hold=api.defeatFrame(.5),end=api.defeatFrame(1);
 assert.equal(start.opacity,0);assert(hold.opacity>.9&&Math.abs(hold.x)<1);assert.equal(end.opacity,0);
 for(let i=0;i<=100;i++){const f=api.defeatFrame(i/100);assert(Number.isFinite(f.x));assert(f.opacity>=0&&f.opacity<=1);assert(f.portraitScale>=1&&f.portraitScale<=1.2);}
});
test('reduced motion removes swimming, dust motion and cut-in sliding',()=>{
 assert.equal(typeof api.defeatFrame,'function');assert.deepEqual(api.defeatFrame(.15,true),api.defeatFrame(.85,true));
 assert.deepEqual(api.endingFrame(.1,true),api.endingFrame(.9,true));assert.equal(api.endingFrame(.5,true).ship.wing,0);
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};

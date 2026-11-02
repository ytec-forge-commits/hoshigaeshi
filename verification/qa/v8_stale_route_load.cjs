const assert=require('node:assert/strict');
const {RouteRenderer}=require('../../source/scenery.js');
const resident=new Set(['r0','r1']);
const callbacks={};
const scene={
  textures:{exists:key=>resident.has(key),remove:key=>resident.delete(key)},
  load:{on:(name,fn)=>{callbacks[name]=fn;},image(){},start(){}},
  add:{image(){throw Error('No sprite expected in this load test');}}
};
const parts=Array.from({length:6},(_,i)=>({key:'r'+i,path:i+'.webp',width:960,height:1440,overlapNext:i<5?120:0}));
const route=new RouteRenderer(scene,parts,x=>x);
route.pending.add('r4');
route.reset();
assert.deepEqual([...route.desired],['r0','r1']);
resident.add('r4');callbacks.filecomplete('r4');
assert.ok(!resident.has('r4'),'old route texture must be removed after retry');
assert.ok(!route.pending.has('r4'));
route.failedKey('r5');assert.equal(route.failed,false,'old route failure must not fail new run');
route.desired.add('r3');route.pending.add('r3');resident.add('r3');callbacks.filecomplete('r3');
assert.ok(resident.has('r3'),'current desired route must survive load completion');
route.failedKey('r1');assert.equal(route.failed,true,'current visible route failure must stop safely');
console.log('stale route completion/failure discarded after retry; wanted load retained');

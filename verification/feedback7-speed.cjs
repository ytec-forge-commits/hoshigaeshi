const assert=require('node:assert/strict'),C=require('../source/core.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
function move(input,ticks=6){const g=new C.Game({difficulty:'normal',seed:431,practice:true});g.player.x=240;g.player.y=400;for(let i=0;i<ticks;i++)g.step(1/60,input);return{x:g.player.x,y:g.player.y};}
test('mouse and touch target share keyboard and full-stick maximum speed',()=>{for(const input of [{dx:1},{dx:1,dy:0},{target:{x:440,y:400}}]){const p=move(input);assert(Math.abs(p.x-308)<1e-8);assert.equal(p.y,400);}});
test('diagonal target and diagonal axis have the same bounded total distance',()=>{for(const input of [{dx:1,dy:-1},{target:{x:440,y:200}}]){const p=move(input);assert(Math.abs(Math.hypot(p.x-240,p.y-400)-68)<1e-8);}});
test('close pointer target stops exactly and never overshoots',()=>{assert.deepEqual(move({target:{x:243,y:404}}),{x:243,y:404});assert.deepEqual(move({target:{x:240,y:400}}),{x:240,y:400});});
test('small analog axis keeps proportional slow movement and paused input stays still',()=>{assert(Math.abs(move({dx:.25}).x-257)<1e-8);const g=new C.Game({seed:431});const before={x:g.player.x,y:g.player.y};g.pause();g.step(1/60,{target:{x:0,y:0}});assert.deepEqual({x:g.player.x,y:g.player.y},before);});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

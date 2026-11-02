const assert=require('node:assert/strict'),{TouchDoubleTap}=require('../source/controls.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
const e=(x=100,y=100)=>({pointerType:'touch',isPrimary:true,pointerId:1,clientX:x,clientY:y});
test('a relaxed double tap with a longer finger contact still fires',()=>{const g=new TouchDoubleTap();g.down(e(),0);assert.equal(g.up(e(),300),false);g.down(e(),560);assert.equal(g.up(e(),800),true);});
test('natural finger drift and imperfect tap position still fire',()=>{const g=new TouchDoubleTap();g.down(e(),0);g.move(e(118));assert.equal(g.up(e(118),80),false);g.down(e(168),360);g.move(e(184));assert.equal(g.up(e(184),440),true);});
test('a deliberate drag remains excluded',()=>{const g=new TouchDoubleTap();g.down(e(),0);g.move(e(140));g.move(e());g.up(e(),80);g.down(e(),160);assert.equal(g.up(e(),240),false);});
test('single taps and a pause between gestures remain excluded',()=>{const g=new TouchDoubleTap();g.down(e(),0);assert.equal(g.up(e(),80),false);g.down(e(),800);assert.equal(g.up(e(),880),false);g.reset();g.down(e(),940);assert.equal(g.up(e(),1020),false);});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

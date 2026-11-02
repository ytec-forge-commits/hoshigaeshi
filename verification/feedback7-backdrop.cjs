const assert=require('node:assert/strict'),C=require('../source/controls.js'),results=[];
const rect={left:100,top:100,right:300,bottom:400};
const e=(x,y=20,extra={})=>({clientX:x,clientY:y,pointerId:1,button:0,...extra});
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
function gesture(){assert.equal(typeof C.BackdropGesture,'function');return new C.BackdropGesture();}
test('outside press and release may dismiss only once at the same outside click',()=>{const g=gesture();g.down(e(20),rect);g.up(e(20),rect);assert.equal(g.click(e(20),rect),true);assert.equal(g.click(e(20),rect),false);});
test('inside tap and inside-to-outside drag never dismiss',()=>{for(const end of [e(200,200),e(20)]){const g=gesture();g.down(e(200,200),rect);g.up(end,rect);assert.equal(g.click(end,rect),false);}});
test('outside-to-inside gesture and large movement returning outside never dismiss',()=>{const g=gesture();g.down(e(20),rect);g.up(e(200,200),rect);assert.equal(g.click(e(200,200),rect),false);g.down(e(20),rect);g.move(e(50));g.up(e(20),rect);assert.equal(g.click(e(20),rect),false);});
test('scroll/cancel and mismatched pointer/right-button never dismiss',()=>{for(const type of ['cancel','other','right']){const g=gesture();g.down(e(20,20,{button:type==='right'?2:0}),rect);if(type==='cancel')g.reset();g.up(e(20,20,{pointerId:type==='other'?2:1}),rect);assert.equal(g.click(e(20),rect),false);}});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

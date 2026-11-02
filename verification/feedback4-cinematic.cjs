const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),results=[];
const modulePath=path.join(__dirname,'../source/cinematic.js');
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
test('cinematic controller is available independently of game simulation',()=>{assert(fs.existsSync(modulePath),'cinematic controller is not implemented');});
if(fs.existsSync(modulePath)){
 const {Timeline}=require(modulePath);
 test('intro runs only once in a document and completes exactly once',()=>{const c=new Timeline();assert(c.start('intro'));let done;for(let i=0;i<481;i++)done=c.step(1/60)||done;assert.equal(done.kind,'intro');assert.equal(c.skip(),null);assert.equal(c.step(1),null);assert.equal(c.start('intro'),false);});
 test('hidden or held timeline stops and skip is idempotent',()=>{const c=new Timeline();c.start('ending');c.step(.05);const t=c.elapsed;for(let i=0;i<100;i++)c.step(.05,true);assert.equal(c.elapsed,t);assert.equal(c.skip().kind,'ending');assert.equal(c.skip(),null);});
 test('reduced motion is brief and cancel cannot trigger a stale completion',()=>{const c=new Timeline();c.start('ending',true);let done;for(let i=0;i<61;i++)done=c.step(1/60)||done;assert.equal(done.kind,'ending');c.start('ending');c.cancel();assert.equal(c.step(10),null);assert.equal(c.skip(),null);});
 test('enabling reduced motion mid-movie immediately uses a brief static ending',()=>{const c=new Timeline();c.start('ending');for(let i=0;i<80;i++)c.step(.05);assert.equal(typeof c.setReduced,'function');c.setReduced(true);assert.equal(c.progress,.82);let done;for(let i=0;i<61;i++)done=c.step(1/60)||done;assert.equal(done.kind,'ending');});
}
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};

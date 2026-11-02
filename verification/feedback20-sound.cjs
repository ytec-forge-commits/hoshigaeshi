const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
const target=path.join(__dirname,'../source/sound-design.js');
test('distinct bounded effects are available without any downloaded audio',()=>{
 assert(fs.existsSync(target),'sound synthesis module missing');const S=require(target),signatures=[];
 for(const key of ['option-laser','boss-beam','shield-break','pickup-extend','pickup-guard']){
  const a=S.synthesize(key,48000),b=S.synthesize(key,48000);assert.deepEqual(a,b);assert(a.length>=4800&&a.length<=48000);let energy=0,peak=0;
  for(const v of a){assert(Number.isFinite(v));energy+=v*v;peak=Math.max(peak,Math.abs(v));}assert(peak<=.71&&peak>.3);assert(energy/a.length>.001);assert.equal(a[0],0);assert(Math.abs(a.at(-1))<.0001);signatures.push(a.length+':'+a[1000]);
 }assert.equal(new Set(signatures).size,5);
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

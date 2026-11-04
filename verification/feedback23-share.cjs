const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),results=[];
module.exports=(async()=>{async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
const file=path.join(__dirname,'../source/result-share.js');
await test('result sharing is available',()=>assert(fs.existsSync(file),'result sharing is not implemented'));
if(fs.existsSync(file)){
 const S=require(file),payload={title:'STAR REBOUND',text:'3 stages cleared | SCORE 12,345'},image={name:'result.png'};
 await test('native share receives prepared image and score synchronously before activation expires',async()=>{let sent;const pending=S.send({...payload,file:image},{canShare:d=>d.files[0]===image,share:d=>{sent=d;return Promise.resolve();}});assert.deepEqual(sent,{...payload,files:[image]});assert.equal(await pending,'shared');});
 await test('unsupported files still share the score text',async()=>{let sent;assert.equal(await S.send({...payload,file:image},{canShare:()=>false,share:d=>{sent=d;return Promise.resolve();}}),'shared');assert.deepEqual(sent,payload);});
 await test('native cancellation never writes the clipboard or starts another share',async()=>{let copied=false;assert.equal(await S.send(payload,{share:()=>Promise.reject({name:'AbortError'}),clipboard:{writeText(){copied=true;}}}),'canceled');assert.equal(copied,false);});
 await test('native failure leaves a manual copy option without extra clipboard side effects',async()=>{let copied=false;assert.equal(await S.send(payload,{share:()=>Promise.reject({name:'NotAllowedError'}),clipboard:{writeText(){copied=true;}}}),'manual');assert.equal(copied,false);});
 await test('without native share only the caption is copied',async()=>{let copied;assert.equal(await S.send(payload,{clipboard:{writeText:text=>{copied=text;return Promise.resolve();}}}),'copied');assert.equal(copied,payload.text);});
 await test('clipboard denial and absent APIs preserve a manual copy route',async()=>{assert.equal(await S.send(payload,{clipboard:{writeText:()=>Promise.reject(Error('denied'))}}),'manual');assert.equal(await S.send(payload,{}),'manual');});
 await test('canShare failure falls back to text within the original click',async()=>{let sent;assert.equal(await S.send({...payload,file:image},{canShare(){throw Error('unavailable');},share:d=>{sent=d;return Promise.resolve();}}),'shared');assert.deepEqual(sent,payload);});
}
const report={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(report,null,2));process.exitCode=report.failed?1:0;}return report;})();

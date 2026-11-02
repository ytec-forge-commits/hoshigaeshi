const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),C=require('../source/core.js'),Controls=require('../source/controls.js'),results=[];
const source=fs.readFileSync(require('node:path').join(__dirname,'../source/app.js'),'utf8');
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
function fixture({touch=false,transit=false}={}){
 const nodes={},events={},doc={hidden:false,hasFocus:()=>true,querySelector:()=>null,pointerLockElement:null,addEventListener:(k,f)=>events[k]=f,exitPointerLock(){this.pointerLockElement=null;events.pointerlockchange();}};
 let requests=0;const arena={focus(){},requestPointerLock(){requests++;}},game=new C.Game();game.pause();
 const env={resumeLabel:()=> '続ける',mode:'paused',sim:game,audioGate:null,document:doc,stageDefeat:null,stageTransit:transit?{}:null,cinematicHeld:true,acc:2,readyAudioAction:null,settings:{controlMode:'mouse'},needsMouseLock:()=>!touch,$:id=>id==='arena'?arena:nodes[id]||(nodes[id]={disabled:false,focus(){}}),clearInput(){env.target=null;},sound:{music:true,pause(){},resume(){},begin(){}},screen(){},paintCinematic(){},announce(){},target:{x:400,y:400}};
 env.mouseLock=new Controls.PointerLockInput(doc,arena,{locked(){env.resume();}});vm.createContext(env);vm.runInContext(source.slice(source.indexOf(' function pause('),source.indexOf(' function home(')),env);
 return{env,game,nodes,requests:()=>requests,lock(){doc.pointerLockElement=arena;events.pointerlockchange();}};
}
test('resume without a click cannot advance a mouse game or request a lock',()=>{const h=fixture();h.env.resume();assert.equal(h.env.mode,'paused');assert.equal(h.game.state,'paused');assert.equal(h.requests(),0);});
test('clicked resume waits for ownership and consumes no simulation time before success',()=>{const h=fixture();h.env.resume(true);assert.equal(h.requests(),1);assert.equal(h.env.mode,'paused');h.game.step(1/60,{dx:1});assert.equal(h.game.time,0);h.lock();assert.equal(h.env.mode,'playing');assert.equal(h.game.state,'playing');assert.equal(h.env.target,null);});
test('pause releases ownership and clears the relative target',()=>{const h=fixture();h.env.mouseLock.request();h.lock();h.env.target={x:400,y:400};h.env.pause();assert.equal(h.env.document.pointerLockElement,null);assert.equal(h.env.mouseLock.locked,false);assert.equal(h.env.target,null);assert.equal(h.game.state,'paused');});
test('touch can resume with mouse selected without attempting Pointer Lock',()=>{const h=fixture({touch:true});h.env.resume(true);assert.equal(h.env.mode,'playing');assert.equal(h.requests(),0);});
test('paused stage transit also waits for ownership and resumes its own phase',()=>{const h=fixture({transit:true});h.env.resume(true);assert.equal(h.env.mode,'paused');h.lock();assert.equal(h.env.mode,'transit');assert.equal(h.env.cinematicHeld,false);assert.equal(h.game.state,'playing');});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

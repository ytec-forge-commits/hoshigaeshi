const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {GamepadInput}=require('../source/controls.js'),results=[];
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
const pad=(axes=[0,0],pressed=[])=>({index:0,id:'Synthetic',connected:true,mapping:'standard',axes,buttons:Array.from({length:17},(_,i)=>({pressed:pressed.includes(i)}))});
const frame=(axes,pressed=[],sensitivity=70)=>{const c=new GamepadInput();c.poll([pad()],true,sensitivity);return c.poll([pad(axes,pressed)],true,sensitivity);};
test('stick sensitivity scales movement but preserves menu navigation',()=>{
 for(const sensitivity of [30,70,100]){const full=frame([1,0],[],sensitivity),half=frame([.61,0],[],sensitivity),diagonal=frame([1,1],[],sensitivity);assert(Math.abs(full.dx-sensitivity/100)<1e-9);assert(Math.abs(half.dx-sensitivity/200)<1e-9);assert(Math.abs(Math.hypot(diagonal.dx,diagonal.dy)-sensitivity/100)<1e-9);assert.equal(full.navX,1);assert.equal(half.navX,1);assert.equal(diagonal.navY,1);}
});
test('D-pad, capture and pause are unaffected at minimum sensitivity',()=>{const r=frame([.9,.9],[0,9,14],30);assert.equal(r.dx,-1);assert.equal(r.dy,0);assert.equal(r.primary,true);assert.equal(r.pause,true);assert.equal(r.navX,-1);});
test('low sensitivity keeps drift deadzone and release-to-arm protection',()=>{const c=new GamepadInput();assert.equal(c.poll([pad([1,0])],true,30).dx,0);assert.equal(c.poll([pad([1,0])],true,30).dx,0);c.poll([pad()],true,30);assert.equal(c.poll([pad([.1,.1])],true,30).dx,0);assert.equal(c.poll([pad([1,0])],true,30).dx,.3);assert.equal(c.poll([pad([1,0])],false,30).dx,0);assert.equal(c.poll([pad([1,0])],true,30).dx,0);});
test('old and invalid settings keep records with a bounded sensitivity',()=>{
 const source=fs.readFileSync(require.resolve('../source/app.js'),'utf8');
 for(const [value,want]of [[undefined,70],[30,30],[70,70],[100,100],[32,30],[33,35],[-1,30],[999,100],['40',70],[null,70],[{},70]]){
  const fixture={schemaVersion:1,settings:{controlMode:'gamepad',difficulty:'hard',stickSensitivity:value},previewBests:{easy:125,normal:250,hard:500,nightmare:1000},previewRuns:15,previewClears:4};let written;
  const element={textContent:'',classList:{add(){},remove(){},toggle(){}}},env={window:{StarLocale:require('../source/i18n.js'),StarCore:require('../source/core.js')},matchMedia:()=>({matches:false}),document:{getElementById:()=>element,body:element},localStorage:{getItem:()=>JSON.stringify(fixture),setItem(key,text){assert.equal(key,'tenchan.hoshigaeshi.v8-dev');written=JSON.parse(text);}}};vm.createContext(env);vm.runInContext(source.slice(0,source.indexOf(' function updateRecords()'))+'persist();})();',env);
  assert.equal(written.settings.stickSensitivity,want);assert.equal(written.schemaVersion,1);assert.deepEqual(written.previewBests,fixture.previewBests);assert.equal(written.previewRuns,15);assert.equal(written.previewClears,4);
 }
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

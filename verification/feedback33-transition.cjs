const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const C=require('../source/core.js'),{Timeline}=require('../source/cinematic.js');
const source=fs.readFileSync(require('node:path').join(__dirname,'../source/app.js'),'utf8'),results=[];
function method(name){const start=source.indexOf('function '+name+'('),body=source.indexOf('{',start);let depth=0;for(let i=body;i<source.length;i++){if(source[i]==='{')depth++;if(source[i]==='}'&&!--depth)return source.slice(start,i+1);}throw Error(name);}
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
function fixture(stage=0){
 const game=new C.Game({difficulty:'nightmare',seed:33});game.stageIndex=stage;game.time=100;game.stageTime=100;game.player.hp=1;game.completeStage();game.events=[];
 const clock=new Timeline();clock.start('transit');const elements=new Map();let audio=0,view='cinematic';
 const env={sim:game,session:4,stageTransit:{game,session:4,stageIndex:stage,acc:0},mode:'transit',cinematic:clock,cinematicHeld:false,acc:0,
  document:{hidden:false,querySelector:()=>null,body:{classList:{remove(){}}}},paintCinematic(){},clearInput(){},screen(name){view=name;},
  $(id){if(!elements.has(id))elements.set(id,{disabled:false,focus(){}});return elements.get(id);},
  fieldTrackFor:()=>'',cueGate(key,after){after();},sound:{transitionToStage(){audio++;}},scene:{handleEvents(){}}};
 vm.createContext(env);vm.runInContext(method('tickStageTransit')+'\n'+method('endStageTransit'),env);
 return{env,game,clock,audio:()=>audio,view:()=>view};
}
test('waiting for next scenery freezes simulation after exactly one stage advance',()=>{
 for(const stage of [0,1]){const h=fixture(stage);for(let i=0;i<240;i++)h.env.tickStageTransit(1/60);
  assert.equal(h.game.stageIndex,stage+1);assert.equal(h.game.stageTime,0);assert.equal(h.game.heals,1);assert.equal(h.game.player.hp,2);
  const time=h.game.time;for(let i=0;i<300;i++)h.env.tickStageTransit(.05);assert.equal(h.game.time,time);assert.equal(h.env.mode,'transit');assert.equal(h.view(),'cinematic');
 }
});
test('arrival releases cover and starts stage audio only once',()=>{const h=fixture();for(let i=0;i<200;i++)h.env.tickStageTransit(1/60);assert.equal(h.audio(),0);h.env.endStageTransit(1);assert.equal(h.env.mode,'playing');assert.equal(h.view(),null);assert.equal(h.audio(),1);h.env.endStageTransit(1);assert.equal(h.audio(),1);});
test('a ready background cannot resume a paused or superseded journey',()=>{
 for(const hold of ['paused','session','game']){const h=fixture();for(let i=0;i<200;i++)h.env.tickStageTransit(1/60);
  if(hold==='paused')h.env.mode='paused';if(hold==='session')h.env.session++;if(hold==='game')h.env.sim=new C.Game({seed:12});
  h.env.endStageTransit(1);assert.equal(h.view(),'cinematic');assert.equal(h.audio(),0);assert(h.env.stageTransit);
 }
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};

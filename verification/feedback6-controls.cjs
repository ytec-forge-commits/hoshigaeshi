const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'../source/controls.js'),results=[];
let C=fs.existsSync(file)?require(file):{};
function test(name,fn){try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}}
function pad(index=0,pressed=[],axes=[0,0],mapping='standard'){return {index,id:'Synthetic '+index,connected:true,mapping,axes,buttons:Array.from({length:17},(_,i)=>({pressed:pressed.includes(i),value:pressed.includes(i)?1:0,touched:pressed.includes(i)})),timestamp:0};}
function fresh(){assert.equal(typeof C.GamepadInput,'function');return new C.GamepadInput();}
test('deadzone suppresses drift; stick and dpad produce bounded movement',()=>{const c=fresh();c.poll([pad()],true);let r=c.poll([pad(0,[],[.1,-.1])],true);assert.equal(r.dx,0);assert.equal(r.dy,0);r=c.poll([pad(0,[],[1,-1])],true);assert(Math.abs(Math.hypot(r.dx,r.dy)-1)<1e-8);r=c.poll([pad(0,[14])],true);assert.equal(r.dx,-1);assert.equal(r.dy,0);});
test('held buttons on connect and reset need neutral before new action',()=>{const c=fresh();assert.equal(c.poll([pad(0,[0])],true).primary,false);c.poll([pad()],true);assert.equal(c.poll([pad(0,[0])],true).primary,true);assert.equal(c.poll([pad(0,[0])],true).primary,false);c.reset();assert.equal(c.poll([pad(0,[0])],true).primary,false);c.poll([pad()],true);assert.equal(c.poll([pad(0,[9])],true).pause,true);});
test('inactive screen discards movement and edges until neutral',()=>{const c=fresh();c.poll([pad()],true);let r=c.poll([pad(0,[0],[1,0])],false);assert.equal(r.dx,0);assert.equal(r.primary,false);r=c.poll([pad(0,[0],[1,0])],true);assert.equal(r.dx,0);assert.equal(r.primary,false);c.poll([pad()],true);assert.equal(c.poll([pad(0,[0])],true).primary,true);});
test('owner stays fixed; disconnect reports loss before another pad can act',()=>{const c=fresh();c.poll([pad(1)],true);assert.equal(c.poll([pad(0,[0]),pad(1)],true).primary,false);let r=c.poll([pad(0,[0])],true);assert.equal(r.lost,true);assert.equal(r.primary,false);assert.equal(c.poll([pad(0,[0])],true).primary,false);c.poll([pad(0)],true);assert.equal(c.poll([pad(0,[0])],true).primary,true);});
test('unsupported mapping and unavailable API give neutral status',()=>{const c=fresh();assert.equal(c.poll([pad(0,[0],[1,0],'')],true).status,'unsupported');assert.equal(c.poll(null,true).status,'unavailable');assert.equal(c.poll([],true).status,'disconnected');});
// The old absolute-coordinate mouse contract is replaced by feedback9-mouse-lock.cjs.
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};
if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

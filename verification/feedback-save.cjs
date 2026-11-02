const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../source/app.js'),'utf8');
// Execute the real load/persist path with a synthetic, isolated storage boundary.
const fixture={settings:{muted:true,musicVolume:17,sfxVolume:83,reduced:true,difficulty:'hard'},previewBests:{easy:123,normal:456,hard:789},previewRuns:12,previewClears:3};
const keys=[],writes=[];
const element={textContent:'',classList:{add(){},remove(){},toggle(){}}};
const env={window:{StarLocale:require('../source/i18n.js'),StarCore:require('../source/core.js')},matchMedia:()=>({matches:false}),document:{getElementById:()=>element,body:element},localStorage:{getItem(key){keys.push(key);return JSON.stringify(fixture);},setItem(key,value){writes.push([key,JSON.parse(value)]);}}};
vm.createContext(env);
const prefix=source.slice(0,source.indexOf(' function updateRecords()'));
vm.runInContext(prefix+'persist();})();',env);
assert.deepEqual(keys,['tenchan.hoshigaeshi.v8-dev']);
assert.equal(writes.length,1);assert.equal(writes[0][0],'tenchan.hoshigaeshi.v8-dev');assert.deepEqual(writes[0][1],{...fixture,settings:{...fixture.settings,controlMode:'keyboard',captureSide:'left',language:'ja'},schemaVersion:1,previewBests:{...fixture.previewBests,nightmare:0}});
module.exports='PASS existing synthetic v8 save round trip: all records/settings retained';
if(require.main===module)console.log(module.exports);

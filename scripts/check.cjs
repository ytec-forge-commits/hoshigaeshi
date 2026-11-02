const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),suites=require('../verification/suites.json');
(async()=>{
 let contracts=0;
 for(const name of suites){
  const result=await require(path.join(root,'verification',name));
  if(result?.failed)throw Error(name+': '+JSON.stringify(result.results.filter(r=>r.status==='FAIL')));
  contracts+=result?.results?.length||0;
 }
 for(const name of fs.readdirSync(path.join(root,'source')).filter(n=>n.endsWith('.js'))){
  const r=cp.spawnSync(process.execPath,['--check',path.join(root,'source',name)],{encoding:'utf8'});
  if(r.status!==0)throw Error(name+': '+r.stderr);
 }
 let hashes=0;
 for(const line of fs.readFileSync(path.join(root,'source/SHA256SUMS.txt'),'utf8').trim().split(/\r?\n/)){
  const match=/^([a-f0-9]{64})  (.+)$/.exec(line);
  if(!match)throw Error('Invalid manifest row');
  const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'source',match[2]))).digest('hex');
  if(actual!==match[1])throw Error('Hash mismatch: '+match[2]);
  hashes++;
 }
 console.log('PASS: '+suites.length+' suites, '+contracts+' named contracts, JavaScript syntax and '+hashes+' asset hashes');
})().catch(e=>{console.error(e.message);process.exitCode=1;});

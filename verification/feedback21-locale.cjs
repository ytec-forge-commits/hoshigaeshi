const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),L=require('../source/i18n.js'),C=require('../source/core.js'),results=[];
const test=(name,fn)=>{try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}};
test('brand copy, blessing and dynamic messages have complete English',()=>{
 assert.equal(L.text('アイデアを、動くものへ。','en'),'Turning ideas into working creations.');
 assert.equal(L.text('あなたの旅路に、星の祝福を','en'),'May the stars light your way.');
 assert.equal(L.text('星の光で、ライフが2回復','en'),'Starlight restored 2 life');
 assert.equal(L.text('第2ステージ・鏡潮の分岐 · 残敵3体 · 残り12秒','en'),'Stage 2 · Mirror Tides · 3 enemies · 12s left');
 for(const suffix of ['秒','機','発','回'])assert.equal(L.text('未記録'+suffix,'en'),'Not recorded');
});
test('Japanese and untrusted plain text are not reinterpreted as HTML',()=>{
 assert.equal(L.text('星返し / STAR REBOUND','ja'),'星返し / STAR REBOUND');
 assert.equal(L.text('<img src=x onerror=alert(1)>','en'),'<img src=x onerror=alert(1)>');
});
test('all authored server errors render in English after UI punctuation normalization',()=>{
 const source=['Leaderboard.php','bootstrap.php'].map(n=>fs.readFileSync(path.join(__dirname,'../server',n),'utf8')).join('\n');let count=0;
 for(const [,raw]of source.matchAll(/'([^'\n]*[ぁ-んァ-ヶ一-龠][^'\n]*)'/g)){const normalized=raw.replace(/。/g,'\n').trim();assert(!/[ぁ-んァ-ヶ一-龠]/.test(L.text(normalized,'en')),normalized);count++;}
 assert(count>25);
});
test('all stage and item names translate and language choices are bounded',()=>{
 for(const s of C.STAGES)assert(!/[ぁ-んァ-ヶ一-龠]/.test(L.text(s.name,'en')));
 assert.equal(L.setLanguage('en'),'en');assert.equal(L.setLanguage('bogus'),'ja');
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

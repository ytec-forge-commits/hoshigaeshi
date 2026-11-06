const assert=require('node:assert/strict'),L=require('../source/i18n.js'),results=[];
const test=(name,fn)=>{try{fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',message:e.message});}};
test('mouse departure explanation remains English after display line breaks',()=>{
 const reason='マウスを固定すると出発します\nカーソルは隠れ、盤面の外へ抜けずに動けます\nEscで固定を解除します';
 const shown=L.text(reason,'en');assert(!/[ぁ-んァ-ヶ一-龠]/.test(shown),shown);assert(/lock/i.test(shown)&&shown.includes('Esc'));assert.equal(L.text(reason,'ja'),reason);
});
test('multiline pause guidance and control status retain complete English',()=>{
 for(const raw of ['下のボタンをクリックしてマウスを固定してください\nEscで固定を解除できます','マウスの固定を待っています\n許可されるまでゲームは進みません','設定のあいだ、星の時間を止めています','ゲームパッド未接続\n接続後、パッドのボタンを一度押してください\n\nタッチで遊ぶ場合は、操作方法を\nタッチに変更してください'])assert(!/[ぁ-んァ-ヶ一-龠]/.test(L.text(raw,'en')),L.text(raw,'en'));
});
module.exports={failed:results.filter(r=>r.status==='FAIL').length,results};if(require.main===module){console.log(JSON.stringify(module.exports,null,2));process.exitCode=module.exports.failed?1:0;}

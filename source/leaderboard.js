/* Star Rebound optional same-origin ranking. Apache-2.0. */
(()=>{'use strict';
const RULESET='feedback4-20261031';
function normalizeName(value){const name=String(value).replace(/\p{Z}+/gu,' ').trim();if(/[\p{C}<>]/u.test(name)||[...name].length<1||[...name].length>12)throw Error('名前は改行や < > を含めず、1〜12文字で入力してください');return name;}
function transport(endpoint){return async(action,payload)=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);try{const url=new URL(endpoint,window.location.href);url.searchParams.set('action',action);if(action==='top')url.searchParams.set('difficulty',payload.difficulty);const response=await fetch(url,{method:action==='top'?'GET':'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,...(action==='top'?{}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})});let data;try{data=await response.json();}catch(e){throw Error('ランキングは現在利用できません\nゲームはそのまま遊べます');}if(!response.ok){const error=Error(data.message||'通信に失敗しました\n少し待って再送してください');error.code=data.error;error.status=response.status;throw error;}return data;}catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw Error('接続できませんでした\n通信を確認して再送してください');throw e;}finally{clearTimeout(timer);}};}
class Client{
 constructor({endpoint='api/index.php',request}={}){this.request=request||transport(endpoint);this.version=0;this.run=null;this.result=null;this.payload=null;}
 cancel(){this.version++;this.run=null;this.result=null;this.payload=null;}
 async start(difficulty){this.cancel();const version=this.version;const run=await this.request('start',{difficulty,ruleset:RULESET});if(version!==this.version)return null;if(run.ruleset!==RULESET||run.difficulty!==difficulty||!Number.isInteger(run.seed)||run.seed<1||run.seed>2147483647||!/^[a-f0-9]{32}$/.test(run.runId)||!/^[a-f0-9]{64}$/.test(run.nonce))throw Error('ランキング情報を確認できません\n新しいプレイでお試しください');this.run=Object.freeze({...run});return this.run;}
 setResult(result){this.result=Object.freeze({...result,...(result.scoreBreakdown?{scoreBreakdown:Object.freeze({...result.scoreBreakdown})}:{})});this.payload=null;}
 async submit(name){if(!this.run||!this.result)throw Error('このプレイはランキングの対象外です');if(!this.payload){const normalized=normalizeName(name),p={runId:this.run.runId,nonce:this.run.nonce,difficulty:this.run.difficulty,ruleset:RULESET,seed:this.run.seed,name:normalized};for(const k of ['score','time','result','stageIndex','completedStages','hp','kills','returned','bestCombo','hits','captureUses'])p[k]=this.result[k];p.time=Math.round(p.time*10)/10;if(this.run.detailsVersion===1&&this.result.scoreBreakdown)p.details=Object.freeze({version:1,heals:this.result.heals,scoreBreakdown:Object.freeze({...this.result.scoreBreakdown})});this.payload=Object.freeze(p);}return this.request('finish',this.payload);}
 top(difficulty){return this.request('top',{difficulty});}
}
window.StarLeaderboard={Client,normalizeName,RULESET};
})();

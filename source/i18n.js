/* STAR REBOUND local-only presentation translation. No network or gameplay mutation. Apache-2.0. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./i18n-en.js'));else root.StarLocale=factory(root.StarEnglish);})(typeof globalThis!=='undefined'?globalThis:this,function(copy){
'use strict';
let language='ja',documentRoot=null,observer=null;
// Pause panels turn authored full-width separators into line breaks before
// inserting text. Keep those display variants translatable without changing
// Japanese copy or treating arbitrary whitespace as interchangeable.
const displayCopy={...Object.fromEntries(Object.entries(copy).filter(([ja])=>ja.includes('　')).map(([ja,en])=>[ja.replace(/　/g,'\n'),en])),...copy};
const japanese=/[ぁ-んァ-ヶ一-龠]/,cache=new Map(),originals=new WeakMap(),attributes=new WeakMap();
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const templates=Object.entries(displayCopy).filter(([s])=>s.includes('${')).sort((a,b)=>b[0].replace(/\$\{[^}]+\}/g,'').length-a[0].replace(/\$\{[^}]+\}/g,'').length).map(([ja,en])=>({pattern:new RegExp('^'+ja.split(/\$\{[^}]+\}/g).map(escape).join('([\\s\\S]*?)')+'$'),en}));
const fragments=Object.entries(displayCopy).filter(([ja])=>!ja.includes('${')&&ja.trim().length>1).sort((a,b)=>b[0].length-a[0].length);
function text(value,locale=language,depth=0){
 const raw=String(value??'');if(locale!=='en'||!japanese.test(raw)||depth>5)return raw;
 const s=raw.replace(/\r\n?/g,'\n');if(cache.has(s))return cache.get(s);
 let result=displayCopy[s];
 if(result===undefined){
  for(const {pattern,en}of templates){const m=pattern.exec(s);if(m){result=en.replace(/\{(\d+)\}/g,(_,i)=>text(m[Number(i)+1],'en',depth+1));break;}}
 }
 if(result===undefined){
  const trim=s.trim();if(displayCopy[trim]!==undefined)result=s.slice(0,s.indexOf(trim))+displayCopy[trim]+s.slice(s.indexOf(trim)+trim.length);
 }
 if(result===undefined){
  result=s;
  for(const [ja,en]of fragments)if(result.includes(ja))result=result.split(ja).join(en);
  result=result.replace(/第(\d+)ステージ/g,'Stage $1').replace(/第(\d+)面/g,'Stage $1').replace(/([\d,.]+)秒/g,'$1s').replace(/([\d,.]+)機/g,'$1 enemies').replace(/([\d,.]+)発/g,'$1 bullets').replace(/([\d,.]+)個/g,'$1').replace(/([\d,.]+)回/g,'$1 times');
 }
 if(cache.size>=2048)cache.delete(cache.keys().next().value);cache.set(s,result);return result;
}
const ignored=node=>node.parentElement?.closest('script,style,noscript,#qa-report,#qa-controls,[data-i18n-ignore]');
function translateText(node){
 if(ignored(node))return;
 let record=originals.get(node);if(!record||node.nodeValue!==record.shown)record={source:node.nodeValue,shown:node.nodeValue};
 const shown=language==='en'&&record.source.trim()==='星返し'&&node.parentElement?.hasAttribute('data-game-title')?'STAR REBOUND':text(record.source);record.shown=shown;originals.set(node,record);if(node.nodeValue!==shown)node.nodeValue=shown;
}
function translateAttributes(el){
 if(el.closest?.('[data-i18n-ignore],script,style'))return;
 let records=attributes.get(el);if(!records){records={};attributes.set(el,records);}
 for(const name of ['aria-label','title','alt','placeholder']){
  if(!el.hasAttribute?.(name))continue;const current=el.getAttribute(name);let record=records[name];if(!record||current!==record.shown)record={source:current,shown:current};record.shown=text(record.source);records[name]=record;if(current!==record.shown)el.setAttribute(name,record.shown);
 }
}
function sync(root=documentRoot){
 if(!root)return;if(root.nodeType===3){translateText(root);return;}if(root.nodeType===1)translateAttributes(root);
 const doc=root.ownerDocument||root,walker=doc.createTreeWalker(root,5);let node;while((node=walker.nextNode())){if(node.nodeType===3)translateText(node);else translateAttributes(node);}
}
function setLanguage(value){
 language=value==='en'?'en':'ja';if(documentRoot){documentRoot.documentElement.lang=language;sync();
 for(const link of documentRoot.querySelectorAll('[data-locale-doc]'))link.href=link.dataset.localeDoc+(language==='en'?'.en':'')+'.md';
 }return language;
}
function bind(doc,locale='ja'){
 observer?.disconnect();documentRoot=doc;setLanguage(locale);
 observer=new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')translateText(record.target);else if(record.type==='attributes')translateAttributes(record.target);else for(const node of record.addedNodes)sync(node);}});
 observer.observe(doc.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt','placeholder']});
}
return{get language(){return language;},text,setLanguage,bind,sync};
});

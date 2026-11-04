(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarResultShare=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
 'use strict';
 async function send({title,text,file},nav){
  const data={title,text};
  if(typeof nav.share==='function'){
   if(file&&typeof nav.canShare==='function'){try{if(nav.canShare({files:[file]}))data.files=[file];}catch(e){/* Text sharing can still work. */}}
   try{await nav.share(data);return 'shared';}catch(e){return e?.name==='AbortError'?'canceled':'manual';}
  }
  try{if(typeof nav.clipboard?.writeText==='function'){await nav.clipboard.writeText(text);return 'copied';}}catch(e){/* Keep the selectable caption available. */}
  return 'manual';
 }
 return {send};
});

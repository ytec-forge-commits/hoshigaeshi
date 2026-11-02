/* Original procedural game effects, Apache-2.0; no external samples. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSoundDesign=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEYS=['option-laser','boss-beam','shield-break','pickup-extend','pickup-guard','player-shot'];
function synthesize(key,sampleRate){
 const rate=Math.max(8000,Math.min(192000,Math.round(sampleRate)||48000)),index=KEYS.indexOf(key);if(index<0)throw Error('Unknown effect');
 const duration=[.32,.9,.46,.64,.72,.10][index],data=new Float32Array(Math.round(rate*duration));let seed=431+index,peak=0;
 for(let i=0;i<data.length;i++){
  const t=i/rate,p=t/duration,attack=Math.min(1,t/.008),tail=Math.min(1,(duration-t)/.04),decay=Math.exp(-p*(index===1?1.5:4));seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;
  let v;if(index===0){const phase=2*Math.PI*(1550*t-1900*t*t);v=Math.sin(phase)+.2*Math.sin(phase*2)+noise*.08;}
  else if(index===1){const phase=2*Math.PI*(105*t-28*t*t);v=.6*Math.sin(phase)+.25*Math.sin(phase*2)+noise*.36;}
  else if(index===2)v=.5*Math.sin(2*Math.PI*880*t)+.35*Math.sin(2*Math.PI*1318.5*t)+noise*.25*Math.exp(-t*12);
  else if(index===5)v=Math.sin(2*Math.PI*(1000*t-2200*t*t));
  else{const base=index===3?659.25:523.25;v=Math.sin(2*Math.PI*base*t)+.4*Math.sin(2*Math.PI*base*1.5*t)+.3*Math.sin(2*Math.PI*base*2*t);}
  data[i]=v*attack*tail*tail*decay;peak=Math.max(peak,Math.abs(data[i]));
 }
 for(let i=0;i<data.length;i++)data[i]=data[i]/peak*.7;data[0]=0;return data;
}
return{KEYS,synthesize};
});

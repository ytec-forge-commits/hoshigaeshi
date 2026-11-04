/* Original procedural game effects, Apache-2.0; no external samples. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSoundDesign=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEYS=['option-laser','boss-beam','shield-break','pickup-extend','pickup-guard','player-shot','boss-defeat','ui-confirm','ui-back','ui-pause','ui-resume'];
function bossDefeat(rate){
 const duration=1.85,data=new Float32Array(Math.round(rate*duration));let seed=1927,low=0,peak=0;
 for(let i=0;i<data.length;i++){
  const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1;low+=(noise-low)*(1-Math.exp(-2*Math.PI*650/rate));
  const boom=Math.sin(2*Math.PI*(45*t+115*.075*(1-Math.exp(-t/.075))))*Math.exp(-t*3.7);
  const body=Math.sin(2*Math.PI*(93*t-8*t*t))*.38*Math.exp(-t*3.1);
  const crack=(noise-low)*.5*Math.exp(-t*26)+low*.9*Math.exp(-t*4);
  let shocks=0;for(const delay of [.12,.29])if(t>=delay)shocks+=low*.45*Math.exp(-(t-delay)*12)*Math.min(1,(t-delay)/.008);
  const u=Math.max(0,t-.09),shine=(Math.sin(2*Math.PI*660*u)+.5*Math.sin(2*Math.PI*990*u)+.25*Math.sin(2*Math.PI*1320*u))*.12*Math.min(1,u/.045)*Math.exp(-u*2.3);
  const fade=Math.min(1,t/.004)*Math.min(1,(duration-t)/.14)**2;
  data[i]=(boom+body+crack+shocks+shine)*fade;peak=Math.max(peak,Math.abs(data[i]));
 }
 for(let i=0;i<data.length;i++)data[i]=data[i]/peak*.86;data[0]=0;return data;
}
function introMusic(rate){
 // Every oscillator completes whole cycles in 16 s, with a quiet chord and sparse bells.
 rate=Math.max(8000,Math.min(192000,Math.round(rate)||48000));const duration=16,data=new Float32Array(rate*duration),tones=[130.8125,196,261.625,329.625];
 for(let i=0;i<data.length;i++){const t=i/rate;let v=0;for(let k=0;k<tones.length;k++){const f=Math.round(tones[k]*duration)/duration;v+=Math.sin(2*Math.PI*f*t+Math.sin(2*Math.PI*t/duration)*.3)*(.023+.009*Math.sin(2*Math.PI*t/duration+k));}
  for(let k=0;k<4;k++){const u=(t-k*4+duration)%duration,f=Math.round(tones[k]*4*duration)/duration;v+=Math.sin(2*Math.PI*f*u)*Math.min(1,u/.06)*Math.exp(-u*1.7)*.045;}
  data[i]=v*Math.sin(Math.PI/2*Math.min(1,t/.25,(duration-t)/.25))**2;
 }return data;
}
function uiCue(key,rate){
 const index=['ui-confirm','ui-back','ui-pause','ui-resume'].indexOf(key),duration=[.14,.13,.18,.18][index],data=new Float32Array(Math.round(rate*duration));
 const start=[660,650,440,440][index],slope=[1600,-1700,-900,2100][index];
 for(let i=0;i<data.length;i++){const t=i/rate,phase=2*Math.PI*(start*t+slope*t*t/2),envelope=Math.min(1,t/.006)*Math.min(1,(duration-t)/.035)**2*Math.exp(-t*10);data[i]=(Math.sin(phase)+.18*Math.sin(phase*2))*.27*envelope;}return data;
}
function synthesize(key,sampleRate){
 const rate=Math.max(8000,Math.min(192000,Math.round(sampleRate)||48000)),index=KEYS.indexOf(key);if(index<0)throw Error('Unknown effect');
 if(key==='boss-defeat')return bossDefeat(rate);
 if(key.startsWith('ui-'))return uiCue(key,rate);
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
return{KEYS,synthesize,introMusic};
});

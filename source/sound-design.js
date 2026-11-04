/* Original procedural game effects, Apache-2.0; no external samples. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarSoundDesign=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEYS=['option-laser','boss-beam','shield-break','pickup-extend','pickup-guard','player-shot','boss-defeat','ui-confirm','ui-back','ui-pause','ui-resume','chain-note',...Array.from({length:21},(_,i)=>'chain-note-'+(i+2)),'chain-sparkle','stage-transit'];
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
 // A soft original keyboard phrase: separate notes and rests, without a sustained drone.
 rate=Math.max(8000,Math.min(192000,Math.round(rate)||48000));const duration=16,data=new Float32Array(rate*duration);
 const notes=[[.1,72],[.85,76],[1.6,79],[2.7,76],[4.1,74],[4.85,72],[5.6,69],[6.7,67],[8.1,69],[8.85,72],[9.6,76],[10.7,74],[12.1,71],[12.85,67],[13.6,72]];
 const addNote=(at,midi,gain,length)=>{const frequency=440*2**((midi-69)/12),start=Math.round(at*rate),end=Math.min(data.length,start+Math.round(length*rate));
  for(let i=start;i<end;i++){const t=(i-start)/rate,phase=2*Math.PI*frequency*t,attack=Math.sin(Math.PI/2*Math.min(1,t/.035))**2,tail=Math.min(1,(end-i)/rate/.3)**2;
   data[i]+=gain*attack*tail*(Math.sin(phase)*Math.exp(-t*2.5)+.18*Math.sin(phase*2)*Math.exp(-t*5)+.035*Math.sin(phase*3)*Math.exp(-t*8));
  }
 };
 for(const [at,midi]of notes){addNote(at,midi,.15,1.8);addNote(at+.23,midi,.025,1.4);}
 for(const [at,midi]of [[.1,48],[4.1,53],[8.1,57],[12.1,55]]){addNote(at,midi,.055,2.6);addNote(at+.35,midi+7,.035,2.2);}
 return data;
}
function uiCue(key,rate){
 const index=['ui-confirm','ui-back','ui-pause','ui-resume'].indexOf(key),duration=[.14,.13,.18,.18][index],data=new Float32Array(Math.round(rate*duration));
 const start=[330,325,220,220][index],slope=[500,-550,-300,700][index];
 for(let i=0;i<data.length;i++){const t=i/rate,phase=2*Math.PI*(start*t+slope*t*t/2),envelope=Math.min(1,t/.01)*Math.min(1,(duration-t)/.035)**2*Math.exp(-t*10);data[i]=(Math.sin(phase)+.08*Math.sin(phase*2))*.27*envelope;}return data;
}
function synthesize(key,sampleRate){
 const rate=Math.max(8000,Math.min(192000,Math.round(sampleRate)||48000)),index=KEYS.indexOf(key);if(index<0)throw Error('Unknown effect');
 if(key==='boss-defeat')return bossDefeat(rate);
 if(key.startsWith('ui-'))return uiCue(key,rate);
 if(key==='stage-transit'){
  const duration=1.25,data=new Float32Array(Math.round(rate*duration)),notes=[523.251,659.255,783.991,1046.502,1318.51,1567.982,2093.005];
  for(let i=0;i<data.length;i++){const t=i/rate;let v=0;
   for(const [n,f]of notes.entries()){const u=t-n*.085;if(u<0)continue;v+=Math.sin(2*Math.PI*f*u)*.23*Math.min(1,u/.015)*Math.exp(-u*6);}
   const flow=Math.sin(2*Math.PI*(180*t+260*t*t))*.08*Math.sin(Math.PI*t/duration)**2;
   data[i]=(v+flow)*Math.min(1,(duration-t)/.2)**2;
  }return data;
 }
 if(key==='chain-sparkle'){
  const duration=.32,data=new Float32Array(Math.round(rate*duration));
  for(let i=0;i<data.length;i++){const t=i/rate;let v=0;
   for(const [n,f]of [1318.51,1760,2093.005].entries()){const u=t-n*.045;if(u<0)continue;const phase=2*Math.PI*f*u;v+=(Math.sin(phase)+(f*2<rate*.45?.1*Math.sin(phase*2):0))*.26*Math.min(1,u/.005)*Math.exp(-u*18);}
   data[i]=v*Math.min(1,(duration-t)/.055)**2;
  }return data;
 }
 if(key==='chain-note'||key.startsWith('chain-note-')){
  const duration=.24,data=new Float32Array(Math.round(rate*duration)),step=key==='chain-note'?0:Number(key.slice(11))-1,frequency=261.625565*2**(([0,2,4,5,7,9,11][step%7]+12*Math.floor(step/7))/12);
  for(let i=0;i<data.length;i++){const t=i/rate,phase=2*Math.PI*frequency*t,envelope=Math.min(1,t/.006)*Math.min(1,(duration-t)/.045)**2*Math.exp(-t*7);
   data[i]=envelope*(.60*Math.sin(phase)+(frequency*2<rate*.45?.12*Math.sin(phase*2)*Math.exp(-t*8):0)+(frequency*3<rate*.45?.035*Math.sin(phase*3)*Math.exp(-t*12):0));
  }return data;
 }
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

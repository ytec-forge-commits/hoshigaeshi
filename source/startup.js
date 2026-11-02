/* Original startup timing and synthesized logo chime, Apache-2.0. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarStartup=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=v=>Math.max(0,Math.min(1,v));
class Timeline{
 constructor(reduced=false){this.reduced=reduced;this.elapsed=0;this.active=false;this.started=false;this.cued=false;this.frame={opacity:0,scale:1,cue:false,done:false};}
 start(){if(this.started)return false;this.started=true;this.active=true;return true;}
 cancel(){this.active=false;this.frame={opacity:0,scale:1,cue:false,done:false};}
 step(dt,held=false){
  if(!this.active||held)return{...this.frame,cue:false,done:false};
  this.elapsed+=Math.max(0,Math.min(.05,Number(dt)||0));
  const t=this.elapsed,fadeIn=this.reduced?.18:.65,fadeOut=this.reduced?.3:.75,holdEnd=this.reduced?1.95:2.45,end=holdEnd+fadeOut+.25;
  const opacity=t<.2?0:t<.2+fadeIn?clamp((t-.2)/fadeIn):t<holdEnd?1:1-clamp((t-holdEnd)/fadeOut);
  const cue=!this.cued&&t>=.2;if(cue)this.cued=true;
  const done=t+1e-9>=end;if(done)this.active=false;
  return this.frame={opacity,scale:this.reduced?1:.975+.025*clamp((t-.2)/2),cue,done};
 }
}
function makeChime(sampleRate){
 const rate=Math.max(8000,Math.min(192000,Math.round(sampleRate)||48000)),data=new Float32Array(rate*2);let peak=0;
 for(let i=0;i<data.length;i++){
  const t=i/rate,attack=1-Math.exp(-t*90),tail=clamp((2-t)/.35),fundamental=Math.sin(2*Math.PI*523.251*t)*Math.exp(-t*2.5),fifth=.4*Math.sin(2*Math.PI*783.991*t)*Math.exp(-t*3.8),octave=.22*Math.sin(2*Math.PI*1046.502*t)*Math.exp(-t*5.5);
  data[i]=(fundamental+fifth+octave)*attack*tail*tail;peak=Math.max(peak,Math.abs(data[i]));
 }
 for(let i=0;i<data.length;i++)data[i]=data[i]/peak*.72;
 return data;
}
return{Timeline,makeChime};
});

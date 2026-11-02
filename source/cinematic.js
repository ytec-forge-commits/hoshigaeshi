/* STAR REBOUND cinematic clock. Apache-2.0. No simulation or audio side effects. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarCinematic=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
class Timeline{
 constructor(){this.active=false;this.introSeen=false;this.version=0;this.kind=null;this.elapsed=0;this.duration=0;this.reduced=false;}
 start(kind,reduced=false){if(!['intro','ending','transit','defeat'].includes(kind))return false;if(kind==='intro'&&this.introSeen)return false;if(kind==='intro')this.introSeen=true;this.version++;this.kind=kind;this.elapsed=0;this.reduced=!!reduced;this.duration=kind==='defeat'?2.4:kind==='transit'?3.2:reduced?.8:kind==='intro'?7.8:10;this.active=true;return true;}
 step(dt,held=false){if(!this.active||held)return null;this.elapsed+=Math.max(0,Math.min(.05,Number(dt)||0));if(this.elapsed+1e-9<this.duration)return null;this.active=false;return{kind:this.kind,version:this.version};}
 skip(){if(!this.active||this.kind==='defeat'&&this.elapsed+1e-9<.35)return null;if(this.kind==='transit'){this.reduced=true;return null;}this.active=false;return{kind:this.kind,version:this.version};}
 cancel(){this.version++;this.active=false;}
 setReduced(value){if(!this.active||!value||this.reduced)return;this.reduced=true;if(!['transit','defeat'].includes(this.kind))this.duration=this.elapsed+.8;}
 get progress(){return this.reduced?.82:Math.min(1,this.elapsed/this.duration);}
}
// Presentation-only star current. No simulation, combat RNG or audio state.
function endingFrame(progress,reduced=false){
 const clamp=v=>Math.max(0,Math.min(1,Number(v)||0)),p=reduced?.55:clamp(progress),smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
 const gather=reduced?1:smooth(p/.28),travel=reduced?.38:Math.pow(clamp((p-.22)/.76),1.15);
 const point=(depth,lane=0)=>{const d=clamp(depth),width=2.8+205*Math.pow(d,1.5);return {x:250+30*Math.sin(2*Math.PI*d)-25*d+lane*width,y:150+480*Math.pow(d,1.45)};};
 const left=[],right=[];for(let i=0;i<=24;i++){left.push(point(i/24,-1));right.push(point(i/24,1));}
 const jitter=i=>{const v=Math.sin((i+1)*78.233)*43758.5453;return v-Math.floor(v);};
 const grain=(i,bright)=>{
  const seed=jitter(i+351),depth=(jitter(i+17)+(reduced?0:Math.max(0,p-.18)*.72))%1;
  const lane=(jitter(i+97)+jitter(i+193)-1)*1.12+.085*Math.sin(depth*19+(reduced?0:p*8)+seed*6),target=point(depth,lane);
  const angle=i*2.39996323,scatter={x:240+Math.cos(angle)*(105+(i%7)*21),y:320+Math.sin(angle)*(130+(i%5)*28)};
  const shimmer=reduced?.8:.68+.24*Math.sin(p*13+i*1.73),edge=smooth(depth/.055)*(1-smooth((depth-.88)/.12));
  const radius=bright?.36+1.42*Math.pow(depth,1.3):.24+.72*depth*(.35+seed*.65);
  return{x:scatter.x+(target.x-scatter.x)*gather,y:scatter.y+(target.y-scatter.y)*gather,radius,scale:radius/12.5,opacity:clamp((.2+.8*gather)*shimmer*edge*(bright?.95:.32+.38*seed)),rotation:0,cool:i%9===0};
 };
 const stars=Array.from({length:96},(_,i)=>grain(i,true)),dust=Array.from({length:560},(_,i)=>grain(i+96,false));
 const shipAt=(q)=>{const flight=reduced?.38:Math.pow(clamp((q-.22)/.76),1.15),phase=q*Math.PI*8,amount=1-flight;
  const y=540-386*flight+(reduced?0:4*Math.sin(phase+.8)*amount*smooth(q/.28)),center=point(Math.pow(clamp((y-150)/480),1/1.45));
  return{x:center.x+(reduced?0:15*Math.sin(phase)*amount),y,scale:.025+1.12*Math.pow(amount,.82),opacity:reduced?1:1-clamp((flight-.9)/.1),tilt:reduced?0:-11*Math.cos(phase)*amount,wing:reduced?0:8.2*Math.sin(phase-.6),phase:reduced?0:phase};
 };
 const ship=shipAt(p),wake=[];for(let i=0;i<24;i++){const prior=shipAt(Math.max(0,p-i*.0025));wake.push({x:prior.x+Math.sin(i*2.4)*i*.16,y:prior.y+32*prior.scale+i*.8,opacity:ship.opacity*(1-i/24)*.26,radius:.3+.6*(1-i/24)});}
 return {road:{left,right,opacity:.045+.48*gather},ship,stars,dust,wake,glow:.1+.13*gather};
}
function paintEnding(canvas,frame,shipImage){
 const ratio=Math.min(2,Math.max(1,Number(globalThis.devicePixelRatio)||1)),width=Math.round(480*ratio),height=Math.round(720*ratio);
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const ctx=canvas.getContext('2d');if(!ctx)return;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,480,720);
 // Open, feather-light currents; no filled polygon or hard road edges.
 for(let lane=-.6;lane<=.61;lane+=.3){ctx.beginPath();for(let i=0;i<frame.road.left.length;i++){const a=frame.road.left[i],b=frame.road.right[i],x=(a.x+b.x)/2+(b.x-a.x)*lane*.5;ctx[i?'lineTo':'moveTo'](x,a.y);}ctx.strokeStyle=`rgba(255,219,145,${frame.road.opacity*.065})`;ctx.lineWidth=1.5;ctx.stroke();}
 for(const grain of frame.dust){ctx.globalAlpha=grain.opacity;ctx.fillStyle=grain.cool?'#a7e9e4':'#ffe7b2';ctx.fillRect(grain.x,grain.y,grain.radius*1.4,grain.radius*1.4);}
 for(let i=0;i<frame.stars.length;i++){const s=frame.stars[i];ctx.globalAlpha=s.opacity;ctx.fillStyle='#fff2ce';ctx.beginPath();ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);ctx.fill();if(i%8===0){ctx.globalAlpha=s.opacity*.38;ctx.strokeStyle='#ffdb91';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(s.x-s.radius*2.4,s.y);ctx.lineTo(s.x+s.radius*2.4,s.y);ctx.moveTo(s.x,s.y-s.radius*2.4);ctx.lineTo(s.x,s.y+s.radius*2.4);ctx.stroke();}}
 for(const s of frame.wake){ctx.globalAlpha=s.opacity;ctx.fillStyle='#9ceee2';ctx.beginPath();ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);ctx.fill();}
 const ship=frame.ship;ctx.globalAlpha=ship.opacity;
 if(shipImage?.complete&&shipImage.naturalWidth){ctx.save();ctx.translate(ship.x,ship.y);ctx.rotate(ship.tilt*Math.PI/180);ctx.scale(ship.scale,ship.scale);
  const slices=32,sw=shipImage.naturalWidth/slices,sh=shipImage.naturalHeight,size=132;
  for(let i=0;i<slices;i++){const side=(i+.5)/slices*2-1,tip=Math.pow(Math.abs(side),1.7),lift=ship.wing*tip+Math.sin(ship.phase-Math.abs(side)*1.1)*2.2*tip*(ship.wing?1:0),height=size*(1-.035*Math.abs(side)*Math.sin(ship.phase));ctx.drawImage(shipImage,i*sw,0,sw,sh,-size/2+i*size/slices,-size/2+lift,size/slices+.3,height);}
  ctx.restore();
 }
 ctx.globalAlpha=1;
}
function defeatFrame(progress,reduced=false){
 const p=Math.max(0,Math.min(1,Number(progress)||0)),smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
 if(reduced)return{opacity:p>=1?0:1,x:0,portraitScale:1,accent:0};
 return{opacity:smooth(p/.08)*(1-smooth((p-.92)/.08)),x:-115*(1-smooth(p/.125))+115*smooth((p-.875)/.125),portraitScale:1.12-.12*smooth(p/.125),accent:Math.sin(Math.PI*p)};
}
return{Timeline,endingFrame,paintEnding,defeatFrame};
});

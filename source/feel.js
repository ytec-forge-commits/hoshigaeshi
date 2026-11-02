/* STAR REBOUND presentation plans. Apache-2.0. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StarFeel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function backgroundFrame(stage,time,reduced=false){
 stage=clamp(Math.floor(Number(stage)||0),0,2);const t=reduced?0:Math.max(0,Number(time)||0),paths=[];
 const path=(points,width,alpha,color)=>paths.push({points,width,alpha:reduced?alpha*.5:alpha,color});
 if(stage===0){
  for(let band=0;band<3;band++){
   const points=Array.from({length:19},(_,i)=>{const x=-30+i*30;return{x,y:130+band*210+Math.sin(x/115+t*.35+band*1.8)*32+Math.sin(t*.14+band)*25};});
   path(points,18,.045,0x72e5db);path(points.map(p=>({x:p.x,y:p.y-6})),1.5,.12,0x98e8ed);
  }
 }else if(stage===1){
  for(let beam=0;beam<6;beam++){
   const points=Array.from({length:19},(_,i)=>{const y=-40+i*44;return{x:20+beam*90+Math.sin(y/155+t*.28+beam)*48,y};});
   path(points,beam%2?2:22,beam%2?.11:.045,beam%2?0x9be9f2:0x53d9cb);
  }
 }else{
  for(let orbit=0;orbit<5;orbit++){
   const phase=t*.045+orbit*.37,cx=orbit%2?460:20,cy=130+orbit*125+Math.sin(t*.16+orbit)*20;
   const points=Array.from({length:33},(_,i)=>{const a=i/32*Math.PI*2+phase;return{x:cx+Math.cos(a)*(185+orbit*13),y:cy+Math.sin(a)*(65+orbit*9)};});
   path(points,orbit%2?1.5:3,.075,orbit%2?0xb7a8f7:0x7edfe5);
  }
 }
 return {kind:['tide','mirror','orbits'][stage],paths};
}
function cueFrame(kind,age,reduced=false){
 const duration=kind==='warning'?2.4:1.5,p=clamp(age/duration,0,1),visible=age>=0&&age<duration;
 return {visible,opacity:visible?(reduced?1:Math.min(1,p*7,(1-p)*6)):0,scale:reduced?1:.92+.12*Math.sin(Math.min(1,p*2)*Math.PI/2),rotation:reduced?0:(1-p)*-5,ring:reduced?1:1+p*1.4};
}
function creditsFrame(elapsed,dt,height,contentHeight,held,finaleHeight=0){
 const next=Math.max(0,elapsed)+(held?0:Math.max(0,dt)),finale=Math.min(height,Math.max(0,finaleHeight)),endY=(height+finale)/2-contentHeight;
 const arrive=(height-endY)/48,duration=finale?Infinity:Math.max(24,(height+contentHeight)/48)+1,y=finale?Math.max(-contentHeight,height-next*48):height-next*48;
 return{elapsed:next,y,finaleOffset:finale?Math.max(0,endY-y):0,remaining:Math.max(0,duration-next),done:next>=duration,closing:finale?clamp((next-arrive)/4,0,1):0};
}
function creditsResumeTime(scrollTop,height){return(Math.max(0,scrollTop)+Math.max(0,height))/48;}
// Presentation only; the contract test checks these tiers against Game.kill.
function scoreChainFrame(combo,lastKill,time){
 const remaining=combo>0?clamp(4-(time-lastKill),0,4):0,count=remaining>0?combo:0,multiplier=Math.min(5,1+Math.floor(count/5));
 return{combo:count,multiplier,remaining,nextKills:multiplier===5?0:multiplier*5-count,nextMultiplier:Math.min(5,multiplier+1)};
}
return{backgroundFrame,cueFrame,creditsFrame,creditsResumeTime,scoreChainFrame};
});

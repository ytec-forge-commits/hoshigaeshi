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
const ITEMS={
 spread:{name:'三連星',effect:'通常弾が三方向',icon:'item-spread-v5.png',texture:'item-spread-v5'},
 twin:{name:'連星',effect:'レーザー＋反撃強化1回',icon:'item-twin-v5.png',texture:'item-twin-v5'},
 pierce:{name:'貫星',effect:'通常弾が二体を貫通',icon:'star.png',texture:'star'},
 extend:{name:'時星',effect:'取り込み時間 ＋0.25秒',icon:'item-extend.svg',texture:'item-extend'},
 guard:{name:'護星',effect:'20秒以内に一度だけ防ぐ',icon:'item-guard.svg',texture:'item-guard'}
};
function itemInfo(type){return ITEMS[type]||ITEMS.twin;}
// Render-only motion; never feeds collision or input coordinates back into the simulation.
function flightPose(previous,vx,vy,dt,reduced=false){
 if(reduced)return{lean:0,tail:0,thrust:0,energy:0,phase:0};
 const p=previous||{lean:0,tail:0,thrust:0,energy:0,phase:0},step=Math.max(0,Math.min(.05,Number(dt)||0));
 const clamp=v=>Math.max(-1,Math.min(1,Number(v)||0)),x=clamp(vx/680),y=clamp(-vy/680),blend=1-Math.exp(-step*14),lag=1-Math.exp(-step*7);
 const lean=p.lean+(x-p.lean)*blend,thrust=p.thrust+(y-p.thrust)*blend,energy=p.energy+(Math.min(1,Math.hypot(x,y))-p.energy)*blend;
 return{lean,tail:p.tail+(lean-p.tail)*lag,thrust,energy,phase:(p.phase+step*(4+energy*7))%(Math.PI*2)};
}
function paintFlight(canvas,image,pose){
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;if(!ctx)return;
 ctx.clearRect(0,0,w,h);
 // Horizontal bands bend the head and tapering tail independently, without replacing the artwork.
 for(let y=0;y<h;y+=4){
  const t=(y+2)/h,tail=Math.max(0,(t-.52)/.48),head=Math.max(0,1-t/.34),wing=Math.max(0,1-Math.abs(t-.34)/.22);
  const offset=pose.lean*3*head-pose.tail*13*tail+Math.sin(pose.phase-tail*3)*3*tail*pose.energy;
  const spread=1-wing*(.055*pose.thrust+.035*Math.sin(pose.phase)*pose.energy),width=w*spread;
  ctx.drawImage(image,0,y,image.width,Math.min(4,h-y),(w-width)/2+offset,y,width,Math.min(4,h-y));
 }
}
return{flightPose,paintFlight,backgroundFrame,cueFrame,creditsFrame,creditsResumeTime,scoreChainFrame,itemInfo};
});

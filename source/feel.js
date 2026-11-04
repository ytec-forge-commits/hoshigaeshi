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
const CREDITS_SPEED=96;
function creditsFrame(elapsed,dt,height,contentHeight,held,finaleHeight=0){
 const next=Math.max(0,elapsed)+(held?0:Math.max(0,dt)),finale=Math.min(height,Math.max(0,finaleHeight)),endY=(height+finale)/2-contentHeight;
 const arrive=(height-endY)/CREDITS_SPEED,duration=finale?Infinity:Math.max(12,(height+contentHeight)/CREDITS_SPEED)+1,y=finale?Math.max(-contentHeight,height-next*CREDITS_SPEED):height-next*CREDITS_SPEED;
 return{elapsed:next,y,finaleOffset:finale?Math.max(0,endY-y):0,remaining:Math.max(0,duration-next),done:next>=duration,closing:finale?clamp((next-arrive)/4,0,1):0};
}
function creditsResumeTime(scrollTop,height){return(Math.max(0,scrollTop)+Math.max(0,height))/CREDITS_SPEED;}
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
 if(reduced)return{lean:0,tail:0,thrust:0,energy:0,phase:0,quiet:true};
 const p=previous||{lean:0,tail:0,thrust:0,energy:0,phase:0},step=Math.max(0,Math.min(.05,Number(dt)||0));
 const clamp=v=>Math.max(-1,Math.min(1,Number(v)||0)),x=clamp(vx/680),y=clamp(-vy/680),blend=1-Math.exp(-step*14),lag=1-Math.exp(-step*7);
 const lean=p.lean+(x-p.lean)*blend,thrust=p.thrust+(y-p.thrust)*blend,energy=p.energy+(Math.min(1,Math.hypot(x,y))-p.energy)*blend;
 return{lean,tail:p.tail+(lean-p.tail)*lag,thrust,energy,phase:(p.phase+step*(4+energy*7))%(Math.PI*2)};
}
// A continuous surface gives each wing, the nose and the tail their own follow-through.
// Coordinates are normalized; the collision jewel at (.5, .34) is an invariant anchor.
function flightPoint(x,y,pose){
 if(pose.quiet)return{x,y};
 const side=Math.sign(x-.5),outer=clamp((Math.abs(x-.5)*2-.14)/.86,0,1),body=1-clamp(Math.abs(x-.5)/.22,0,1);
 const wingBand=clamp((y-.14)/.13,0,1)*clamp((.6-y)/.12,0,1),wing=outer**1.25*wingBand;
 const stroke=Math.sin(pose.phase-outer*1.15),head=clamp((.34-y)/.23,0,1)*body,tail=clamp((y-.51)/.37,0,1)**1.3*body;
 const fold=.07+.09*(.5+.5*stroke)+.025*Math.max(0,pose.thrust);
 return{x:x-(x-.5)*wing*fold+pose.lean*.032*head-pose.tail*.105*tail+Math.sin(pose.phase-tail*3.8)*.06*tail*(.6+.4*pose.energy),
  y:y+wing*(stroke*(.065+.055*pose.energy)+pose.thrust*.045+side*pose.lean*.05)-pose.thrust*.028*head+pose.thrust*.03*tail+Math.cos(pose.phase)*.009*tail+(y-.34)*body*.018*Math.sin(pose.phase)};
}
const FLIGHT_X=[0,.125,.25,.375,.5,.625,.75,.875,1],FLIGHT_Y=[0,.125,.25,.34,.4375,.5625,.625,.75,.875,1];
function paintFlight(canvas,image,pose){return paintSurface(canvas,image,(x,y)=>flightPoint(x,y,pose),pose.quiet);}
function paintSurface(canvas,image,point,quiet=false){
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;if(!ctx)return;
 ctx.clearRect(0,0,w,h);if(quiet){ctx.drawImage(image,0,0,w,h);return;}
 const points=FLIGHT_Y.map(y=>FLIGHT_X.map(x=>{const p=point(x,y);return{sx:x*w,sy:y*h,x:p.x*w,y:p.y*h};}));
 function triangle(p,q,r){
  const ux=q.sx-p.sx,uy=q.sy-p.sy,vx=r.sx-p.sx,vy=r.sy-p.sy,det=ux*vy-vx*uy;
  const dx=q.x-p.x,dy=q.y-p.y,ex=r.x-p.x,ey=r.y-p.y;
  const a=(dx*vy-ex*uy)/det,b=(dy*vy-ey*uy)/det,c=(ux*ex-vx*dx)/det,d=(ux*ey-vx*dy)/det;
  const cx=(p.x+q.x+r.x)/3,cy=(p.y+q.y+r.y)/3;
  ctx.save();ctx.beginPath();
  // Subpixel overlap avoids antialiased cracks between adjacent painted triangles.
  for(const [i,v]of [p,q,r].entries()){const length=Math.hypot(v.x-cx,v.y-cy)||1,x=v.x+(v.x-cx)*.65/length,y=v.y+(v.y-cy)*.65/length;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
  ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,p.x-a*p.sx-c*p.sy,p.y-b*p.sx-d*p.sy);ctx.drawImage(image,0,0,w,h);ctx.restore();
 }
 for(let y=0;y<points.length-1;y++)for(let x=0;x<points[y].length-1;x++){const a=points[y][x],b=points[y][x+1],c=points[y+1][x],d=points[y+1][x+1];triangle(a,b,c);triangle(b,d,c);}
}
// Outer anatomy breathes around a rigid centre. This is never used by core.js.
function creaturePoint(x,y,kind,phase,reduced=false){
 if(reduced)return{x,y};
 const dx=x-.5,dy=y-.5,r=Math.hypot(dx,dy),outer=clamp((r-.11)/.5,0,1),a=Math.atan2(dy,dx);
 if(kind==='radial'){
  const angle=a+Math.sin(phase-r*5)*.15*outer,scale=1+Math.sin(phase*2+a*3)*.055*outer;
  return{x:.5+Math.cos(angle)*r*scale,y:.5+Math.sin(angle)*r*scale};
 }
 const wing=clamp((Math.abs(dx)-.06)/.37,0,1),tail=clamp((y-.51)/.44,0,1),stroke=Math.sin(phase-Math.abs(dx)*3);
 if(kind==='wing')return{x:x-dx*wing*(.07+.09*stroke),y:y+wing*stroke*.09+tail*Math.sin(phase-2)*.015};
 return{x:x+Math.sin(phase-tail*4)*.045*tail+(dx*.05*Math.sin(phase))*outer,y:y+wing*Math.sin(phase-wing*2)*.045-dy*.035*Math.sin(phase)};
}
function paintCreature(canvas,image,kind,phase){paintSurface(canvas,image,(x,y)=>creaturePoint(x,y,kind,phase));}
function laserFrame(length,width,time,reduced=false){
 if(reduced||length<=0)return[];
 const speed=620,spacing=58,travel=((time*speed)%spacing+spacing)%spacing,packets=[];
 for(let d=travel,i=0;d<length;d+=spacing,i++)packets.push({distance:d,tail:Math.min(d,24+8*Math.sin(i+time*3)),offset:Math.sin(d*.035-time*9)*width*.27,radius:Math.max(1,width*.11)});
 return packets;
}
return{creaturePoint,paintCreature,laserFrame,flightPose,flightPoint,paintFlight,backgroundFrame,cueFrame,CREDITS_SPEED,creditsFrame,creditsResumeTime,scoreChainFrame,itemInfo};
});

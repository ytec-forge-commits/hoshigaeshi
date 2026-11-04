(function(root){
'use strict';
// Standard mapping only. Ownership survives neutral input and never jumps to
// another controller in the same frame as a disconnect.
class GamepadInput{
 constructor(){this.owner=null;this.reset();}
 reset(){this.armed=false;this.previous={};}
 release(){this.owner=null;this.reset();}
 poll(pads,active,stickSensitivity=100){
  const empty={dx:0,dy:0,primary:false,pause:false,back:false,navX:0,navY:0,lost:false,status:'disconnected'};
  const all=pads?Array.from(pads).filter(p=>p&&p.connected):[];
  const supported=all.filter(p=>p.mapping==='standard');
  let pad=this.owner&&supported.find(p=>p.index===this.owner.index&&p.id===this.owner.id);
  if(this.owner&&!pad){this.release();return {...empty,lost:true,status:pads===null?'unavailable':supported.length?'waiting':all.length?'unsupported':'disconnected'};}
  if(!pad){pad=supported[0];if(pad){this.owner={index:pad.index,id:pad.id};this.reset();}}
  if(!pad)return {...empty,status:pads===null?'unavailable':all.length?'unsupported':'disconnected'};
  const down=i=>!!pad.buttons[i]?.pressed||pad.buttons[i]?.value>.5;
  let dx=Number(down(15))-Number(down(14)),dy=Number(down(13))-Number(down(12));
  const analog=!dx&&!dy;
  if(!dx&&!dy){dx=Number.isFinite(pad.axes[0])?pad.axes[0]:0;dy=Number.isFinite(pad.axes[1])?pad.axes[1]:0;const size=Math.hypot(dx,dy);if(size<=.22){dx=0;dy=0;}else{const scale=Math.min(1,(size-.22)/.78)/size;dx*=scale;dy*=scale;}}
  const size=Math.hypot(dx,dy);if(size>1){dx/=size;dy/=size;}
  const now={primary:down(0),pause:down(9),back:down(1),navX:Math.abs(dx)>.45?Math.sign(dx):0,navY:Math.abs(dy)>.45?Math.sign(dy):0};
  const neutral=dx===0&&dy===0&&!now.primary&&!now.pause&&!now.back;
  if(!active){this.reset();return {...empty,status:'connected'};}
  if(!this.armed){if(neutral)this.armed=true;this.previous=now;return {...empty,status:neutral?'connected':'waiting'};}
  // Sensitivity changes ship motion only, after menu edges and neutral detection.
  if(analog){const gain=(Number.isFinite(stickSensitivity)?Math.max(30,Math.min(100,stickSensitivity)):100)/100;dx*=gain;dy*=gain;}
  const out={...empty,dx,dy,status:'connected'};
  for(const k of ['primary','pause','back','navX','navY'])out[k]=now[k]&&now[k]!==this.previous[k]?now[k]:typeof now[k]==='boolean'?false:0;
  this.previous=now;return out;
 }
}
// Pointer Lock ownership, not promise resolution, is the authority for input.
class PointerLockInput{
 constructor(document,element,callbacks={}){
  this.document=document;this.element=element;this.callbacks=callbacks;this.locked=false;this.pending=false;this.wanted=false;this.serial=0;
  document.addEventListener('pointerlockchange',()=>this.changed());
  document.addEventListener('pointerlockerror',()=>{if(this.pending)this.failed(this.serial);});
 }
 request(){
  if(this.pending||this.locked)return;
  this.wanted=true;this.pending=true;const serial=++this.serial;
  try{if(typeof this.element.requestPointerLock!=='function')throw Error('Pointer Lock unavailable');const result=this.element.requestPointerLock();if(result&&typeof result.catch==='function')result.catch(()=>this.failed(serial));}
  catch(error){this.failed(serial);}
 }
 failed(serial){if(serial!==this.serial||!this.pending)return;this.pending=false;this.wanted=false;this.callbacks.error?.();}
 changed(){
  if(this.document.pointerLockElement===this.element){
   if(!this.wanted){this.document.exitPointerLock();return;}
   const wasLocked=this.locked;this.locked=true;this.pending=false;if(!wasLocked)this.callbacks.locked?.();
  }else if(this.locked){this.locked=false;this.pending=false;this.wanted=false;this.serial++;this.callbacks.lost?.();}
 }
 release(){this.serial++;this.wanted=false;this.pending=false;this.locked=false;if(this.document.pointerLockElement===this.element)this.document.exitPointerLock();}
}
function relativeMouseTarget(e,r,origin){
 if(r.width<=0||r.height<=0)return null;
 const dx=Number.isFinite(e.movementX)?e.movementX:0,dy=Number.isFinite(e.movementY)?e.movementY:0;
 // Preserve relative heading; core clamps the actual player and the input controller bounds retained movement.
 return{x:origin.x+dx*480/r.width,y:origin.y+dy*720/r.height};
}
class RelativeMouseInput{
 constructor(){this.clear();}
 clear(){this.freshX=0;this.freshY=0;this.carryX=0;this.carryY=0;this.hasFresh=false;this.lastInput=-Infinity;}
 push(e,rect,now){
  const delta=relativeMouseTarget(e,rect,{x:0,y:0});
  if(!delta||(!delta.x&&!delta.y))return;
  this.freshX+=delta.x;this.freshY+=delta.y;this.hasFresh=true;this.lastInput=now;
 }
 begin(player,now){
  // At most two 60 Hz ticks of residual; wall-clock expiry also covers stalled frames.
  if(now-this.lastInput>1000/30+1e-7){this.clear();return null;}
  let dx=this.carryX,dy=this.carryY;
  if(this.hasFresh){
   const length=Math.hypot(this.freshX,this.freshY);
   if(length){const ux=this.freshX/length,uy=this.freshY/length,along=Math.max(0,dx*ux+dy*uy);dx=this.freshX+ux*along;dy=this.freshY+uy*along;}
   else dx=dy=0;
  }
  return{x:player.x,y:player.y,dx,dy,target:{x:player.x+dx,y:player.y+dy}};
 }
 consume(frame,player,now){
  let dx=frame.dx-(player.x-frame.x),dy=frame.dy-(player.y-frame.y);
  // A blocked component must not survive at the wall and delay a later reversal.
  if((player.x<=22&&dx<0)||(player.x>=458&&dx>0))dx=0;
  if((player.y<=68&&dy<0)||(player.y>=690&&dy>0))dy=0;
  const length=Math.hypot(dx,dy),limit=680/30;
  if(length>limit){dx*=limit/length;dy*=limit/length;}
  this.freshX=0;this.freshY=0;this.hasFresh=false;this.carryX=dx;this.carryY=dy;
  if(now-this.lastInput>1000/30+1e-7)this.clear();
 }
}
// CSS pixels and wall-clock milliseconds keep touch gestures independent of game scale and speed.
class TouchDoubleTap{
 constructor(){this.reset();}
 reset(){this.press=null;this.previous=null;}
 down(e,now){
  if(e.pointerType!=='touch'||e.isPrimary===false||this.press){this.reset();return;}
  this.press={id:e.pointerId,x:e.clientX,y:e.clientY,time:now};
 }
 move(e){if(this.press&&e.pointerId===this.press.id&&Math.hypot(e.clientX-this.press.x,e.clientY-this.press.y)>24)this.reset();}
 cancel(e){if(this.press?.id===e.pointerId)this.reset();}
 up(e,now){
  this.move(e);const press=this.press;
  if(!press||press.id!==e.pointerId)return false;
  this.press=null;
  if(now<press.time||now-press.time>350){this.previous=null;return false;}
  const previous=this.previous;
  if(previous&&now>=previous.time&&now-previous.time<=520&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<=72){this.previous=null;return true;}
  this.previous={x:e.clientX,y:e.clientY,time:now};return false;
 }
}
class BackdropGesture{
 constructor(){this.reset();}
 reset(){this.press=null;this.released=false;}
 outside(e,r){return e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom;}
 down(e,r){this.reset();if(e.button===0&&this.outside(e,r))this.press={id:e.pointerId,x:e.clientX,y:e.clientY};}
 move(e){if(this.press&&(e.pointerId!==this.press.id||Math.hypot(e.clientX-this.press.x,e.clientY-this.press.y)>8))this.reset();}
 up(e,r){this.move(e);if(this.press&&this.outside(e,r))this.released=true;else this.reset();}
 click(e,r){const accept=!!this.press&&this.released&&this.outside(e,r)&&Math.hypot(e.clientX-this.press.x,e.clientY-this.press.y)<=8;this.reset();return accept;}
}
const api={GamepadInput,PointerLockInput,relativeMouseTarget,RelativeMouseInput,TouchDoubleTap,BackdropGesture};if(typeof module==='object'&&module.exports)module.exports=api;else root.StarControls=api;
})(typeof window!=='undefined'?window:globalThis);

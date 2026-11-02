/* Authored raster route, in travel order from opening to boss approach. */
(function(root){
  'use strict';
  const W=480,H=720;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function makePlan(parts){
    if(!Array.isArray(parts)||parts.length<2)throw Error('A route needs at least two raster sections');
    const rows=parts.map((part,i)=>{
      if(!part.key||!part.path||!(part.width>=W)||!(part.height>=H))throw Error('Invalid route section '+i);
      const height=part.height*W/part.width;
      const overlap=i<parts.length-1?(part.overlapNext??120):0;
      if(overlap<0||overlap>=height||overlap>=H)throw Error('Invalid route overlap '+i);
      return{...part,sourceHeight:part.height,height,overlap,top:0};
    });
    let cursor=0;
    for(let i=rows.length-1;i>=0;i--){rows[i].top=cursor;cursor+=rows[i].height-(i>0?rows[i-1].overlap:0);}
    if(cursor<=H)throw Error('Route must be taller than the viewport');
    return{rows,height:cursor,travel:cursor-H};
  }
  function sample(plan,stageTime,sweepAt=84){
    const p=clamp(stageTime/sweepAt,0,1);
    // Decelerate towards the boss vista. Sweep and boss hold the final view.
    const progress=1-Math.pow(1-p,1.6),cameraTop=plan.travel*(1-progress);
    const speed=p>=1?0:plan.travel*1.6/sweepAt*Math.pow(1-p,.6);
    const visible=[];
    for(let i=0;i<plan.rows.length;i++){
      const row=plan.rows[i];
      if(row.top<cameraTop+H&&row.top+row.height>cameraTop)visible.push(i);
    }
    return{progress,cameraTop,speed,visible};
  }
  class RouteRenderer{
    static preloadInitial(scene,parts,asset){
      if(!parts.length)return;
      makePlan(parts);
      for(const part of parts.slice(0,2))scene.load.image(part.key,asset(part.path));
    }
    constructor(scene,parts,asset,landmarks=[],optimizeTexture=null){
      this.scene=scene;this.parts=parts;this.asset=asset;this.plan=makePlan(parts);
      this.optimizeTexture=optimizeTexture;
      this.sprites=new Map();this.pending=new Set();this.failed=false;
      this.landmarks=landmarks;this.landmarkSprites=new Map();this.failedLandmarks=new Set();
      this.retired=false;this.desired=new Set(parts.slice(0,2).map(p=>p.key));
      scene.load.on?.('filecomplete',key=>{
        if(!this.parts.some(p=>p.key===key)&&!this.landmarks.some(p=>p.key===key))return;
        this.pending.delete(key);
        // A request from before retry or stage exit may complete after reset.
        // Keep only textures required by the current viewport or its prefetch.
        if((this.retired||!this.desired.has(key))&&scene.textures.exists(key))scene.textures.remove(key);
      });
    }
    failedKey(key){
      if(this.parts.some(p=>p.key===key)){
        this.pending.delete(key);
        if(this.retired||!this.desired.has(key))return true;
        this.failed=true;this.hide();return true;
      }
      if(this.landmarks.some(p=>p.key===key)){
        this.pending.delete(key);
        if(!this.retired&&this.desired.has(key))this.failedLandmarks.add(key);
        return true;
      }
      return false;
    }
    queue(i){
      const row=this.plan.rows[i];
      if(!row||this.pending.has(row.key)||this.scene.textures.exists(row.key))return;
      this.pending.add(row.key);this.scene.load.image(row.key,this.asset(row.path));this.scene.load.start();
    }
    createSprite(i,row){
      const depth=.3+i*.01;
      if(!row.softJoin)return this.scene.add.image(240,0,row.key).setDepth(depth);
      const overlap=this.plan.rows[i-1]?.overlap??0;
      if(overlap<1||overlap>=row.height)throw Error('Invalid soft join '+row.key);
      // A single alpha gradient avoids the horizontal edges produced when
      // many translucent Phaser frames meet at fractional camera positions.
      // Downsample once and replace the decoded source under the same key, so
      // a soft section does not retain two full-size GPU/CPU textures.
      const source=this.scene.textures.get(row.key).getSourceImage();
      if(source.width!==W||source.height!==H){
        const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
        const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable for route '+row.key);
        ctx.drawImage(source,0,0,W,H);
        const fade=ctx.createLinearGradient(0,H-overlap,0,H);
        fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');
        ctx.globalCompositeOperation='destination-in';ctx.fillStyle=fade;
        // destination-in clears pixels outside its source shape as well, so
        // cover the whole image; the gradient is opaque before H-overlap.
        ctx.fillRect(0,0,W,H);
        this.scene.textures.remove(row.key);
        this.scene.textures.addCanvas(row.key,canvas);
      }
      return this.scene.add.image(240,0,row.key).setDepth(depth);
    }
    hide(){for(const sprite of this.sprites.values())sprite.setVisible(false);for(const sprite of this.landmarkSprites.values())sprite.setVisible(false);}
    unload(){
      this.retired=true;
      this.desired.clear();
      this.hide();
      for(const sprite of this.sprites.values())sprite.destroy();this.sprites.clear();
      for(const sprite of this.landmarkSprites.values())sprite.destroy();this.landmarkSprites.clear();
      for(const part of this.parts)if(this.scene.textures.exists(part.key))this.scene.textures.remove(part.key);
      for(const mark of this.landmarks)if(this.scene.textures.exists(mark.key))this.scene.textures.remove(mark.key);
      this.pending.clear();
    }
    reset(){
      this.retired=false;
      this.desired=new Set(this.parts.slice(0,2).map(p=>p.key));
      this.failed=false;
      this.failedLandmarks.clear();
      for(const [i,sprite] of this.sprites){sprite.destroy();this.sprites.delete(i);}
      for(const [key,sprite] of this.landmarkSprites){sprite.destroy();this.landmarkSprites.delete(key);}
      for(let i=2;i<this.plan.rows.length;i++){
        const key=this.plan.rows[i].key;
        if(this.scene.textures.exists(key))this.scene.textures.remove(key);
      }
      for(const landmark of this.landmarks)if(this.scene.textures.exists(landmark.key))this.scene.textures.remove(landmark.key);
      this.queue(0);this.queue(1);
    }
    updateLandmarks(frame,sweepAt){
      for(const mark of this.landmarks){
        const at=clamp(mark.at,0,1),anchor=sample(this.plan,at*sweepAt,sweepAt).cameraTop;
        const y=(mark.y??360)+(anchor-frame.cameraTop)*(mark.parallax??1.12);
        const extent=Math.max(mark.displayHeight??120,mark.displayWidth??120);
        const near=y>-extent-240&&y<H+extent+240;
        if(near)this.desired.add(mark.key);else this.desired.delete(mark.key);
        if(near&&!this.failedLandmarks.has(mark.key)&&!this.scene.textures.exists(mark.key)&&!this.pending.has(mark.key)){
          this.pending.add(mark.key);this.scene.load.image(mark.key,this.asset(mark.path));this.scene.load.start();
        }
        if(this.scene.textures.exists(mark.key)){
          this.pending.delete(mark.key);
          if(mark.textureWidth&&mark.textureHeight&&this.optimizeTexture){
            this.optimizeTexture(this.scene,mark.key,mark.textureWidth,mark.textureHeight);
            if(!this.scene.textures.exists(mark.key))this.failedLandmarks.add(mark.key);
          }
        }
        let sprite=this.landmarkSprites.get(mark.key);
        if(near&&this.scene.textures.exists(mark.key)){
          if(!sprite){sprite=this.scene.add.image(mark.x,y,mark.key).setDepth(.8);this.landmarkSprites.set(mark.key,sprite);}
          sprite.setPosition(mark.x,y).setDisplaySize(mark.displayWidth??120,mark.displayHeight??120)
            .setAlpha(Math.min(.55,mark.alpha??.32)).setVisible(y>-extent&&y<H+extent);
        }else if(sprite){sprite.destroy();this.landmarkSprites.delete(mark.key);}
        if(!near&&!this.pending.has(mark.key)&&this.scene.textures.exists(mark.key))this.scene.textures.remove(mark.key);
      }
    }
    update(stageTime,sweepAt=84){
      if(this.failed)return{active:false,reason:'asset-failed'};
      const frame=sample(this.plan,stageTime,sweepAt);
      const wanted=new Set(frame.visible.map(i=>this.plan.rows[i].key));
      const nextIndex=Math.max(...frame.visible)+1,nextRow=this.plan.rows[nextIndex];
      const prefetch=frame.visible.length<=2&&nextRow&&frame.cameraTop-(nextRow.top+nextRow.height)<300;
      if(prefetch)wanted.add(nextRow.key);
      this.desired=wanted;
      // Release the section that left the viewport before allocating the next.
      const oldest=Math.min(...frame.visible);
      for(let i=0;i<oldest;i++){
        const sprite=this.sprites.get(i);
        if(sprite){sprite.destroy();this.sprites.delete(i);}
        const key=this.plan.rows[i].key;
        if(this.scene.textures.exists(key))this.scene.textures.remove(key);
      }
      // A 720px section with 120px overlaps briefly exposes three sections.
      // Load at most one section ahead of the visible set; never prefetch a fourth.
      if(prefetch)this.queue(nextIndex);
      for(const i of frame.visible)this.queue(i);
      for(const key of this.pending)if(this.scene.textures.exists(key)){
        this.pending.delete(key);
        if(!this.desired.has(key))this.scene.textures.remove(key);
      }
      if(frame.visible.some(i=>!this.scene.textures.exists(this.plan.rows[i].key))){this.hide();return{...frame,active:false,reason:'loading'};}
      const keep=new Set(frame.visible);
      for(const i of frame.visible){
        const row=this.plan.rows[i];let sprite=this.sprites.get(i);
        if(!sprite){sprite=this.createSprite(i,row);this.sprites.set(i,sprite);}
        sprite.setPosition(240,row.top+row.height/2-frame.cameraTop).setDisplaySize(W,row.height).setVisible(true);
      }
      for(const [i,sprite] of this.sprites){if(!keep.has(i)){sprite.destroy();this.sprites.delete(i);}}
      for(let i=0;i<this.plan.rows.length;i++){
        const key=this.plan.rows[i].key;
        if(!keep.has(i)&&!this.pending.has(key)&&this.scene.textures.exists(key)){
          // Preserve the immediately upcoming section; old sections can reload on retry.
          const next=Math.max(...frame.visible)+1;
          if(i!==next)this.scene.textures.remove(key);
        }
      }
      this.updateLandmarks(frame,sweepAt);
      return{...frame,active:true};
    }
  }
  root.StarScenery={makePlan,sample,RouteRenderer};
  if(typeof module!=='undefined')module.exports=root.StarScenery;
})(typeof window!=='undefined'?window:globalThis);

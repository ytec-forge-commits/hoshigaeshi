"""Original STAR REBOUND audio. Deterministic, asset-only; numpy/scipy/ffmpeg required."""
from pathlib import Path
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter,sosfilt,fftconvolve
import subprocess,json,hashlib
P=Path(__file__).parent; SR=44100; DUR=64; N=SR*DUR; rng=np.random.default_rng(231026)
cache={}; music=np.zeros((N,2));piano=np.zeros_like(music);pad=np.zeros_like(music);drums=np.zeros_like(music);bass=np.zeros_like(music)
def stereo(x,pan=0):
 if x.ndim==1:return np.stack((x*np.sqrt((1-pan)/2),x*np.sqrt((1+pan)/2)),axis=1)
 return x*np.array([1-max(pan,0)*.6,1+min(pan,0)*.6])
def add(dst,x,sec,amp=1,pan=0):
 x=stereo(x,pan)*amp; at=int(round(sec*SR))%len(dst); remain=len(dst)-at
 if len(x)<=remain:dst[at:at+len(x)]+=x
 else:
  dst[at:]+=x[:remain];dst[:len(x)-remain]+=x[remain:]
def piano_sample(note,layer=1):
 key=(note,layer)
 if key in cache:return cache[key]
 idx=min(range(6,34,2),key=lambda k:abs(21+2*k-note));root=21+2*idx
 sr,x=wavfile.read(P/'samples'/f'Player_dyn{layer}_rr1_{idx:03}.wav')
 x=x.astype(float)/np.iinfo(x.dtype).max if np.issubdtype(x.dtype,np.integer) else x.astype(float)
 if x.ndim==1:x=np.stack((x,x),axis=1)
 e=np.max(np.abs(x),axis=1); start=np.flatnonzero(e>max(e.max()*.006,.00002))[0];x=x[max(0,start-int(sr*.002)):]
 pos=np.arange(0,len(x)-1,2**((note-root)/12)*sr/SR);x=np.stack([np.interp(pos,np.arange(len(x)),x[:,j]) for j in range(2)],axis=1)
 x*=.7/max(np.max(np.abs(x)),1e-8);cache[key]=x;return x

def pn(dst,n,t,v=.2,hold=.7,layer=1,pan=0):
 x=piano_sample(n,layer)[:int((hold+1.4)*SR)].copy();tt=np.arange(len(x))/SR
 x*= (np.minimum(tt/.002,1)*np.exp(-np.maximum(tt-hold,0)*5))[:,None];add(dst,x,t,v,pan)
def low(x,hz):return sosfilt(butter(2,hz,fs=SR,output='sos'),x,axis=0)
def osc(n,dur):
 t=np.arange(int(SR*dur))/SR;f=440*2**((n-69)/12)
 return t,f
# D minor/add9 -> B-flat major 7 -> F major/add9 -> C suspended/A; original 8-bar harmonic sentence.
chords=[[38,57,62,65,69,76],[38,57,62,65,69,74],[34,53,58,62,65,72],[34,53,58,62,69,74],[41,53,57,60,65,72],[41,57,60,65,69,76],[36,55,60,62,67,74],[33,55,60,64,67,73]]
melodies=[[(0,74),(.75,77),(1.5,76),(2.5,69),(3,74)],[(.5,72),(1.5,69),(2,65),(3,69)],[(0,70),(1,74),(1.75,77),(2.5,74),(3.5,72)],[(0,69),(1.5,65),(2.5,62),(3,65)],[(.5,69),(1,72),(2,77),(3,76)],[(0,74),(1,72),(1.5,69),(2.5,72),(3.25,76)],[(0,74),(1,79),(2,77),(3,74)],[(.5,73),(1.5,76),(2.5,73),(3.5,69)]]
for bar in range(32):
 ch=chords[bar%8];sec=bar*2; phase=bar//8; level=[.85,1,.68,1.07][phase]
 # Real recorded piano is the foreground, not a token layer.
 for j,n in enumerate(ch[1:5]):pn(piano,n,sec+j*.018,.105*level,1.45,1,(j-1.5)*.18)
 arp=[2,3,4,3,2,4,5,3]
 for j,i in enumerate(arp):
  pn(piano,ch[i]+(12 if phase==3 and j in (5,7) else 0),sec+j*.25+.006,.135*level*(.83 if j%2 else 1),.21,1,(-.38 if j%2 else .38))
 for j,(bt,n) in enumerate(melodies[bar%8]):
  pn(piano,n+(12 if phase==2 and bar%2==0 else 0),sec+bt*.5,.29*level,.45 if j<4 else .65,2,.12)
 # Solid octave bass, gently overdriven harmonics, with breathing rhythmic envelope.
 for bt,ln,g in [(0,.39,1),(1.5,.21,.75),(2,.39,.92),(3,.23,.7),(3.5,.22,.8)]:
  t,f=osc(ch[0]-12,ln+.13);env=(1-np.exp(-t*110))*np.exp(-t*2.4)*np.minimum(1,np.maximum(0,(ln+.13-t)/.09))
  x=(np.sin(2*np.pi*f*t)+.30*np.sin(2*np.pi*f*2*t)+.12*np.sin(2*np.pi*f*3*t))*env
  add(bass,x,sec+bt*.5,.33*g*level)
 # Soft stereo ensemble built from detuned sinusoidal partials; no sharp saw/beeps.
 t=np.arange(int(2.65*SR))/SR;env=np.minimum(t/.33,1)*np.minimum((2.65-t)/.65,1)
 for i,n in enumerate(ch[1:5]):
  f=440*2**((n-69)/12);x=np.zeros((len(t),2))
  for side in range(2):
   for h,g in [(1,1),(2,.20),(3,.07)]:x[:,side]+=g*np.sin(2*np.pi*f*h*(1+(-1 if side else 1)*.0015)*t+i*.7+side*.23)
  x*=env[:,None]*(.025 if phase!=2 else .04);add(pad,x,sec-.15)
 # Electronic-acoustic-style low kick, short brush snare, filtered shaker.
 kickbeats=[0,1.5,2,3.5] if phase!=2 else [0,2]
 for bt in kickbeats:
  t=np.arange(int(.34*SR))/SR;f=48+100*np.exp(-t*35);ph=2*np.pi*np.cumsum(f)/SR
  x=np.sin(ph)*(1-np.exp(-t*650))*np.exp(-t*13)+low(rng.normal(size=len(t)),1500)*np.exp(-t*100)*.11
  add(drums,x,sec+bt*.5,.48*level)
 for bt in [1,3]:
  t=np.arange(int(.20*SR))/SR;noise=rng.normal(size=len(t));noise=low(noise,5500)-low(noise,750)
  x=(noise*.48+np.sin(2*np.pi*185*t)*.22)*np.exp(-t*23)*(1-np.exp(-t*900))
  add(drums,x,sec+bt*.5,.37*level,-.09)
 for j in range(8):
  t=np.arange(int(.09*SR))/SR;noise=rng.normal(size=len(t));x=(low(noise,10000)-low(noise,4300))*np.exp(-t*65)*(1-np.exp(-t*1200))
  add(drums,x,sec+j*.25,.13*level*(.55 if j%2==0 else 1),.45 if j%2 else -.35)
 if bar%8==7:
  for j in range(4):
   t=np.arange(int(.15*SR))/SR;x=np.sin(2*np.pi*(160-j*20)*t)*np.exp(-t*23)*(1-np.exp(-t*300));add(drums,x,sec+1.5+j*.125,.15,-.5+j*.33)
print('Notes rendered',flush=True)
# Circular room processing carries end tails into loop start rather than cutting them.
room=np.zeros_like(piano)
for d,g in [(.027,.10),(.047,.08),(.093,.065),(.375,.12),(.75,.065)]:room+=np.roll(piano[:,::-1],int(d*SR),axis=0)*g
L=int(SR*2.4);t=np.arange(L)/SR
for c in range(2):
 ir=low(rng.normal(size=L),4200)*np.exp(-t*2.5);ir[:int(.025*SR)]=0;ir/=np.sqrt(np.sum(ir**2))
 wet=fftconvolve(piano[:,c]+pad[:,c],ir);room[:,c]+=wet[:N]*.16;room[:len(wet)-N,c]+=wet[N:]*.16
music=piano+room+pad+bass+drums
# Circular filter history, restrained soft saturation; peak mastered by ffmpeg separately.
x=np.concatenate((music[-SR:],music));x=sosfilt(butter(2,32,fs=SR,btype='highpass',output='sos'),x,axis=0);x=low(x,14500)[SR:];x=np.tanh(x*1.13)/1.13
x*=.79/np.max(np.abs(x));wavfile.write(P/'masters/star-tide-premaster.wav',SR,x.astype(np.float32))
# Independently rendered original SFX; clear timbral roles, rounded transients.
def fxwrite(name,x):
 x=stereo(x);n=len(x);r=min(int(.012*SR),n//4);x[:r]*=np.linspace(0,1,r)[:,None];x[-r:]*=np.linspace(1,0,r)[:,None];x*=.68/max(np.max(np.abs(x)),1e-8)
 wavfile.write(P/f'masters/{name}.wav',SR,(x*32767).astype(np.int16))
def swoosh(dur,up=True):
 t=np.arange(int(SR*dur))/SR;noise=low(rng.normal(size=len(t)),4200)-low(rng.normal(size=len(t)),350);env=np.sin(np.pi*t/dur)**1.7
 return noise*env*.10
for name,notes,dur in [('capture',[74,81],.30),('return-burst',[62,69,74,81],.68),('victory',[62,69,74,77,81,86],2.15),('button',[74],.14)]:
 out=np.zeros((int(SR*dur),2))
 for i,n in enumerate(notes):
  at=i*(.09 if name=='victory' else .028);s=piano_sample(n,2)[:len(out)-int(at*SR)].copy();tt=np.arange(len(s))/SR;s*=np.exp(-tt*(3 if name=='victory' else 12))[:,None];start=int(at*SR);out[start:start+len(s)]+=s*.7
 if name=='return-burst':out+=stereo(swoosh(dur),-.1)
 fxwrite(name,out)
for name,dur,base in [('hit',.32,90),('enemy-pop',.20,260),('boss',1.45,55)]:
 t=np.arange(int(SR*dur))/SR;f=base*(1+.65*np.exp(-t*12));phase=2*np.pi*np.cumsum(f)/SR;env=(1-np.exp(-t*300))*np.exp(-t*(10 if name!='boss' else 3.3));x=np.sin(phase)*env*.45+swoosh(dur)*(.8 if name=='boss' else .5)
 if name=='boss':x+=np.sin(phase*1.5)*env*.17
 fxwrite(name,x)
print('Masters and SFX complete',flush=True)

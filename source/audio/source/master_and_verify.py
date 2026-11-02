from pathlib import Path
import subprocess, json, hashlib, numpy as np
from scipy.io import wavfile
P=Path(__file__).parent

def run(a):return subprocess.run(a,check=True,capture_output=True)
run(['ffmpeg','-y','-v','error','-i',str(P/'masters/star-tide-premaster.wav'),'-af','volume=-2.32dB','-c:a','pcm_s24le',str(P/'masters/star-tide-loop.wav')])
for src in [P/'masters/star-tide-loop.wav']+[p for p in (P/'masters').glob('*.wav') if not p.name.startswith('star-tide')]:
 out=P/'runtime'/f'{src.stem}.mp3'
 run(['ffmpeg','-y','-v','error','-i',str(src),'-c:a','libmp3lame','-b:a','112k' if src.stem=='star-tide-loop' else '96k','-ar','44100','-write_xing','1',str(out)])

def stats(x):
 return dict(peak_dbfs=float(20*np.log10(max(np.max(abs(x)),1e-12))),rms_dbfs=float(20*np.log10(max(np.sqrt(np.mean(x*x)),1e-12))),clipped_samples=int(np.sum(abs(x)>=1)),dc_offset=[float(v) for v in x.mean(axis=0)])
report={'hearing':'Not auditioned by a human or audio-capable model. All checks below are signal/decoder measurements, not subjective listening.','bpm':120,'bars':32,'loop_seconds':64,'runtime':{}}
for file in sorted((P/'runtime').glob('*.mp3')):
 d=run(['ffmpeg','-v','error','-i',str(file),'-f','f32le','-ac','2','-ar','44100','-']).stdout;x=np.frombuffer(d,np.float32).reshape(-1,2)
 s=stats(x);s.update(bytes=file.stat().st_size,decoded_frames=len(x),decoded_duration=len(x)/44100,sha256=hashlib.sha256(file.read_bytes()).hexdigest())
 if file.stem=='star-tide-loop':
  s.update(boundary_jump=[float(v) for v in abs(x[0]-x[-1])],normal_step_p99=[float(v) for v in np.percentile(abs(np.diff(x,axis=0)),99,axis=0)],start_50ms_rms=float(np.sqrt(np.mean(x[:2205]**2))),end_50ms_rms=float(np.sqrt(np.mean(x[-2205:]**2))),stereo_correlation=float(np.corrcoef(x.T)[0,1]),side_to_mid_db=float(20*np.log10(np.std(x[:,0]-x[:,1])/np.std(x[:,0]+x[:,1]))))
  wavfile.write(P/'qa/loop-boundary-audition.wav',44100,np.concatenate((x[-44100*3:],x[:44100*3])))
  for tag,source in [('master',P/'masters/star-tide-loop.wav'),('mp3',file)]:
   proc=run(['ffmpeg','-hide_banner','-i',str(source),'-af','loudnorm=I=-18:TP=-2:LRA=8:print_format=json','-f','null','-']);(P/f'qa/loudness-{tag}.txt').write_bytes(proc.stderr)
   txt=proc.stderr.decode();s['loudness_'+tag]=json.loads(txt[txt.rfind('{'):txt.rfind('}')+1])
 report['runtime'][file.name]=s
(P/'qa/audio-analysis.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))

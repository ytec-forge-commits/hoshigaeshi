"""Reproduce the approved 0:20-0:30 bell proposal; Python + NumPy + FFmpeg."""
from pathlib import Path
import argparse,hashlib,json,subprocess
import numpy as np

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--ffmpeg',default='ffmpeg');ap.add_argument('--out',type=Path,default=Path(__file__).resolve().parents[1]/'selected');args=ap.parse_args()
    sr=44100;seconds=.7;rows=[];args.out.mkdir(parents=True,exist_ok=True)
    for tier in range(4):
        x=np.zeros((round(.77*sr),2));notes=[60+2*tier,64+2*tier,67+2*tier]
        for j,note in enumerate(notes):
            t=np.arange(round(seconds*sr))/sr;f=440*2**((note-69)/12)
            tone=sum(a*np.sin(2*np.pi*f*h*t)*np.exp(-t*d) for h,a,d in [(1,1,4.5),(2,.18,11),(3,.04,20)])
            tone*=np.minimum(t/.006,1)*np.minimum((seconds-t)/.04,1)
            # Preserve the chosen demo's bell/shot/defeat balance at 40% SFX.
            tone*=.047/(.24*.95)/np.sqrt(2);at=round(j*.035*sr)
            x[at:at+len(tone)]+=tone[:,None]
        assert np.isfinite(x).all() and abs(x).max()<.95
        for ext,codec in [('ogg',['-c:a','libvorbis','-q:a','5']),('mp3',['-c:a','libmp3lame','-b:a','192k'])]:
            f=args.out/f'chain-bell-{tier+1}.{ext}'
            subprocess.run([args.ffmpeg,'-v','error','-y','-f','f32le','-ar',str(sr),'-ac','2','-i','-',*codec,'-map_metadata','-1',str(f)],input=x.astype('<f4').tobytes(),check=True)
            raw=subprocess.check_output([args.ffmpeg,'-v','error','-i',str(f),'-f','f32le','-ar',str(sr),'-ac','2','-']);decoded=np.frombuffer(raw,'<f4')
            assert np.isfinite(decoded).all() and abs(decoded).max()<.98
            rows.append({'file':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'notes_midi':notes,'seconds':len(decoded)/2/sr,'peak':float(abs(decoded).max()),'clipped_samples':int(np.sum(abs(decoded)>=1))})
    meta={'date':'2026-11-04','selection':'User confirmed 0:20-0:30 of chain-current-ABC.mp3 (proposal B).','origin':'Original additive synthesis for STAR REBOUND; no third-party recording.','license':'CC0-1.0 under the existing original synthesized asset policy.','recipe':{'sample_rate':sr,'partials_ratio_gain_decay':[[1,1,4.5],[2,.18,11],[3,.04,20]],'tone_seconds':.7,'onset_spacing_seconds':.035,'attack_seconds':.006,'release_seconds':.04,'note_gain':.047/(.24*.95),'equal_power_centre_pan':True},'policy':'Every five defeats; four authored voicings at 5/10/15/20, then repeat the fourth voicing. Coalesce simultaneous milestones.','outputs':rows}
    (args.out/'CHAIN_BELLS.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('PASS:',len(rows),'encodings; finite samples and zero clipping')

if __name__=='__main__':main()

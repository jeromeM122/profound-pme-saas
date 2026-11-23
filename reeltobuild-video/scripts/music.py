"""Musique originale + bruitages, entièrement synthétisés (aucun échantillon externe, aucun droit tiers).
Usage : python3 scripts/music.py   ->  public/audio/main.wav, public/audio/short.wav
"""
import json, os, wave
import numpy as np

SR = 48000
BPM = 96
BEAT = 60 / BPM
BAR = BEAT * 4
TL = json.load(open(os.path.join(os.path.dirname(__file__), '..', 'src', 'timeline.json')))
rng = np.random.default_rng(7)

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

# Progression (MIDI) : Dmaj9 · Bm9 · Gmaj9 · A6sus
CHORDS = [
    [50, 57, 61, 64, 66, 69],
    [47, 54, 57, 61, 62, 66],
    [43, 50, 54, 57, 59, 66],
    [45, 52, 54, 57, 62, 64],
]
ARP = [3, 4, 5, 4, 2, 3, 5, 4]  # indices dans l'accord, notes pincées en croches

def env_adsr(n, a, r):
    e = np.ones(n); a = max(1, int(a * SR)); r = max(1, int(r * SR))
    e[:a] = np.linspace(0, 1, a); e[-r:] *= np.linspace(1, 0, r); return e

def add(buf, start, sig, pan=0.0):
    i = int(start * SR)
    if i >= buf.shape[1]: return
    sig = sig[: buf.shape[1] - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * l; buf[1, i:i + len(sig)] += sig * r

def pad_note(f, dur, bright):
    t = np.arange(int(dur * SR)) / SR; s = np.zeros_like(t)
    for det in (-0.12, 0.12):
        ff = f * 2 ** (det / 12 / 4)
        for k in range(1, 7):
            s += (bright ** (k - 1)) / k * np.sin(2 * np.pi * ff * k * t + rng.uniform(0, 6.28))
    s *= 1 + 0.15 * np.sin(2 * np.pi * 0.25 * t)
    return s * env_adsr(len(t), 0.9, 1.2) * 0.05

def pluck(f, dur=0.9):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 18))
    s += 0.25 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 9)
    return s * np.exp(-t * 6.5) * env_adsr(len(t), 0.003, 0.05) * 0.10

def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 42 + 90 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) * 0.55

def hat(level=0.05):
    n = int(0.05 * SR); x = rng.standard_normal(n); x = np.diff(np.concatenate([[0], x]))
    return x * np.exp(-np.arange(n) / SR * 90) * level

def bass(f, dur):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 2 * f * t)
    return s * env_adsr(len(t), 0.02, 0.25) * 0.20

def noise_swell(dur, rise=True):
    n = int(dur * SR); x = rng.standard_normal(n)
    # passe-bas mobile simple
    out = np.zeros(n); a = np.linspace(0.02, 0.35, n) if rise else np.linspace(0.35, 0.02, n); y = 0.0
    for i in range(n):
        y += a[i] * (x[i] - y); out[i] = y
    e = np.linspace(0, 1, n) ** 2 if rise else np.linspace(1, 0, n) ** 2
    return out * e * 0.35

# ---------- bruitages ----------
def sfx(kind):
    t = lambda d: np.arange(int(d * SR)) / SR
    if kind == 'tap':
        tt = t(0.06); return np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 120) * 0.18
    if kind == 'tick':
        tt = t(0.03); return np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 220) * 0.06
    if kind == 'pop':
        tt = t(0.18); f = 520 + 600 * np.exp(-tt * 40)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 22) * 0.16
    if kind == 'whoosh':
        return noise_swell(0.45, True) * 0.7
    if kind == 'whoosh_soft':
        return noise_swell(0.35, True) * 0.35
    raise ValueError(kind)

def reverb(buf, secs=2.2, mix=0.28):
    n = int(secs * SR); ir = rng.standard_normal((2, n)) * np.exp(-np.arange(n) / SR * 3.2)
    ir[:, : int(0.01 * SR)] = 0
    L = buf.shape[1] + n; N = 1 << (L - 1).bit_length(); out = np.zeros_like(buf)
    for c in range(2):
        wet = np.fft.irfft(np.fft.rfft(buf[c], N) * np.fft.rfft(ir[c], N), N)[: buf.shape[1]]
        out[c] = buf[c] + mix * wet / np.abs(ir[c]).sum() * 40
    return out

def render(version):
    cfg = TL[version]; D = cfg['duration']; M = cfg['music']
    music = np.zeros((2, int((D + 0.5) * SR)))
    drums = np.zeros_like(music)
    nbars = int(np.ceil(M['final'] / BAR))
    for b in range(nbars):
        t0 = b * BAR; ch = CHORDS[b % 4]
        bright = 0.35 + 0.3 * min(1, t0 / max(1, M['final']))
        for j, m in enumerate(ch[1:]):
            dur = min(BAR + 1.3, M['final'] - t0 + 1.0)
            add(music, t0, pad_note(hz(m), dur, bright), pan=(j - 2.5) / 4)
        for k in range(8):
            ts = t0 + k * BEAT / 2
            if M['pluck'] <= ts < M['final']:
                add(music, ts, pluck(hz(ch[ARP[k]] + 12)), pan=0.35 if k % 2 else -0.35)
        for k in range(4):
            ts = t0 + k * BEAT
            if M['drums'][0] <= ts < M['drums'][1]:
                if k in (0, 2): add(drums, ts, kick())
                add(drums, ts + BEAT / 2, hat(0.05), pan=0.2)
                if k == 3: add(drums, ts + BEAT * 0.75, hat(0.03), pan=-0.2)
                if k in (0, 2): add(drums, ts, bass(hz(ch[0] - 12), BEAT * 1.8))
            elif ts < M['drums'][0] and ts >= 0.6 and M['pluck'] > 0:
                add(drums, ts, hat(0.025))  # tic-tac discret pendant le « problème »
    # riser avant la règle
    add(music, M['riser'] - 1.0, noise_swell(1.0) * 0.5)
    # accord final
    for j, m in enumerate([50, 57, 61, 64, 66, 69, 74]):
        add(music, M['final'], pad_note(hz(m), D - M['final'] + 0.4, 0.5) * 1.5, pan=(j - 3) / 4)
        add(music, M['final'] + j * 0.09, pluck(hz(m + 12), 2.5) * 0.8, pan=(j - 3) / 5)
    mix = reverb(music) + drums
    # bruitages
    fx = np.zeros_like(mix)
    for sc in cfg['scenes']:
        for (tl, kind) in TL['cues'].get(sc['id'], []):
            if tl < sc['offset'] or tl > sc['offset'] + sc['len'] * sc['rate']: continue
            add(fx, sc['start'] + (tl - sc['offset']) / sc['rate'], sfx(kind))
    out = mix + reverb(fx, 0.8, 0.15)
    out = out[:, : int(D * SR)]
    # fondus
    fi = int(0.4 * SR); fo = int(1.6 * SR)
    out[:, :fi] *= np.linspace(0, 1, fi); out[:, -fo:] *= np.linspace(1, 0, fo) ** 1.5
    out = np.tanh(out * 1.1) ; out /= np.abs(out).max(); out *= 10 ** (-1.5 / 20)
    os.makedirs('public/audio', exist_ok=True)
    with wave.open(f'public/audio/{version}.wav', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((out.T * 32767).astype('<i2').tobytes())
    print(version, D, 's ok')

if __name__ == '__main__':
    render('main'); render('short')

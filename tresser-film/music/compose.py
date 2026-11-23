"""Musique originale du film Tresser — composée par code, rendue avec FluidSynth
et la banque de sons FluidR3_GM (licence MIT). Aucun échantillon tiers : la
musique appartient au projet et peut être utilisée librement.

80 BPM, 4/4 -> 1 temps = 0,75 s, 1 mesure = 3 s.
  long  : 15 mesures = 45 s (coupes de montage calées sur les temps)
  court :  5 mesures = 15 s
Usage : python3 music/compose.py  (écrit music/out/*.mid et *.wav)
"""
import os, random, subprocess
import mido

BPM = 80
TPB = 480
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
SF2 = '/usr/share/sounds/sf2/FluidR3_GM.sf2'

# Accords (notes MIDI), tonalité de Ré bémol majeur, voicings ouverts et chauds
C = {
    'Db9':  [49, 56, 60, 63, 65, 68],      # Db Ab C Eb F Ab
    'Bbm9': [46, 53, 58, 60, 61, 65],      # Bb F Bb C Db F
    'Gb7':  [42, 49, 53, 58, 60, 65],      # Gb Db F Bb C F  (maj7#11 colour)
    'Absus': [44, 51, 56, 58, 61, 63],     # Ab Eb Ab Bb Db Eb
    'Ab':   [44, 51, 56, 60, 63, 67],      # Ab Eb Ab C Eb G (add9)
    'Fm7':  [41, 48, 53, 56, 60, 63],
}
BASS = {'Db9': 37, 'Bbm9': 34, 'Gb7': 30, 'Absus': 32, 'Ab': 32, 'Fm7': 29}

random.seed(7)


def beats(b):
    return int(b * TPB)


class Track:
    def __init__(self, name, ch, program, vol=100, pan=64):
        self.ev = []  # (tick, msg)
        self.ch = ch
        self.ev.append((0, mido.Message('program_change', channel=ch, program=program)))
        self.ev.append((0, mido.Message('control_change', channel=ch, control=7, value=vol)))
        self.ev.append((0, mido.Message('control_change', channel=ch, control=10, value=pan)))
        self.ev.append((0, mido.Message('control_change', channel=ch, control=91, value=90)))  # reverb send

    def note(self, start_beat, dur_beats, n, vel, human=0.0):
        t = beats(start_beat + random.uniform(-human, human)) if human else beats(start_beat)
        t = max(t, 0)
        v = max(1, min(127, int(vel + random.uniform(-6, 6))))
        self.ev.append((t, mido.Message('note_on', channel=self.ch, note=n, velocity=v)))
        self.ev.append((t + beats(dur_beats), mido.Message('note_off', channel=self.ch, note=n, velocity=0)))

    def cc(self, beat, control, value):
        self.ev.append((beats(beat), mido.Message('control_change', channel=self.ch, control=control, value=int(value))))

    def to_track(self):
        tr = mido.MidiTrack()
        last = 0
        for t, m in sorted(self.ev, key=lambda x: (x[0], x[1].type == 'note_on')):
            tr.append(m.copy(time=t - last)); last = t
        return tr


def build(plan, total_bars, name):
    """plan: liste de (accord, intensité 0..4) par mesure."""
    piano = Track('piano', 0, 0, vol=104, pan=60)        # Acoustic Grand
    pad = Track('pad', 1, 89, vol=70, pan=64)            # Warm Pad
    strings = Track('strings', 2, 49, vol=78, pan=72)    # Slow Strings
    bass = Track('bass', 3, 42, vol=74, pan=58)          # Cello (basse douce)
    harp = Track('harp', 4, 46, vol=66, pan=80)          # Harpe : pulsation discrète

    for bar, (ch, lvl) in enumerate(plan):
        b0 = bar * 4
        notes = C[ch]
        # pad : toujours, notes tenues
        for n in notes[1:5]:
            pad.note(b0, 4.0, n, 46 + lvl * 6)
        # piano : accord égrené + mélodie très simple
        if lvl <= 1:
            for i, n in enumerate([notes[0], notes[2], notes[4], notes[5] + 12]):
                piano.note(b0 + i * 0.5, 3.6 - i * 0.5, n + 12, 54 + lvl * 4, human=0.02)
        else:
            piano.note(b0, 3.8, notes[0] + 12, 60, human=0.01)
            for i, n in enumerate([notes[2], notes[3], notes[4], notes[5], notes[4] + 12, notes[3] + 12]):
                piano.note(b0 + 1 + i * 0.5, 1.2, n + 12, 50 + lvl * 3, human=0.015)
        # mélodie (piano aigu) sur les mesures intenses
        if lvl >= 3:
            top = notes[5] + 12
            for k, (o, d) in enumerate([(0, 1.5), (1.5, 0.5), (2, 2)]):
                piano.note(b0 + o, d, top + [0, -2, -3][k] + 12, 62, human=0.01)
        # basse
        if lvl >= 2:
            bass.note(b0, 3.9, BASS[ch], 64 + lvl * 4)
        # harpe en croches (pulsation) à partir de la découverte
        if lvl >= 2:
            seq = [notes[1], notes[3], notes[4], notes[5], notes[4], notes[3], notes[2], notes[3]]
            for i, n in enumerate(seq):
                harp.note(b0 + i * 0.5, 0.6, n + 12, 44 + lvl * 5, human=0.01)
        # cordes : élan sur les mesures fortes
        if lvl >= 3:
            for n in notes[1:4]:
                strings.note(b0, 4.0, n, 58 + (lvl - 3) * 10)

    # final : accord tenu
    end = total_bars * 4
    mid = mido.MidiFile(ticks_per_beat=TPB)
    meta = mido.MidiTrack()
    meta.append(mido.MetaMessage('set_tempo', tempo=mido.bpm2tempo(BPM), time=0))
    meta.append(mido.MetaMessage('end_of_track', time=beats(end + 4)))
    mid.tracks.append(meta)
    for t in (piano, pad, strings, bass, harp):
        mid.tracks.append(t.to_track())
    os.makedirs(OUT, exist_ok=True)
    mp = os.path.join(OUT, name + '.mid'); mid.save(mp)
    raw = os.path.join(OUT, name + '_raw.wav')
    subprocess.run(['fluidsynth', '-ni', '-g', '0.6', '-r', '48000', '-R', '1', '-C', '1',
                    '-o', 'synth.reverb.room-size=0.75', '-o', 'synth.reverb.width=0.9',
                    '-o', 'synth.reverb.level=0.75', '-F', raw, SF2, mp], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    dur = total_bars * 3.0
    wav = os.path.join(OUT, name + '.wav')
    # chaleur (léger filtrage des aigus), fondu de sortie, normalisation -16 LUFS
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af',
                    f'highpass=f=35,lowpass=f=12500,equalizer=f=250:t=q:w=1:g=1.5,'
                    f'afade=t=in:st=0:d=0.4,afade=t=out:st={dur - 2.2}:d=2.2,'
                    f'atrim=0:{dur},loudnorm=I=-16:TP=-1.5:LRA=9',
                    '-ar', '48000', wav], check=True)
    os.remove(raw)
    print('ok', wav)


LONG = [
    ('Db9', 0), ('Bbm9', 1),               # 0–6 s  identification
    ('Gb7', 1), ('Absus', 1),              # 6–12 s questions (suspendu)
    ('Db9', 2), ('Bbm9', 2),               # 12–18 s découverte
    ('Gb7', 3), ('Fm7', 3), ('Absus', 3),  # 18–27 s routine
    ('Db9', 3), ('Bbm9', 3),               # 27–33 s quiz
    ('Gb7', 4), ('Ab', 4),                 # 33–39 s communauté
    ('Gb7', 2), ('Db9', 1),                # 39–45 s signature
]
SHORT = [('Db9', 1), ('Bbm9', 2), ('Gb7', 3), ('Ab', 4), ('Db9', 1)]

if __name__ == '__main__':
    build(LONG, len(LONG), 'tresser_45s')
    build(SHORT, len(SHORT), 'tresser_15s')

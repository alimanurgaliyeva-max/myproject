let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Soft "whoosh" for regular piece moves
export function playMoveSound(enabled = true) {
  if (!enabled) return
  try {
    const ac = getCtx()
    const now = ac.currentTime
    const dur = 0.13

    const bufLen = Math.floor(ac.sampleRate * dur)
    const buf = ac.createBuffer(1, bufLen, ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.5)
    }

    const src = ac.createBufferSource()
    src.buffer = buf

    const filter = ac.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, now)
    filter.frequency.exponentialRampToValueAtTime(350, now + dur)
    filter.Q.value = 1.2

    const gain = ac.createGain()
    gain.gain.setValueAtTime(0.28, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(ac.destination)
    src.start(now)
  } catch (_) {}
}

// Snappy "thud + pop" for captures
export function playCaptureSound(enabled = true) {
  if (!enabled) return
  try {
    const ac = getCtx()
    const now = ac.currentTime

    // Low thud oscillator
    const osc = ac.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(280, now)
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.1)

    const oscGain = ac.createGain()
    oscGain.gain.setValueAtTime(0.45, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(oscGain)
    oscGain.connect(ac.destination)
    osc.start(now)
    osc.stop(now + 0.1)

    // Crisp noise click on top
    const clickLen = Math.floor(ac.sampleRate * 0.04)
    const clickBuf = ac.createBuffer(1, clickLen, ac.sampleRate)
    const clickData = clickBuf.getChannelData(0)
    for (let i = 0; i < clickLen; i++) {
      clickData[i] = (Math.random() * 2 - 1) * (1 - i / clickLen)
    }

    const clickSrc = ac.createBufferSource()
    clickSrc.buffer = clickBuf

    const hpf = ac.createBiquadFilter()
    hpf.type = 'highpass'
    hpf.frequency.value = 2000

    const clickGain = ac.createGain()
    clickGain.gain.setValueAtTime(0.18, now)

    clickSrc.connect(hpf)
    hpf.connect(clickGain)
    clickGain.connect(ac.destination)
    clickSrc.start(now)
  } catch (_) {}
}

/**
 * Standing Wave / VSWR Calculator
 * Animates a transmitted (incident) wave and a reflected wave travelling in
 * opposite directions, plots their sum, and computes the resulting VSWR.
 */
(function () {
    const canvas = document.getElementById('plot');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const a1Slider = document.getElementById('a1');
    const a2Slider = document.getElementById('a2');
    const speedSlider = document.getElementById('speed');
    const wlSlider = document.getElementById('wl');
    const a1val = document.getElementById('a1val');
    const a2val = document.getElementById('a2val');
    const speedval = document.getElementById('speedval');
    const wlval = document.getElementById('wlval');
    const invertBox = document.getElementById('invert');
    const playBtn = document.getElementById('playpause');
    const resetBtn = document.getElementById('reset');

    const gammaOut = document.getElementById('gammaOut');
    const vswrOut = document.getElementById('vswrOut');
    const rlOut = document.getElementById('rlOut');
    const vswrNote = document.getElementById('vswrNote');

    let A1 = parseFloat(a1Slider.value);
    let A2 = parseFloat(a2Slider.value);
    let speed = parseFloat(speedSlider.value);
    let numWavelengths = parseInt(wlSlider.value, 10);
    let invert = invertBox.checked;
    let playing = true;
    let t = 0;
    let lastTs = null;

    function fmt(v) { return v.toFixed(2); }

    function updateVSWR() {
        if (A1 <= 0) {
            gammaOut.textContent = '-';
            vswrOut.textContent = '-';
            rlOut.textContent = '-';
            vswrOut.classList.remove('warn');
            vswrNote.innerHTML = 'Set a non-zero transmitted amplitude (A&#8321;) to compute VSWR.';
            return;
        }
        const gamma = A2 / A1; // reflection coefficient magnitude
        gammaOut.textContent = fmt(gamma);
        rlOut.textContent = gamma > 0 ? (-20 * Math.log10(gamma)).toFixed(2) + ' dB' : '\u221e dB';

        if (gamma >= 1) {
            vswrOut.textContent = '\u221e';
            vswrOut.classList.add('warn');
            vswrNote.textContent = (gamma === 1)
                ? 'VSWR \u2192 \u221e: reflected amplitude equals transmitted amplitude (total reflection).'
                : 'VSWR is undefined here: reflected amplitude exceeds transmitted amplitude, which is non-physical for a passive reflection.';
        } else {
            const vswr = (1 + gamma) / (1 - gamma);
            vswrOut.textContent = fmt(vswr);
            vswrOut.classList.remove('warn');
            vswrNote.innerHTML = 'VSWR = (1 + |&Gamma;|) / (1 &minus; |&Gamma;|), with |&Gamma;| = A&#8322; / A&#8321; (reflected amplitude over transmitted amplitude).';
        }
    }

    a1Slider.addEventListener('input', () => { A1 = parseFloat(a1Slider.value); a1val.textContent = fmt(A1); updateVSWR(); });
    a2Slider.addEventListener('input', () => { A2 = parseFloat(a2Slider.value); a2val.textContent = fmt(A2); updateVSWR(); });
    speedSlider.addEventListener('input', () => { speed = parseFloat(speedSlider.value); speedval.textContent = fmt(speed) + '\u00d7'; });
    wlSlider.addEventListener('input', () => { numWavelengths = parseInt(wlSlider.value, 10); wlval.textContent = numWavelengths; });
    invertBox.addEventListener('change', () => { invert = invertBox.checked; });
    playBtn.addEventListener('click', () => {
        playing = !playing;
        playBtn.textContent = playing ? 'Pause' : 'Play';
        lastTs = null;
    });
    resetBtn.addEventListener('click', () => { t = 0; });

    a1val.textContent = fmt(A1);
    a2val.textContent = fmt(A2);
    speedval.textContent = fmt(speed) + '\u00d7';
    wlval.textContent = numWavelengths;
    updateVSWR();

    function resize() {
        const cssWidth = canvas.clientWidth || 880;
        const cssHeight = 360;
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw(cssWidth, cssHeight);
    }

    function getColor(varName) {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }

    function ampToPx(v, maxAmpPx, maxAmpUnits) {
        return (v / maxAmpUnits) * maxAmpPx;
    }

    function draw(width, height) {
        const gridColor = getColor('--border');
        const incidentColor = getColor('--incident');
        const reflectedColor = getColor('--reflected');
        const sumColor = getColor('--sum');
        const textColor = getColor('--muted');

        ctx.clearRect(0, 0, width, height);

        const midY = height / 2;
        const padX = 16;
        const plotW = width - padX * 2;
        const maxAmpPx = height * 0.34;
        const maxAmpUnits = 2.2;

        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padX, midY);
        ctx.lineTo(width - padX, midY);
        ctx.stroke();

        ctx.font = '11px -apple-system, sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.fillText('x \u2192', width - padX - 22, midY - 8);

        const k = (2 * Math.PI * numWavelengths) / plotW;
        const omega = 2.4;
        const N = 400;
        const reflSign = invert ? -1 : 1;

        ctx.strokeStyle = incidentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
            const px = padX + (plotW * i) / N;
            const xrel = px - padX;
            const y = A1 * Math.sin(k * xrel - omega * t);
            const py = midY - ampToPx(y, maxAmpPx, maxAmpUnits);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = reflectedColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
            const px = padX + (plotW * i) / N;
            const xrel = px - padX;
            const y = reflSign * A2 * Math.sin(k * xrel + omega * t);
            const py = midY - ampToPx(y, maxAmpPx, maxAmpUnits);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.strokeStyle = sumColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
            const px = padX + (plotW * i) / N;
            const xrel = px - padX;
            const y1 = A1 * Math.sin(k * xrel - omega * t);
            const y2 = reflSign * A2 * Math.sin(k * xrel + omega * t);
            const y = y1 + y2;
            const py = midY - ampToPx(y, maxAmpPx, maxAmpUnits);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    function frame(ts) {
        if (playing) {
            if (lastTs === null) lastTs = ts;
            const dt = (ts - lastTs) / 1000;
            lastTs = ts;
            t += dt * speed;
        } else {
            lastTs = null;
        }
        const cssWidth = canvas.clientWidth || 880;
        draw(cssWidth, 360);
        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(frame);
})();

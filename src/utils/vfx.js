
export const VFX = {
    createContainer: function(targetElement) {
        if (!targetElement) return null;
        const container = document.createElement('div');
        container.className = 'vfx-container';
        targetElement.appendChild(container);
        
        // Remove container after animation usually finishes
        setTimeout(() => {
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 2000);
        
        return container;
    },

    createContainerWithClass: function(targetElement, extraClassName) {
        const container = this.createContainer(targetElement);
        if (!container) return null;
        container.className = `vfx-container ${extraClassName || ''}`.trim();
        return container;
    },

    spawnUltimateCore: function(container, kind = 'impact') {
        const flash = document.createElement('div');
        flash.className = `vfx-ultimate-flash vfx-ultimate-${kind}`;
        container.appendChild(flash);

        const ring = document.createElement('div');
        ring.className = `vfx-ultimate-ring vfx-ultimate-${kind}`;
        container.appendChild(ring);

        for (let i = 0; i < 10; i++) {
            const shard = document.createElement('div');
            shard.className = `vfx-ultimate-shard vfx-ultimate-${kind}`;
            const angle = Math.random() * Math.PI * 2;
            const dist = 90 + Math.random() * 90;
            const tx = Math.cos(angle) * dist + 'px';
            const ty = Math.sin(angle) * dist + 'px';
            shard.style.setProperty('--tx', tx);
            shard.style.setProperty('--ty', ty);
            shard.style.setProperty('--rot', `${Math.round((angle * 180) / Math.PI)}deg`);
            shard.style.left = '50%';
            shard.style.top = '50%';
            shard.style.animationDelay = (Math.random() * 0.05) + 's';
            container.appendChild(shard);
        }
    },

    playFire: function(targetElement) {
        const container = this.createContainer(targetElement);
        if (!container) return;

        const core = document.createElement('div');
        core.className = 'vfx-fire-core';
        container.appendChild(core);

        // Spawn particles
        for (let i = 0; i < 8; i++) {
            const p = document.createElement('div');
            p.className = 'vfx-fire-particle';
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 50;
            const tx = Math.cos(angle) * dist + 'px';
            const ty = Math.sin(angle) * dist + 'px';
            p.style.setProperty('--tx', tx);
            p.style.setProperty('--ty', ty);
            p.style.left = '50%';
            p.style.top = '50%';
            container.appendChild(p);
        }
    },

    playWater: function(targetElement) {
        const container = this.createContainer(targetElement);
        if (!container) return;

        const spout = document.createElement('div');
        spout.className = 'vfx-water-spout';
        container.appendChild(spout);

        for (let i = 0; i < 5; i++) {
            const b = document.createElement('div');
            b.className = 'vfx-water-bubble';
            b.style.width = (10 + Math.random() * 20) + 'px';
            b.style.height = b.style.width;
            b.style.left = (20 + Math.random() * 60) + '%';
            b.style.bottom = '10%';
            b.style.animationDelay = (Math.random() * 0.3) + 's';
            container.appendChild(b);
        }
    },

    playEarth: function(targetElement) {
        const container = this.createContainer(targetElement);
        if (!container) return;

        const rock = document.createElement('div');
        rock.className = 'vfx-earth-rock';
        container.appendChild(rock);

        const dust = document.createElement('div');
        dust.className = 'vfx-earth-dust';
        container.appendChild(dust);
    },

    playAir: function(targetElement) {
        const container = this.createContainer(targetElement);
        if (!container) return;

        const tornado = document.createElement('div');
        tornado.className = 'vfx-air-tornado';
        container.appendChild(tornado);

        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            line.className = 'vfx-air-line';
            line.style.top = (20 + Math.random() * 60) + '%';
            line.style.left = (Math.random() * 20) + '%';
            line.style.animationDelay = (i * 0.1) + 's';
            container.appendChild(line);
        }
    },

    play: function(element, targetElement) {
        if (!element || !targetElement) return;
        
        switch(element) {
            case 'fire': this.playFire(targetElement); break;
            case 'water': this.playWater(targetElement); break;
            case 'earth': this.playEarth(targetElement); break;
            case 'air': this.playAir(targetElement); break;
        }
    },

    playUltimate: function(element, attackerElement, targetElement) {
        if (!element) return;

        if (attackerElement) {
            const c1 = this.createContainerWithClass(attackerElement, `vfx-ultimate vfx-ultimate-${element}`);
            if (c1) this.spawnUltimateCore(c1, 'charge');
        }
        if (targetElement) {
            const c2 = this.createContainerWithClass(targetElement, `vfx-ultimate vfx-ultimate-${element}`);
            if (c2) this.spawnUltimateCore(c2, 'impact');
        }
    },

    shakeStage: function(kind, stageId) {
        const stage = document.getElementById(stageId || 'rinha-battle-stage');
        if (!stage) return;
        stage.classList.remove('rinha-shake-pre', 'rinha-shake-hit');
        void stage.offsetWidth;
        stage.classList.add(kind === 'impact' ? 'rinha-shake-hit' : 'rinha-shake-pre');
        clearTimeout(this._shakeTimer);
        this._shakeTimer = setTimeout(() => {
            stage.classList.remove('rinha-shake-pre', 'rinha-shake-hit');
        }, kind === 'impact' ? 260 : 200);
    },

    /**
     * O galo atacante vira um clone em position:fixed e voa até o centro do alvo.
     * O original fica no slot (visibility) para o layout não pular.
     * onImpact dispara no contato, antes do retorno.
     */
    chargeStrike: function(attacker, target, style, hooks = {}) {
        const profile = CHARGE_PROFILES[style] || CHARGE_PROFILES.peck;
        const trail = TRAIL_COLOR[hooks.trail] ? hooks.trail : 'fire';
        const showTrail = hooks.fx !== false;
        const fireImpact = () => {
            try { hooks.onImpact?.(); } catch (err) { console.error(err); }
        };

        if (!attacker?.isConnected || !target?.isConnected) {
            fireImpact();
            return Promise.resolve();
        }

        const from = attacker.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        if (from.width < 4 || to.width < 4) {
            fireImpact();
            return Promise.resolve();
        }

        const face = readFacing(attacker);
        const ax = from.left + from.width / 2;
        const ay = from.top + from.height / 2;
        const tx = to.left + to.width / 2;
        const ty = to.top + to.height * 0.48;
        const fullDx = tx - ax;
        const fullDy = ty - ay;
        const dx = fullDx * profile.stop;
        const dy = fullDy * profile.stop;
        const dist = Math.hypot(fullDx, fullDy) || 1;
        const hopMag = Math.min(Math.max(from.height, 64) * 1.15, dist * Math.abs(profile.arc || 0.25));
        const hop = hopMag * Math.sign(profile.arc || -1);

        const clone = attacker.cloneNode(true);
        clone.removeAttribute('id');
        clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        clone.classList.remove('anim-hit', 'anim-lunge-up', 'anim-lunge-down', 'anim-wing-flap', 'active-rooster', 'inactive-rooster', 'target-rooster', 'anim-ko-l', 'anim-ko-r');
        clone.classList.add('charge-actor', 'anim-wing-flap');
        clone.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;margin:0;z-index:2800;pointer-events:none;visibility:visible;transition:none;transform:scale(${face},1)`;
        document.body.appendChild(clone);
        attacker.style.visibility = 'hidden';

        const xf = (x, y, s = 1) => `translate(${x}px, ${y}px) scale(${face * s}, ${s})`;
        const pecks = Math.max(1, profile.pecks || 1);
        const frames = [
            { transform: xf(0, 0, 1), offset: 0 },
            { transform: xf(fullDx * 0.05, hop * 0.14, 0.94), offset: 0.1 },
            { transform: xf(dx * 0.48, hop, 1.08), offset: 0.3 },
            { transform: xf(dx, dy, 1.14), offset: 0.46 }
        ];
        let cursor = 0.46;
        const room = 0.3;
        for (let i = 0; i < pecks; i++) {
            const jab = i % 2 === 0 ? 12 : -9;
            cursor += (room / pecks) * 0.42;
            frames.push({ transform: xf(dx + jab, dy + (i % 2 ? 5 : -6), 1.2), offset: roundOffset(cursor) });
            cursor += (room / pecks) * 0.58;
            frames.push({ transform: xf(dx, dy, 1.06), offset: roundOffset(Math.min(0.8, cursor)) });
        }
        frames.push({ transform: xf(dx * 0.32, hop * 0.22, 1), offset: 0.9 });
        frames.push({ transform: xf(0, 0, 1), offset: 1 });
        lockOffsets(frames);

        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const duration = Math.round(profile.duration * (reduced ? 0.62 : 1));
        if (showTrail) spawnChargeTrail(ax, ay, dx, dy, hop, trail, duration * 0.46);

        const anim = clone.animate(frames, { duration, easing: 'linear', fill: 'forwards' });
        let impacted = false;
        const impactTimer = setTimeout(() => {
            impacted = true;
            if (showTrail) spawnChargeBurst(to, trail);
            if (profile.self && attacker.isConnected) {
                const shell = document.createElement('div');
                shell.className = 'charge-shell';
                attacker.appendChild(shell);
                setTimeout(() => shell.remove(), 780);
            }
            if (style !== 'peck') this.shakeStage(style === 'ultimate' || style === 'quake' || style === 'breaker' ? 'impact' : 'pre', hooks.stageId);
            fireImpact();
        }, duration * 0.46);

        return new Promise(resolve => {
            let settled = false;
            const end = () => {
                if (settled) return;
                settled = true;
                clearTimeout(impactTimer);
                if (!impacted) fireImpact();
                if (clone.parentNode) clone.remove();
                if (attacker.isConnected) attacker.style.visibility = '';
                resolve();
            };
            anim.onfinish = end;
            setTimeout(end, duration + 90);
        });
    }
};

const CHARGE_PROFILES = {
    peck: { duration: 560, arc: -0.22, stop: 0.84, pecks: 1 },
    comet: { duration: 820, arc: -0.95, stop: 0.92, pecks: 1 },
    shell: { duration: 640, arc: 0.12, stop: 0.82, pecks: 1, self: true },
    wave: { duration: 980, arc: -0.05, stop: 0.98, pecks: 1 },
    brace: { duration: 620, arc: 0.48, stop: 0.62, pecks: 1 },
    quake: { duration: 860, arc: -0.68, stop: 0.88, pecks: 1 },
    dive: { duration: 760, arc: -1.12, stop: 0.76, pecks: 2 },
    flurry: { duration: 960, arc: -0.3, stop: 0.82, pecks: 3 },
    phoenix: { duration: 820, arc: -0.72, stop: 0.84, pecks: 1 },
    ultimate: { duration: 900, arc: -0.42, stop: 0.8, pecks: 2 },
    breaker: { duration: 740, arc: -0.36, stop: 0.92, pecks: 1 }
};

const TRAIL_COLOR = {
    fire: '#fb923c',
    water: '#38bdf8',
    earth: '#a3e635',
    air: '#e2e8f0'
};

function readFacing(el) {
    try {
        const t = getComputedStyle(el).transform;
        if (t && t !== 'none') {
            const m = new DOMMatrix(t);
            if (m.a < -0.01) return -1;
        }
    } catch (err) { /* o sprite interno já guarda o lado */ }
    return 1;
}

function roundOffset(n) {
    return Math.round(Math.min(0.99, Math.max(0.01, n)) * 1000) / 1000;
}

function lockOffsets(frames) {
    let last = -0.001;
    frames.forEach((frame, index) => {
        if (index === frames.length - 1) {
            frame.offset = 1;
            return;
        }
        if (frame.offset <= last) frame.offset = Math.min(0.97, last + 0.015);
        last = frame.offset;
    });
}

function spawnChargeTrail(ax, ay, dx, dy, hop, trail, ms) {
    const color = TRAIL_COLOR[trail] || '#fff';
    const layer = document.createElement('div');
    layer.className = 'charge-layer';
    document.body.appendChild(layer);
    for (let i = 0; i < 12; i++) {
        const spark = document.createElement('div');
        spark.className = 'charge-spark';
        spark.style.background = color;
        spark.style.color = color;
        spark.style.left = ax + 'px';
        spark.style.top = ay + 'px';
        spark.style.width = spark.style.height = (6 + (i % 3) * 3) + 'px';
        spark.animate([
            { transform: 'translate(-4px, -4px) scale(1)', opacity: 0.95 },
            { transform: `translate(${dx * 0.5}px, ${hop}px) scale(0.75)`, opacity: 0.85, offset: 0.5 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0 }
        ], { duration: Math.max(180, ms), delay: i * 18, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
        layer.appendChild(spark);
    }
    setTimeout(() => layer.remove(), ms + 520);
}

function spawnChargeBurst(rect, trail) {
    const color = TRAIL_COLOR[trail] || '#fff';
    const burst = document.createElement('div');
    burst.className = `charge-burst charge-burst--${trail}`;
    burst.style.left = (rect.left + rect.width / 2) + 'px';
    burst.style.top = (rect.top + rect.height * 0.45) + 'px';
    for (let i = 0; i < 8; i++) {
        const chip = document.createElement('i');
        chip.className = 'charge-chip';
        const ang = (Math.PI * 2 * i) / 8;
        chip.style.background = color;
        chip.style.setProperty('--cx', Math.cos(ang) * 46 + 'px');
        chip.style.setProperty('--cy', Math.sin(ang) * 34 + 'px');
        burst.appendChild(chip);
    }
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 520);
}

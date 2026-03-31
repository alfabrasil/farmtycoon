
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
    }
};

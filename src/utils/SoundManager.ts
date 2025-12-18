export class SoundManager {
    private ctx: AudioContext | null = null;

    constructor() {
        // Automatically set up global unlock listeners
        if (typeof window !== 'undefined') {
            const unlockHandler = () => {
                this.unlock();
                // Remove listeners once triggers
                window.removeEventListener('touchstart', unlockHandler);
                window.removeEventListener('click', unlockHandler);
                window.removeEventListener('keydown', unlockHandler);
            };

            window.addEventListener('touchstart', unlockHandler, { passive: true });
            window.addEventListener('click', unlockHandler, { passive: true });
            window.addEventListener('keydown', unlockHandler, { passive: true });
        }
    }

    unlock() {
        // Synchronous check and create
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) { return; }
        }

        // Synchronous resume call (don't await here for the interaction token)
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => console.warn('Audio resume failed', e));
        }

        // Play silent sound instantly
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            gain.gain.value = 0.001;
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(0);
            osc.stop(this.ctx.currentTime + 0.01);
        } catch (e) {
            // Ignore (context might not be ready)
        }
    }

    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        // Try to create if missing (defensive)
        if (!this.ctx) {
            this.ensureContext();
        }
    }

    private ensureContext() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) { return null; }
        }
        return this.ctx;
    }

    playBeep() {
        if (!this.ctx) return;
        const ctx = this.ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    playCountdown() {
        if (!this.ctx) return;
        const ctx = this.ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    playSuccess() {
        if (!this.ctx) return;
        const ctx = this.ctx;

        // A Major chord arpeggio or chime
        const freqs = [554.37, 659.25, 880]; // C#5, E5, A5
        freqs.forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);

            gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 1); // Decay 1s

            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 1);
        });
    }
}

export const soundManager = new SoundManager();

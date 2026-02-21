import { useEffect, useRef } from 'react';

export function useEngineSound(active: boolean, timeScale: number, muted: boolean = false) {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscillator1Ref = useRef<OscillatorNode | null>(null);
    const oscillator2Ref = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        if (active && !muted) {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

                // Main low hum oscillator
                oscillator1Ref.current = audioCtxRef.current.createOscillator();
                oscillator1Ref.current.type = 'sawtooth';

                // Secondary pulsating oscillator
                oscillator2Ref.current = audioCtxRef.current.createOscillator();
                oscillator2Ref.current.type = 'sine';

                gainNodeRef.current = audioCtxRef.current.createGain();

                oscillator1Ref.current.connect(gainNodeRef.current);
                oscillator2Ref.current.connect(gainNodeRef.current);
                gainNodeRef.current.connect(audioCtxRef.current.destination);

                oscillator1Ref.current.start();
                oscillator2Ref.current.start();
            }

            const ctx = audioCtxRef.current;
            const osc1 = oscillator1Ref.current;
            const osc2 = oscillator2Ref.current;
            const gainNode = gainNodeRef.current;

            if (ctx && osc1 && osc2 && gainNode) {
                if (ctx.state === 'suspended') ctx.resume();

                const baseFreq = 40 + (Math.log10(timeScale + 1) * 20);
                osc1.frequency.setTargetAtTime(baseFreq, ctx.currentTime, 0.1);
                osc2.frequency.setTargetAtTime(baseFreq * 1.5, ctx.currentTime, 0.1);

                // Set gain based on activity and mute
                gainNode.gain.setTargetAtTime(0.05, ctx.currentTime, 0.1);
            }
        } else {
            if (gainNodeRef.current && audioCtxRef.current) {
                gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
            }
        }
    }, [active, timeScale, muted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);
}

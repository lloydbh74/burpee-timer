import { useState, useEffect, useRef, useCallback } from 'react';
import type { SessionResult, SessionParams } from '../utils/calculator';

export interface TimerState {
    elapsedTime: number; // Total seconds elapsed
    currentRep: number; // 1-indexed, relative to set
    totalRepsCompleted: number; // Global rep count
    currentSet: number; // 1-indexed
    isWorkPhase: boolean; // true = working, false = resting
    isFinished: boolean; // session done
    phaseTimeElapsed: number; // Time spent in current phase (work or rest)
    phaseDuration: number; // Total duration of current phase
}



export function usePreciseTimer(
    sessionResult: SessionResult,
    sessionParams: SessionParams,
    isActive: boolean
) {
    const [timerState, setTimerState] = useState<TimerState>({
        elapsedTime: 0,
        currentRep: 1,
        totalRepsCompleted: 0,
        currentSet: 1,
        isWorkPhase: true,
        isFinished: false,
        phaseTimeElapsed: 0,
        phaseDuration: 0,
    });

    const startTimeRef = useRef<number | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const totalPausedTimeRef = useRef<number>(0);
    const lastPauseTimeRef = useRef<number | null>(null);

    const calculateState = useCallback((elapsed: number): TimerState => {
        // 1. Check for finish
        const TOTAL_DURATION = 1200; // 20 mins
        if (elapsed >= TOTAL_DURATION) {
            return {
                elapsedTime: TOTAL_DURATION,
                currentRep: sessionParams.totalReps, // capped
                totalRepsCompleted: sessionParams.totalReps,
                currentSet: sessionResult.numSets,
                isWorkPhase: false,
                isFinished: true,
                phaseTimeElapsed: 0,
                phaseDuration: 0,
            };
        }

        // 2. Determine Set and Phase
        let timeAccumulator = 0;
        let currentSet = 1;
        let isWorkPhase = true;
        let phaseTimeElapsed = 0;
        let phaseDuration = 0;
        let totalRepsDone = 0;
        let currentRepInSet = 1;

        // Iterate through sets to find where we are
        for (let i = 1; i <= sessionResult.numSets; i++) {
            // Calculate Reps in this specific set
            // Standard sets have `setSize`. Last set has remainder.
            const previousReps = (i - 1) * sessionParams.setSize;
            const repsRemaining = sessionParams.totalReps - previousReps;
            const repsInThisSet = Math.min(sessionParams.setSize, repsRemaining);

            const workDuration = repsInThisSet * sessionResult.timePerRep;
            const restDuration = sessionResult.restPerSet;

            // Check if in Work Phase
            if (elapsed < timeAccumulator + workDuration) {
                currentSet = i;
                isWorkPhase = true;
                phaseTimeElapsed = elapsed - timeAccumulator;
                phaseDuration = workDuration;

                // Calculate Reps
                const repsDoneInPhase = Math.floor(phaseTimeElapsed / sessionResult.timePerRep);
                currentRepInSet = Math.min(repsInThisSet, repsDoneInPhase + 1);
                totalRepsDone = previousReps + Math.min(repsInThisSet, repsDoneInPhase);
                // Wait, logic: currentRep is 1-indexed being done. totalRepsCompleted usually means *finished*.
                // Let's stick to totalRepsCompleted = fully finished reps.

                break;
            }
            timeAccumulator += workDuration;
            totalRepsDone += repsInThisSet; // All reps in this set done if we passed it

            // Check if in Rest Phase (ONLY if not last set)
            if (i < sessionResult.numSets) {
                if (elapsed < timeAccumulator + restDuration) {
                    currentSet = i;
                    isWorkPhase = false;
                    phaseTimeElapsed = elapsed - timeAccumulator;
                    phaseDuration = restDuration;
                    currentRepInSet = 0; // No rep during rest
                    break;
                }
                timeAccumulator += restDuration;
            }

            // If loop continues, we are past this set
        }

        // Handle edge case where we might slightly exceed accumulator due to float precision but not 1200
        // (Should be covered by loop, but if elapsed is very close to end boundary?)

        return {
            elapsedTime: elapsed,
            currentSet,
            currentRep: currentRepInSet,
            totalRepsCompleted: totalRepsDone,
            isWorkPhase,
            isFinished: false,
            phaseTimeElapsed,
            phaseDuration
        };

    }, [sessionResult, sessionParams]);

    useEffect(() => {
        if (isActive) {
            if (startTimeRef.current === null) {
                // First start
                startTimeRef.current = Date.now();
            } else if (lastPauseTimeRef.current !== null) {
                // Resume from pause
                const pauseDuration = Date.now() - lastPauseTimeRef.current;
                totalPausedTimeRef.current += pauseDuration;
                lastPauseTimeRef.current = null;
            }

            const loop = () => {
                const now = Date.now();
                // Effective elapsed time = real time - start time - paused time
                const effectiveElapsed = (now - startTimeRef.current!) - totalPausedTimeRef.current;
                const secondsElapsed = effectiveElapsed / 1000;

                setTimerState(calculateState(secondsElapsed));
                rafIdRef.current = requestAnimationFrame(loop);
            };

            rafIdRef.current = requestAnimationFrame(loop);
        } else {
            // Paused or stopped
            if (startTimeRef.current !== null && !timerState.isFinished) {
                lastPauseTimeRef.current = Date.now();
            }
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        }

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [isActive, calculateState, timerState.isFinished]);

    return timerState;
}

import { useMemo, useState, useEffect, useRef } from 'react';
import { calculateSession } from '../utils/calculator';
import type { SessionParams } from '../utils/calculator';
import { usePreciseTimer } from '../hooks/usePreciseTimer';
import { useWakeLock } from '../hooks/useWakeLock';
import { soundManager } from '../utils/SoundManager';
import { MetronomeBar } from './MetronomeBar';
import { RestScreen } from './RestScreen';
import './WorkoutSession.css';

interface Props {
    params: SessionParams;
    onExit: () => void;
}

export function WorkoutSession({ params, onExit }: Props) {
    const sessionResult = useMemo(() => calculateSession(params), [params]);
    const [isActive, setIsActive] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Wake Lock
    useWakeLock(isActive || hasStarted);

    // 5s Countdown before start
    const [startCountdown, setStartCountdown] = useState(5);

    useEffect(() => {
        if (!hasStarted) {
            const timer = setInterval(() => {
                setStartCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setHasStarted(true);
                        setIsActive(true);
                        soundManager.playSuccess(); // Start sound
                        return 0;
                    }
                    soundManager.playCountdown(); // Tick
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [hasStarted]);

    const timerState = usePreciseTimer(sessionResult, params, isActive);

    // Audio Triggers
    const prevRepRef = useRef(timerState.currentRep);
    const prevPhaseRef = useRef(timerState.isWorkPhase);
    const prevSetRef = useRef(timerState.currentSet);
    const lastPhaseTimeRef = useRef(0);

    useEffect(() => {
        // Rep Complete (Change in rep count during Work Phase)
        if (timerState.isWorkPhase && timerState.currentRep !== prevRepRef.current) {
            if (timerState.currentRep > 1) {
                soundManager.playBeep();
            }
        }
        prevRepRef.current = timerState.currentRep;

        // Phase Change (Work <-> Rest)
        if (timerState.isWorkPhase !== prevPhaseRef.current) {
            if (!timerState.isWorkPhase) {
                // Just entered Rest
                soundManager.playBeep();
            } else {
                // Just entered Work
                soundManager.playBeep();
            }
        }
        prevPhaseRef.current = timerState.isWorkPhase;

        // Set Complete
        if (timerState.currentSet !== prevSetRef.current) {
            soundManager.playSuccess();
        }
        prevSetRef.current = timerState.currentSet;

        // Rest Countdown
        if (!timerState.isWorkPhase) {
            const timeLeft = timerState.phaseDuration - timerState.phaseTimeElapsed;
            if (timeLeft <= 3.1 && timeLeft > 0.1) {
                const prevTimeLeft = timerState.phaseDuration - lastPhaseTimeRef.current;
                if (Math.ceil(timeLeft) < Math.ceil(prevTimeLeft)) {
                    soundManager.playCountdown();
                }
            }
        }
        lastPhaseTimeRef.current = timerState.phaseTimeElapsed;

        // Finished
        if (timerState.isFinished && isActive) {
            setIsActive(false);
            soundManager.playSuccess();
        }

    }, [timerState, isActive]);

    if (!hasStarted) {
        return (
            <div className="countdown-overlay">
                <div className="countdown-number">{startCountdown}</div>
                <p>Get Ready</p>
            </div>
        );
    }

    // Calculate Progress and Direction
    let progress = 0;
    if (timerState.isWorkPhase) {
        const timeInCurrentRep = timerState.phaseTimeElapsed % sessionResult.timePerRep;
        progress = timeInCurrentRep / sessionResult.timePerRep;
    }

    const direction = (timerState.currentRep % 2 !== 0) ? 'up' : 'down';

    return (
        <div className="workout-session">
            {timerState.isWorkPhase ? (
                <>
                    <MetronomeBar
                        progress={progress}
                        direction={direction}
                        isActive={isActive}
                    />
                    <div className="session-info">
                        <div className="rep-counter">
                            <span className="label">Rep</span>
                            <span className="value">{timerState.currentRep}</span>
                            <span className="total"> / {params.setSize}</span>
                        </div>

                        <div className="set-counter">
                            <span className="label">Set</span>
                            <span className="value">{timerState.currentSet}</span>
                            <span className="total"> / {sessionResult.numSets}</span>
                        </div>

                        <div className="total-counter">
                            Total: {timerState.totalRepsCompleted}
                        </div>
                    </div>
                </>
            ) : (
                <RestScreen
                    duration={timerState.phaseDuration}
                    elapsed={timerState.phaseTimeElapsed}
                />
            )}

            {timerState.isFinished && (
                <div className="finished-overlay">
                    <h1>Workout Complete!</h1>
                    <button onClick={onExit}>Done</button>
                </div>
            )}

            {!timerState.isFinished && (
                <button className="stop-btn" onClick={onExit}>Stop</button>
            )}
        </div>
    );
}

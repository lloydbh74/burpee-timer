import { useState } from 'react';
import type { SessionParams } from '../utils/calculator';
import { soundManager } from '../utils/SoundManager';
import './ConfigurationForm.css';

interface Props {
    onStart: (params: SessionParams) => void;
}

export function ConfigurationForm({ onStart }: Props) {
    const [totalReps, setTotalReps] = useState(100);
    const [setSize, setSetSize] = useState(10);
    const [ratio, setRatio] = useState(3); // 3:1 default

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Fallback unlock (fire and forget, synchronous-ish)
        soundManager.unlock();
        onStart({ totalReps, setSize, ratio });
    };

    return (
        <form className="config-form" onSubmit={handleSubmit}>
            <h2>Setup Workout</h2>

            <div className="form-group">
                <label htmlFor="reps">Total Reps: <span className="value">{totalReps}</span></label>
                <input
                    id="reps"
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={totalReps}
                    onChange={(e) => setTotalReps(Number(e.target.value))}
                />
            </div>

            <div className="form-group">
                <label htmlFor="setSize">Set Size: <span className="value">{setSize}</span></label>
                <div className="preset-buttons">
                    {[5, 10, 15, 20].map(s => (
                        <button
                            key={s}
                            type="button"
                            className={setSize === s ? 'active' : ''}
                            onClick={() => setSetSize(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="ratio">Work:Rest Ratio: <span className="value">{ratio}:1</span></label>
                <input
                    id="ratio"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={ratio}
                    onChange={(e) => setRatio(Number(e.target.value))}
                />
                <p className="hint">Higher ratio = Faster work, Less rest.</p>
            </div>

            <button type="submit" className="start-btn">Start Workout</button>
        </form>
    );
}

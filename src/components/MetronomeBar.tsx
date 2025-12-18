import './MetronomeBar.css';

interface Props {
    progress: number; // 0 to 1
    direction: 'up' | 'down';
    isActive: boolean;
}

export function MetronomeBar({ progress, direction, isActive }: Props) {
    // Logic: 
    // Up: Height 0% -> 100%
    // Down: Height 100% -> 0%
    // Progress passed is always 0->1 representing time elapsed in rep.

    const heightPercent = direction === 'up'
        ? progress * 100
        : (1 - progress) * 100;

    return (
        <div className="metronome-container">
            <div
                className="metronome-bar"
                style={{
                    height: `${heightPercent}%`,
                    opacity: isActive ? 1 : 0.3
                }}
            />
        </div>
    );
}

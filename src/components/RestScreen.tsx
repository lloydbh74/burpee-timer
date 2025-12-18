import './RestScreen.css';

interface Props {
    duration: number; // Total rest duration
    elapsed: number; // Elapsed time in rest
}

export function RestScreen({ duration, elapsed }: Props) {
    const timeLeft = Math.max(0, Math.ceil(duration - elapsed));
    const isFlashing = timeLeft <= 3 && timeLeft > 0;

    // Flash effect: if flashing, toggle opacity every 500ms? 
    // Or CSS animation? CSS animation is smoother.

    return (
        <div className={`rest-screen ${isFlashing ? 'flashing' : ''}`}>
            <div className="rest-content">
                <h2>REST</h2>
                <div className="countdown">{timeLeft}</div>
                <p>Get Ready</p>
            </div>
        </div>
    );
}

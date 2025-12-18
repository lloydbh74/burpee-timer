export interface SessionParams {
    totalReps: number;
    setSize: number;
    ratio: number; // Work:Rest
}

export interface SessionResult {
    timePerRep: number; // seconds
    restPerSet: number; // seconds
    numSets: number;
    totalWorkTime: number;
    totalRestTime: number;
}

export const SESSION_DURATION = 1200; // 20 minutes in seconds

export function calculateSession(params: SessionParams): SessionResult {
    const { totalReps, setSize, ratio } = params;

    // Calculate Number of Sets
    const numSets = Math.ceil(totalReps / setSize);

    // New Logic: Total Time = (NumSets * WorkPerSet) + ((NumSets - 1) * RestPerSet)
    // Constraint: WorkPerSet / RestPerSet = Ratio  => WorkPerSet = Ratio * RestPerSet

    // Equation: NumSets * (Ratio * Rest) + (NumSets - 1) * Rest = 1200
    // Rest * (NumSets * Ratio + NumSets - 1) = 1200
    // Rest = 1200 / (NumSets * Ratio + NumSets - 1)

    // Edge case: NumSets = 1. Denom = Ratio + 0 = Ratio. Wait equation:
    // 1 * (Ratio * Rest) + 0 = 1200. => Work = 1200. Correct.

    let restPerSet = 0;

    if (numSets > 1) {
        const denominator = (numSets * ratio) + (numSets - 1);
        restPerSet = SESSION_DURATION / denominator;
    } else {
        // Single set, no rest
        restPerSet = 0;
    }

    // Work per Rep
    // NOTE: sets might vary in size if totalReps is not multiple of setSize?
    // Current logic assumes uniform speed.
    // Last set might be smaller. 
    // Should we keep "Time Per Rep" constant? Yes.
    // We solved for "Time Per Set" assuming standard set size.
    // Actually, strictly: TotalWorkTime + TotalRestTime = 1200
    // TotalWorkTime = TotalReps * TimePerRep
    // TotalRestTime = (NumSets - 1) * RestPerSet
    // RestPerSet = (SetSize * TimePerRep) / Ratio ?? 
    // Usually "Work:Rest" is Set Time vs Rest Time.
    // So yes: SetTime / RestTime = Ratio.
    // So TimePerRep * SetSize / RestPerSet = Ratio.
    // RestPerSet = (TimePerRep * SetSize) / Ratio.

    // Equation: TotalReps * TimePerRep + (NumSets - 1) * ((TimePerRep * SetSize) / Ratio) = 1200
    // TimePerRep * [ TotalReps + (NumSets - 1) * (SetSize / Ratio) ] = 1200

    const term1 = totalReps;
    const term2 = (numSets - 1) * (setSize / ratio);

    const timePerRep = SESSION_DURATION / (term1 + term2);

    // Recalculate derived
    const totalWorkTime = timePerRep * totalReps;
    const totalRestTime = SESSION_DURATION - totalWorkTime;

    // Recalculate RestPerSet based on TimePerRep (consistency check)
    // RestPerSet = (SetSize * TimePerRep) / Ratio
    if (numSets > 1) {
        restPerSet = (timePerRep * setSize) / ratio;
    }

    return {
        timePerRep,
        restPerSet,
        numSets,
        totalWorkTime,
        totalRestTime
    };
}

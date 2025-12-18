import { describe, it, expect } from 'vitest';
import { calculateSession, SESSION_DURATION } from './calculator';

describe('calculateSession', () => {
    it('should sum up to total session duration approximately (1:1 Ratio, N Sets, N-1 Rests)', () => {
        // 100 reps, 10 set size => 10 sets.
        // 10 Sets, 9 Rests.
        // Ratio 1:1 => Work = Rest (per unit).
        // Equation: 10*T + 9*T = 19*T = 1200.
        // T = 1200 / 19 = 63.157...
        const params = { totalReps: 100, setSize: 10, ratio: 1 };
        const result = calculateSession(params);

        expect(result.numSets).toBe(10);
        // Work Time = 10 * 63.157... = 631.57...
        expect(result.totalWorkTime).toBeCloseTo(1200 * (10 / 19));

        // Rest Time = 9 * 63.157... = 568.42...
        expect(result.totalRestTime).toBeCloseTo(1200 * (9 / 19));

        // Per Rep = Work / 100 = 6.315...
        expect(result.timePerRep).toBeCloseTo(6.3157);

        // Rest Per Set = 63.157...
        expect(result.restPerSet).toBeCloseTo(63.1578);

        // Verification
        // (TimePerRep * TotalReps) + (RestPerSet * (NumSets - 1))
        const calculatedTotal = (result.timePerRep * params.totalReps) + (result.restPerSet * (result.numSets - 1));
        expect(calculatedTotal).toBeCloseTo(SESSION_DURATION);
    });

    it('should handle high work ratio (9:1)', () => {
        // 200 reps, 10 set size => 20 sets. 19 rests.
        // Ratio 9 => Work = 9 * Rest.
        // (20 * 9R) + 19R = 1200
        // 180R + 19R = 199R = 1200
        // R = 1200 / 199 ≈ 6.03

        const params = { totalReps: 200, setSize: 10, ratio: 9 };
        const result = calculateSession(params);

        const R = 1200 / 199;
        expect(result.restPerSet).toBeCloseTo(R);
        expect(result.totalRestTime).toBeCloseTo(R * 19);
        expect(result.totalWorkTime).toBeCloseTo(1200 - (R * 19));

        const calculatedTotal = (result.timePerRep * params.totalReps) + (result.restPerSet * (result.numSets - 1));
        expect(calculatedTotal).toBeCloseTo(SESSION_DURATION);
    });

    it('should handle odd rep counts', () => {
        // 55 reps. 6 Sets. 5 Rests.
        // T_rep * (55 + 5*(10/3)) = 1200
        // T_rep * 71.666 = 1200
        // T_rep = 16.74418...
        // Rest = 10 * T_rep / 3 = 55.8139...

        const params = { totalReps: 55, setSize: 10, ratio: 3 };
        const result = calculateSession(params);

        expect(result.numSets).toBe(6);
        expect(result.restPerSet).toBeCloseTo(55.8139);

        const calculatedTotal = (result.timePerRep * params.totalReps) + (result.restPerSet * (result.numSets - 1));
        expect(calculatedTotal).toBeCloseTo(SESSION_DURATION);
    });
});

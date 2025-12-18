# Busy Dad Burpee Timer

A precision high-intensity interval timer web application designed specifically for the "Busy Dad Training" methodology.

## 🚀 Features

- **Precision Timing**: Drift-correction logic ensures the 20-minute timer remains perfectly synced to real-time.
- **Visual Metronome**: Smooth 60fps animation guides your rep cadence (Up for Rep 1, Down for Rep 2).
- **Smart Pacing Logic**: 
  - Calculates exact work/rest intervals based on your Total Rep goal.
  - Implements "N Sets, N-1 Rests" logic to maximize rep duration.
- **Audio Cues**:
  - Start/Stop signals.
  - Rep completion beeps.
  - 3-2-1 Countdown for workout start and rest intervals.
- **Screen Wake Lock**: Prevents your device from sleeping during the workout.
- **Customizable**:
  - Total Reps (50 - 500)
  - Set Size (5, 10, 15, 20)
  - Work:Rest Ratio (1:1 to 10:1)

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest
- **Audio**: Web Audio API (Native, no dependencies)
- **Styling**: Vanilla CSS (CSS Variables for theming)

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lloydbh74/burpee-timer.git
   ```
2. Navigate to the project directory:
   ```bash
   cd burpee-timer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

## 🧪 Running Tests

Run the unit tests for calculation logic:
```bash
npm run test
```

## 📄 License

This project is open source.

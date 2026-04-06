import { useState } from "react";

/*
  REP SHEET V2 — Active Workout Screen (Super Aimee Theme)

  Color palette extracted from Super Aimee illustrations:
  - Deep purple/navy backgrounds (#0F0A1A, #1A1028)
  - Hot magenta accent (#E91E8C)
  - Cyan/teal secondary (#00E5FF)
  - Mint green highlights (#7DFFC4)
  - Warm white text (#F0EAF4)
  - Muted purple for secondary text (#9B8FB0)

  Typography: Bold, athletic, uppercase headers
  Style: Neon glow effects, cyberpunk energy, sharp but not harsh
*/

const colors = {
  bg: "#0F0A1A",
  surface: "#1A1028",
  surfaceHover: "#241838",
  accent: "#E91E8C",
  accentGlow: "rgba(233, 30, 140, 0.3)",
  cyan: "#00E5FF",
  cyanGlow: "rgba(0, 229, 255, 0.2)",
  mint: "#7DFFC4",
  success: "#7DFFC4",
  failed: "#FF4D6A",
  pending: "#2A2040",
  textPrimary: "#F0EAF4",
  textSecondary: "#9B8FB0",
  textMuted: "#5E5278",
  border: "#2A2040",
  borderGlow: "#3D2E5C",
};

const exercises = [
  { name: "Barbell Squat", sets: 5, reps: 5, weight: 185, completedSets: [
    { reps: 5, weight: 185, status: "complete" },
    { reps: 5, weight: 185, status: "complete" },
    { reps: 5, weight: 185, status: "complete" },
    { reps: 3, weight: 185, status: "failed" },
    { reps: null, weight: null, status: "pending" },
  ]},
  { name: "Bench Press", sets: 5, reps: 5, weight: 135, completedSets: [
    { reps: null, weight: null, status: "pending" },
    { reps: null, weight: null, status: "pending" },
    { reps: null, weight: null, status: "pending" },
    { reps: null, weight: null, status: "pending" },
    { reps: null, weight: null, status: "pending" },
  ]},
  { name: "Hex Bar Deadlift", sets: 5, reps: 5, weight: 225, completedSets: [
    { reps: null, weight: null, status: "pending" },
    { reps: null, weight: null, status: "pending" },
    { reps: null, weight: null, status: "pending" },
    { reps: null, weight: null, status: "pending" },
    { reps: null, weight: null, status: "pending" },
  ]},
];

const navItems = [
  { icon: "⬡", label: "Home", active: false },
  { icon: "◆", label: "Workout", active: true },
  { icon: "☰", label: "History", active: false },
  { icon: "◫", label: "Calendar", active: false },
  { icon: "◉", label: "Body", active: false },
  { icon: "⊞", label: "Library", active: false },
  { icon: "⚙", label: "Settings", active: false },
];

function SetIndicator({ status, number }) {
  const bgColor = status === "complete" ? colors.success : status === "failed" ? colors.failed : colors.pending;
  const textColor = status === "pending" ? colors.textMuted : "#0F0A1A";
  const glow = status === "complete" ? `0 0 12px rgba(125, 255, 196, 0.4)` : status === "failed" ? `0 0 12px rgba(255, 77, 106, 0.4)` : "none";
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 8, backgroundColor: bgColor,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 800,
      color: textColor, transition: "all 0.2s ease", boxShadow: glow,
    }}>
      {status === "complete" ? "✓" : status === "failed" ? "✗" : number}
    </div>
  );
}

function RestTimer() {
  const [seconds, setSeconds] = useState(120);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div style={{
      backgroundColor: colors.surface, borderRadius: 14, padding: "20px 24px",
      border: `2px solid ${colors.accent}`, marginBottom: 16,
      boxShadow: `0 0 20px ${colors.accentGlow}, inset 0 0 20px ${colors.accentGlow}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: colors.accent, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 3 }}>REST</span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setSeconds(s => Math.max(0, s - 30))} style={{
            width: 48, height: 48, borderRadius: 10, backgroundColor: colors.surfaceHover,
            border: `1px solid ${colors.borderGlow}`, color: colors.textPrimary, fontSize: 22, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>−</button>
          <span style={{
            fontFamily: "'Inter', system-ui, sans-serif", fontSize: 52, fontWeight: 900,
            color: colors.accent, letterSpacing: -2, minWidth: 130, textAlign: "center",
            textShadow: `0 0 20px ${colors.accentGlow}`,
          }}>{mins}:{secs.toString().padStart(2, "0")}</span>
          <button onClick={() => setSeconds(s => s + 30)} style={{
            width: 48, height: 48, borderRadius: 10, backgroundColor: colors.surfaceHover,
            border: `1px solid ${colors.borderGlow}`, color: colors.textPrimary, fontSize: 22, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>+</button>
        </div>
        <button style={{
          padding: "10px 18px", borderRadius: 10, backgroundColor: "transparent",
          border: `1px solid ${colors.borderGlow}`, color: colors.textSecondary, fontSize: 12,
          fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif",
          textTransform: "uppercase", letterSpacing: 1.5,
        }}>SKIP</button>
      </div>
    </div>
  );
}

export default function ActiveWorkoutScreen() {
  const [activeExercise, setActiveExercise] = useState(0);
  const [weightInput, setWeightInput] = useState("185");
  const [repsInput, setRepsInput] = useState("5");
  const [showTimer, setShowTimer] = useState(true);

  return (
    <div style={{
      display: "flex", width: "100%", height: "100vh", backgroundColor: colors.bg,
      fontFamily: "'Inter', system-ui, sans-serif", color: colors.textPrimary,
      overflow: "hidden",
    }}>
      {/* Sidebar Nav */}
      <div style={{
        width: 76, backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}`,
        display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16,
        gap: 4, flexShrink: 0,
      }}>
        {/* Super Aimee Avatar */}
        <div style={{
          width: 48, height: 48, borderRadius: "50%", marginBottom: 16,
          border: `2px solid ${colors.accent}`,
          boxShadow: `0 0 12px ${colors.accentGlow}`,
          backgroundColor: colors.surfaceHover,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 800, color: colors.accent,
          letterSpacing: 0.5,
        }}>SA</div>

        {navItems.map((item, i) => (
          <div key={i} style={{
            width: 56, height: 56, borderRadius: 12, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", cursor: "pointer",
            backgroundColor: item.active ? colors.accent : "transparent",
            color: item.active ? "#FFFFFF" : colors.textMuted,
            boxShadow: item.active ? `0 0 16px ${colors.accentGlow}` : "none",
            transition: "all 0.15s ease",
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: 8, fontWeight: 700, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Exercise List Panel */}
      <div style={{
        width: 320, backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}`,
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        {/* Workout Header */}
        <div style={{
          padding: "20px 20px 16px", borderBottom: `1px solid ${colors.border}`,
          background: `linear-gradient(180deg, ${colors.surfaceHover} 0%, ${colors.surface} 100%)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: colors.accent, textTransform: "uppercase",
              letterSpacing: 3, textShadow: `0 0 10px ${colors.accentGlow}`,
            }}>5×5 WORKOUT A</span>
            <span style={{
              fontSize: 13, color: colors.cyan, fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}>38:12</span>
          </div>
          <div style={{ fontSize: 12, color: colors.textSecondary }}>
            Thursday, March 27, 2026
          </div>
        </div>

        {/* Exercise List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
          {exercises.map((ex, i) => {
            const isActive = i === activeExercise;
            return (
              <div key={i} onClick={() => setActiveExercise(i)} style={{
                padding: "16px", borderRadius: 12, marginBottom: 6, cursor: "pointer",
                backgroundColor: isActive ? colors.surfaceHover : "transparent",
                borderLeft: isActive ? `3px solid ${colors.accent}` : "3px solid transparent",
                boxShadow: isActive ? `inset 0 0 20px rgba(233, 30, 140, 0.08)` : "none",
                transition: "all 0.15s ease",
              }}>
                <div style={{
                  fontSize: 15, fontWeight: 700, marginBottom: 8,
                  color: isActive ? colors.textPrimary : colors.textSecondary,
                }}>{ex.name}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {ex.completedSets.map((set, j) => (
                    <SetIndicator key={j} status={set.status} number={j + 1} />
                  ))}
                </div>
                {ex.weight && (
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>
                    {ex.weight} lbs × {ex.reps} reps
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Exercise Button */}
          <button style={{
            width: "100%", padding: "14px", borderRadius: 12, border: `1px dashed ${colors.borderGlow}`,
            backgroundColor: "transparent", color: colors.textMuted, fontSize: 13, fontWeight: 600,
            cursor: "pointer", marginTop: 8, fontFamily: "'Inter', system-ui, sans-serif",
          }}>+ Add Exercise</button>
        </div>

        {/* Bottom Actions */}
        <div style={{ padding: "12px", borderTop: `1px solid ${colors.border}` }}>
          <button style={{
            width: "100%", padding: "14px", borderRadius: 12, backgroundColor: "transparent",
            border: `2px solid ${colors.failed}`, color: colors.failed, fontSize: 13, fontWeight: 800,
            cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif",
            textTransform: "uppercase", letterSpacing: 2,
          }}>End Workout</button>
        </div>
      </div>

      {/* Main Content — Active Set Logging */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", padding: "24px 32px",
        overflowY: "auto",
        background: `radial-gradient(ellipse at top right, rgba(233, 30, 140, 0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(0, 229, 255, 0.03) 0%, transparent 50%)`,
      }}>
        {/* Exercise Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontSize: 38, fontWeight: 900, margin: 0, letterSpacing: -1,
            textTransform: "uppercase",
            background: `linear-gradient(135deg, ${colors.textPrimary} 0%, ${colors.accent} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Barbell Squat</h1>
          <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 6 }}>
            Set 5 of 5 &nbsp;<span style={{ color: colors.cyan }}>·</span>&nbsp; Working weight: <span style={{ color: colors.cyan, fontWeight: 700 }}>185 lbs</span>
          </div>
        </div>

        {/* Rest Timer */}
        {showTimer && <RestTimer />}

        {/* Set Input */}
        <div style={{
          backgroundColor: colors.surface, borderRadius: 16, padding: "28px 32px",
          marginBottom: 20, border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: colors.cyan, textTransform: "uppercase",
            letterSpacing: 3, marginBottom: 20,
            textShadow: `0 0 10px ${colors.cyanGlow}`,
          }}>LOG SET 5</div>

          <div style={{ display: "flex", gap: 32, alignItems: "flex-end" }}>
            {/* Weight Input */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5 }}>
                Weight (lbs)
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setWeightInput(String(Math.max(0, Number(weightInput) - 5)))} style={{
                  width: 52, height: 64, borderRadius: 12, backgroundColor: colors.surfaceHover,
                  border: `1px solid ${colors.borderGlow}`, color: colors.textPrimary, fontSize: 24, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>−</button>
                <input value={weightInput} onChange={e => setWeightInput(e.target.value)} style={{
                  flex: 1, height: 64, borderRadius: 12, backgroundColor: colors.bg,
                  border: `2px solid ${colors.borderGlow}`, color: colors.textPrimary,
                  fontSize: 34, fontWeight: 900, textAlign: "center",
                  fontFamily: "'Inter', system-ui, sans-serif", outline: "none",
                  caretColor: colors.accent, fontVariantNumeric: "tabular-nums",
                }} onFocus={e => e.target.style.borderColor = colors.accent}
                   onBlur={e => e.target.style.borderColor = colors.borderGlow} />
                <button onClick={() => setWeightInput(String(Number(weightInput) + 5))} style={{
                  width: 52, height: 64, borderRadius: 12, backgroundColor: colors.surfaceHover,
                  border: `1px solid ${colors.borderGlow}`, color: colors.textPrimary, fontSize: 24, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>+</button>
              </div>
            </div>

            {/* Reps Input */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.5 }}>
                Reps
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setRepsInput(String(Math.max(0, Number(repsInput) - 1)))} style={{
                  width: 52, height: 64, borderRadius: 12, backgroundColor: colors.surfaceHover,
                  border: `1px solid ${colors.borderGlow}`, color: colors.textPrimary, fontSize: 24, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>−</button>
                <input value={repsInput} onChange={e => setRepsInput(e.target.value)} style={{
                  flex: 1, height: 64, borderRadius: 12, backgroundColor: colors.bg,
                  border: `2px solid ${colors.borderGlow}`, color: colors.textPrimary,
                  fontSize: 34, fontWeight: 900, textAlign: "center",
                  fontFamily: "'Inter', system-ui, sans-serif", outline: "none",
                  caretColor: colors.accent, fontVariantNumeric: "tabular-nums",
                }} onFocus={e => e.target.style.borderColor = colors.accent}
                   onBlur={e => e.target.style.borderColor = colors.borderGlow} />
                <button onClick={() => setRepsInput(String(Number(repsInput) + 1))} style={{
                  width: 52, height: 64, borderRadius: 12, backgroundColor: colors.surfaceHover,
                  border: `1px solid ${colors.borderGlow}`, color: colors.textPrimary, fontSize: 24, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>+</button>
              </div>
            </div>

            {/* Log Button */}
            <button style={{
              height: 64, padding: "0 44px", borderRadius: 12, backgroundColor: colors.accent,
              border: "none", color: "#FFFFFF", fontSize: 16, fontWeight: 900, cursor: "pointer",
              fontFamily: "'Inter', system-ui, sans-serif", textTransform: "uppercase",
              letterSpacing: 3, whiteSpace: "nowrap", transition: "all 0.15s ease",
              boxShadow: `0 0 24px ${colors.accentGlow}, 0 4px 12px rgba(0,0,0,0.3)`,
            }}>LOG SET</button>
          </div>
        </div>

        {/* Set History for Current Exercise */}
        <div style={{
          backgroundColor: colors.surface, borderRadius: 16, padding: "24px 32px",
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: colors.textMuted, textTransform: "uppercase",
            letterSpacing: 3, marginBottom: 16,
          }}>SET HISTORY</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exercises[0].completedSets.map((set, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "12px 16px",
                borderRadius: 10, backgroundColor: set.status === "pending" ? "transparent" : colors.bg,
                border: set.status === "pending" ? `1px dashed ${colors.border}` : `1px solid ${colors.border}`,
              }}>
                <SetIndicator status={set.status} number={i + 1} />
                <div style={{ flex: 1 }}>
                  {set.status !== "pending" ? (
                    <span style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                      {set.weight} lbs × {set.reps} reps
                    </span>
                  ) : (
                    <span style={{ fontSize: 14, color: colors.textMuted }}>—</span>
                  )}
                </div>
                {set.status === "failed" && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: colors.failed, textTransform: "uppercase", letterSpacing: 1 }}>
                    Failed at rep {set.reps}
                  </span>
                )}
                {set.status === "complete" && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: colors.success, textTransform: "uppercase", letterSpacing: 1 }}>
                    Complete
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Previous Session Reference */}
        <div style={{
          marginTop: 16, padding: "16px 20px", borderRadius: 14,
          backgroundColor: colors.surface, border: `1px solid ${colors.border}`,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 4, height: 40, borderRadius: 2, backgroundColor: colors.cyan,
            boxShadow: `0 0 8px ${colors.cyanGlow}`,
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6 }}>
              LAST SESSION — MAR 24
            </div>
            <div style={{ fontSize: 14, color: colors.textSecondary }}>
              185 lbs — 5/5/5/5/5 <span style={{ color: colors.success }}>✓</span>
              <span style={{ color: colors.textMuted }}>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
              <span style={{ color: colors.mint, fontWeight: 600 }}>↑ Increase to 190 lbs?</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

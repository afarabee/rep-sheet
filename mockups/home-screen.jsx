import { useState } from "react";

/*
  REP SHEET V2 — Home Screen (Super Aimee Theme)
  Landscape tablet layout with sidebar nav and Super Aimee hero
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
  textPrimary: "#F0EAF4",
  textSecondary: "#9B8FB0",
  textMuted: "#5E5278",
  border: "#2A2040",
  borderGlow: "#3D2E5C",
};

const navItems = [
  { icon: "⬡", label: "Home", active: true },
  { icon: "◆", label: "Workout", active: false },
  { icon: "☰", label: "History", active: false },
  { icon: "◫", label: "Calendar", active: false },
  { icon: "◉", label: "Body", active: false },
  { icon: "⊞", label: "Library", active: false },
  { icon: "⚙", label: "Settings", active: false },
];

const recentWorkouts = [
  { date: "Mar 24", type: "5×5 Workout A", status: "complete", exercises: "Squat · Bench · Hex Bar DL", duration: "52 min" },
  { date: "Mar 22", type: "5×5 Workout B", status: "complete", exercises: "Squat · OHP · Deadlift", duration: "48 min" },
  { date: "Mar 20", type: "Freeform", status: "complete", exercises: "Pull-ups · Rows · Curls · Abs", duration: "35 min" },
  { date: "Mar 19", type: "5×5 Workout A", status: "partial", exercises: "Squat · Bench (3/5) · Hex Bar DL", duration: "41 min" },
];

export default function HomeScreen() {
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

      {/* Main Content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", overflowY: "auto",
        background: `radial-gradient(ellipse at top right, rgba(233, 30, 140, 0.06) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(0, 229, 255, 0.04) 0%, transparent 50%)`,
      }}>
        {/* Hero Section */}
        <div style={{
          display: "flex", alignItems: "center", padding: "32px 40px 24px",
          gap: 40,
        }}>
          {/* Left: Title + Actions */}
          <div style={{ flex: 1 }}>
            {/* App Title */}
            <div style={{ marginBottom: 8 }}>
              <span style={{
                fontSize: 14, fontWeight: 800, color: colors.accent, textTransform: "uppercase",
                letterSpacing: 4, textShadow: `0 0 10px ${colors.accentGlow}`,
              }}>REP SHEET</span>
            </div>
            <h1 style={{
              fontSize: 44, fontWeight: 900, margin: "0 0 6px 0", letterSpacing: -1.5,
              lineHeight: 1.1,
            }}>
              Ready to lift,<br />
              <span style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.cyan} 100%)`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Super Aimee?</span>
            </h1>
            <div style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 28 }}>
              Next up: <span style={{ color: colors.cyan, fontWeight: 700 }}>5×5 Workout B</span>
              <span style={{ color: colors.textMuted }}>&nbsp;&nbsp;·&nbsp;&nbsp;</span>
              Training day: <span style={{ color: colors.mint, fontWeight: 600 }}>Today (Friday)</span>
            </div>

            {/* Primary Actions */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button style={{
                flex: 1, padding: "18px 24px", borderRadius: 14, backgroundColor: colors.accent,
                border: "none", color: "#FFFFFF", fontSize: 15, fontWeight: 800, cursor: "pointer",
                fontFamily: "'Inter', system-ui, sans-serif", textTransform: "uppercase",
                letterSpacing: 2, boxShadow: `0 0 24px ${colors.accentGlow}, 0 4px 12px rgba(0,0,0,0.3)`,
                transition: "all 0.15s ease",
              }}>Start 5×5 Workout B</button>
              <button style={{
                flex: 1, padding: "18px 24px", borderRadius: 14, backgroundColor: "transparent",
                border: `2px solid ${colors.cyan}`, color: colors.cyan, fontSize: 15, fontWeight: 800,
                cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif",
                textTransform: "uppercase", letterSpacing: 2,
                boxShadow: `0 0 12px ${colors.cyanGlow}`,
                transition: "all 0.15s ease",
              }}>Start Freeform</button>
            </div>

            {/* Template Button */}
            <button style={{
              width: "100%", padding: "14px 24px", borderRadius: 14, backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: 13,
              fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', system-ui, sans-serif",
              textTransform: "uppercase", letterSpacing: 1.5, textAlign: "left",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>Start from Template</span>
              <span style={{ color: colors.textMuted, fontSize: 12 }}>3 saved →</span>
            </button>
          </div>

          {/* Right: Super Aimee Hero Image placeholder */}
          <div style={{
            width: 280, height: 340, borderRadius: 20, flexShrink: 0,
            background: `linear-gradient(135deg, ${colors.surfaceHover} 0%, ${colors.surface} 100%)`,
            border: `1px solid ${colors.borderGlow}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative neon border glow */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 20,
              boxShadow: `inset 0 0 40px ${colors.accentGlow}, 0 0 30px ${colors.accentGlow}`,
              pointerEvents: "none",
            }} />
            {/* Placeholder for Super Aimee illustration */}
            <div style={{
              fontSize: 80, lineHeight: 1, marginBottom: 12, opacity: 0.6,
            }}>💪</div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase",
              letterSpacing: 2,
            }}>SUPER AIMEE</div>
            <div style={{
              fontSize: 11, color: colors.textMuted, marginTop: 4,
            }}>Hero illustration goes here</div>
          </div>
        </div>

        {/* Recent Workouts */}
        <div style={{ padding: "0 40px 32px" }}>
          <div style={{
            fontSize: 11, fontWeight: 800, color: colors.textMuted, textTransform: "uppercase",
            letterSpacing: 3, marginBottom: 14,
          }}>RECENT WORKOUTS</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {recentWorkouts.map((w, i) => (
              <div key={i} style={{
                padding: "16px 20px", borderRadius: 14, backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`, cursor: "pointer",
                transition: "all 0.15s ease",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{w.type}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                    padding: "3px 8px", borderRadius: 6,
                    backgroundColor: w.status === "complete" ? "rgba(125, 255, 196, 0.15)" : "rgba(255, 77, 106, 0.15)",
                    color: w.status === "complete" ? colors.mint : colors.failed,
                  }}>{w.status === "complete" ? "COMPLETE" : "PARTIAL"}</span>
                </div>
                <div style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>{w.exercises}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 12, color: colors.textMuted }}>{w.date}</span>
                  <span style={{ fontSize: 12, color: colors.textMuted }}>·</span>
                  <span style={{ fontSize: 12, color: colors.textMuted }}>{w.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div style={{ padding: "0 40px 32px" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "This Week", value: "3", unit: "workouts", color: colors.accent },
              { label: "Squat PR", value: "185", unit: "lbs (est 1RM: 208)", color: colors.cyan },
              { label: "Streak", value: "12", unit: "days", color: colors.mint },
            ].map((stat, i) => (
              <div key={i} style={{
                flex: 1, padding: "16px 20px", borderRadius: 14, backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>{stat.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{
                    fontSize: 32, fontWeight: 900, color: stat.color,
                    textShadow: `0 0 12px ${stat.color}33`,
                    fontVariantNumeric: "tabular-nums",
                  }}>{stat.value}</span>
                  <span style={{ fontSize: 12, color: colors.textSecondary }}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

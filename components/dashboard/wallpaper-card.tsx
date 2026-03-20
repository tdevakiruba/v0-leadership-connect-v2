"use client"

import { useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Download, Loader2, Smartphone, Brain, Target, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WallpaperCardProps {
  dayNumber: number
  phaseName: string
  phaseLabel: string
  quote: string | null
  mentalModel: string | null
  scoreMetric: string | null
  phaseColor: string
}

// Phase hex colors keyed by phase letter
const PHASE_COLORS: Record<string, { bg: string; text: string; accent: string; gradient: string }> = {
  S: { bg: "#0d9488", text: "#ffffff", accent: "#5eead4", gradient: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)" },
  I: { bg: "#2563eb", text: "#ffffff", accent: "#93c5fd", gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)" },
  G: { bg: "#7c3aed", text: "#ffffff", accent: "#c4b5fd", gradient: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)" },
  N: { bg: "#d97706", text: "#ffffff", accent: "#fcd34d", gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)" },
  A: { bg: "#dc2626", text: "#ffffff", accent: "#fca5a5", gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)" },
  L: { bg: "#0f766e", text: "#ffffff", accent: "#5eead4", gradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)" },
}

function getPhaseColors(phaseName: string) {
  const map: Record<string, string> = {
    "Self Awareness": "S",
    "Inner Clarity": "I",
    "Growth Mindset": "G",
    "Navigate Complexity": "N",
    "Authentic Leadership": "A",
    "Legacy & Impact": "L",
  }
  const letter = map[phaseName] || "S"
  return PHASE_COLORS[letter] || PHASE_COLORS["S"]
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/^[-*]\s/gm, "")
    .trim()
}

function extractMetricMeasure(scoreMetric: string): string {
  const stripped = stripMarkdown(scoreMetric)
  const firstSentence = stripped.split(/[.!?]/)[0]
  return firstSentence.length > 100
    ? firstSentence.substring(0, 97) + "..."
    : firstSentence
}

interface WallpaperPreviewProps {
  dayNumber: number
  phaseName: string
  phaseLabel: string
  quote: string | null
  mentalModel: string | null
  scoreMetric: string | null
}

// SVG Icons for inline rendering (html-to-image compatible)
const QuoteIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1" />
  </svg>
)

const BrainIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M12 18v-1a1 1 0 0 0-1-1H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 0-1 1v1" />
  </svg>
)

const TargetIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

// Reboot Logo SVG (simplified version)
const RebootLogoSVG = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#000000" />
    <path
      d="M20 8C13.4 8 8 13.4 8 20c0 6.6 5.4 12 12 12s12-5.4 12-12c0-2.4-0.7-4.6-1.9-6.5"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polygon points="24,12 24,6 28,9" fill="#ffffff" />
  </svg>
)

export function WallpaperPreview({
  dayNumber,
  phaseName,
  phaseLabel,
  quote,
  mentalModel,
  scoreMetric,
}: WallpaperPreviewProps) {
  const colors = getPhaseColors(phaseName)

  return (
    <div
      style={{
        width: "270px",
        height: "480px",
        background: "linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0f172a 100%)",
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Premium header with gradient */}
      <div
        style={{
          background: colors.gradient,
          padding: "20px 18px 18px",
          position: "relative",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />
        
        {/* Logo + Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", position: "relative" }}>
          <RebootLogoSVG size={28} />
          <div>
            <div style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>
              Leadership Reboot
            </div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.08em" }}>
              SIGNAL™
            </div>
          </div>
        </div>

        {/* Day badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <div style={{ fontSize: "7px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.accent }}>
            {phaseLabel} · {phaseName}
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(10px)",
              borderRadius: "10px",
              padding: "6px 12px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.accent }}>DAY</div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>{dayNumber}</div>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "16px 18px", gap: "14px" }}>
        {/* Quote section */}
        {quote && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              padding: "12px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <QuoteIcon color={colors.bg} size={12} />
              <span style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Today&apos;s Quote
              </span>
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 500,
                color: "#e2e8f0",
                lineHeight: 1.5,
                fontStyle: "italic",
                paddingLeft: "8px",
                borderLeft: `2px solid ${colors.bg}`,
              }}
            >
              &ldquo;{stripMarkdown(quote).substring(0, 120)}&rdquo;
            </div>
          </div>
        )}

        {/* Mental Model section */}
        {mentalModel && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              padding: "12px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <BrainIcon color={colors.bg} size={12} />
              <span style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Mental Model
              </span>
            </div>
            <div style={{ fontSize: "9px", fontWeight: 500, color: "#e2e8f0", lineHeight: 1.5 }}>
              {stripMarkdown(mentalModel).substring(0, 100)}
            </div>
          </div>
        )}

        {/* Success Metric section */}
        {scoreMetric && (
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.bg}15 0%, ${colors.bg}08 100%)`,
              borderRadius: "12px",
              padding: "12px",
              border: `1px solid ${colors.bg}30`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <TargetIcon color={colors.bg} size={12} />
              <span style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Success Metric
              </span>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#f8fafc", lineHeight: 1.4 }}>
              {extractMetricMeasure(scoreMetric)}
            </div>
          </div>
        )}
      </div>

      {/* Premium footer */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: "7px", color: colors.accent, fontWeight: 600, letterSpacing: "0.05em" }}>
          Reboot.TransformerHub.com
        </div>
        <div style={{ fontSize: "7px", color: "#64748b", fontWeight: 500 }}>
          Day {dayNumber} / 90
        </div>
      </div>
    </div>
  )
}

// Full-resolution wallpaper for download (1080×1920) - LinkedIn ready
function WallpaperExport({
  dayNumber,
  phaseName,
  phaseLabel,
  quote,
  mentalModel,
  scoreMetric,
}: WallpaperPreviewProps) {
  const colors = getPhaseColors(phaseName)

  return (
    <div
      style={{
        width: "1080px",
        height: "1920px",
        background: "linear-gradient(180deg, #0a0f1a 0%, #111827 40%, #0f172a 100%)",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Premium header with gradient */}
      <div
        style={{
          background: colors.gradient,
          padding: "80px 80px 70px",
          position: "relative",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.15) 0%, transparent 40%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "120px",
            background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)",
          }}
        />

        {/* Logo + Brand row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "50px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            <RebootLogoSVG size={80} />
            <div>
              <div style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", marginBottom: "4px" }}>
                Leadership Reboot
              </div>
              <div style={{ fontSize: "52px", fontWeight: 900, color: "#ffffff", letterSpacing: "0.12em" }}>
                SIGNAL™
              </div>
            </div>
          </div>

          {/* Day badge */}
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              backdropFilter: "blur(20px)",
              borderRadius: "32px",
              padding: "28px 48px",
              textAlign: "center",
              border: "2px solid rgba(255,255,255,0.15)",
              minWidth: "180px",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: colors.accent }}>DAY</div>
            <div style={{ fontSize: "88px", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>{dayNumber}</div>
          </div>
        </div>

        {/* Phase label */}
        <div style={{ fontSize: "26px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent, position: "relative" }}>
          {phaseLabel} · {phaseName}
        </div>
      </div>

      {/* Content sections */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "70px 80px", gap: "50px" }}>
        {/* Quote section */}
        {quote && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "32px",
              padding: "50px",
              border: "2px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
              <div style={{ background: `${colors.bg}20`, borderRadius: "16px", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QuoteIcon color={colors.bg} size={40} />
              </div>
              <span style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Today&apos;s Quote
              </span>
            </div>
            <div
              style={{
                fontSize: "42px",
                fontWeight: 500,
                color: "#e2e8f0",
                lineHeight: 1.5,
                fontStyle: "italic",
                paddingLeft: "36px",
                borderLeft: `6px solid ${colors.bg}`,
              }}
            >
              &ldquo;{stripMarkdown(quote).substring(0, 200)}&rdquo;
            </div>
          </div>
        )}

        {/* Mental Model section */}
        {mentalModel && (
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "32px",
              padding: "50px",
              border: "2px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
              <div style={{ background: `${colors.bg}20`, borderRadius: "16px", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BrainIcon color={colors.bg} size={40} />
              </div>
              <span style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Mental Model
              </span>
            </div>
            <div style={{ fontSize: "38px", fontWeight: 500, color: "#e2e8f0", lineHeight: 1.5 }}>
              {stripMarkdown(mentalModel).substring(0, 180)}
            </div>
          </div>
        )}

        {/* Success Metric section */}
        {scoreMetric && (
          <div
            style={{
              background: `linear-gradient(135deg, ${colors.bg}18 0%, ${colors.bg}08 100%)`,
              borderRadius: "32px",
              padding: "50px",
              border: `2px solid ${colors.bg}40`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
              <div style={{ background: `${colors.bg}30`, borderRadius: "16px", padding: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <TargetIcon color={colors.bg} size={40} />
              </div>
              <span style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Success Metric
              </span>
            </div>
            <div style={{ fontSize: "48px", fontWeight: 700, color: "#f8fafc", lineHeight: 1.35 }}>
              {extractMetricMeasure(scoreMetric)}
            </div>
          </div>
        )}
      </div>

      {/* Premium footer */}
      <div
        style={{
          background: "rgba(0,0,0,0.4)",
          borderTop: "2px solid rgba(255,255,255,0.06)",
          padding: "50px 80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <RebootLogoSVG size={48} />
          <div style={{ fontSize: "28px", color: colors.accent, fontWeight: 600, letterSpacing: "0.08em" }}>
            Reboot.TransformerHub.com
          </div>
        </div>
        <div style={{ fontSize: "28px", color: "#64748b", fontWeight: 500 }}>
          Day {dayNumber} / 90
        </div>
      </div>
    </div>
  )
}

// Main dialog + trigger button
export function WallpaperDownloadButton({
  dayNumber,
  phaseName,
  phaseLabel,
  quote,
  mentalModel,
  scoreMetric,
  variant = "outline",
}: WallpaperCardProps & { variant?: "outline" | "ghost" | "default" }) {
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  async function handleDownload() {
    if (!exportRef.current) return
    setDownloading(true)
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: 1080,
        height: 1920,
      })
      const link = document.createElement("a")
      link.download = `leadership-signal-day-${dayNumber}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Wallpaper download failed:", err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Smartphone className="h-4 w-4" />
        Save as Wallpaper
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Phone Wallpaper — Day {dayNumber}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground -mt-2">
            Preview your wallpaper below. Perfect for LinkedIn sharing or as a phone wallpaper (1080×1920 px).
          </p>

          {/* Preview (scaled down) */}
          <div className="flex justify-center py-2">
            <WallpaperPreview
              dayNumber={dayNumber}
              phaseName={phaseName}
              phaseLabel={phaseLabel}
              quote={quote}
              mentalModel={mentalModel}
              scoreMetric={scoreMetric}
            />
          </div>

          {/* Download button */}
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full gap-2"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Wallpaper
              </>
            )}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Off-screen full-res export target */}
      <div
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div ref={exportRef}>
          <WallpaperExport
            dayNumber={dayNumber}
            phaseName={phaseName}
            phaseLabel={phaseLabel}
            quote={quote}
            mentalModel={mentalModel}
            scoreMetric={scoreMetric}
          />
        </div>
      </div>
    </>
  )
}

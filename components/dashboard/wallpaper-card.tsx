"use client"

import { useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Download, Loader2, X, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface WallpaperCardProps {
  dayNumber: number
  phaseName: string
  phaseLabel: string
  quote: string | null
  mentalModel: string | null
  scoreMetric: string | null
  phaseColor: string // e.g. "teal", "blue" etc — used for inline styles
}

// Phase hex colors keyed by phase letter
const PHASE_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  S: { bg: "#0d9488", text: "#ffffff", accent: "#99f6e4" },
  I: { bg: "#2563eb", text: "#ffffff", accent: "#bfdbfe" },
  G: { bg: "#7c3aed", text: "#ffffff", accent: "#ddd6fe" },
  N: { bg: "#d97706", text: "#ffffff", accent: "#fde68a" },
  A: { bg: "#dc2626", text: "#ffffff", accent: "#fecaca" },
  L: { bg: "#0f766e", text: "#ffffff", accent: "#99f6e4" },
}

function getPhaseColors(phaseName: string) {
  // Map phase name to letter
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

// Strip markdown formatting for clean wallpaper text
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

// Extract just the metric measure (first sentence or short phrase)
function extractMetricMeasure(scoreMetric: string): string {
  const stripped = stripMarkdown(scoreMetric)
  // Take up to the first period or 120 chars
  const firstSentence = stripped.split(/[.!?]/)[0]
  return firstSentence.length > 120
    ? firstSentence.substring(0, 117) + "..."
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
    // 9:16 phone wallpaper ratio at a preview scale
    <div
      style={{
        width: "270px",
        height: "480px",
        backgroundColor: "#0f172a",
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top phase color bar */}
      <div
        style={{
          backgroundColor: colors.bg,
          padding: "20px 20px 16px",
          position: "relative",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: colors.accent,
                marginBottom: "2px",
              }}
            >
              Leadership Reboot
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: colors.text,
                letterSpacing: "0.08em",
              }}
            >
              SIGNAL™
            </div>
          </div>
          {/* Day badge */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "10px",
              padding: "6px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: colors.accent,
              }}
            >
              DAY
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: colors.text,
                lineHeight: 1,
              }}
            >
              {dayNumber}
            </div>
          </div>
        </div>

        {/* Phase label */}
        <div
          style={{
            fontSize: "8px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: colors.accent,
          }}
        >
          {phaseLabel} · {phaseName}
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          gap: "16px",
          overflowY: "hidden",
        }}
      >
        {/* Quote */}
        {quote && (
          <div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: colors.bg,
                marginBottom: "6px",
              }}
            >
              Today's Quote
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#e2e8f0",
                lineHeight: 1.55,
                fontStyle: "italic",
                borderLeft: `3px solid ${colors.bg}`,
                paddingLeft: "10px",
              }}
            >
              &ldquo;{stripMarkdown(quote).substring(0, 160)}&rdquo;
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />

        {/* Mental Model */}
        {mentalModel && (
          <div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: colors.bg,
                marginBottom: "6px",
              }}
            >
              Mental Model
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#e2e8f0",
                lineHeight: 1.55,
              }}
            >
              {stripMarkdown(mentalModel).substring(0, 140)}
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />

        {/* Success Metric */}
        {scoreMetric && (
          <div>
            <div
              style={{
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: colors.bg,
                marginBottom: "6px",
              }}
            >
              Success Metric
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#f8fafc",
                lineHeight: 1.4,
              }}
            >
              {extractMetricMeasure(scoreMetric)}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: "8px",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          leadershipreboot.com
        </div>
        <div
          style={{
            fontSize: "8px",
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          Day {dayNumber} / 90
        </div>
      </div>
    </div>
  )
}

// Full-resolution wallpaper for download (1080×1920)
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
        backgroundColor: "#0f172a",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top phase color section */}
      <div
        style={{
          backgroundColor: colors.bg,
          padding: "100px 90px 80px",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "60px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: colors.accent,
                marginBottom: "8px",
              }}
            >
              Leadership Reboot
            </div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: 900,
                color: colors.text,
                letterSpacing: "0.1em",
              }}
            >
              SIGNAL™
            </div>
          </div>
          {/* Day badge */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "40px",
              padding: "24px 40px",
              textAlign: "center",
              minWidth: "180px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: colors.accent,
              }}
            >
              DAY
            </div>
            <div
              style={{
                fontSize: "100px",
                fontWeight: 900,
                color: colors.text,
                lineHeight: 1,
              }}
            >
              {dayNumber}
            </div>
          </div>
        </div>

        {/* Phase label */}
        <div
          style={{
            fontSize: "30px",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.accent,
          }}
        >
          {phaseLabel} · {phaseName}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "80px 90px",
          gap: "70px",
        }}
      >
        {/* Quote */}
        {quote && (
          <div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: colors.bg,
                marginBottom: "28px",
              }}
            >
              Today's Quote
            </div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: 500,
                color: "#e2e8f0",
                lineHeight: 1.5,
                fontStyle: "italic",
                borderLeft: `8px solid ${colors.bg}`,
                paddingLeft: "40px",
              }}
            >
              &ldquo;{stripMarkdown(quote).substring(0, 280)}&rdquo;
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "2px", backgroundColor: "rgba(255,255,255,0.08)" }} />

        {/* Mental Model */}
        {mentalModel && (
          <div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: colors.bg,
                marginBottom: "28px",
              }}
            >
              Mental Model
            </div>
            <div
              style={{
                fontSize: "44px",
                fontWeight: 500,
                color: "#e2e8f0",
                lineHeight: 1.5,
              }}
            >
              {stripMarkdown(mentalModel).substring(0, 240)}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: "2px", backgroundColor: "rgba(255,255,255,0.08)" }} />

        {/* Success Metric */}
        {scoreMetric && (
          <div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: colors.bg,
                marginBottom: "28px",
              }}
            >
              Success Metric
            </div>
            <div
              style={{
                fontSize: "54px",
                fontWeight: 800,
                color: "#f8fafc",
                lineHeight: 1.3,
              }}
            >
              {extractMetricMeasure(scoreMetric)}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "2px solid rgba(255,255,255,0.08)",
          padding: "50px 90px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: "32px", color: "#475569", fontWeight: 500 }}>
          leadershipreboot.com
        </div>
        <div style={{ fontSize: "32px", color: "#475569", fontWeight: 500 }}>
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
            Preview your wallpaper below. Download saves as 1080×1920 px, optimised for modern phone screens.
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

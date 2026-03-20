"use client"

import { useRef, useState } from "react"
import { toPng } from "html-to-image"
import { Download, Loader2, Smartphone } from "lucide-react"
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
  phaseSubtitle?: string | null
  focusReframeTechnique?: string | null
  quote: string | null
  mentalModel: string | null
  reflectionQuestion?: string | null
  leaderExample?: string | null
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

interface WallpaperPreviewProps {
  dayNumber: number
  phaseName: string
  phaseLabel: string
  phaseSubtitle?: string | null
  focusReframeTechnique?: string | null
  quote: string | null
  mentalModel: string | null
  reflectionQuestion?: string | null
  leaderExample?: string | null
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

const HelpCircleIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
)

const ArrowRightIcon = ({ color, size = 24 }: { color: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

// Reboot Logo - Power Button Design (embedded SVG for html-to-image compatibility)
const RebootLogoImage = ({ size = 40 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#1a1a1a" />
    <path
      d="M 13 12 A 10 10 0 1 0 27 12"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line x1="20" y1="8" x2="20" y2="20" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export function WallpaperPreview({
  dayNumber,
  phaseName,
  phaseLabel,
  phaseSubtitle,
  focusReframeTechnique,
  quote,
  mentalModel,
  reflectionQuestion,
  leaderExample,
}: WallpaperPreviewProps) {
  const colors = getPhaseColors(phaseName)

  // Build the title from phase subtitle + focus reframe technique
  const titleLine1 = phaseSubtitle ? stripMarkdown(phaseSubtitle).substring(0, 40) : phaseName
  const titleLine2 = focusReframeTechnique ? stripMarkdown(focusReframeTechnique).substring(0, 50) : null

  // CTA text using leader name extracted from leaderExample
  const leaderName = leaderExample
    ? stripMarkdown(leaderExample).split(/\s+/).slice(0, 3).join(" ")
    : "this leader"
  const ctaText = `Learn how ${leaderName} used this mental model to level-up leadership`

  return (
    <div
      style={{
        width: "270px",
        height: "580px",
        background: "linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0f172a 100%)",
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with gradient */}
      <div
        style={{
          background: colors.gradient,
          padding: "16px 16px 14px",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)" }} />

        {/* Logo + Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", position: "relative" }}>
          <RebootLogoImage size={24} />
          <div>
            <div style={{ fontSize: "7px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>
              Leadership Reboot
            </div>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.08em" }}>
              SIGNAL™
            </div>
          </div>
          {/* Day badge inline */}
          <div style={{ marginLeft: "auto", background: "rgba(0,0,0,0.25)", borderRadius: "8px", padding: "4px 10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontSize: "6px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.accent }}>DAY</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>{dayNumber}</div>
          </div>
        </div>

        {/* Phase label */}
        <div style={{ fontSize: "6px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: colors.accent, marginBottom: "6px", position: "relative" }}>
          {phaseLabel}
        </div>

        {/* Title block */}
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em", marginBottom: "2px" }}>
            {titleLine1}
          </div>
          {titleLine2 && (
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#ffffff", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {titleLine2}
            </div>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 14px", gap: "10px", overflow: "hidden" }}>
        {/* Quote card */}
        {quote && (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
              <QuoteIcon color={colors.accent} size={10} />
              <span style={{ fontSize: "6px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Quote
              </span>
            </div>
            <div style={{ fontSize: "9px", fontWeight: 500, color: "#e2e8f0", lineHeight: 1.5, fontStyle: "italic", paddingLeft: "7px", borderLeft: `2px solid ${colors.bg}` }}>
              &ldquo;{stripMarkdown(quote).substring(0, 110)}&rdquo;
            </div>
          </div>
        )}

        {/* Mental Model card */}
        {mentalModel && (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
              <BrainIcon color={colors.accent} size={10} />
              <span style={{ fontSize: "6px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Mental Model
              </span>
            </div>
            <div style={{ fontSize: "9px", fontWeight: 500, color: "#e2e8f0", lineHeight: 1.5 }}>
              {stripMarkdown(mentalModel).substring(0, 90)}
            </div>
          </div>
        )}

        {/* Reflection Question card */}
        {reflectionQuestion && (
          <div style={{ background: `linear-gradient(135deg, ${colors.bg}18 0%, ${colors.bg}08 100%)`, borderRadius: "10px", padding: "10px", border: `1px solid ${colors.bg}35`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
              <HelpCircleIcon color={colors.accent} size={10} />
              <span style={{ fontSize: "6px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Reflect
              </span>
            </div>
            <div style={{ fontSize: "9px", fontWeight: 600, color: "#f1f5f9", lineHeight: 1.5, fontStyle: "italic" }}>
              {stripMarkdown(reflectionQuestion).substring(0, 90)}
            </div>
          </div>
        )}
      </div>

      {/* CTA Footer */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.bg}cc 0%, ${colors.bg}ee 100%)`,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "7px", fontWeight: 700, color: "#ffffff", lineHeight: 1.4, letterSpacing: "0.01em" }}>
            {ctaText}
          </div>
          <div style={{ fontSize: "6px", color: colors.accent, marginTop: "2px", fontWeight: 600 }}>
            Reboot.TransformerHub.com
          </div>
        </div>
        <ArrowRightIcon color="#ffffff" size={14} />
      </div>
    </div>
  )
}

// Full-resolution wallpaper for download (1080×1920)
function WallpaperExport({
  dayNumber,
  phaseName,
  phaseLabel,
  phaseSubtitle,
  focusReframeTechnique,
  quote,
  mentalModel,
  reflectionQuestion,
  leaderExample,
}: WallpaperPreviewProps) {
  const colors = getPhaseColors(phaseName)

  const titleLine1 = phaseSubtitle ? stripMarkdown(phaseSubtitle).substring(0, 60) : phaseName
  const titleLine2 = focusReframeTechnique ? stripMarkdown(focusReframeTechnique).substring(0, 70) : null

  const leaderName = leaderExample
    ? stripMarkdown(leaderExample).split(/\s+/).slice(0, 3).join(" ")
    : "this leader"
  const ctaText = `Learn how ${leaderName} used this mental model to level-up leadership`

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
      {/* Header */}
      <div style={{ background: colors.gradient, padding: "72px 80px 60px", position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.15) 0%, transparent 40%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)" }} />

        {/* Logo + Brand + Day badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "44px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <RebootLogoImage size={72} />
            <div>
              <div style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", marginBottom: "4px" }}>
                Leadership Reboot
              </div>
              <div style={{ fontSize: "48px", fontWeight: 900, color: "#ffffff", letterSpacing: "0.12em" }}>
                SIGNAL™
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: "28px", padding: "24px 44px", textAlign: "center", border: "2px solid rgba(255,255,255,0.15)", minWidth: "160px" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: colors.accent }}>DAY</div>
            <div style={{ fontSize: "80px", fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>{dayNumber}</div>
          </div>
        </div>

        {/* Phase label */}
        <div style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent, marginBottom: "14px", position: "relative" }}>
          {phaseLabel}
        </div>

        {/* Title block */}
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "30px", fontWeight: 600, color: "rgba(255,255,255,0.75)", marginBottom: "8px" }}>
            {titleLine1}
          </div>
          {titleLine2 && (
            <div style={{ fontSize: "52px", fontWeight: 900, color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              {titleLine2}
            </div>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "60px 80px", gap: "40px" }}>
        {/* Quote card */}
        {quote && (
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "28px", padding: "46px", border: "2px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "28px" }}>
              <div style={{ background: `${colors.bg}22`, borderRadius: "14px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <QuoteIcon color={colors.bg} size={36} />
              </div>
              <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Quote
              </span>
            </div>
            <div style={{ fontSize: "40px", fontWeight: 500, color: "#e2e8f0", lineHeight: 1.5, fontStyle: "italic", paddingLeft: "32px", borderLeft: `6px solid ${colors.bg}` }}>
              &ldquo;{stripMarkdown(quote).substring(0, 200)}&rdquo;
            </div>
          </div>
        )}

        {/* Mental Model card */}
        {mentalModel && (
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "28px", padding: "46px", border: "2px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "28px" }}>
              <div style={{ background: `${colors.bg}22`, borderRadius: "14px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BrainIcon color={colors.bg} size={36} />
              </div>
              <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Mental Model
              </span>
            </div>
            <div style={{ fontSize: "36px", fontWeight: 500, color: "#e2e8f0", lineHeight: 1.5 }}>
              {stripMarkdown(mentalModel).substring(0, 180)}
            </div>
          </div>
        )}

        {/* Reflection Question card */}
        {reflectionQuestion && (
          <div style={{ background: `linear-gradient(135deg, ${colors.bg}18 0%, ${colors.bg}08 100%)`, borderRadius: "28px", padding: "46px", border: `2px solid ${colors.bg}40` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "28px" }}>
              <div style={{ background: `${colors.bg}30`, borderRadius: "14px", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <HelpCircleIcon color={colors.bg} size={36} />
              </div>
              <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: colors.accent }}>
                Reflect
              </span>
            </div>
            <div style={{ fontSize: "44px", fontWeight: 700, color: "#f8fafc", lineHeight: 1.35, fontStyle: "italic" }}>
              {stripMarkdown(reflectionQuestion).substring(0, 180)}
            </div>
          </div>
        )}
      </div>

      {/* CTA Footer */}
      <div
        style={{
          background: `linear-gradient(135deg, ${colors.bg}dd 0%, ${colors.bg}ff 100%)`,
          padding: "44px 80px",
          display: "flex",
          alignItems: "center",
          gap: "32px",
          flexShrink: 0,
        }}
      >
        <RebootLogoImage size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "30px", fontWeight: 700, color: "#ffffff", lineHeight: 1.35 }}>
            {ctaText}
          </div>
          <div style={{ fontSize: "22px", color: colors.accent, marginTop: "6px", fontWeight: 600 }}>
            Reboot.TransformerHub.com
          </div>
        </div>
        <ArrowRightIcon color="#ffffff" size={52} />
      </div>
    </div>
  )
}

// Main dialog + trigger button
export function WallpaperDownloadButton({
  dayNumber,
  phaseName,
  phaseLabel,
  phaseSubtitle,
  focusReframeTechnique,
  quote,
  mentalModel,
  reflectionQuestion,
  leaderExample,
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
              phaseSubtitle={phaseSubtitle}
              focusReframeTechnique={focusReframeTechnique}
              quote={quote}
              mentalModel={mentalModel}
              reflectionQuestion={reflectionQuestion}
              leaderExample={leaderExample}
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
            phaseSubtitle={phaseSubtitle}
            focusReframeTechnique={focusReframeTechnique}
            quote={quote}
            mentalModel={mentalModel}
            reflectionQuestion={reflectionQuestion}
            leaderExample={leaderExample}
            scoreMetric={scoreMetric}
          />
        </div>
      </div>
    </>
  )
}

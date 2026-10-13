import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Clock3,
  ExternalLink,
  MessageCircle,
  Twitter,
  Send,
  Smartphone,
  Eye,
  Palette,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Post } from "@/types/ghostline";
import { remainingDetailed } from "@/lib/services/mock";
import { getAvatarPalette } from "./cute-avatar";
import conversationIcon from "@/assets/conversation.png";

export interface ShareCardModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

type CardThemeId = "lavender" | "peach" | "mint" | "midnight" | "sakura";
type CardFormat = "square" | "landscape" | "story";

interface ThemeConfig {
  id: CardThemeId;
  name: string;
  gradientBg: [string, string];
  cardBg: string;
  textColor: string;
  subtextColor: string;
  accentColor: string;
  borderColor: string;
  ghostTint: string;
}

const THEMES: Record<CardThemeId, ThemeConfig> = {
  lavender: {
    id: "lavender",
    name: "Lavender Dream",
    gradientBg: ["#FAF5FF", "#EDE9FE"],
    cardBg: "#FFFFFF",
    textColor: "#2E1065",
    subtextColor: "#7C3AED",
    accentColor: "#A855F7",
    borderColor: "#DDD6FE",
    ghostTint: "#C084FC",
  },
  peach: {
    id: "peach",
    name: "Sunset Peach",
    gradientBg: ["#FFF7ED", "#FFEDD5"],
    cardBg: "#FFFFFF",
    textColor: "#431407",
    subtextColor: "#EA580C",
    accentColor: "#FB923C",
    borderColor: "#FED7AA",
    ghostTint: "#FDBA74",
  },
  mint: {
    id: "mint",
    name: "Mint Meadow",
    gradientBg: ["#F0FDF4", "#DCFCE7"],
    cardBg: "#FFFFFF",
    textColor: "#052E16",
    subtextColor: "#16A34A",
    accentColor: "#4ADE80",
    borderColor: "#BBF7D0",
    ghostTint: "#86EFAC",
  },
  midnight: {
    id: "midnight",
    name: "Midnight Plum",
    gradientBg: ["#180A28", "#2E1065"],
    cardBg: "#24103E",
    textColor: "#F5F3FF",
    subtextColor: "#DDD6FE",
    accentColor: "#C084FC",
    borderColor: "#4C1D95",
    ghostTint: "#E9D5FF",
  },
  sakura: {
    id: "sakura",
    name: "Sakura Blossom",
    gradientBg: ["#FFF1F2", "#FCE7F3"],
    cardBg: "#FFFFFF",
    textColor: "#4C0519",
    subtextColor: "#DB2777",
    accentColor: "#F472B6",
    borderColor: "#FBCFE8",
    ghostTint: "#F472B6",
  },
};

export function ShareCardModal({ post, isOpen, onClose }: ShareCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardThemeId>("lavender");
  const [format, setFormat] = useState<CardFormat>("square");
  const [showAvatar, setShowAvatar] = useState(true);
  const [showTopic, setShowTopic] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [generating, setGenerating] = useState(false);

  const themeConfig = THEMES[selectedTheme];

  const shareUrl =
    typeof window !== "undefined" && post ? `${window.location.origin}/post/${post.id}` : "";

  // Dimensions based on format
  const getDimensions = useCallback(() => {
    switch (format) {
      case "landscape":
        return { width: 1200, height: 630 };
      case "story":
        return { width: 1080, height: 1920 };
      case "square":
      default:
        return { width: 1080, height: 1080 };
    }
  }, [format]);

  // Render to canvas
  const renderCanvas = useCallback(() => {
    if (!post || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = getDimensions();
    canvas.width = width;
    canvas.height = height;

    const theme = THEMES[selectedTheme];

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, theme.gradientBg[0]);
    bgGradient.addColorStop(1, theme.gradientBg[1]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative floating soft circles
    ctx.save();
    ctx.filter = "blur(40px)";
    ctx.fillStyle = theme.accentColor + "22"; // 13% opacity
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.15, width * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.85, width * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Center Card dimensions
    const isLandscape = format === "landscape";
    const isStory = format === "story";
    const padding = isStory ? 80 : isLandscape ? 44 : 70;
    const cardX = padding;
    const cardY = padding;
    const cardWidth = width - padding * 2;
    const cardHeight = height - padding * 2;
    const cardRadius = isLandscape ? 28 : 36;

    // Outer card drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 16;

    // Draw inner card background
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.fillStyle = theme.cardBg;
    ctx.fill();
    ctx.restore();

    // Card border
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius);
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // Top Header: Cute Logo and Expiration Tag
    const headerY = cardY + (isLandscape ? 40 : 60);
    ctx.fillStyle = theme.textColor;
    ctx.font = `bold ${isLandscape ? 26 : 32}px 'Nunito', 'Inter', sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // Ghost icon drawing (simplified cute ghost curve)
    const ghostX = cardX + (isLandscape ? 44 : 60);
    const ghostY = headerY;
    const gRadius = isLandscape ? 13 : 16;
    ctx.save();
    ctx.fillStyle = theme.accentColor;
    ctx.beginPath();
    ctx.arc(ghostX, ghostY - (isLandscape ? 4 : 6), gRadius, Math.PI, 0, false);
    ctx.lineTo(ghostX + gRadius, ghostY + (isLandscape ? 10 : 12));
    ctx.quadraticCurveTo(
      ghostX + (isLandscape ? 8 : 10),
      ghostY + 5,
      ghostX + 4,
      ghostY + (isLandscape ? 10 : 12),
    );
    ctx.quadraticCurveTo(ghostX, ghostY + 5, ghostX - 4, ghostY + (isLandscape ? 10 : 12));
    ctx.quadraticCurveTo(
      ghostX - (isLandscape ? 8 : 10),
      ghostY + 5,
      ghostX - gRadius,
      ghostY + (isLandscape ? 10 : 12),
    );
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = theme.cardBg;
    ctx.beginPath();
    ctx.arc(
      ghostX - (isLandscape ? 5 : 6),
      ghostY - (isLandscape ? 4 : 6),
      isLandscape ? 2.5 : 3,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      ghostX + (isLandscape ? 5 : 6),
      ghostY - (isLandscape ? 4 : 6),
      isLandscape ? 2.5 : 3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();

    // Brand Name
    ctx.fillText("ghostline", ghostX + (isLandscape ? 26 : 32), headerY);

    // Ephemeral badge (top right)
    const badgeText = "⏳ Fades in 24h";
    ctx.font = `600 ${isLandscape ? 17 : 20}px 'Inter', sans-serif`;
    const badgeMetrics = ctx.measureText(badgeText);
    const badgeW = badgeMetrics.width + (isLandscape ? 28 : 36);
    const badgeH = isLandscape ? 34 : 42;
    const badgeX = cardX + cardWidth - (isLandscape ? 44 : 60) - badgeW;
    const badgeY = headerY - badgeH / 2;

    ctx.save();
    ctx.fillStyle = theme.gradientBg[1];
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    ctx.fill();
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = theme.subtextColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, badgeX + badgeW / 2, headerY);
    ctx.restore();

    // Author and Avatar row
    const authorY = headerY + (isLandscape ? 44 : 68);
    const avatarSize = isLandscape ? 46 : 64;
    const avatarX = cardX + (isLandscape ? 44 : 60);

    if (showAvatar) {
      const palette = getAvatarPalette(post.alias);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, authorY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = palette.bg ?? "#F5EEFD";
      ctx.fill();
      ctx.strokeStyle = palette.ring ?? "#D8B4FE";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = palette.ink ?? "#7E22CE";
      ctx.font = `bold ${avatarSize * 0.45}px 'Inter', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(post.alias.slice(0, 2), avatarX + avatarSize / 2, authorY + avatarSize / 2);
      ctx.restore();

      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = theme.textColor;
      ctx.font = `bold ${isLandscape ? 23 : 28}px 'Inter', sans-serif`;
      ctx.fillText(post.alias, avatarX + avatarSize + 14, authorY + (isLandscape ? 2 : 4));

      ctx.fillStyle = theme.subtextColor;
      ctx.font = `500 ${isLandscape ? 16 : 20}px 'Inter', sans-serif`;
      ctx.fillText(
        "Pseudonymous voice",
        avatarX + avatarSize + 14,
        authorY + (isLandscape ? 26 : 36),
      );
      ctx.restore();
    }

    // Topic Pill (if active)
    if (showTopic && post.topic) {
      ctx.save();
      const topicTag = `#${post.topic.toLowerCase()}`;
      ctx.font = `bold ${isLandscape ? 17 : 20}px 'Inter', sans-serif`;
      const tm = ctx.measureText(topicTag);
      const tw = tm.width + (isLandscape ? 24 : 32);
      const th = isLandscape ? 32 : 38;
      const tx = cardX + cardWidth - (isLandscape ? 44 : 60) - tw;
      const ty = authorY + (isLandscape ? 8 : 12);

      ctx.fillStyle = theme.gradientBg[0];
      ctx.beginPath();
      ctx.roundRect(tx, ty, tw, th, th / 2);
      ctx.fill();
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = theme.subtextColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(topicTag, tx + tw / 2, ty + th / 2);
      ctx.restore();
    }

    // Divider Line
    const dividerY = authorY + avatarSize + (isLandscape ? 14 : 26);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cardX + (isLandscape ? 44 : 60), dividerY);
    ctx.lineTo(cardX + cardWidth - (isLandscape ? 44 : 60), dividerY);
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Footer of the card calculation
    const footerY = cardY + cardHeight - (isLandscape ? 42 : 62);

    // Content area boundary
    const contentStartY = dividerY + (isLandscape ? 22 : 44);
    const contentMaxWidth = cardWidth - (isLandscape ? 88 : 120);
    const maxContentHeight = footerY - contentStartY - (isLandscape ? 28 : 40);

    // Background quotation mark (proportional)
    ctx.save();
    ctx.fillStyle = theme.accentColor + "18"; // subtle 10%
    const quoteSize = isLandscape ? 88 : 130;
    ctx.font = `italic bold ${quoteSize}px 'Georgia', serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("“", cardX + (isLandscape ? 36 : 48), contentStartY - (isLandscape ? 14 : 24));
    ctx.restore();

    // Multi-line Text Auto-Fitting Algorithm
    let testFontSize = isLandscape
      ? post.body.length > 180
        ? 24
        : post.body.length > 100
          ? 28
          : 32
      : post.body.length > 180
        ? 32
        : post.body.length > 90
          ? 38
          : 44;

    const minFontSize = isLandscape ? 18 : 22;

    const wrapLinesAtSize = (size: number) => {
      ctx.font = `500 ${size}px 'Inter', system-ui, -apple-system, sans-serif`;
      const lh = size * (isLandscape ? 1.38 : 1.45);
      const paragraphs = post.body.split("\n");
      const linesOut: { text: string; isParagraphBreak: boolean }[] = [];

      for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
        const paragraph = paragraphs[pIdx] ?? "";
        const words = paragraph.split(" ");
        let curLine = "";
        for (let w = 0; w < words.length; w++) {
          const word = words[w] ?? "";
          const testL = curLine ? `${curLine} ${word}` : word;
          const m = ctx.measureText(testL);
          if (m.width > contentMaxWidth && curLine) {
            linesOut.push({ text: curLine, isParagraphBreak: false });
            curLine = word;
          } else {
            curLine = testL;
          }
        }
        if (curLine) {
          linesOut.push({ text: curLine, isParagraphBreak: pIdx < paragraphs.length - 1 });
        }
      }

      const totalH = linesOut.reduce(
        (sum, item) => sum + lh + (item.isParagraphBreak ? lh * 0.25 : 0),
        0,
      );
      return { lines: linesOut, totalHeight: totalH, lineHeight: lh };
    };

    let wrapped = wrapLinesAtSize(testFontSize);
    while (wrapped.totalHeight > maxContentHeight && testFontSize > minFontSize) {
      testFontSize -= 1.5;
      wrapped = wrapLinesAtSize(testFontSize);
    }

    // Draw the fitted text lines
    ctx.save();
    ctx.fillStyle = theme.textColor;
    ctx.font = `500 ${testFontSize}px 'Inter', system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    let drawY = contentStartY + (isLandscape ? 8 : 16);
    const textX = cardX + (isLandscape ? 44 : 60);

    for (let i = 0; i < wrapped.lines.length; i++) {
      const lineObj = wrapped.lines[i];
      // Only draw if line fits above footer safety limit
      if (lineObj && drawY + wrapped.lineHeight <= footerY - 18) {
        ctx.fillText(lineObj.text, textX, drawY);
        drawY += wrapped.lineHeight;
        if (lineObj.isParagraphBreak) {
          drawY += wrapped.lineHeight * 0.25;
        }
      }
    }
    ctx.restore();

    // Footer stats
    const loveCount = post.reactions.find((r) => r.kind === "love")?.count || 0;
    const replyCount = post.replies.length;
    const socialStatText = `❤️ ${loveCount}  💬 ${replyCount} thoughts`;

    ctx.save();
    ctx.fillStyle = theme.subtextColor;
    ctx.font = `600 ${isLandscape ? 19 : 22}px 'Inter', sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(socialStatText, cardX + (isLandscape ? 44 : 60), footerY);
    ctx.restore();

    // Watermark at footer right
    if (showWatermark) {
      ctx.save();
      ctx.fillStyle = theme.subtextColor;
      ctx.font = `500 ${isLandscape ? 17 : 20}px 'Inter', sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "ghostline.app · safe, cozy & ephemeral",
        cardX + cardWidth - (isLandscape ? 44 : 60),
        footerY,
      );
      ctx.restore();
    }
  }, [post, selectedTheme, format, showAvatar, showTopic, showWatermark, getDimensions]);

  // Re-render canvas whenever settings change or modal opens
  useEffect(() => {
    if (!isOpen || !post) return undefined;
    renderCanvas();
    const af = requestAnimationFrame(() => {
      renderCanvas();
    });
    const t = setTimeout(() => {
      renderCanvas();
    }, 60);
    return () => {
      cancelAnimationFrame(af);
      clearTimeout(t);
    };
  }, [isOpen, post, renderCanvas]);

  if (!post) return null;

  // Actions: Download PNG
  const handleDownload = () => {
    if (!canvasRef.current) return;
    try {
      setGenerating(true);
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ghostline-${post.alias.toLowerCase()}-${post.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Card downloaded! Ready to share anywhere.");
    } catch {
      toast.error("Could not download image. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Actions: Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    setGenerating(true);
    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to generate image data.");
          setGenerating(false);
          return;
        }
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            setCopiedImage(true);
            setTimeout(() => setCopiedImage(false), 2500);
            toast.success("Card copied to clipboard! Paste it directly into any app.");
          } else {
            handleDownload();
          }
        } catch {
          handleDownload();
        } finally {
          setGenerating(false);
        }
      }, "image/png");
    } catch {
      toast.error("Clipboard copy failed, downloading instead.");
      handleDownload();
      setGenerating(false);
    }
  };

  // Actions: Social Direct Shares
  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `"${post.body.slice(0, 180)}${post.body.length > 180 ? "…" : ""}" — ${post.alias} on Ghostline\n\nRead & reply before it fades (24h ephemeral):`,
    );
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `"${post.body}" — ${post.alias} on Ghostline 👻 (Disappears in 24h)\n${shareUrl}`,
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`"${post.body}" — ${post.alias} on Ghostline 👻`);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Ghostline thought by ${post.alias}`,
          text: `"${post.body}" — ephemeral 24h thought`,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
          toast.success("Thought link copied to clipboard!");
        },
        () => toast.info(`Link: ${shareUrl}`),
      );
    } else {
      toast.info(`Link: ${shareUrl}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-card border border-border shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/70">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-lg bg-primary/15 flex items-center justify-center p-1">
              <img src={conversationIcon} alt="" className="size-full object-contain" />
            </span>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Share Viral Thought Card
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Generate an aesthetic, share-ready quote card or share directly to your favorite social
            networks.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left Column: Live Card Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-muted/40 p-3 sm:p-4 rounded-xl border border-border/60">
            <div className="w-full flex items-center justify-between pb-2 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="size-3.5 text-primary" /> Live High-Res Card
              </span>
              <span className="capitalize">
                {format} format · {themeConfig.name}
              </span>
            </div>

            {/* Canvas Element with Responsive Max Height */}
            <div className="relative w-full flex items-center justify-center overflow-hidden rounded-xl shadow-md border border-border/70 bg-card">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[380px] object-contain transition-all duration-200"
              />
            </div>

            <p className="text-[11px] text-muted-foreground/80 mt-2 text-center">
              Rendered at ultra crisp 2x resolution with cozy typography & pastel tints.
            </p>
          </div>

          {/* Right Column: Customization Controls & Social Sharing Actions */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* 1. Theme Palette Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Palette className="size-3.5 text-primary" /> Card Theme
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(THEMES) as CardThemeId[]).map((tid) => {
                  const t = THEMES[tid];
                  const active = selectedTheme === tid;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => setSelectedTheme(tid)}
                      title={t.name}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                        active
                          ? "border-primary ring-2 ring-primary/40 shadow-md scale-105"
                          : "border-border/80 hover:border-primary/50 opacity-95 hover:opacity-100"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${t.gradientBg[0]}, ${t.gradientBg[1]})`,
                      }}
                    >
                      <div
                        className="size-5 rounded-full border border-black/15 shadow-inner mb-1"
                        style={{ backgroundColor: t.accentColor }}
                      />
                      <span
                        className={`text-[11px] font-extrabold tracking-tight truncate w-full text-center ${
                          tid === "midnight" ? "text-white" : "text-neutral-900"
                        }`}
                      >
                        {t.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" /> Card Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "square" as const, label: "Square (1:1)", sub: "Instagram/Feed" },
                  { id: "landscape" as const, label: "Twitter (16:9)", sub: "X & LinkedIn" },
                  { id: "story" as const, label: "Story (9:16)", sub: "IG Story/Status" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      format === f.id
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                        : "bg-background border-border text-foreground hover:bg-muted font-medium"
                    }`}
                  >
                    <div className="text-xs">{f.label}</div>
                    <div className="text-[10px] text-muted-foreground">{f.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Toggles */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAvatar(!showAvatar)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  showAvatar
                    ? "bg-accent text-primary-ink border-primary/40 font-semibold"
                    : "bg-muted/50 text-muted-foreground border-border"
                }`}
              >
                {showAvatar ? "✓ Avatar included" : "+ Show Avatar"}
              </button>
              <button
                type="button"
                onClick={() => setShowTopic(!showTopic)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  showTopic
                    ? "bg-accent text-primary-ink border-primary/40 font-semibold"
                    : "bg-muted/50 text-muted-foreground border-border"
                }`}
              >
                {showTopic ? "✓ Topic tag" : "+ Topic tag"}
              </button>
              <button
                type="button"
                onClick={() => setShowWatermark(!showWatermark)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  showWatermark
                    ? "bg-accent text-primary-ink border-primary/40 font-semibold"
                    : "bg-muted/50 text-muted-foreground border-border"
                }`}
              >
                {showWatermark ? "✓ Watermark" : "+ Watermark"}
              </button>
            </div>

            {/* 4. Primary Image Card Actions */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleDownload}
                  disabled={generating}
                  className="w-full gap-2 font-bold shadow-sm"
                >
                  <Download className="size-4" />
                  <span>Download Card</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyImage}
                  disabled={generating}
                  className="w-full gap-2 font-semibold"
                >
                  {copiedImage ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  <span>{copiedImage ? "Copied!" : "Copy Image"}</span>
                </Button>
              </div>
            </div>

            {/* 5. One-Click Viral Direct Sharing */}
            <div className="pt-2 border-t border-border/70 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Share Link Directly
              </span>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareTwitter}
                  title="Share to X / Twitter"
                  className="flex flex-col items-center justify-center h-12 p-1 rounded-xl hover:bg-black hover:text-white transition-colors"
                >
                  <Twitter className="size-4 text-sky-500 mb-0.5" />
                  <span className="text-[10px] font-semibold">Post to X</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareWhatsApp}
                  title="Share to WhatsApp"
                  className="flex flex-col items-center justify-center h-12 p-1 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  <MessageCircle className="size-4 text-emerald-500 mb-0.5" />
                  <span className="text-[10px] font-semibold">WhatsApp</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareTelegram}
                  title="Share to Telegram"
                  className="flex flex-col items-center justify-center h-12 p-1 rounded-xl hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Send className="size-4 text-blue-500 mb-0.5" />
                  <span className="text-[10px] font-semibold">Telegram</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNativeShare}
                  title="More Share Options"
                  className="flex flex-col items-center justify-center h-12 p-1 rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Smartphone className="size-4 text-primary mb-0.5" />
                  <span className="text-[10px] font-semibold">More Apps</span>
                </Button>
              </div>

              {/* Quick Copy Link Row */}
              <div className="flex items-center gap-2 pt-1">
                <div className="min-w-0 flex-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-mono text-muted-foreground truncate border border-border/60">
                  {shareUrl}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0 gap-1.5 text-xs font-medium"
                >
                  {copiedLink ? (
                    <Check className="size-3.5 text-green-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Flame,
  Loader2,
  Play,
  Share2,
  Sparkles,
  Upload,
  User,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import {
  DANCE_TEMPLATES,
  DanceCategory,
  DanceTemplate,
  getDanceCategoriesWithCount,
  getDanceTemplatesByCategory,
  getTrendingTemplates,
} from '@/config/dance-templates';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { ImageUploader, ImageUploaderValue } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';

interface DanceGeneratorPremiumProps {
  templates?: DanceTemplate[];
  maxSizeMB?: number;
  srOnlyTitle?: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  provider?: string;
  model?: string;
}

interface BackendTask {
  id: string;
  status: string;
  provider: string;
  model: string;
  prompt: string | null;
  taskInfo: string | null;
  taskResult: string | null;
}

const POLL_INTERVAL = 15000;
const GENERATION_TIMEOUT = 600000;
const DANCE_MODEL = 'fal-ai/kling-video/v2.6/pro/motion-control';
const DANCE_PROVIDER = 'fal';

function parseTaskResult(taskResult: string | null): any {
  if (!taskResult) return null;
  try {
    return JSON.parse(taskResult);
  } catch {
    return null;
  }
}

function extractVideoUrls(result: any): string[] {
  if (!result) return [];
  const videos = result.videos;
  if (videos && Array.isArray(videos)) {
    return videos
      .map((item: any) => {
        if (!item) return null;
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          return (
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl
          );
        }
        return null;
      })
      .filter(Boolean);
  }
  const output = result.output ?? result.video ?? result.data;
  if (!output) return [];
  if (typeof output === 'string') return [output];
  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item) return [];
        if (typeof item === 'string') return [item];
        if (typeof item === 'object') {
          const candidate =
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }
  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.video ?? output.src ?? output.videoUrl;
    if (typeof candidate === 'string') return [candidate];
  }
  return [];
}

function StepIndicator({
  step,
  title,
  isComplete,
  isActive,
}: {
  step: number;
  title: string;
  isComplete: boolean;
  isActive: boolean;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-300 md:h-10 md:w-10 md:rounded-xl md:text-sm',
          isComplete
            ? 'from-primary to-accent shadow-primary/25 bg-gradient-to-br text-white shadow-lg'
            : isActive
              ? 'border-primary bg-primary/10 text-primary border-2'
              : 'border-border bg-muted/50 text-muted-foreground border'
        )}
      >
        {isComplete ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : step}
      </div>
      <span
        className={cn(
          'hidden text-sm font-medium transition-colors sm:inline',
          isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {title}
      </span>
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  onPreview,
  featured = false,
}: {
  template: DanceTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  featured?: boolean;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageError, setImageError] = useState(false);
  const hasValidImage = template.thumbnailUrl && !imageError;

  const gradientIndex = template.name.charCodeAt(0) % 4;
  const gradients = [
    'from-violet-500/30 via-purple-500/20 to-fuchsia-500/30',
    'from-blue-500/30 via-cyan-500/20 to-teal-500/30',
    'from-rose-500/30 via-pink-500/20 to-orange-500/30',
    'from-emerald-500/30 via-green-500/20 to-lime-500/30',
  ];

  useEffect(() => {
    if (isHovering && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovering]);

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        'group relative flex-shrink-0 overflow-hidden rounded-2xl transition-all duration-300',
        featured ? 'w-40 md:w-44' : 'w-36',
        isSelected
          ? 'ring-primary ring-offset-background scale-[1.02] ring-4 ring-offset-2'
          : 'hover:shadow-primary/10 ring-border/50 ring-1 hover:scale-[1.03] hover:shadow-xl'
      )}
    >
      <div
        className={cn(
          'bg-muted relative aspect-[9/16] w-full overflow-hidden',
          !hasValidImage && `bg-gradient-to-br ${gradients[gradientIndex]}`
        )}
      >
        {!hasValidImage && (
          <div className="absolute inset-0">
            <div className="from-primary/10 to-accent/10 absolute inset-0 bg-gradient-to-br via-transparent" />
            <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-8 w-8 text-white/50" />
            </div>
          </div>
        )}

        {template.thumbnailUrl && !imageError && (
          <Image
            src={template.thumbnailUrl}
            alt={template.name}
            fill
            className={cn(
              'object-cover transition-opacity duration-300',
              isHovering ? 'opacity-0' : 'opacity-100'
            )}
            sizes={featured ? '(max-width: 640px) 176px, 176px' : '144px'}
            onError={() => setImageError(true)}
          />
        )}

        <video
          ref={videoRef}
          src={template.videoUrl}
          muted
          loop
          playsInline
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
            isHovering ? 'opacity-100' : 'opacity-0'
          )}
        />

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {featured && (
          <div className="absolute top-0 left-0 rounded-br-xl bg-gradient-to-r from-orange-500 to-red-600 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg">
            HOT
          </div>
        )}

        {!featured && template.new && (
          <div className="absolute top-2 left-2 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase shadow-sm">
            NEW
          </div>
        )}

        {isSelected && (
          <div className="bg-primary shadow-primary/50 absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-lg">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        )}

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300',
            isHovering && !isSelected ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform hover:scale-110 hover:bg-white/30"
          >
            <Play className="ml-0.5 h-5 w-5 text-white" fill="currentColor" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 text-left">
          <h4 className="line-clamp-2 text-sm leading-tight font-bold text-white drop-shadow-md">
            {template.name}
          </h4>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-medium text-white/80">
              <Video className="h-3 w-3" />
              {template.duration}s
            </span>
            {template.popularity > 85 && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-orange-400">
                <Flame className="h-3 w-3" />
                Trending
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function MobileStickyBar({
  canGenerate,
  isGenerating,
  remainingCredits,
  costCredits,
  onGenerate,
  onSignIn,
  isLoggedIn,
  generateLabel,
  generatingLabel,
}: {
  canGenerate: boolean;
  isGenerating: boolean;
  remainingCredits: number;
  costCredits: number;
  onGenerate: () => void;
  onSignIn: () => void;
  isLoggedIn: boolean;
  generateLabel: string;
  generatingLabel: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const generatorSection = document.getElementById('generator');
    if (!generatorSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when generator section is NOT visible (scrolled past it)
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(generatorSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 bg-black/95 px-4 py-3 backdrop-blur-xl transition-transform duration-300 md:hidden',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        {isLoggedIn ? (
          <>
            <Button
              size="lg"
              className={cn(
                'h-12 flex-1 rounded-xl font-bold transition-all',
                canGenerate
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-muted text-muted-foreground'
              )}
              onClick={onGenerate}
              disabled={!canGenerate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {generatingLabel}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {generateLabel}
                </>
              )}
            </Button>
            <div className="flex flex-col items-end text-right">
              <span className="text-xs font-medium text-white">
                {costCredits} credits
              </span>
              <span
                className={cn(
                  'text-[10px]',
                  remainingCredits < costCredits
                    ? 'text-red-400'
                    : 'text-green-400'
                )}
              >
                {remainingCredits} left
              </span>
            </div>
          </>
        ) : (
          <Button
            size="lg"
            className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-bold text-white"
            onClick={onSignIn}
          >
            <User className="mr-2 h-4 w-4" />
            Sign in to Generate
          </Button>
        )}
      </div>
    </div>
  );
}

function FeaturedTemplatesRow({
  templates,
  selectedId,
  onSelect,
  onPreview,
}: {
  templates: DanceTemplate[];
  selectedId?: string;
  onSelect: (t: DanceTemplate) => void;
  onPreview: (t: DanceTemplate) => void;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2 px-1">
        <Flame className="h-5 w-5 text-orange-500" fill="currentColor" />
        <h3 className="text-foreground text-lg font-bold tracking-tight">
          Trending Now
        </h3>
      </div>
      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 md:gap-5">
        {templates.slice(0, 4).map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedId === template.id}
            onSelect={() => onSelect(template)}
            onPreview={() => onPreview(template)}
            featured
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCarousel({
  templates,
  selectedId,
  onSelect,
  onPreview,
}: {
  templates: DanceTemplate[];
  selectedId?: string;
  onSelect: (t: DanceTemplate) => void;
  onPreview: (t: DanceTemplate) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 600;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="group/carousel relative">
      <button
        onClick={() => scroll('left')}
        className="border-border/50 bg-background/80 text-foreground hover:bg-background absolute top-1/2 -left-3 z-10 hidden -translate-y-1/2 rounded-full border p-2 shadow-lg backdrop-blur-md transition-all hover:scale-110 disabled:opacity-0 md:flex"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="border-border/50 bg-background/80 text-foreground hover:bg-background absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 rounded-full border p-2 shadow-lg backdrop-blur-md transition-all hover:scale-110 disabled:opacity-0 md:flex"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto pt-1 pb-4 md:gap-4"
      >
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedId === template.id}
            onSelect={() => onSelect(template)}
            onPreview={() => onPreview(template)}
          />
        ))}
      </div>
    </div>
  );
}

export function DanceGeneratorPremium({
  templates = DANCE_TEMPLATES,
  maxSizeMB = 50,
  srOnlyTitle,
}: DanceGeneratorPremiumProps) {
  const t = useTranslations('ai.dance.generator');

  const [activeCategory, setActiveCategory] = useState<DanceCategory | 'all'>(
    'all'
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<DanceTemplate | null>(null);
  const [uploadedImageItems, setUploadedImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] =
    useState<DanceTemplate | null>(null);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const costCredits = selectedTemplate?.creditCost ?? 10;

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return getDanceTemplatesByCategory();
    }
    return getDanceTemplatesByCategory(activeCategory);
  }, [activeCategory]);

  const trendingTemplates = useMemo(() => getTrendingTemplates(), []);

  const categories = useMemo(() => getDanceCategoriesWithCount(), []);

  const handleImageChange = useCallback((items: ImageUploaderValue[]) => {
    setUploadedImageItems(items);
    const uploadedItem = items.find(
      (item) => item.status === 'uploaded' && item.url
    );
    setUploadedImageUrl(uploadedItem?.url ?? null);
  }, []);

  const isImageUploading = useMemo(
    () => uploadedImageItems.some((item) => item.status === 'uploading'),
    [uploadedImageItems]
  );

  const hasImageUploadError = useMemo(
    () => uploadedImageItems.some((item) => item.status === 'error'),
    [uploadedImageItems]
  );

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) return '';
    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return t('status_pending');
      case AITaskStatus.PROCESSING:
        return t('status_processing');
      case AITaskStatus.SUCCESS:
        return t('status_success');
      case AITaskStatus.FAILED:
        return t('status_failed');
      default:
        return '';
    }
  }, [taskStatus, t]);

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
  }, []);

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error(t('error_timeout'));
          return true;
        }
        const resp = await fetch('/api/ai/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: id }),
        });
        if (!resp.ok)
          throw new Error(`request failed with status: ${resp.status}`);
        const { code, message, data } = await resp.json();
        if (code !== 0) throw new Error(message || 'Query task failed');
        const task = data as BackendTask;
        const currentStatus = task.status as AITaskStatus;
        setTaskStatus(currentStatus);
        const parsedResult = parseTaskResult(task.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);
        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 20));
          return false;
        }
        if (currentStatus === AITaskStatus.PROCESSING) {
          if (videoUrls.length > 0) {
            setGeneratedVideo({
              id: task.id,
              url: videoUrls[0],
              provider: task.provider,
              model: task.model,
            });
            setProgress((prev) => Math.max(prev, 85));
          } else {
            setProgress((prev) => Math.min(prev + 5, 80));
          }
          return false;
        }
        if (currentStatus === AITaskStatus.SUCCESS) {
          if (videoUrls.length === 0) {
            toast.error(t('error_no_video'));
          } else {
            setGeneratedVideo({
              id: task.id,
              url: videoUrls[0],
              provider: task.provider,
              model: task.model,
            });
            toast.success(t('success'));
          }
          setProgress(100);
          resetTaskState();
          return true;
        }
        if (currentStatus === AITaskStatus.FAILED) {
          const errorMessage =
            parsedResult?.errorMessage || t('error_generation');
          toast.error(errorMessage);
          resetTaskState();
          fetchUserCredits();
          return true;
        }
        setProgress((prev) => Math.min(prev + 3, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling dance task:', error);
        toast.error(`${t('error_query')}: ${error.message}`);
        resetTaskState();
        fetchUserCredits();
        return true;
      }
    },
    [generationStartTime, resetTaskState, fetchUserCredits, t]
  );

  useEffect(() => {
    if (!taskId || !isGenerating) return;
    let cancelled = false;
    const tick = async () => {
      if (!taskId) return;
      const completed = await pollTaskStatus(taskId);
      if (completed) cancelled = true;
    };
    tick();
    const interval = setInterval(async () => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) clearInterval(interval);
    }, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId, isGenerating, pollTaskStatus]);

  const handleGenerate = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }
    if (remainingCredits < costCredits) {
      toast.error(t('error_insufficient_credits'));
      return;
    }
    if (!uploadedImageUrl) {
      toast.error(t('error_no_image'));
      return;
    }
    if (!selectedTemplate) {
      toast.error(t('error_no_template'));
      return;
    }
    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedVideo(null);
    setGenerationStartTime(Date.now());
    try {
      const options: any = {
        image_input: [uploadedImageUrl],
        video_input: [selectedTemplate.videoUrl],
      };
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: AIMediaType.VIDEO,
          scene: 'dance-generation',
          provider: DANCE_PROVIDER,
          model: DANCE_MODEL,
          prompt: `A person dancing with smooth and natural movements, ${selectedTemplate.name} style dance, viral TikTok quality`,
          options,
        }),
      });
      if (!resp.ok)
        throw new Error(`request failed with status: ${resp.status}`);
      const { code, message, data } = await resp.json();
      if (code !== 0) throw new Error(message || 'Failed to create dance task');
      const newTaskId = data?.id;
      if (!newTaskId) throw new Error('Task id missing in response');
      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const parsedResult = parseTaskResult(data.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);
        if (videoUrls.length > 0) {
          setGeneratedVideo({
            id: newTaskId,
            url: videoUrls[0],
            provider: DANCE_PROVIDER,
            model: DANCE_MODEL,
          });
          toast.success(t('success'));
          setProgress(100);
          resetTaskState();
          await fetchUserCredits();
          return;
        }
      }
      setTaskId(newTaskId);
      setProgress(25);
      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate dance video:', error);
      toast.error(`${t('error_generation')}: ${error.message}`);
      resetTaskState();
    }
  };

  const handleDownloadVideo = async () => {
    if (!generatedVideo?.url) return;
    try {
      setIsDownloading(true);
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(generatedVideo.url)}`
      );
      if (!resp.ok) throw new Error('Failed to fetch video');
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ai-dance-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success(t('download_success'));
    } catch (error) {
      console.error('Failed to download video:', error);
      toast.error(t('download_error'));
    } finally {
      setIsDownloading(false);
    }
  };

  const canGenerate =
    uploadedImageUrl &&
    selectedTemplate &&
    !isGenerating &&
    !isImageUploading &&
    !hasImageUploadError;

  const step1Complete = !!uploadedImageUrl;
  const step2Complete = !!selectedTemplate;

  return (
    <section id="generator" className="relative py-16 md:py-24">
      <div className="absolute inset-0 -z-10">
        <div className="bg-primary/5 absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/5 absolute right-1/4 bottom-0 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
            <div className="border-primary/20 bg-primary/5 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5">
              <Zap className="text-primary h-4 w-4" />
              <span className="text-primary text-sm font-medium">
                AI-Powered Generation
              </span>
            </div>
            <h2
              className="text-foreground text-3xl font-bold sm:text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Create Your <span className="gradient-text">Dance Video</span>
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
              Upload a photo, choose a trending dance, and watch AI bring it to
              life in seconds.
            </p>
          </div>

          <div className="border-border/50 bg-card/50 overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-sm">
            <div className="border-border/50 bg-muted/30 border-b px-4 py-4 md:px-8">
              <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 md:gap-4">
                <StepIndicator
                  step={1}
                  title={t('step1_title')}
                  isComplete={step1Complete}
                  isActive={!step1Complete}
                />
                <ChevronRight className="text-muted-foreground/50 hidden h-5 w-5 sm:block" />
                <StepIndicator
                  step={2}
                  title={t('step2_title')}
                  isComplete={step2Complete}
                  isActive={step1Complete && !step2Complete}
                />
                <ChevronRight className="text-muted-foreground/50 hidden h-5 w-5 sm:block" />
                <StepIndicator
                  step={3}
                  title="Generate"
                  isComplete={!!generatedVideo}
                  isActive={step1Complete && step2Complete && !generatedVideo}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.5fr_1fr]">
              <div className="border-border/50 border-r p-6 md:p-8">
                <div className="mb-10">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <Upload className="text-primary h-4 w-4" />
                    </div>
                    <h3 className="text-foreground text-xl font-bold">
                      {t('step1_title')}
                    </h3>
                  </div>
                  <div className="border-border bg-muted/30 hover:border-primary/50 overflow-hidden rounded-2xl border-2 border-dashed transition-colors">
                    <ImageUploader
                      title={t('upload_title')}
                      allowMultiple={false}
                      maxImages={1}
                      maxSizeMB={maxSizeMB}
                      onChange={handleImageChange}
                      emptyHint={t('upload_hint')}
                    />
                  </div>
                  {hasImageUploadError && (
                    <p className="text-destructive mt-2 text-sm">
                      {t('upload_error')}
                    </p>
                  )}
                </div>

                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                        <Video className="text-primary h-4 w-4" />
                      </div>
                      <h3 className="text-foreground text-xl font-bold">
                        {t('step2_title')}
                      </h3>
                    </div>
                  </div>

                  <FeaturedTemplatesRow
                    templates={trendingTemplates}
                    selectedId={selectedTemplate?.id}
                    onSelect={setSelectedTemplate}
                    onPreview={setPreviewingTemplate}
                  />

                  <div className="mb-5 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setActiveCategory(cat.value)}
                        className={cn(
                          'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300',
                          activeCategory === cat.value
                            ? 'scale-105 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:scale-105'
                        )}
                      >
                        {cat.value === 'all'
                          ? 'All'
                          : t(`category_${cat.value}`)}
                        <span
                          className={cn(
                            'ml-1.5 text-xs opacity-70',
                            activeCategory === cat.value
                              ? 'text-white'
                              : 'text-muted-foreground'
                          )}
                        >
                          ({cat.count})
                        </span>
                      </button>
                    ))}
                  </div>

                  <TemplateCarousel
                    templates={filteredTemplates}
                    selectedId={selectedTemplate?.id}
                    onSelect={setSelectedTemplate}
                    onPreview={setPreviewingTemplate}
                  />
                </div>
              </div>

              <div className="bg-muted/10 flex flex-col p-6 md:p-8">
                <div className="sticky top-8 mb-6 flex-1">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                      <Sparkles className="text-primary h-4 w-4" />
                    </div>
                    <h3 className="text-foreground text-xl font-bold">
                      {t('result_title')}
                    </h3>
                  </div>

                  {generatedVideo ? (
                    <div className="animate-in fade-in zoom-in flex flex-col items-center duration-500">
                      <div className="relative mx-auto w-full max-w-xs">
                        <div className="border-foreground/10 relative overflow-hidden rounded-[2rem] border-4 bg-black shadow-2xl">
                          <div className="aspect-[9/16]">
                            <video
                              src={generatedVideo.url}
                              controls
                              autoPlay
                              loop
                              playsInline
                              className="h-full w-full object-contain"
                              preload="metadata"
                            />
                          </div>
                        </div>
                        <div className="from-primary/20 via-accent/10 absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br to-transparent blur-2xl" />
                      </div>

                      <div className="mt-8 flex w-full flex-col gap-3">
                        <Button
                          size="lg"
                          onClick={handleDownloadVideo}
                          disabled={isDownloading}
                          className="from-primary to-accent shadow-primary/25 w-full rounded-xl bg-gradient-to-r py-6 text-lg shadow-lg"
                        >
                          {isDownloading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-5 w-5" />
                          )}
                          {t('download')}
                        </Button>
                      </div>

                      <div className="bg-primary/5 text-muted-foreground mt-6 flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                        <Share2 className="h-4 w-4" />
                        {t('share_tip')}
                      </div>
                    </div>
                  ) : (
                    <div className="border-border/60 bg-muted/20 flex h-full min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed py-12 text-center">
                      <div className="relative mx-auto mb-6 w-48">
                        {isGenerating ? (
                          <div className="flex aspect-[9/16] items-center justify-center overflow-hidden rounded-3xl bg-black/5">
                            <div className="p-4 text-center">
                              <Loader2 className="text-primary mx-auto mb-4 h-12 w-12 animate-spin" />
                              <p className="text-foreground text-sm font-bold">
                                Generating...
                              </p>
                              <p className="text-muted-foreground mt-1 text-xs">
                                {taskStatusLabel}
                              </p>
                            </div>
                          </div>
                        ) : selectedTemplate ? (
                          <div className="group relative aspect-[9/16] overflow-hidden rounded-3xl shadow-xl">
                            <Image
                              src={selectedTemplate.thumbnailUrl}
                              alt="Preview"
                              fill
                              className="scale-110 object-cover opacity-50 blur-sm"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                                <Sparkles className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border-border bg-muted/30 aspect-[9/16] overflow-hidden rounded-3xl border-2 border-dashed">
                            <div className="flex h-full flex-col items-center justify-center gap-3">
                              <Video className="text-muted-foreground/30 h-12 w-12" />
                              <p className="text-muted-foreground px-4 text-xs">
                                Select a template to preview
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground max-w-[240px] text-sm">
                        {isGenerating
                          ? t('generating_hint')
                          : selectedTemplate
                            ? 'Ready to generate your video!'
                            : t('no_video')}
                      </p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="border-primary/20 bg-primary/5 mt-6 rounded-2xl border p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-foreground font-medium">
                          {t('progress')}
                        </span>
                        <span className="text-primary font-bold">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    {!isMounted ? (
                      <Button
                        className="h-14 w-full rounded-xl text-base"
                        disabled
                        size="lg"
                      >
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('loading')}
                      </Button>
                    ) : isCheckSign ? (
                      <Button
                        className="h-14 w-full rounded-xl text-base"
                        disabled
                        size="lg"
                      >
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('checking_account')}
                      </Button>
                    ) : user ? (
                      <Button
                        size="lg"
                        className={cn(
                          'btn-glow h-14 w-full rounded-xl text-base font-semibold transition-all duration-300',
                          canGenerate
                            ? 'from-primary via-primary to-accent shadow-primary/25 hover:shadow-primary/30 bg-gradient-to-r shadow-lg hover:scale-[1.02] hover:shadow-xl'
                            : 'opacity-80'
                        )}
                        onClick={handleGenerate}
                        disabled={!canGenerate}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t('generating')}
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            {t('generate')}{' '}
                            <span className="ml-1 opacity-80">
                              ({costCredits} credits)
                            </span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="from-primary to-accent shadow-primary/25 h-14 w-full rounded-xl bg-gradient-to-r text-base font-semibold shadow-lg"
                        onClick={() => setIsShowSignModal(true)}
                      >
                        <User className="mr-2 h-5 w-5" />
                        {t('sign_in_to_generate')}
                      </Button>
                    )}

                    <div className="bg-muted/50 flex items-center justify-between rounded-xl px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="text-primary h-4 w-4" />
                        <span className="text-muted-foreground">
                          Required: {costCredits} credits
                        </span>
                      </div>
                      {isMounted && (
                        <span
                          className={cn(
                            'font-medium',
                            remainingCredits < costCredits
                              ? 'text-destructive'
                              : 'text-green-600 dark:text-green-400'
                          )}
                        >
                          You have: {remainingCredits}
                        </span>
                      )}
                    </div>

                    {isMounted && user && remainingCredits < costCredits && (
                      <Link href="/pricing" className="block">
                        <Button
                          variant="outline"
                          className="h-12 w-full rounded-xl border-dashed"
                          size="lg"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {t('buy_credits')}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewingTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setPreviewingTemplate(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-sm overflow-hidden rounded-[2rem] bg-black shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[9/16]">
              <video
                src={previewingTemplate.videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="h-full w-full object-contain"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent" />
            </div>

            <button
              type="button"
              onClick={() => setPreviewingTemplate(null)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="absolute right-0 bottom-0 left-0 p-6 pt-0">
              <h3 className="mb-1 text-2xl font-bold text-white">
                {previewingTemplate.name}
              </h3>
              <p className="mb-6 line-clamp-2 text-sm text-white/80">
                {previewingTemplate.description}
              </p>

              <Button
                size="lg"
                className="w-full rounded-xl bg-white font-bold text-black hover:bg-white/90"
                onClick={() => {
                  setSelectedTemplate(previewingTemplate);
                  setPreviewingTemplate(null);
                }}
              >
                Use This Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {isMounted && (
        <MobileStickyBar
          canGenerate={!!canGenerate}
          isGenerating={isGenerating}
          remainingCredits={remainingCredits}
          costCredits={costCredits}
          onGenerate={handleGenerate}
          onSignIn={() => setIsShowSignModal(true)}
          isLoggedIn={!!user}
          generateLabel={t('generate')}
          generatingLabel={t('generating')}
        />
      )}
    </section>
  );
}

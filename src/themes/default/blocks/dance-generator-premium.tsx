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
  ScanEye,
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
  section?: any;
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
  hotLabel = 'HOT',
  newLabel = 'NEW',
  trendingLabel = 'Trending',
  usesLabel = 'uses',
}: {
  template: DanceTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  featured?: boolean;
  hotLabel?: string;
  newLabel?: string;
  trendingLabel?: string;
  usesLabel?: string;
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
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
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
        'group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-300',
        isSelected
          ? 'border-purple-500/50 bg-white/10 shadow-[0_0_20px_rgba(168,85,247,0.2)] ring-2 ring-purple-500/50'
          : 'border-white/10 bg-white/5 hover:scale-[1.02] hover:border-white/20 hover:bg-white/10 hover:shadow-xl hover:shadow-purple-500/10',
        featured ? 'w-full' : 'w-full'
      )}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/20">
        {!hasValidImage && (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br transition-opacity duration-500',
              gradients[gradientIndex]
            )}
          />
        )}

        {template.thumbnailUrl && !imageError && (
          <Image
            src={template.thumbnailUrl}
            alt={template.name}
            fill
            className={cn(
              'object-cover transition-all duration-500',
              isHovering ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
            )}
            sizes="(max-width: 640px) 50vw, 33vw"
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

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {featured && (
            <div className="rounded-md bg-gradient-to-r from-orange-500 to-red-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg">
              {hotLabel}
            </div>
          )}
          {!featured && template.new && (
            <div className="rounded-md bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase shadow-sm">
              {newLabel}
            </div>
          )}
        </div>

        {/* Selection Indicator */}
        <div
          className={cn(
            'absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300',
            isSelected
              ? 'scale-100 bg-purple-500 text-white shadow-lg shadow-purple-500/40'
              : 'scale-0 bg-black/40 text-white/40 opacity-0'
          )}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </div>

        {/* Play Button Overlay (Hover) */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            isHovering && !isSelected
              ? 'scale-100 opacity-100'
              : 'scale-90 opacity-0'
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 shadow-lg backdrop-blur-md">
            <Play className="ml-1 h-5 w-5 fill-white text-white" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-2 right-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {template.duration}s
        </div>
      </div>

      {/* Card Footer - Always Visible */}
      <div className="flex w-full flex-col gap-1 p-3 text-left">
        <h4 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-purple-300">
          {template.name}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-white/50">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {template.useCount || '1k+'} {usesLabel}
          </span>
          {template.popularity > 80 && (
            <span className="flex items-center gap-1 text-orange-400">
              <Flame className="h-3 w-3" />
              {trendingLabel}
            </span>
          )}
        </div>
      </div>

      {/* Quick Preview Button (Absolute position over image) */}
      <div
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
        className="absolute right-2 bottom-[4.5rem] rounded-full bg-black/40 p-1.5 text-white/70 opacity-0 backdrop-blur-sm transition-colors group-hover:opacity-100 hover:bg-black/60 hover:text-white"
        title="Preview Full Screen"
      >
        <ScanEye className="h-4 w-4" />
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
  creditsLabel = 'credits',
  leftLabel = 'left',
  signInLabel = 'Sign in to Generate',
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
  creditsLabel?: string;
  leftLabel?: string;
  signInLabel?: string;
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
                {costCredits} {creditsLabel}
              </span>
              <span
                className={cn(
                  'text-[10px]',
                  remainingCredits < costCredits
                    ? 'text-red-400'
                    : 'text-green-400'
                )}
              >
                {remainingCredits} {leftLabel}
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
            {signInLabel}
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
  trendingNowLabel = 'Trending Now',
}: {
  templates: DanceTemplate[];
  selectedId?: string;
  onSelect: (t: DanceTemplate) => void;
  onPreview: (t: DanceTemplate) => void;
  trendingNowLabel?: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
          <Flame className="h-5 w-5 text-orange-500" fill="currentColor" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-white">
          {trendingNowLabel}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

function TemplateGrid({
  templates,
  selectedId,
  onSelect,
  onPreview,
  hotLabel,
  newLabel,
  trendingLabel,
  usesLabel,
}: {
  templates: DanceTemplate[];
  selectedId?: string;
  onSelect: (t: DanceTemplate) => void;
  onPreview: (t: DanceTemplate) => void;
  hotLabel?: string;
  newLabel?: string;
  trendingLabel?: string;
  usesLabel?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedId === template.id}
          onSelect={() => onSelect(template)}
          onPreview={() => onPreview(template)}
          hotLabel={hotLabel}
          newLabel={newLabel}
          trendingLabel={trendingLabel}
          usesLabel={usesLabel}
        />
      ))}
    </div>
  );
}

export function DanceGeneratorPremium({
  section,
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
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 text-center">
            {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 backdrop-blur-md">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">
                {section?.badge ?? 'AI-Powered Generation'}
              </span>
            </div>
            <h2
              className="text-4xl font-bold text-white sm:text-5xl md:text-6xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {section?.title ?? 'Create Your'}{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {section?.title_highlight ?? 'Dance Video'}
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
              {section?.subtitle ??
                'Upload a photo, choose a trending dance, and watch AI bring it to life in seconds.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7 xl:col-span-8">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {t('step1_title')}
                    </h3>
                    <p className="text-sm text-white/50">
                      {section?.upload_hint ?? t('upload_hint')}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-white/5 transition-colors hover:border-violet-500/30 hover:bg-white/10">
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
                  <p className="mt-2 text-sm text-red-400">
                    {t('upload_error')}
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
                <div className="mb-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {t('step2_title')}
                      </h3>
                      <p className="text-sm text-white/50">
                        {section?.step2_hint ??
                          'Select a dance style from our library'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setActiveCategory(cat.value)}
                        className={cn(
                          'rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300',
                          activeCategory === cat.value
                            ? 'border-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
                            : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        {cat.value === 'all'
                          ? (section?.category_all ?? t('category_all'))
                          : t(`category_${cat.value}`)}
                        <span
                          className={cn(
                            'ml-2 text-xs',
                            activeCategory === cat.value
                              ? 'text-white/80'
                              : 'text-white/40'
                          )}
                        >
                          {cat.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <TemplateGrid
                    templates={filteredTemplates}
                    selectedId={selectedTemplate?.id}
                    onSelect={setSelectedTemplate}
                    onPreview={setPreviewingTemplate}
                    hotLabel={section?.hot_label}
                    newLabel={section?.new_label}
                    trendingLabel={section?.trending_label}
                    usesLabel={section?.uses_label}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {t('result_title')}
                    </h3>
                  </div>

                  <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-inner">
                    {generatedVideo ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
                        <video
                          src={generatedVideo.url}
                          controls
                          autoPlay
                          loop
                          playsInline
                          className="h-full w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        {isGenerating ? (
                          <>
                            <Loader2 className="mb-4 h-12 w-12 animate-spin text-purple-500" />
                            <p className="text-sm font-medium text-white">
                              {t('generating')}
                            </p>
                            <p className="mt-2 text-xs text-white/50">
                              {taskStatusLabel}
                            </p>
                            <div className="mt-4 h-1.5 w-full max-w-[200px] rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </>
                        ) : selectedTemplate ? (
                          <>
                            {selectedTemplate.thumbnailUrl ? (
                              <Image
                                src={selectedTemplate.thumbnailUrl}
                                alt="Preview"
                                fill
                                className="object-cover opacity-30 blur-sm"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/20" />
                            )}
                            <div className="z-10 mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                              <Sparkles className="h-8 w-8 text-white drop-shadow-lg" />
                            </div>
                            <p className="z-10 max-w-[200px] text-sm font-medium text-white/80">
                              Ready to generate with
                              <br />
                              <span className="text-purple-300">
                                "{selectedTemplate.name}"
                              </span>
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="mb-4 rounded-full bg-white/5 p-4">
                              <Video className="h-8 w-8 text-white/20" />
                            </div>
                            <p className="text-sm text-white/40">
                              Select a template to see preview
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-4">
                    {generatedVideo ? (
                      <Button
                        size="lg"
                        onClick={handleDownloadVideo}
                        disabled={isDownloading}
                        className="h-14 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-lg font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] hover:shadow-purple-500/40"
                      >
                        {isDownloading ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-5 w-5" />
                        )}
                        {t('download')}
                      </Button>
                    ) : !isMounted ? (
                      <Button
                        className="h-14 w-full rounded-xl bg-white/10 text-white/50"
                        disabled
                      >
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('loading')}
                      </Button>
                    ) : user ? (
                      <Button
                        size="lg"
                        className={cn(
                          'h-14 w-full rounded-xl text-lg font-bold transition-all duration-300',
                          canGenerate
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] hover:shadow-purple-500/40'
                            : 'cursor-not-allowed bg-white/10 text-white/40'
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
                            {t('generate')}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="h-14 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-lg font-bold text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02]"
                        onClick={() => setIsShowSignModal(true)}
                      >
                        <User className="mr-2 h-5 w-5" />
                        {t('sign_in_to_generate')}
                      </Button>
                    )}

                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm">
                      <div className="flex items-center gap-2 text-white/60">
                        <Zap className="h-4 w-4" />
                        <span>
                          {t('credits_cost', { credits: costCredits })}
                        </span>
                      </div>
                      {isMounted && (
                        <span
                          className={cn(
                            'font-medium',
                            remainingCredits < costCredits
                              ? 'text-red-400'
                              : 'text-emerald-400'
                          )}
                        >
                          {t('credits_remaining', {
                            credits: remainingCredits,
                          })}
                        </span>
                      )}
                    </div>

                    {isMounted && user && remainingCredits < costCredits && (
                      <Link href="/pricing" className="block">
                        <Button
                          variant="ghost"
                          className="w-full text-purple-300 hover:bg-white/5 hover:text-purple-200"
                          size="sm"
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
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={() => setPreviewingTemplate(null)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-black shadow-2xl ring-1 ring-white/10"
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
            </div>
            <button
              type="button"
              onClick={() => setPreviewingTemplate(null)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-20">
              <h3 className="mb-2 text-2xl font-bold text-white">
                {previewingTemplate.name}
              </h3>
              <Button
                size="lg"
                className="w-full rounded-xl bg-white font-bold text-black hover:bg-gray-200"
                onClick={() => {
                  setSelectedTemplate(previewingTemplate);
                  setPreviewingTemplate(null);
                }}
              >
                {section?.use_template ?? 'Use This Template'}
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
          creditsLabel={section?.credits_label}
          leftLabel={section?.left_label}
          signInLabel={t('sign_in_to_generate')}
        />
      )}
    </section>
  );
}

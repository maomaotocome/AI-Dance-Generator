'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Check,
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
  DanceCategory,
  DanceTemplate,
  DANCE_CATEGORIES,
  DANCE_TEMPLATES,
  getDanceTemplatesByCategory,
} from '@/config/dance-templates';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { ImageUploader, ImageUploaderValue } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
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
          return item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl;
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
          const candidate = item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }
  if (typeof output === 'object') {
    const candidate = output.url ?? output.uri ?? output.video ?? output.src ?? output.videoUrl;
    if (typeof candidate === 'string') return [candidate];
  }
  return [];
}

// Step indicator component
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
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300',
          isComplete
            ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/25'
            : isActive
              ? 'border-2 border-primary bg-primary/10 text-primary'
              : 'border border-border bg-muted/50 text-muted-foreground'
        )}
      >
        {isComplete ? <Check className="h-5 w-5" /> : step}
      </div>
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {title}
      </span>
    </div>
  );
}

// Template card component - refined design with better visual hierarchy
function TemplateCard({
  template,
  isSelected,
  onSelect,
  onPreview,
}: {
  template: DanceTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = template.thumbnailUrl && !imageError;

  // Generate a consistent gradient based on template name
  const gradientIndex = template.name.charCodeAt(0) % 4;
  const gradients = [
    'from-violet-500/30 via-purple-500/20 to-fuchsia-500/30',
    'from-blue-500/30 via-cyan-500/20 to-teal-500/30',
    'from-rose-500/30 via-pink-500/20 to-orange-500/30',
    'from-emerald-500/30 via-green-500/20 to-lime-500/30',
  ];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative overflow-hidden rounded-xl transition-all duration-300',
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]'
          : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10'
      )}
    >
      {/* 9:16 aspect ratio card */}
      <div className={cn(
        'relative aspect-[9/16] overflow-hidden rounded-xl',
        !hasValidImage && `bg-gradient-to-br ${gradients[gradientIndex]}`
      )}>
        {/* Background pattern for placeholder */}
        {!hasValidImage && (
          <div className="absolute inset-0">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            {/* Decorative circles */}
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Play className="ml-0.5 h-6 w-6 text-white/80" />
              </div>
            </div>
          </div>
        )}

        {/* Actual image if exists */}
        {template.thumbnailUrl && !imageError && (
          <Image
            src={template.thumbnailUrl}
            alt={template.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 25vw, 20vw"
            onError={() => setImageError(true)}
          />
        )}

        {/* Always visible gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

        {/* Preview button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 backdrop-blur-md transition-transform hover:scale-110"
          >
            <Play className="ml-0.5 h-4 w-4 text-white" fill="white" />
          </button>
        </div>

        {/* Selected indicator - top right */}
        {isSelected && (
          <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/50">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}

        {/* Trending badge - moved to avoid overlap with name */}
        {template.trending && (
          <div className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-lg">
            <Flame className="h-2.5 w-2.5" />
            <span>Hot</span>
          </div>
        )}

        {/* Bottom content - always visible */}
        <div className="absolute inset-x-0 bottom-0 p-2">
          {/* Template name */}
          <p className="mb-1 truncate text-center text-xs font-semibold text-white drop-shadow-lg">
            {template.name}
          </p>
          {/* Duration badge */}
          <div className="flex justify-center">
            <span className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
              {template.duration}s
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function DanceGeneratorPremium({
  templates = DANCE_TEMPLATES,
  maxSizeMB = 50,
  srOnlyTitle,
}: DanceGeneratorPremiumProps) {
  const t = useTranslations('ai.dance.generator');

  const [activeCategory, setActiveCategory] = useState<DanceCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<DanceTemplate | null>(null);
  const [uploadedImageItems, setUploadedImageItems] = useState<ImageUploaderValue[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<DanceTemplate | null>(null);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } = useAppContext();

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

  const handleImageChange = useCallback((items: ImageUploaderValue[]) => {
    setUploadedImageItems(items);
    const uploadedItem = items.find((item) => item.status === 'uploaded' && item.url);
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
        if (generationStartTime && Date.now() - generationStartTime > GENERATION_TIMEOUT) {
          resetTaskState();
          toast.error(t('error_timeout'));
          return true;
        }
        const resp = await fetch('/api/ai/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: id }),
        });
        if (!resp.ok) throw new Error(`request failed with status: ${resp.status}`);
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
          const errorMessage = parsedResult?.errorMessage || t('error_generation');
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
      if (!resp.ok) throw new Error(`request failed with status: ${resp.status}`);
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
      const resp = await fetch(`/api/proxy/file?url=${encodeURIComponent(generatedVideo.url)}`);
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
    uploadedImageUrl && selectedTemplate && !isGenerating && !isImageUploading && !hasImageUploadError;

  const step1Complete = !!uploadedImageUrl;
  const step2Complete = !!selectedTemplate;

  return (
    <section id="generator" className="relative py-16 md:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-12 text-center">
            {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Generation</span>
            </div>
            <h2
              className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Create Your <span className="gradient-text">Dance Video</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Upload a photo, choose a trending dance, and watch AI bring it to life in seconds.
            </p>
          </div>

          {/* Main generator card */}
          <div className="overflow-hidden rounded-3xl border border-border/50 bg-card/50 shadow-2xl backdrop-blur-sm">
            {/* Steps progress bar */}
            <div className="border-b border-border/50 bg-muted/30 px-6 py-4 md:px-8">
              <div className="flex items-center justify-between gap-4">
                <StepIndicator
                  step={1}
                  title={t('step1_title')}
                  isComplete={step1Complete}
                  isActive={!step1Complete}
                />
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                <StepIndicator
                  step={2}
                  title={t('step2_title')}
                  isComplete={step2Complete}
                  isActive={step1Complete && !step2Complete}
                />
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                <StepIndicator
                  step={3}
                  title="Generate"
                  isComplete={!!generatedVideo}
                  isActive={step1Complete && step2Complete && !generatedVideo}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.2fr]">
              {/* Left side - Upload & Templates */}
              <div className="border-r border-border/50 p-6 md:p-8">
                {/* Step 1: Upload */}
                <div className="mb-8">
                  <div className="mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">{t('step1_title')}</h3>
                  </div>
                  <div className="overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50">
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
                    <p className="mt-2 text-sm text-destructive">{t('upload_error')}</p>
                  )}
                </div>

                {/* Step 2: Select Template */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">{t('step2_title')}</h3>
                  </div>

                  {/* Category tabs */}
                  <Tabs
                    value={activeCategory}
                    onValueChange={(v) => setActiveCategory(v as DanceCategory | 'all')}
                    className="mb-4"
                  >
                    <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
                      <TabsTrigger
                        value="all"
                        className="rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                      >
                        All
                      </TabsTrigger>
                      {DANCE_CATEGORIES.map((cat) => (
                        <TabsTrigger
                          key={cat.value}
                          value={cat.value}
                          className="rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          {t(`category_${cat.value}`)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  {/* Template grid */}
                  <div className="grid max-h-80 grid-cols-3 gap-3 overflow-y-auto pr-2 scrollbar-hide sm:grid-cols-4">
                    {filteredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplate?.id === template.id}
                        onSelect={() => setSelectedTemplate(template)}
                        onPreview={() => setPreviewingTemplate(template)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side - Preview & Generate */}
              <div className="flex flex-col p-6 md:p-8">
                {/* Result preview */}
                <div className="mb-6 flex-1">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">{t('result_title')}</h3>
                  </div>

                  {generatedVideo ? (
                    <div className="flex flex-col items-center">
                      {/* Video in phone mockup */}
                      <div className="relative mx-auto w-full max-w-xs">
                        <div className="relative overflow-hidden rounded-3xl border-4 border-foreground/10 bg-black shadow-2xl">
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
                        {/* Glow effect */}
                        <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent blur-2xl" />
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 flex gap-3">
                        <Button
                          size="lg"
                          onClick={handleDownloadVideo}
                          disabled={isDownloading}
                          className="rounded-xl bg-gradient-to-r from-primary to-accent px-6 shadow-lg shadow-primary/25"
                        >
                          {isDownloading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-5 w-5" />
                          )}
                          {t('download')}
                        </Button>
                      </div>

                      {/* Share tip */}
                      <div className="mt-4 flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-sm text-muted-foreground">
                        <Share2 className="h-4 w-4" />
                        {t('share_tip')}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                      {/* Empty state mockup */}
                      <div className="relative mx-auto mb-6 w-48">
                        <div className="aspect-[9/16] overflow-hidden rounded-3xl border-2 border-dashed border-border bg-muted/30">
                          <div className="flex h-full items-center justify-center">
                            {isGenerating ? (
                              <div className="text-center">
                                <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin text-primary" />
                                <p className="text-sm font-medium text-muted-foreground">
                                  {taskStatusLabel || t('generating_hint')}
                                </p>
                              </div>
                            ) : (
                              <Video className="h-12 w-12 text-muted-foreground/30" />
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isGenerating ? t('generating_hint') : t('no_video')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {isGenerating && (
                  <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{t('progress')}</span>
                      <span className="font-bold text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {/* Generate button */}
                <div className="space-y-4">
                  {!isMounted ? (
                    <Button className="h-14 w-full rounded-xl text-base" disabled size="lg">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('loading')}
                    </Button>
                  ) : isCheckSign ? (
                    <Button className="h-14 w-full rounded-xl text-base" disabled size="lg">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t('checking_account')}
                    </Button>
                  ) : user ? (
                    <Button
                      size="lg"
                      className={cn(
                        'btn-glow h-14 w-full rounded-xl text-base font-semibold transition-all duration-300',
                        canGenerate
                          ? 'bg-gradient-to-r from-primary via-primary to-accent shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30'
                          : ''
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
                      className="h-14 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-base font-semibold shadow-lg shadow-primary/25"
                      onClick={() => setIsShowSignModal(true)}
                    >
                      <User className="mr-2 h-5 w-5" />
                      {t('sign_in_to_generate')}
                    </Button>
                  )}

                  {/* Credits info */}
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {t('credits_cost', { credits: costCredits })}
                      </span>
                    </div>
                    {isMounted && (
                      <span
                        className={cn(
                          'font-medium',
                          remainingCredits < costCredits ? 'text-destructive' : 'text-foreground'
                        )}
                      >
                        {t('credits_remaining', { credits: remainingCredits })}
                      </span>
                    )}
                  </div>

                  {isMounted && user && remainingCredits < costCredits && (
                    <Link href="/pricing" className="block">
                      <Button variant="outline" className="h-12 w-full rounded-xl" size="lg">
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

      {/* Template Preview Modal */}
      {previewingTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setPreviewingTemplate(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-sm overflow-hidden rounded-3xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[9/16]">
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
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-12">
              <p className="text-xl font-bold text-white">{previewingTemplate.name}</p>
              <p className="mt-1 text-sm text-white/70">{previewingTemplate.description}</p>
              <Button
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-accent"
                onClick={() => {
                  setSelectedTemplate(previewingTemplate);
                  setPreviewingTemplate(null);
                }}
              >
                Select This Dance
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

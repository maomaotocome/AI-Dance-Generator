'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Check,
  CreditCard,
  Download,
  Loader2,
  Play,
  Share2,
  Sparkles,
  User,
  Video,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import {
  DANCE_CATEGORIES,
  DANCE_TEMPLATES,
  DanceCategory,
  DanceTemplate,
  getDanceTemplatesByCategory,
} from '@/config/dance-templates';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { ImageUploader, ImageUploaderValue } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';

interface DanceGeneratorProps {
  templates?: DanceTemplate[];
  maxSizeMB?: number;
  srOnlyTitle?: string;
  initialTemplateId?: string;
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
const GENERATION_TIMEOUT = 600000; // 10 minutes for video

// AI model for dance generation - Kling Motion Control for best quality
const DANCE_MODEL = 'fal-ai/kling-video/v2.6/pro/motion-control';
const DANCE_PROVIDER = 'fal';

function parseTaskResult(taskResult: string | null): any {
  if (!taskResult) {
    return null;
  }

  try {
    return JSON.parse(taskResult);
  } catch (error) {
    console.warn('Failed to parse taskResult:', error);
    return null;
  }
}

function extractVideoUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  // check videos array first
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

  // check output
  const output = result.output ?? result.video ?? result.data;

  if (!output) {
    return [];
  }

  if (typeof output === 'string') {
    return [output];
  }

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
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function DanceGenerator({
  templates = DANCE_TEMPLATES,
  maxSizeMB = 50,
  srOnlyTitle,
  initialTemplateId,
}: DanceGeneratorProps) {
  const t = useTranslations('ai.dance.generator');

  const [activeCategory, setActiveCategory] = useState<DanceCategory | 'all'>(
    'all'
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<DanceTemplate | null>(
      initialTemplateId
        ? (templates.find((t) => t.id === initialTemplateId) ?? null)
        : null
    );
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

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value as DanceCategory | 'all');
  };

  const handleTemplateSelect = (template: DanceTemplate) => {
    setSelectedTemplate(template);
  };

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
    if (!taskStatus) {
      return '';
    }

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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId: id }),
        });

        if (!resp.ok) {
          throw new Error(`request failed with status: ${resp.status}`);
        }

        const { code, message, data } = await resp.json();
        if (code !== 0) {
          throw new Error(message || 'Query task failed');
        }

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
    if (!taskId || !isGenerating) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (!taskId) {
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        cancelled = true;
      }
    };

    tick();

    const interval = setInterval(async () => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        clearInterval(interval);
      }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.VIDEO,
          scene: 'dance-generation',
          provider: DANCE_PROVIDER,
          model: DANCE_MODEL,
          prompt: `A person dancing with smooth and natural movements, ${selectedTemplate.name} style dance, viral TikTok quality`,
          options,
        }),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to create dance task');
      }

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

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
    if (!generatedVideo?.url) {
      return;
    }

    try {
      setIsDownloading(true);
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(generatedVideo.url)}`
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch video');
      }

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

  // Step indicator
  const step1Complete = !!uploadedImageUrl;
  const step2Complete = !!selectedTemplate;

  return (
    <section id="generator" className="py-12 md:py-16">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Left Column - Generator */}
            <Card className="border-2">
              <CardHeader className="pb-4">
                {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Sparkles className="text-primary h-5 w-5" />
                  {t('title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                {/* Step 1: Upload Image */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        step1Complete
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {step1Complete ? <Check className="h-3.5 w-3.5" /> : '1'}
                    </div>
                    <h3 className="text-sm font-medium">{t('step1_title')}</h3>
                  </div>
                  <ImageUploader
                    title={t('upload_title')}
                    allowMultiple={false}
                    maxImages={1}
                    maxSizeMB={maxSizeMB}
                    onChange={handleImageChange}
                    emptyHint={t('upload_hint')}
                  />
                  {hasImageUploadError && (
                    <p className="text-destructive text-xs">
                      {t('upload_error')}
                    </p>
                  )}
                </div>

                {/* Step 2: Select Dance Template */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        step2Complete
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {step2Complete ? <Check className="h-3.5 w-3.5" /> : '2'}
                    </div>
                    <h3 className="text-sm font-medium">{t('step2_title')}</h3>
                  </div>

                  {/* Category Tabs */}
                  <Tabs
                    value={activeCategory}
                    onValueChange={handleCategoryChange}
                  >
                    <TabsList className="bg-muted/50 flex h-auto flex-wrap justify-start gap-1 p-1">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-3 py-1.5 text-xs"
                      >
                        {t('category_all')}
                      </TabsTrigger>
                      {DANCE_CATEGORIES.map((cat) => (
                        <TabsTrigger
                          key={cat.value}
                          value={cat.value}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-3 py-1.5 text-xs"
                        >
                          {t(`category_${cat.value}`)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  {/* Template Grid - Vertical format like TikTok */}
                  <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className={cn(
                          'group relative overflow-hidden rounded-lg border-2 transition-all hover:scale-[1.02]',
                          selectedTemplate?.id === template.id
                            ? 'border-primary ring-primary/30 ring-2'
                            : 'hover:border-primary/30 border-transparent'
                        )}
                      >
                        {/* 9:16 aspect ratio for TikTok format */}
                        <div className="from-primary/20 via-primary/10 to-primary/5 relative aspect-[9/16] bg-gradient-to-br">
                          {template.thumbnailUrl &&
                          template.thumbnailUrl !== '' ? (
                            <Image
                              src={template.thumbnailUrl}
                              alt={template.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="text-primary/40 h-8 w-8" />
                            </div>
                          )}

                          {/* Selected indicator */}
                          {selectedTemplate?.id === template.id && (
                            <div className="bg-primary absolute top-1 right-1 rounded-full p-0.5">
                              <Check className="text-primary-foreground h-3 w-3" />
                            </div>
                          )}

                          {/* Preview on hover */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewingTemplate(template);
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Play className="h-8 w-8 text-white" />
                          </button>

                          {/* Duration badge */}
                          <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                            {template.duration}s
                          </div>
                        </div>

                        {/* Template name */}
                        <div className="bg-background/80 absolute right-0 bottom-0 left-0 p-1.5 backdrop-blur-sm">
                          <p className="truncate text-center text-[10px] font-medium">
                            {template.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="space-y-3 pt-2">
                  {!isMounted ? (
                    <Button className="w-full" disabled size="lg">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('loading')}
                    </Button>
                  ) : isCheckSign ? (
                    <Button className="w-full" disabled size="lg">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('checking_account')}
                    </Button>
                  ) : user ? (
                    <Button
                      size="lg"
                      className="w-full text-base font-semibold"
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
                      className="w-full text-base font-semibold"
                      onClick={() => setIsShowSignModal(true)}
                    >
                      <User className="mr-2 h-5 w-5" />
                      {t('sign_in_to_generate')}
                    </Button>
                  )}

                  {/* Credits Info */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('credits_cost', { credits: costCredits })}
                    </span>
                    {isMounted && (
                      <span
                        className={cn(
                          remainingCredits < costCredits
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        )}
                      >
                        {t('credits_remaining', { credits: remainingCredits })}
                      </span>
                    )}
                  </div>

                  {isMounted && user && remainingCredits < costCredits && (
                    <Link href="/pricing" className="block">
                      <Button variant="outline" className="w-full" size="sm">
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t('buy_credits')}
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Progress */}
                {isGenerating && (
                  <div className="bg-muted/30 space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t('progress')}</span>
                      <span className="text-primary font-bold">
                        {progress}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {taskStatusLabel && (
                      <p className="text-muted-foreground text-center text-xs">
                        {taskStatusLabel}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Result */}
            <Card className="border-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <Video className="text-primary h-5 w-5" />
                  {t('result_title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                {generatedVideo ? (
                  <div className="space-y-4">
                    {/* Video in 9:16 format container */}
                    <div className="relative mx-auto max-w-xs overflow-hidden rounded-xl border-2 shadow-lg">
                      <div className="aspect-[9/16] bg-black">
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

                    {/* Action buttons */}
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleDownloadVideo}
                        disabled={isDownloading}
                        className="max-w-40 flex-1"
                      >
                        {isDownloading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        {t('download')}
                      </Button>
                    </div>

                    {/* Share tip */}
                    <div className="bg-primary/5 rounded-lg p-3 text-center">
                      <p className="text-muted-foreground flex items-center justify-center gap-2 text-xs">
                        <Share2 className="h-3.5 w-3.5" />
                        {t('share_tip')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    {/* Placeholder in 9:16 format */}
                    <div className="bg-muted/50 mx-auto mb-6 flex aspect-[9/16] w-40 items-center justify-center rounded-xl border-2 border-dashed">
                      <Video className="text-muted-foreground/50 h-12 w-12" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {isGenerating ? t('generating_hint') : t('no_video')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Template Preview Modal - Full screen for mobile feel */}
      {previewingTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewingTemplate(null)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-sm overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 9:16 video container */}
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

            {/* Close button */}
            <button
              type="button"
              onClick={() => setPreviewingTemplate(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Template info */}
            <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-lg font-bold text-white">
                {previewingTemplate.name}
              </p>
              <p className="text-sm text-white/70">
                {previewingTemplate.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from 'react'
import { Check, Download, FileCode2, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/stores/config-store'
import { validateLxMusicSourceScript } from '@/services/music-source/LxMusicSourceRunner'
import type {
  ImportedLxMusicSource,
  LxMusicSourceScriptDraft,
} from '../../../../shared/lx-music-source'
import {
  MUSIC_SOURCE_PROVIDERS,
  type MusicSourceProvider,
} from '../../../../main/config/types'

type MusicSourceTab = 'providers' | 'luoxue' | 'custom-api'

const MUSIC_SOURCE_PROVIDER_LABELS: Record<MusicSourceProvider, string> = {
  migu: '咪咕音乐',
  kugou: '酷狗音乐',
  pyncmd: 'pyncmd',
  bilibili: '哔哩哔哩',
  lxMusic: '落雪音源',
}

interface MusicSourceSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SourceToggle = ({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  onChange: () => void
}) => {
  return (
    <button
      type='button'
      disabled={disabled}
      aria-pressed={checked}
      onClick={onChange}
      className={cn(
        'bg-muted/60 relative h-8 w-24 rounded-full px-1 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        checked
          ? 'text-primary-foreground bg-primary/90'
          : 'text-muted-foreground'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'bg-background absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full shadow-sm transition-transform duration-300',
          checked ? 'translate-x-full' : 'translate-x-0'
        )}
      />
      <span className='relative z-10 grid h-full grid-cols-2 items-center'>
        <span className={cn(!checked && 'text-foreground')}>关闭</span>
        <span className={cn(checked && 'text-foreground')}>开启</span>
      </span>
    </button>
  )
}

const ScriptInfoCard = ({
  script,
  active,
  disabled,
  onActivate,
  onRemove,
}: {
  script: ImportedLxMusicSource
  active: boolean
  disabled: boolean
  onActivate: () => void
  onRemove: () => void
}) => {
  const meta = [
    script.version ? `版本 ${script.version}` : null,
    script.author ? `作者 ${script.author}` : null,
    script.sources?.length ? `支持 ${script.sources.join(', ')}` : null,
  ].filter(Boolean)

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border p-4 transition-colors',
        active
          ? 'border-primary/40 bg-primary/5'
          : 'border-border/70 bg-muted/30'
      )}
    >
      <button
        type='button'
        disabled={disabled}
        aria-label='设为当前落雪音源'
        onClick={onActivate}
        className={cn(
          'mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          active
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted-foreground/40'
        )}
      >
        {active ? <Check className='size-3.5' /> : null}
      </button>
      <div className='bg-background text-primary flex size-10 shrink-0 items-center justify-center rounded-xl'>
        <FileCode2 className='size-5' />
      </div>
      <div className='min-w-0 flex-1 space-y-1'>
        <h4 className='truncate text-sm font-semibold'>{script.name}</h4>
        <p className='text-muted-foreground truncate text-xs'>
          {script.fileName}
        </p>
        {script.description ? (
          <p className='text-muted-foreground line-clamp-2 text-xs'>
            {script.description}
          </p>
        ) : null}
        {meta.length ? (
          <p className='text-muted-foreground text-xs'>{meta.join(' / ')}</p>
        ) : null}
      </div>
      <Button
        type='button'
        variant='ghost'
        size='icon-sm'
        disabled={disabled}
        aria-label='删除落雪音源脚本'
        onClick={onRemove}
      >
        <Trash2 className='size-4' />
      </Button>
    </div>
  )
}

function uniqueProviders(providers: MusicSourceProvider[]) {
  return [...new Set(providers)]
}

const MusicSourceSettingsDialog = ({
  open,
  onOpenChange,
}: MusicSourceSettingsDialogProps) => {
  const config = useConfigStore(state => state.config)
  const setConfig = useConfigStore(state => state.setConfig)
  const [activeTab, setActiveTab] = useState<MusicSourceTab>('providers')
  const [providers, setProviders] = useState<MusicSourceProvider[]>([])
  const [lxScripts, setLxScripts] = useState<ImportedLxMusicSource[]>([])
  const [activeLxScriptId, setActiveLxScriptId] = useState<string | null>(null)
  const [customApiEnabled, setCustomApiEnabled] = useState(false)
  const [customApiUrl, setCustomApiUrl] = useState('')
  const [onlineScriptUrl, setOnlineScriptUrl] = useState('')
  const [importingLocal, setImportingLocal] = useState(false)
  const [importingOnline, setImportingOnline] = useState(false)
  const [saving, setSaving] = useState(false)

  const canSave = providers.length > 0
  const importing = importingLocal || importingOnline

  useEffect(() => {
    if (!open) {
      return
    }

    setActiveTab('providers')
    setProviders(config.musicSourceProviders)
    setLxScripts(config.luoxueMusicSourceScripts)
    setActiveLxScriptId(config.activeLuoxueMusicSourceScriptId)
    setCustomApiEnabled(config.customMusicApiEnabled)
    setCustomApiUrl(config.customMusicApiUrl)
    setOnlineScriptUrl('')
    // 只在打开弹框时同步一次，避免导入脚本写入配置后把当前 Tab 重置。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const persistLxScripts = async (
    scripts: ImportedLxMusicSource[],
    activeId: string | null,
    nextProviders = providers
  ) => {
    const nextActiveId = scripts.some(script => script.id === activeId)
      ? activeId
      : scripts[0]?.id || null
    const nextSourceEnabled = Boolean(nextActiveId)
    const nextMusicSourceProviders = nextSourceEnabled
      ? uniqueProviders([...nextProviders, 'lxMusic'])
      : nextProviders.filter(provider => provider !== 'lxMusic')

    setLxScripts(scripts)
    setActiveLxScriptId(nextActiveId)
    setProviders(nextMusicSourceProviders)

    await setConfig('luoxueMusicSourceScripts', scripts)
    await setConfig('activeLuoxueMusicSourceScriptId', nextActiveId)
    await setConfig('luoxueSourceEnabled', nextSourceEnabled)
    await setConfig('musicSourceProviders', nextMusicSourceProviders)
  }

  const validateAndSaveLxScript = async (draft: LxMusicSourceScriptDraft) => {
    const initedData = await validateLxMusicSourceScript(draft.rawScript)
    const savedScript = await window.electronMusicSource.saveLxScript(
      {
        ...draft,
        sources: Object.keys(initedData.sources),
      },
      initedData
    )
    const nextScripts = [...lxScripts, savedScript]

    await persistLxScripts(nextScripts, savedScript.id)
    toast.success(`已导入落雪音源：${savedScript.name}`)
  }

  const handleProviderChange = (
    provider: MusicSourceProvider,
    checked: boolean
  ) => {
    if (provider === 'lxMusic' && checked && !activeLxScriptId) {
      toast.warning('请先导入并选择落雪音源脚本')
      setActiveTab('luoxue')
      return
    }

    if (checked) {
      setProviders(current =>
        current.includes(provider) ? current : [...current, provider]
      )
      return
    }

    setProviders(current => {
      if (current.length <= 1) {
        toast.warning('至少保留一个音源')
        return current
      }

      return current.filter(item => item !== provider)
    })
  }

  const handleImportLocalLxScript = async () => {
    if (importing) {
      return
    }

    setImportingLocal(true)

    try {
      const draft = await window.electronMusicSource.selectLxScript()
      if (!draft) {
        return
      }

      await validateAndSaveLxScript(draft)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '导入音源脚本失败，请重试。'
      )
    } finally {
      setImportingLocal(false)
    }
  }

  const handleImportOnlineLxScript = async () => {
    if (importing) {
      return
    }

    const url = onlineScriptUrl.trim()
    if (!url) {
      toast.warning('请输入在线音源脚本 URL')
      return
    }

    setImportingOnline(true)

    try {
      const draft =
        await window.electronMusicSource.downloadLxScriptFromUrl(url)
      await validateAndSaveLxScript(draft)
      setOnlineScriptUrl('')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '在线导入音源脚本失败，请重试。'
      )
    } finally {
      setImportingOnline(false)
    }
  }

  const handleActivateLxScript = async (scriptId: string) => {
    if (saving || importing) {
      return
    }

    try {
      await persistLxScripts(lxScripts, scriptId)
      toast.success('已切换落雪音源')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '切换落雪音源失败，请重试。'
      )
    }
  }

  const handleRemoveLxScript = async (scriptId: string) => {
    if (saving || importing) {
      return
    }

    const nextScripts = lxScripts.filter(script => script.id !== scriptId)
    const nextActiveId =
      activeLxScriptId === scriptId
        ? nextScripts[0]?.id || null
        : activeLxScriptId

    try {
      await persistLxScripts(nextScripts, nextActiveId)
      await window.electronMusicSource.removeLxScript(scriptId)
      toast.success('已删除落雪音源脚本')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '删除落雪音源失败，请重试。'
      )
    }
  }

  const handleSave = async () => {
    if (!canSave || saving) {
      return
    }

    const nextProviders = activeLxScriptId
      ? providers
      : providers.filter(provider => provider !== 'lxMusic')

    setSaving(true)

    try {
      await setConfig('musicSourceProviders', nextProviders)
      await setConfig('luoxueSourceEnabled', Boolean(activeLxScriptId))
      await setConfig('customMusicApiEnabled', customApiEnabled)
      await setConfig('customMusicApiUrl', customApiUrl.trim())
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '保存音源设置失败，请重试。'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[min(680px,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden rounded-[28px] p-0 lg:max-w-170'>
        <div className='space-y-5 px-7 pt-7 pb-6'>
          <DialogHeader>
            <DialogTitle className='text-xl font-semibold'>
              音源设置
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={value => setActiveTab(value as MusicSourceTab)}
            className='gap-4'
          >
            <TabsList className='bg-muted/60 grid h-10 w-full grid-cols-3 rounded-2xl p-1'>
              <TabsTrigger value='providers' className='rounded-xl'>
                音源选择
              </TabsTrigger>
              <TabsTrigger value='luoxue' className='rounded-xl'>
                落雪音源
              </TabsTrigger>
              <TabsTrigger value='custom-api' className='rounded-xl'>
                自定义 API
              </TabsTrigger>
            </TabsList>

            <TabsContent value='providers' className='min-h-[320px] space-y-4'>
              <div>
                <h3 className='text-foreground text-sm font-semibold'>
                  音源选择
                </h3>
                <p className='text-muted-foreground mt-1 text-xs'>
                  至少保留一个音源。落雪音源需要先导入脚本并选择当前脚本。
                </p>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                {MUSIC_SOURCE_PROVIDERS.map(provider => (
                  <label
                    key={provider}
                    className={cn(
                      'border-border/70 bg-muted/30 hover:bg-muted/60 flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors',
                      provider === 'lxMusic' &&
                        !activeLxScriptId &&
                        'opacity-70'
                    )}
                  >
                    <Checkbox
                      checked={providers.includes(provider)}
                      onCheckedChange={checked =>
                        handleProviderChange(provider, checked === true)
                      }
                    />
                    <span className='min-w-0 flex-1 text-sm font-medium'>
                      {MUSIC_SOURCE_PROVIDER_LABELS[provider]}
                      {provider === 'lxMusic' ? (
                        <span className='text-muted-foreground block truncate text-[11px] font-normal'>
                          {activeLxScriptId
                            ? lxScripts.find(
                                script => script.id === activeLxScriptId
                              )?.name
                            : '未配置'}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='luoxue' className='min-h-[320px] space-y-4'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h3 className='text-foreground text-sm font-semibold'>
                    落雪音源
                  </h3>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    支持本地导入和在线 URL 导入 LX Music 自定义源脚本。
                  </p>
                </div>
              </div>

              {lxScripts.length ? (
                <div className='max-h-44 space-y-3 overflow-y-auto pr-1'>
                  {lxScripts.map(script => (
                    <ScriptInfoCard
                      key={script.id}
                      script={script}
                      active={script.id === activeLxScriptId}
                      disabled={saving || importing}
                      onActivate={() => void handleActivateLxScript(script.id)}
                      onRemove={() => void handleRemoveLxScript(script.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className='border-border/70 bg-muted/20 text-muted-foreground flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center text-sm'>
                  <FileCode2 className='size-6' />
                  <span>尚未导入落雪音源脚本</span>
                </div>
              )}

              <div className='space-y-3'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={importing}
                  onClick={() => void handleImportLocalLxScript()}
                >
                  <Upload
                    className={importingLocal ? 'animate-pulse' : undefined}
                  />
                  本地导入脚本
                </Button>

                <div className='flex items-center gap-2'>
                  <Input
                    value={onlineScriptUrl}
                    disabled={importing}
                    placeholder='输入在线落雪音源脚本 URL'
                    onChange={event => setOnlineScriptUrl(event.target.value)}
                    className='bg-muted/40 h-10 border-none px-4'
                  />
                  <Button
                    type='button'
                    disabled={!onlineScriptUrl.trim() || importing}
                    onClick={() => void handleImportOnlineLxScript()}
                  >
                    <Download
                      className={importingOnline ? 'animate-pulse' : undefined}
                    />
                    在线导入
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='custom-api' className='min-h-[320px] space-y-4'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <h3 className='text-foreground text-sm font-semibold'>
                    自定义 API
                  </h3>
                  <p className='text-muted-foreground mt-1 text-xs'>
                    填写自定义音乐解析 API 地址，关闭时不会参与解析。
                  </p>
                </div>
                <SourceToggle
                  checked={customApiEnabled}
                  onChange={() => setCustomApiEnabled(value => !value)}
                />
              </div>
              <Input
                value={customApiUrl}
                disabled={!customApiEnabled}
                placeholder='https://example.com/api'
                onChange={event => setCustomApiUrl(event.target.value)}
                className='bg-muted/40 h-10 border-none px-4'
              />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className='mx-0 mb-0 px-7 py-5'>
          <Button
            type='button'
            variant='ghost'
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            type='button'
            disabled={!canSave || saving}
            onClick={() => void handleSave()}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MusicSourceSettingsDialog

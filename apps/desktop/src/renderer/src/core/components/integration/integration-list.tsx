import * as React from 'react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@manager/ui'
import { useI18n } from '@renderer/hooks/use-i18n'
import { useUserStore } from '@renderer/core/store/user.store'
import { Google } from '@renderer/components/brands/google'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CloudOff,
  ExternalLink,
  Github,
  Loader2,
  LogOut,
  MoreVertical,
  NotepadText,
  RefreshCw,
  Settings,
  Slack,
  UploadCloud,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'

export type IntegrationStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'ERROR'
  | 'REVOKED'
  | 'RATE_LIMITED'

export type IntegrationId =
  | 'google'
  | 'slack'
  | 'notion'
  | 'github'
  | 'microsoft'
  | 'apple'

export type IntegrationDefinition = {
  id: IntegrationId
  name: string
  description: string
  icon: React.ReactNode
  scopes?: string[]
  comingSoon?: boolean
  requiresAuth?: boolean
  settingsFields?: React.ReactNode
}

export type ConnectedAccount = {
  email?: string
  org?: string
  lastSynced?: string
}

export type IntegrationState = {
  status: IntegrationStatus
  account?: ConnectedAccount
  error?: string
}

// ---- Utility components
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
)

const BrandGoogle = () => <Google className="size-7" />
const BrandSlack = () => <Slack className="size-7" />
const BrandNotion = () => <NotepadText className="size-7" />
const BrandGithub = () => <Github className="size-7" />
const BrandMicrosoft = () => (
  <svg
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 23 23"
    className="size-7"
  >
    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
    <path fill="#f35325" d="M1 1h10v10H1z" />
    <path fill="#81bc06" d="M12 1h10v10H12z" />
    <path fill="#05a6f0" d="M1 12h10v10H1z" />
    <path fill="#ffba08" d="M12 12h10v10H12z" />
  </svg>
)
const BrandApple = () => (
  <svg
    aria-hidden
    className="size-7"
    viewBox="-52.01 0 560.035 560.035"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655" />
  </svg>
)

const CATALOG: IntegrationDefinition[] = [
  {
    id: 'google',
    name: 'Google',
    icon: <BrandGoogle />,
    description: 'Sync Calendar, Drive, and Contacts.',
    scopes: ['calendar.read', 'drive.read', 'contacts.read'],
    requiresAuth: true,
    settingsFields: (
      <div className="grid gap-2">
        <Label>Sync frequency</Label>
        <select className="rounded-md border p-2">
          <option>Every 15 minutes</option>
          <option>Hourly</option>
          <option>Daily</option>
        </select>
      </div>
    )
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: <BrandSlack />,
    description: 'Post messages, import channels, and more.',
    scopes: ['chat:write', 'channels:read'],
    requiresAuth: true,
    settingsFields: (
      <div className="grid gap-2">
        <Label>Default channel</Label>
        <Input placeholder="#general" />
      </div>
    )
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: <BrandNotion />,
    description: 'Two-way sync with selected databases.',
    scopes: ['databases.read', 'pages.read'],
    requiresAuth: true,
    settingsFields: (
      <div className="grid gap-2">
        <Label>Database ID</Label>
        <Input placeholder="Paste your Notion DB ID" />
      </div>
    )
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: <BrandGithub />,
    description: 'Sync issues, PRs, and deployments.',
    scopes: ['repo', 'read:org'],
    requiresAuth: true,
    settingsFields: (
      <div className="grid gap-2">
        <Label>Repository filter</Label>
        <Input placeholder="org/repo-name" />
      </div>
    )
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: <BrandMicrosoft />,
    description: 'Outlook, OneDrive, and Teams integration.',
    scopes: ['files.read', 'user.read'],
    requiresAuth: true,
    settingsFields: (
      <div className="grid gap-2">
        <Label>Sync calendar type</Label>
        <select className="rounded-md border p-2">
          <option>Work</option>
          <option>Personal</option>
        </select>
      </div>
    )
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: <BrandApple />,
    description: 'Sign in with Apple and iCloud sync.',
    comingSoon: true
  }
]

function useIntegrationService() {
  const store = useUserStore()
  const [states, setStates] = React.useState<
    Record<IntegrationId, IntegrationState>
  >({
    google: {
      status:
        (store.currentUser?.google?.status as IntegrationStatus) ??
        'DISCONNECTED'
    },
    slack: { status: 'DISCONNECTED' },
    notion: { status: 'DISCONNECTED' },
    github: { status: 'DISCONNECTED' },
    microsoft: { status: 'DISCONNECTED' },
    apple: { status: 'DISCONNECTED' }
  })

  const set = (id: IntegrationId, next: Partial<IntegrationState>) =>
    setStates((s) => ({ ...s, [id]: { ...s[id], ...next } }))

  const connect = async (id: IntegrationId) => {
    const def = CATALOG.find((c) => c.id === id)!
    if (def.comingSoon) return
    set(id, { status: 'CONNECTING', error: undefined })
    try {
      // Wire these to your real store flows
      if (id === 'google') {
        await store.authenticateGoogle?.()
      } else {
        // Simulate network
        await new Promise((r) => setTimeout(r, 900))
      }
      set(id, {
        status: 'CONNECTED',
        account: {
          email: store.currentUser?.email ?? 'you@example.com',
          lastSynced: new Date().toISOString()
        }
      })
    } catch (e: any) {
      set(id, { status: 'ERROR', error: e?.message ?? 'Failed to connect' })
    }
  }

  const revoke = async (id: IntegrationId) => {
    set(id, { status: 'CONNECTING' })
    try {
      if (id === 'google') {
        await store.revokeGoogle?.()
      } else {
        await new Promise((r) => setTimeout(r, 600))
      }
      set(id, { status: 'REVOKED' })
      // After revoke, surface as disconnected but with toast
      setTimeout(
        () => set(id, { status: 'DISCONNECTED', account: undefined }),
        1200
      )
    } catch (e: any) {
      set(id, { status: 'ERROR', error: e?.message ?? 'Failed to revoke' })
    }
  }

  const resync = async (id: IntegrationId) => {
    set(id, { status: 'CONNECTING' })
    await new Promise((r) => setTimeout(r, 900))
    set(id, {
      status: 'CONNECTED',
      account: { ...states[id].account, lastSynced: new Date().toISOString() }
    })
  }

  return { states, connect, revoke, resync }
}

// ---- UI helpers
function StatusPill({ status }: { status: IntegrationStatus }) {
  const map: Record<
    IntegrationStatus,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    CONNECTED: {
      label: 'Connected',
      className: 'bg-green-600/10 text-green-600',
      icon: <CheckCircle2 className="size-3.5" />
    },
    CONNECTING: {
      label: 'Working…',
      className: 'bg-blue-600/10 text-blue-600',
      icon: <Loader2 className="size-3.5 animate-spin" />
    },
    DISCONNECTED: {
      label: 'Not connected',
      className: 'bg-muted text-muted-foreground',
      icon: <CloudOff className="size-3.5" />
    },
    ERROR: {
      label: 'Error',
      className: 'bg-red-600/10 text-red-600',
      icon: <XCircle className="size-3.5" />
    },
    REVOKED: {
      label: 'Revoked',
      className: 'bg-amber-600/10 text-amber-600',
      icon: <AlertTriangle className="size-3.5" />
    },
    RATE_LIMITED: {
      label: 'Rate limited',
      className: 'bg-amber-600/10 text-amber-600',
      icon: <Clock className="size-3.5" />
    }
  }
  const s = map[status]
  return (
    <Badge
      variant="secondary"
      className={`gap-1 rounded-full px-2.5 py-0.5 ${s.className}`}
      aria-live="polite"
    >
      {s.icon}
      <span className="text-[11px] font-medium leading-none">{s.label}</span>
    </Badge>
  )
}

function LoadingContent() {
  return (
    <div
      role="status"
      aria-busy
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <Loader2 className="size-4 animate-spin" />
      <span>Working…</span>
      <VisuallyHidden>Content is loading</VisuallyHidden>
    </div>
  )
}

// ---- Individual card
function IntegrationCard({
  def,
  state,
  onConnect,
  onRevoke,
  onResync
}: {
  def: IntegrationDefinition
  state: IntegrationState
  onConnect: () => void
  onRevoke: () => void
  onResync: () => void
}) {
  const disabled = !!def.comingSoon || state.status === 'CONNECTING'

  return (
    <Card className="flex h-full flex-col justify-between rounded-2xl border shadow-sm">
      <CardHeader className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-muted/60">
              {def.icon}
            </div>
            <CardTitle className="text-base leading-tight">
              {def.name}
            </CardTitle>
          </div>
          {def.comingSoon ? (
            <Badge className="rounded-full bg-amber-600/10 text-amber-600">
              Coming soon
            </Badge>
          ) : (
            <StatusPill status={state.status} />
          )}

          {!def.comingSoon && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${def.name} menu`}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={onResync}
                  disabled={state.status !== 'CONNECTED'}
                >
                  <UploadCloud className="mr-2 size-4" /> Re-sync now
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(def.name + ' integration docs')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 size-4" /> Provider docs
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={onRevoke}
                  disabled={state.status !== 'CONNECTED'}
                >
                  <LogOut className="mr-2 size-4" /> Revoke access
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardDescription className="text-sm leading-snug">
          {def.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-3 text-sm">
        {state.status === 'CONNECTING' ? (
          <LoadingContent />
        ) : (
          <>
            {state.status === 'ERROR' && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-red-600">
                <XCircle className="mt-0.5 size-4" />
                <div>
                  <p className="font-medium">Connection error</p>
                  <p className="text-xs text-red-700/80">
                    {state.error ?? 'Unknown error.'}
                  </p>
                </div>
              </div>
            )}

            {state.account?.email && (
              <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                Connected as{' '}
                <span className="font-medium text-foreground">
                  {state.account.email}
                </span>
                {state.account.org && (
                  <>
                    {' '}
                    · Org:{' '}
                    <span className="font-medium text-foreground">
                      {state.account.org}
                    </span>
                  </>
                )}
                {state.account.lastSynced && (
                  <>
                    {' '}
                    · Last sync{' '}
                    {new Date(state.account.lastSynced).toLocaleString()}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        {def.comingSoon ? (
          <Button variant="secondary" size="sm" disabled>
            Coming soon
          </Button>
        ) : state.status === 'CONNECTED' ? (
          <div className="flex items-center gap-2">
            {def.settingsFields && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-1 size-4" /> Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{def.name} settings</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4">{def.settingsFields}</div>
                  <DialogFooter>
                    <Button variant="outline" onClick={onResync}>
                      Re-sync
                    </Button>
                    <Button variant="destructive" onClick={onRevoke}>
                      Revoke
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" size="sm" onClick={onRevoke}>
              <LogOut className="mr-1 size-4" /> Revoke
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onConnect}
            disabled={disabled}
          >
            Connect
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// ---- Gallery + filters
export default function IntegrationsGallery() {
  const { t } = useI18n()
  const service = useIntegrationService()

  const [search, setSearch] = React.useState('')
  const [tab, setTab] = React.useState<
    'all' | 'connected' | 'popular' | 'coming'
  >('all')

  const items = React.useMemo(() => {
    const q = search.toLowerCase().trim()
    let list = CATALOG.filter((c) => c.name.toLowerCase().includes(q))
    if (tab === 'connected')
      list = list.filter((c) => service.states[c.id].status === 'CONNECTED')
    if (tab === 'popular')
      list = list.filter((c) =>
        ['google', 'slack', 'github', 'notion'].includes(c.id)
      )
    if (tab === 'coming') list = list.filter((c) => c.comingSoon)
    return list
  }, [search, tab, service.states])

  const onConnect = async (id: IntegrationId) => {
    await service.connect(id)
    if (service.states[id].status !== 'ERROR') {
      toast.message('Connected', {
        description: `Successfully connected to ${id}.`
      })
    } else {
      toast.error('Connection failed')
    }
  }

  const onRevoke = async (id: IntegrationId) => {
    await service.revoke(id)
    toast.message('Revoked', {
      description: `Access revoked for ${id}.`
    })
  }

  const onResync = async (id: IntegrationId) => {
    await service.resync(id)
    toast('Sync complete', { description: `Fetched latest data from ${id}.` })
  }

  return (
    <div className="mx-auto grid gap-4">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">
            {t('settings.integrations.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('settings.integrations.description')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search integrations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-64"
            aria-label="Search integrations"
          />
        </div>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="coming">Coming soon</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4" />
        <TabsContent value="popular" className="mt-4" />
        <TabsContent value="connected" className="mt-4" />
        <TabsContent value="coming" className="mt-4" />
      </Tabs>

      <div
        role="list"
        aria-live="polite"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {items.length === 0 && (
          <div className="col-span-full rounded-2xl border p-8 text-center text-sm text-muted-foreground">
            No integrations match your search.
          </div>
        )}

        {items.map((def) => (
          <div role="listitem" key={def.id}>
            <IntegrationCard
              def={def}
              state={service.states[def.id]}
              onConnect={() => onConnect(def.id)}
              onRevoke={() => onRevoke(def.id)}
              onResync={() => onResync(def.id)}
            />
          </div>
        ))}
      </div>

      <footer className="mt-2 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Tip: Some integrations require an admin to approve scopes. You can
          re-auth at any time.
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Separator className="h-4" orientation="vertical" />
          <span className="hidden sm:inline">Having trouble?</span>
          <a
            href="https://status.cloud.google.com/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            Check provider status
          </a>
        </div>
      </footer>
    </div>
  )
}

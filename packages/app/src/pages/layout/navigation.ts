import { base64Encode } from "@opencode-ai/util/encode"
import { type Session } from "@opencode-ai/sdk/v2/client"
import type { LocalProject } from "@/context/layout"
import { type Accessor, type Setter } from "solid-js"
import { effectiveWorkspaceOrder, latestRootSession, workspaceKey } from "./helpers"

export function createLayoutNavigation(props: {
  layout: {
    projects: { list: () => LocalProject[]; open: (directory: string) => void; close: (directory: string) => void }
  }
  store: {
    workspaceOrder: Record<string, string[]>
    lastProjectSession: Record<string, { directory: string; id: string; at: number } | undefined>
  }
  params: { dir?: string; id?: string }
  currentDir: Accessor<string>
  currentProject: Accessor<LocalProject | undefined>
  server: { projects: { last: () => string | undefined; touch: (directory: string) => void } }
  globalSync: {
    child: (directory: string, opts?: { bootstrap?: boolean }) => [{ session: Session[]; path: { directory: string }; project?: string }]
    data: { project: { id: string; worktree: string }[] }
  }
  globalSDK: {
    client: {
      worktree: { list: (input: { directory: string }) => Promise<{ data?: string[] }> }
      session: {
        get: (input: { sessionID: string }) => Promise<{ data?: Session }>
        list: (input: { directory: string }) => Promise<{ data?: Session[] }>
      }
    }
  }
  clearSidebarHoverState: () => void
  setLastProjectSession: (root: string, session: { directory: string; id: string; at: number }) => void
  clearLastProjectSession: (root: string) => void
  navigate: (href: string) => void
  hideMobileSidebar: () => void
}) {
  const navigateWithSidebarReset = (href: string) => {
    props.clearSidebarHoverState()
    props.navigate(href)
    props.hideMobileSidebar()
  }

  const projectRoot = (directory: string) => {
    const project = props.layout.projects
      .list()
      .find((item) => item.worktree === directory || item.sandboxes?.includes(directory))
    if (project) return project.worktree

    const known = Object.entries(props.store.workspaceOrder).find(([root, dirs]) => root === directory || dirs.includes(directory))
    if (known) return known[0]

    const [child] = props.globalSync.child(directory, { bootstrap: false })
    const id = child.project
    if (!id) return directory

    const meta = props.globalSync.data.project.find((item) => item.id === id)
    return meta?.worktree ?? directory
  }

  const activeProjectRoot = (directory: string) => props.currentProject()?.worktree ?? projectRoot(directory)

  const touchProjectRoute = () => {
    const root = props.currentProject()?.worktree
    if (!root) return
    if (props.server.projects.last() !== root) props.server.projects.touch(root)
    return root
  }

  const rememberSessionRoute = (directory: string, id: string, root = activeProjectRoot(directory)) => {
    props.setLastProjectSession(root, { directory, id, at: Date.now() })
    return root
  }

  const syncSessionRoute = (directory: string, id: string, scroll: (id: string, key: string) => void, expanded?: boolean) => {
    const root = rememberSessionRoute(directory, id)
    if (expanded === false) scroll(id, `${directory}:${id}`)
    return root
  }

  const navigateToSession = (session: Session | undefined) => {
    if (!session) return
    navigateWithSidebarReset(`/${base64Encode(session.directory)}/session/${session.id}`)
  }

  const openProject = (directory: string, move = true) => {
    props.layout.projects.open(directory)
    if (move) void navigateToProject(directory)
  }

  const navigateToProject = async (directory: string | undefined) => {
    if (!directory) return
    const root = projectRoot(directory)
    props.server.projects.touch(root)
    const project = props.layout.projects.list().find((item) => item.worktree === root)
    let dirs = project ? effectiveWorkspaceOrder(root, [root, ...(project.sandboxes ?? [])], props.store.workspaceOrder[root]) : [root]
    const canOpen = (value: string | undefined) => !!value && dirs.some((item) => workspaceKey(item) === workspaceKey(value))
    const refreshDirs = async (target?: string) => {
      if (!target || target === root || canOpen(target)) return canOpen(target)
      const listed = await props.globalSDK.client.worktree.list({ directory: root }).then((x) => x.data ?? []).catch(() => [] as string[])
      dirs = effectiveWorkspaceOrder(root, [root, ...listed], props.store.workspaceOrder[root])
      return canOpen(target)
    }
    const openSession = async (target: { directory: string; id: string }) => {
      if (!canOpen(target.directory)) return false
      const [data] = props.globalSync.child(target.directory, { bootstrap: false })
      if (data.session.some((item) => item.id === target.id)) {
        props.setLastProjectSession(root, { directory: target.directory, id: target.id, at: Date.now() })
        navigateWithSidebarReset(`/${base64Encode(target.directory)}/session/${target.id}`)
        return true
      }
      const resolved = await props.globalSDK.client.session.get({ sessionID: target.id }).then((x) => x.data).catch(() => undefined)
      if (!resolved?.directory) return false
      if (!canOpen(resolved.directory)) return false
      props.setLastProjectSession(root, { directory: resolved.directory, id: resolved.id, at: Date.now() })
      navigateWithSidebarReset(`/${base64Encode(resolved.directory)}/session/${resolved.id}`)
      return true
    }

    const projectSession = props.store.lastProjectSession[root]
    if (projectSession?.id) {
      await refreshDirs(projectSession.directory)
      if (await openSession(projectSession)) return
      props.clearLastProjectSession(root)
    }

    const latest = latestRootSession(
      dirs.map((item) => props.globalSync.child(item, { bootstrap: false })[0]),
      Date.now(),
    )
    if (latest && (await openSession(latest))) return

    const fetched = latestRootSession(
      await Promise.all(
        dirs.map(async (item) => ({
          path: { directory: item },
          session: await props.globalSDK.client.session.list({ directory: item }).then((x) => x.data ?? []).catch(() => []),
        })),
      ),
      Date.now(),
    )
    if (fetched && (await openSession(fetched))) return

    navigateWithSidebarReset(`/${base64Encode(root)}/session`)
  }

  const closeProject = (directory: string) => {
    const list = props.layout.projects.list()
    const index = list.findIndex((x) => x.worktree === directory)
    const active = props.currentProject()?.worktree === directory
    if (index === -1) return
    const next = list[index + 1]

    if (!active) {
      props.layout.projects.close(directory)
      return
    }

    if (!next) {
      props.layout.projects.close(directory)
      props.navigate("/")
      return
    }

    navigateWithSidebarReset(`/${base64Encode(next.worktree)}/session`)
    props.layout.projects.close(directory)
    queueMicrotask(() => {
      void navigateToProject(next.worktree)
    })
  }

  return {
    navigateWithSidebarReset,
    projectRoot,
    activeProjectRoot,
    touchProjectRoute,
    rememberSessionRoute,
    syncSessionRoute,
    navigateToSession,
    navigateToProject,
    openProject,
    closeProject,
  }
}

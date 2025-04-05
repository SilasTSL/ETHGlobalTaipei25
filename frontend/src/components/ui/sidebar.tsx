"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarContextProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  collapsible: "always" | "responsive" | "none"
}

const SidebarContext = React.createContext<SidebarContextProps>({
  collapsed: false,
  setCollapsed: () => undefined,
  collapsible: "responsive",
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
  collapsible?: "always" | "responsive" | "none"
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
  collapsible = "responsive",
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, collapsible }}>
      <div className="grid lg:grid-cols-[auto_1fr]">{children}</div>
    </SidebarContext.Provider>
  )
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: "always" | "responsive" | "none"
}

export function Sidebar({ className, collapsible = "responsive", ...props }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, collapsible }}>
      <div
        data-collapsed={collapsed}
        className={cn(
          "relative flex h-full flex-col gap-4 border-r bg-background",
          collapsible === "always" && ["transition-[width]", collapsed ? "w-16" : "w-72"],
          collapsible === "responsive" && ["transition-[width]", collapsed ? "w-16 lg:w-16" : "w-16 lg:w-72"],
          collapsible === "none" && "w-72",
          className,
        )}
        {...props}
      />
    </SidebarContext.Provider>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return <div className={cn("flex h-16 items-center px-4", className)} {...props} />
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return <div className={cn("flex-1 overflow-auto py-2", className)} {...props} />
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({ className, ...props }: SidebarFooterProps) {
  return <div className={cn("flex flex-col gap-4 p-4", className)} {...props} />
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroup({ className, ...props }: SidebarGroupProps) {
  return <div className={cn("px-2 py-2", className)} {...props} />
}

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupLabel({ className, ...props }: SidebarGroupLabelProps) {
  const { collapsed } = useSidebar()

  return (
    <div
      className={cn("mb-2 px-2 text-xs font-semibold tracking-tight", collapsed && "sr-only", className)}
      {...props}
    />
  )
}

interface SidebarGroupContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarGroupContent({ className, ...props }: SidebarGroupContentProps) {
  return <div className={cn("space-y-1", className)} {...props} />
}

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenu({ className, ...props }: SidebarMenuProps) {
  return <div className={cn("space-y-1 px-2", className)} {...props} />
}

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarMenuItem({ className, ...props }: SidebarMenuItemProps) {
  return <div className={cn("pb-0.5", className)} {...props} />
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  asChild?: boolean
}

export function SidebarMenuButton({ className, isActive, asChild = false, ...props }: SidebarMenuButtonProps) {
  const { collapsed } = useSidebar()
  const Comp = asChild ? React.Fragment : "button"

  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center py-2",
        className,
      )}
      {...props}
    />
  )
}

interface SidebarMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean
}

export function SidebarMenuLink({ className, isActive, ...props }: SidebarMenuLinkProps) {
  const { collapsed } = useSidebar()

  return (
    <a
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center py-2",
        className,
      )}
      {...props}
    />
  )
}

interface SidebarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarSeparator({ className, ...props }: SidebarSeparatorProps) {
  return <div className={cn("mx-2 my-2 h-px bg-border", className)} {...props} />
}

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { collapsed, setCollapsed, collapsible } = useSidebar()

  if (collapsible === "none") {
    return null
  }

  if (collapsible === "responsive") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute -right-3 top-3 z-10 hidden h-6 w-6 rotate-180 rounded-full bg-background lg:flex",
          className,
        )}
        onClick={() => setCollapsed(!collapsed)}
        {...props}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute -right-3 top-3 z-10 h-6 w-6 rotate-180 rounded-full bg-background",
        collapsed && "rotate-0",
        className,
      )}
      onClick={() => setCollapsed(!collapsed)}
      {...props}
    >
      {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

interface SidebarRailProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarRail({ className, ...props }: SidebarRailProps) {
  const { collapsed, collapsible } = useSidebar()

  if (collapsible === "none" || !collapsed) {
    return null
  }

  return <div className={cn("absolute inset-y-0 right-0 z-10 w-1 cursor-ew-resize bg-border", className)} {...props} />
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarInset({ className, ...props }: SidebarInsetProps) {
  return <div className={cn("flex h-full flex-col", className)} {...props} />
}


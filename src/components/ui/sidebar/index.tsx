
import { TooltipProvider } from "@/components/ui/tooltip"
import { 
  SidebarProvider as InternalSidebarProvider, 
  useSidebar,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_MOBILE,
  SIDEBAR_WIDTH_ICON
} from "./sidebar-context"
import { 
  Sidebar, 
  SidebarTrigger, 
  SidebarRail,
  SidebarInset
} from "./sidebar-main"
import {
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent
} from "./sidebar-sections"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from "./sidebar-menu"

// Create a wrapper for SidebarProvider that includes TooltipProvider
export const SidebarProvider: typeof InternalSidebarProvider = (props) => {
  return (
    <TooltipProvider delayDuration={0}>
      <InternalSidebarProvider
        {...props}
        className={props.className || "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"}
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...props.style,
          } as React.CSSProperties
        }
      />
    </TooltipProvider>
  )
}
SidebarProvider.displayName = "SidebarProvider"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

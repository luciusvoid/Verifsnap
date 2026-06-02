import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Plus,
  Archive,
  FolderOpen,
  Eye,
  HardDrive,
  CreditCard,
  Settings,
  Search,
  Bell,
  ChevronsUpDown,
  LogOut,
  CheckCircle2,
  XCircle,
  Home,
} from "lucide-react";
import { Logo } from "./Logo";
import { useState, useEffect, useRef } from "react";
import { CommandPalette } from "./CommandPalette";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { fetchActivities, Activity, relativeTime, loadProfileName } from "@/lib/mock-data";

const nav = [
  { to: "/dashboard", label: "New Snapshot", icon: Plus, exact: true },
  { to: "/dashboard/archives", label: "Archives", icon: Archive },
  { to: "/dashboard/collections", label: "Collections", icon: FolderOpen },
  { to: "/dashboard/storage", label: "Storage", icon: HardDrive },
  { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { connected, account, disconnect, wallet } = useWallet();
  const [activeNetwork, setActiveNetwork] = useState("testnet");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileName, setProfileName] = useState("");
  const notifRefDesktop = useRef<HTMLDivElement>(null);
  const notifRefMobile = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("verifsnap_network") || "testnet";
      setActiveNetwork(stored);
    }
  }, []);

  // Load profile name from Supabase
  useEffect(() => {
    if (!account) return;
    loadProfileName(account.address.toString()).then((name) => {
      if (name) setProfileName(name);
    });
  }, [account]);

  // Load notifications from Supabase when wallet connects
  useEffect(() => {
    if (!account) return;
    const load = () =>
      fetchActivities(account.address.toString(), 15).then((data) => {
        setActivities(data);
        // Count unread = activities after last viewed timestamp
        const lastRead = localStorage.getItem("verifsnap_notif_read") || "0";
        const unread = data.filter(
          (a) => new Date(a.created_at).getTime() > parseInt(lastRead),
        ).length;
        setUnreadCount(unread);
      });
    load();
    // Poll every 30s for new notifications
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [account]);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        (notifRefDesktop.current && notifRefDesktop.current.contains(target)) ||
        (notifRefMobile.current && notifRefMobile.current.contains(target))
      ) {
        return;
      }
      setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openNotif = () => {
    setNotifOpen((v) => !v);
    // Mark all as read
    localStorage.setItem("verifsnap_notif_read", Date.now().toString());
    setUnreadCount(0);
  };

  const shortAddress = account?.address
    ? `${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}`
    : "Not Connected";

  const walletName = wallet?.name || "Keyless / Web3";

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      {/* Sidebar — sticky so it never scrolls with content */}
      <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-border/60 bg-sidebar/60 backdrop-blur sticky top-0 h-screen">
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-sidebar-border/60 shrink-0">
          <Logo />
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 rounded-md transition"
            title="Go to Home"
          >
            <Home className="h-4 w-4" />
          </Link>
        </div>

        {/* Search */}
        <div className="px-3 pt-3 pb-1 shrink-0">
          <button
            onClick={() => setPaletteOpen(true)}
            className="group flex w-full items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/70 transition"
          >
            <Search className="h-4 w-4" />
            <span>Search archives…</span>
            <kbd className="ml-auto rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav — scrollable if many items */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          {nav.map((item) => {
            const active = isActive(item.to, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition relative",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />
                )}
                <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                <span className="truncate">{item.label}</span>
                {item.label === "New Snapshot" && (
                  <kbd className="ml-auto rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px]">
                    N
                  </kbd>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile — compact, pinned to bottom */}
        <div className="px-3 py-2 border-t border-sidebar-border/60 shrink-0">
          {connected ? (
            <div className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 bg-sidebar-accent/30 border border-border/20">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 grid place-items-center text-[11px] font-bold uppercase shrink-0">
                {(profileName || walletName).slice(0, 2)}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-medium truncate leading-tight">
                  {profileName || shortAddress}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      activeNetwork === "shelbynet" ? "bg-primary animate-pulse" : "bg-success",
                    ].join(" ")}
                  />
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">
                    {activeNetwork === "shelbynet" ? "ShelbyNet" : "Testnet"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => disconnect()}
                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded-md transition text-muted-foreground cursor-pointer shrink-0"
                title="Disconnect Wallet"
                aria-label="Disconnect Wallet"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/15 border border-primary/20 px-3 py-2 text-sm text-primary hover:bg-primary/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Connect Wallet</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 backdrop-blur px-4">
          <div className="flex items-center gap-2">
            <Logo />
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 p-1.5 rounded-md transition"
              title="Go to Home"
            >
              <Home className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaletteOpen(true)}
              className="rounded-lg p-2 hover:bg-muted/60 text-muted-foreground"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <div className="relative" ref={notifRefMobile}>
              <button
                onClick={openNotif}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 transition relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary text-[8px] flex items-center justify-center text-white font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 z-50 w-72 sm:w-80 rounded-2xl border border-border/60 bg-card shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                    <span className="text-sm font-semibold">Notifications</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
                    {activities.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No activity yet
                      </div>
                    ) : (
                      activities.map((a) => (
                        <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                          {a.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs leading-snug truncate">{a.details}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {relativeTime(a.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {connected ? (
              <Link to="/dashboard/settings" className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 transition">
                <Settings className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/login" className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 transition">
                 <LogOut className="h-5 w-5" />
              </Link>
            )}
          </div>
        </header>

        <div className="hidden md:flex sticky top-0 z-20 h-16 items-center justify-end gap-2 border-b border-border/60 bg-background/70 backdrop-blur px-6">
          {connected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border/40 bg-card/40 px-3 py-1 text-xs text-muted-foreground mr-auto hover:bg-muted/40 hover:text-foreground transition cursor-pointer select-none outline-none focus:ring-1 focus:ring-primary/30">
                  <span
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      activeNetwork === "shelbynet" ? "bg-primary animate-pulse" : "bg-success",
                    ].join(" ")}
                  />
                  <span className="font-mono text-[11px]">{shortAddress}</span>
                  <span className="h-3 w-px bg-border/60" />
                  <span className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider">
                    {activeNetwork === "shelbynet" ? "ShelbyNet" : "Testnet"}
                    <ChevronsUpDown className="h-3 w-3 opacity-60" />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 bg-card border border-border/60 p-1 shadow-lg"
              >
                <DropdownMenuLabel className="text-[11px] text-muted-foreground font-semibold px-2 py-1.5">
                  Select Blockchain Network
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  onClick={() => {
                    if (activeNetwork !== "testnet") {
                      localStorage.setItem("verifsnap_network", "testnet");
                      setActiveNetwork("testnet");
                      toast.success("Network changed to Testnet. Reloading config...");
                      setTimeout(() => window.location.reload(), 1200);
                    }
                  }}
                  className={[
                    "flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors cursor-pointer select-none",
                    activeNetwork === "testnet"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  ].join(" ")}
                >
                  <span>Testnet</span>
                  {activeNetwork === "testnet" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (activeNetwork !== "shelbynet") {
                      localStorage.setItem("verifsnap_network", "shelbynet");
                      setActiveNetwork("shelbynet");
                      toast.success("Network changed to ShelbyNet. Reloading config...");
                      setTimeout(() => window.location.reload(), 1200);
                    }
                  }}
                  className={[
                    "flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors cursor-pointer select-none",
                    activeNetwork === "shelbynet"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  ].join(" ")}
                >
                  <span>ShelbyNet</span>
                  {activeNetwork === "shelbynet" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* Notification Bell with real Supabase data */}
          <div className="relative" ref={notifRefDesktop}>
            <button
              onClick={openNotif}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary text-[8px] flex items-center justify-center text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notifOpen && (
              <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-border/60 bg-card shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                  <span className="text-sm font-semibold">Notifications</span>
                  <span className="text-xs text-muted-foreground">{activities.length} recent</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
                  {activities.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No activity yet
                    </div>
                  ) : (
                    activities.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition"
                      >
                        {a.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-snug truncate">{a.details}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {relativeTime(a.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Link
            to="/dashboard"
            className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" /> New snapshot
          </Link>
        </div>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden sticky bottom-0 z-30 grid grid-cols-5 gap-1 border-t border-border/60 bg-background/85 backdrop-blur p-2">
          {nav.slice(0, 5).map((item) => {
            const active = isActive(item.to, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate max-w-full">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { clearAuthStorage } from '../../services/auth';
import { Calendar, BarChart3, Users, DollarSign, Settings, Bell, Heart, Home, FileText, LogOut, PawPrint, Store } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { NavLink } from "react-router-dom";
import { useSelectedBusiness } from '../../contexts/SelectedBusinessContext';

const menuItems = [
	{ title: "Dashboard", icon: Home, page: "dashboard" },
	{ title: "Agenda / Calendário", icon: Calendar, page: "schedule" },
	{ title: "Clientes", icon: Users, page: "clients" },
	{ title: "Pets", icon: PawPrint, page: "pets" },
	{ title: "Serviços", icon: FileText, page: "services" },
];

const financialItems = [
	{ title: "Financeiro", icon: DollarSign, page: "financial" },
	{ title: "Relatórios", icon: FileText, page: "reports" },
	{ title: "Análises", icon: BarChart3, page: "analytics" },
];

const systemItems = [
	{ title: "Configurações", icon: Settings, page: "settings" },
	{ title: "Notificações", icon: Bell, page: "notifications" },
	{ title: "Usuários", icon: Users, page: "users" },
];

interface AdminSidebarProps {
	onLogout: () => void;
}

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
	const { setOpenMobile } = useSidebar();
			const [currentUser, setCurrentUser] = useState<{ first_name?: string | null; last_name?: string | null; phone?: string | null; business_name?: string | null; role?: string | null } | null>(null);
			const { businesses, selectedBusinessId, setSelectedBusinessId } = useSelectedBusiness();

		useEffect(() => {
			let mounted = true;
				(async () => {
					try {
						const mod = await import('../../services/auth');
						const user = await mod.getCurrentUser();
						if (mounted) setCurrentUser({ first_name: user.first_name || null, last_name: user.last_name || null, phone: user.phone || null, business_name: user.business_name || null, role: user.role || null });
					} catch (e) {
						// ignore
					}
				})();

			return () => { mounted = false; };
		}, []);

	return (
		<Sidebar>
			<SidebarHeader>
				<div className="flex items-center gap-2 px-2 py-4">
					<div className="bg-primary p-2 rounded-lg">
						<Heart className="h-6 w-6 text-white" />
					</div>
					<div>
						<div className="text-lg">AugendaPet</div>
						<div className="text-xs text-muted-foreground">Painel Admin</div>
					</div>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menuItems.map((item) => {
								const Icon = item.icon;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<NavLink
												to={item.page === "dashboard" ? "/admin" : `/admin/${item.page}`}
												onClick={() => setOpenMobile(false)}
												className={({ isActive }) => "flex items-center gap-2"}
											>
												<Icon className="h-4 w-4" />
												<span>{item.title}</span>
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Gestão & Análises</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{financialItems.map((item) => {
								const Icon = item.icon;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<NavLink
												to={`/admin/${item.page}`}
												onClick={() => setOpenMobile(false)}
												className={({ isActive }) => "flex items-center gap-2"}
											>
												<Icon className="h-4 w-4" />
												<span>{item.title}</span>
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Sistema</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{systemItems.map((item) => {
								const Icon = item.icon;
								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton asChild>
											<NavLink
												to={`/admin/${item.page}`}
												onClick={() => setOpenMobile(false)}
												className={({ isActive }) => "flex items-center gap-2"}
											>
												<Icon className="h-4 w-4" />
												<span>{item.title}</span>
											</NavLink>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
							{currentUser && currentUser.role === 'support' && (
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<NavLink to="/admin/petshops" onClick={() => setOpenMobile(false)} className={({ isActive }) => "flex items-center gap-2"}>
											<Store className="h-4 w-4 text-current" />
											<span>Petshops</span>
										</NavLink>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<div className="p-2 space-y-4">
					<div className="flex items-center gap-3 p-2">
						<Avatar className="h-8 w-8">
							<AvatarFallback className="bg-primary text-white text-sm">MS</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium truncate">{currentUser ? ((currentUser.first_name || '') + (currentUser.last_name ? ' ' + currentUser.last_name : '')).trim() || 'Usuário' : 'Usuário'}</div>
							<div className="text-xs text-muted-foreground">{currentUser && currentUser.business_name ? currentUser.business_name : '—'}</div>
							{currentUser && currentUser.role === 'support' && (
								<div className="mt-2">
									<select
										value={selectedBusinessId || ''}
										onChange={(e) => {
										const v = e.target.value || null;
										setSelectedBusinessId(v);
										const found = businesses.find(b => b.id === v);
										setCurrentUser((cu) => cu ? { ...cu, business_name: found ? found.brand_name : cu.business_name } : cu);
									}}
									className="p-1 text-sm border rounded w-full"
									>
										<option value="">— Selecionar petshop —</option>
										{businesses.map(b => (
											<option key={b.id} value={b.id}>{b.brand_name}</option>
										))}
									</select>
								</div>
							)}
						</div>
					</div>

					<Button
						variant="ghost"
						size="sm"
						className="w-full justify-start text-muted-foreground hover:text-foreground"
						onClick={() => {
							clearAuthStorage();
							try { localStorage.removeItem('selectedBusinessId'); } catch (e) {}
							try { setSelectedBusinessId(null); } catch (e) {}
							onLogout();
						}}
					>
						<LogOut className="h-4 w-4 mr-2" />
						Sair
					</Button>
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
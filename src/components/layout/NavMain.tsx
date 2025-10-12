"use client"

import { type Icon } from "@tabler/icons-react"
import { NavLink, useLocation } from "react-router-dom"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
                            items,
                        }: {
    items: {
        title: string
        url: string
        icon?: Icon
    }[]
}) {
    const location = useLocation();
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = location.pathname === item.url;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <NavLink
                                    to={item.url}
                                    className={({ isActive: navActive }) =>
                                        `flex items-center w-full gap-2 px-2 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                                            isActive || navActive
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-muted"
                                        }`
                                    }
                                >
                                    {item.icon && <item.icon className="size-4" />}
                                    <span>{item.title}</span>
                                </NavLink>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

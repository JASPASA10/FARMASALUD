"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inventario", href: "/dashboard/inventario", icon: Package },
    { name: "Pedidos", href: "/dashboard/pedidos", icon: ShoppingCart },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  ]

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Button
            key={item.name}
            variant={isActive ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              router.push(item.href)
              setOpen(false)
            }}
          >
            <item.icon className="mr-2 h-5 w-5" />
            {item.name}
          </Button>
        )
      })}
      <Button
        variant="ghost"
        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-5 w-5" />
        Cerrar sesión
      </Button>
    </>
  )

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar para pantallas medianas y grandes */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r bg-white">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-semibold">FarmaSalud</h1>
          </div>
          <div className="flex flex-col flex-grow px-4 mt-5">
            <nav className="flex-1 space-y-2">
              <NavItems />
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="w-full">
          <div className="relative z-10 flex h-16 flex-shrink-0 border-b bg-white shadow-sm">
            <div className="flex flex-1 justify-between px-4 md:px-0">
              <div className="flex flex-1 items-center md:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[240px] sm:w-[240px]">
                    <div className="py-4">
                      <h2 className="text-lg font-semibold mb-4">FarmaSalud</h2>
                      <nav className="flex flex-col space-y-2">
                        <NavItems />
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
                <h1 className="text-xl font-semibold">Sistema de Inventario – FarmaSalud</h1>
              </div>
              <div className="hidden md:flex md:items-center md:justify-between md:flex-1">
                <h1 className="text-xl font-semibold">Sistema de Inventario – FarmaSalud</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

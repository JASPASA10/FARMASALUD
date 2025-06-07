"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Trash2, Plus, Search } from "lucide-react"

// Tipos para los clientes
interface Cliente {
  id: number
  nombre: string
  telefono: string
  email: string
  direccion: string
}

export default function ClientesPage() {
  // Datos de ejemplo
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 1,
      nombre: "María González",
      telefono: "555-1234",
      email: "maria@ejemplo.com",
      direccion: "Calle Principal 123",
    },
    { id: 2, nombre: "Juan Pérez", telefono: "555-5678", email: "juan@ejemplo.com", direccion: "Avenida Central 456" },
    { id: 3, nombre: "Ana Rodríguez", telefono: "555-9012", email: "ana@ejemplo.com", direccion: "Plaza Mayor 789" },
    {
      id: 4,
      nombre: "Carlos López",
      telefono: "555-3456",
      email: "carlos@ejemplo.com",
      direccion: "Calle Secundaria 101",
    },
    {
      id: 5,
      nombre: "Laura Martínez",
      telefono: "555-7890",
      email: "laura@ejemplo.com",
      direccion: "Avenida Norte 202",
    },
  ])

  // Estado para el formulario
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCliente, setCurrentCliente] = useState<Cliente>({
    id: 0,
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
  })

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState("")

  const handleAddEdit = () => {
    if (isEditing) {
      // Actualizar cliente existente
      setClientes(clientes.map((c) => (c.id === currentCliente.id ? currentCliente : c)))
    } else {
      // Agregar nuevo cliente
      const newId = Math.max(0, ...clientes.map((c) => c.id)) + 1
      setClientes([...clientes, { ...currentCliente, id: newId }])
    }

    // Resetear formulario
    setIsOpen(false)
    setIsEditing(false)
    setCurrentCliente({ id: 0, nombre: "", telefono: "", email: "", direccion: "" })
  }

  const handleEdit = (cliente: Cliente) => {
    setCurrentCliente(cliente)
    setIsEditing(true)
    setIsOpen(true)
  }

  const handleDelete = (id: number) => {
    setClientes(clientes.filter((c) => c.id !== id))
  }

  // Filtrar clientes según término de búsqueda
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono.includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false)
                setCurrentCliente({ id: 0, nombre: "", telefono: "", email: "", direccion: "" })
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Cliente" : "Agregar Cliente"}</DialogTitle>
              <DialogDescription>Complete los detalles del cliente a continuación.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={currentCliente.nombre}
                  onChange={(e) => setCurrentCliente({ ...currentCliente, nombre: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={currentCliente.telefono}
                  onChange={(e) => setCurrentCliente({ ...currentCliente, telefono: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentCliente.email}
                  onChange={(e) => setCurrentCliente({ ...currentCliente, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={currentCliente.direccion}
                  onChange={(e) => setCurrentCliente({ ...currentCliente, direccion: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddEdit}>{isEditing ? "Actualizar" : "Agregar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.nombre}</TableCell>
                <TableCell>{cliente.telefono}</TableCell>
                <TableCell>{cliente.email}</TableCell>
                <TableCell>{cliente.direccion}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(cliente)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cliente.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

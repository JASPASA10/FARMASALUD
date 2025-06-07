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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Tipos para los pedidos
interface Pedido {
  id: number
  cliente: string
  fecha: string
  total: number
  estado: "Pendiente" | "Procesando" | "Completado" | "Cancelado"
}

export default function PedidosPage() {
  // Datos de ejemplo
  const [pedidos, setPedidos] = useState<Pedido[]>([
    { id: 1, cliente: "María González", fecha: "2023-05-15", total: 125.5, estado: "Completado" },
    { id: 2, cliente: "Juan Pérez", fecha: "2023-05-16", total: 78.25, estado: "Pendiente" },
    { id: 3, cliente: "Ana Rodríguez", fecha: "2023-05-17", total: 210.75, estado: "Procesando" },
    { id: 4, cliente: "Carlos López", fecha: "2023-05-18", total: 45.99, estado: "Pendiente" },
    { id: 5, cliente: "Laura Martínez", fecha: "2023-05-19", total: 156.3, estado: "Cancelado" },
  ])

  // Estado para el formulario
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPedido, setCurrentPedido] = useState<Pedido>({
    id: 0,
    cliente: "",
    fecha: "",
    total: 0,
    estado: "Pendiente",
  })

  // Estados disponibles
  const estados: Array<Pedido["estado"]> = ["Pendiente", "Procesando", "Completado", "Cancelado"]

  const handleAddEdit = () => {
    if (isEditing) {
      // Actualizar pedido existente
      setPedidos(pedidos.map((p) => (p.id === currentPedido.id ? currentPedido : p)))
    } else {
      // Agregar nuevo pedido
      const newId = Math.max(0, ...pedidos.map((p) => p.id)) + 1
      setPedidos([...pedidos, { ...currentPedido, id: newId }])
    }

    // Resetear formulario
    setIsOpen(false)
    setIsEditing(false)
    setCurrentPedido({ id: 0, cliente: "", fecha: "", total: 0, estado: "Pendiente" })
  }

  const handleEdit = (pedido: Pedido) => {
    setCurrentPedido(pedido)
    setIsEditing(true)
    setIsOpen(true)
  }

  const handleDelete = (id: number) => {
    setPedidos(pedidos.filter((p) => p.id !== id))
  }

  // Función para obtener el color de la badge según el estado
  const getStatusColor = (estado: Pedido["estado"]) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Procesando":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Completado":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Cancelado":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false)
                setCurrentPedido({
                  id: 0,
                  cliente: "",
                  fecha: new Date().toISOString().split("T")[0],
                  total: 0,
                  estado: "Pendiente",
                })
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar pedido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Pedido" : "Agregar Pedido"}</DialogTitle>
              <DialogDescription>Complete los detalles del pedido a continuación.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={currentPedido.cliente}
                  onChange={(e) => setCurrentPedido({ ...currentPedido, cliente: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={currentPedido.fecha}
                  onChange={(e) => setCurrentPedido({ ...currentPedido, fecha: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total">Total</Label>
                <Input
                  id="total"
                  type="number"
                  step="0.01"
                  value={currentPedido.total.toString()}
                  onChange={(e) =>
                    setCurrentPedido({ ...currentPedido, total: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={currentPedido.estado}
                  onValueChange={(value: Pedido["estado"]) => setCurrentPedido({ ...currentPedido, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>{pedido.id}</TableCell>
                <TableCell className="font-medium">{pedido.cliente}</TableCell>
                <TableCell>{pedido.fecha}</TableCell>
                <TableCell>${pedido.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(pedido.estado)} variant="outline">
                    {pedido.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(pedido)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pedido.id)}>
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

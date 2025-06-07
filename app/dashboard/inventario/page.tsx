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

// Tipos para los productos
interface Producto {
  id: number
  nombre: string
  categoria: string
  stock: number
  precio: number
}

export default function InventarioPage() {
  // Datos de ejemplo
  const [productos, setProductos] = useState<Producto[]>([
    { id: 1, nombre: "Paracetamol 500mg", categoria: "Analgésicos", stock: 150, precio: 5.99 },
    { id: 2, nombre: "Ibuprofeno 400mg", categoria: "Antiinflamatorios", stock: 120, precio: 7.5 },
    { id: 3, nombre: "Amoxicilina 500mg", categoria: "Antibióticos", stock: 80, precio: 12.75 },
    { id: 4, nombre: "Loratadina 10mg", categoria: "Antialérgicos", stock: 95, precio: 8.25 },
    { id: 5, nombre: "Omeprazol 20mg", categoria: "Antiácidos", stock: 110, precio: 9.99 },
  ])

  // Estado para el formulario
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentProducto, setCurrentProducto] = useState<Producto>({
    id: 0,
    nombre: "",
    categoria: "",
    stock: 0,
    precio: 0,
  })

  // Categorías disponibles
  const categorias = [
    "Analgésicos",
    "Antiinflamatorios",
    "Antibióticos",
    "Antialérgicos",
    "Antiácidos",
    "Vitaminas",
    "Otros",
  ]

  const handleAddEdit = () => {
    if (isEditing) {
      // Actualizar producto existente
      setProductos(productos.map((p) => (p.id === currentProducto.id ? currentProducto : p)))
    } else {
      // Agregar nuevo producto
      const newId = Math.max(0, ...productos.map((p) => p.id)) + 1
      setProductos([...productos, { ...currentProducto, id: newId }])
    }

    // Resetear formulario
    setIsOpen(false)
    setIsEditing(false)
    setCurrentProducto({ id: 0, nombre: "", categoria: "", stock: 0, precio: 0 })
  }

  const handleEdit = (producto: Producto) => {
    setCurrentProducto(producto)
    setIsEditing(true)
    setIsOpen(true)
  }

  const handleDelete = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsEditing(false)
                setCurrentProducto({ id: 0, nombre: "", categoria: "", stock: 0, precio: 0 })
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
              <DialogDescription>Complete los detalles del producto a continuación.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={currentProducto.nombre}
                  onChange={(e) => setCurrentProducto({ ...currentProducto, nombre: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={currentProducto.categoria}
                  onValueChange={(value) => setCurrentProducto({ ...currentProducto, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={currentProducto.stock.toString()}
                  onChange={(e) =>
                    setCurrentProducto({ ...currentProducto, stock: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  value={currentProducto.precio.toString()}
                  onChange={(e) =>
                    setCurrentProducto({ ...currentProducto, precio: Number.parseFloat(e.target.value) || 0 })
                  }
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell className="font-medium">{producto.nombre}</TableCell>
                <TableCell>{producto.categoria}</TableCell>
                <TableCell>{producto.stock}</TableCell>
                <TableCell>${producto.precio.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(producto)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(producto.id)}>
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

"use client";
import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export default function FirebaseApp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [clientes, setClientes] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [ordenes, setOrdenes] = useState([]);

  // Registro
  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setMessage("¡Registrado correctamente!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setMessage("¡Sesión iniciada!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMessage("Sesión cerrada");
  };

  // Guardar cliente
  const handleSaveCliente = async () => {
    try {
      await addDoc(collection(db, "clientes"), { nombre: "Cliente Demo", email: "cliente@demo.com", fecha: new Date() });
      setMessage("Cliente guardado en Firestore");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Leer clientes
  const handleReadClientes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(docs);
      setMessage("Clientes leídos de Firestore");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Guardar inventario
  const handleSaveInventario = async () => {
    try {
      await addDoc(collection(db, "inventario"), { producto: "Producto Demo", cantidad: 10, fecha: new Date() });
      setMessage("Producto guardado en Firestore");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Leer inventario
  const handleReadInventario = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "inventario"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(docs);
      setMessage("Inventario leído de Firestore");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Guardar orden
  const handleSaveOrden = async () => {
    try {
      await addDoc(collection(db, "ordenes"), { cliente: "Cliente Demo", total: 100, fecha: new Date() });
      setMessage("Orden guardada en Firestore");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Leer órdenes
  const handleReadOrdenes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ordenes"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrdenes(docs);
      setMessage("Órdenes leídas de Firestore");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto mt-8">
      <h2 className="text-lg font-bold mb-2">Demo Firebase</h2>
      <input
        className="border p-1 mb-2 w-full"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="border p-1 mb-2 w-full"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <div className="flex gap-2 mb-2">
        <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={handleRegister}>Registrar</button>
        <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleLogin}>Login</button>
        <button className="bg-gray-500 text-white px-2 py-1 rounded" onClick={handleLogout}>Logout</button>
      </div>
      <div className="flex gap-2 mb-2">
        <button className="bg-purple-500 text-white px-2 py-1 rounded" onClick={handleSaveCliente}>Guardar Cliente</button>
        <button className="bg-orange-500 text-white px-2 py-1 rounded" onClick={handleReadClientes}>Leer Clientes</button>
      </div>
      <div className="flex gap-2 mb-2">
        <button className="bg-purple-500 text-white px-2 py-1 rounded" onClick={handleSaveInventario}>Guardar Inventario</button>
        <button className="bg-orange-500 text-white px-2 py-1 rounded" onClick={handleReadInventario}>Leer Inventario</button>
      </div>
      <div className="flex gap-2 mb-2">
        <button className="bg-purple-500 text-white px-2 py-1 rounded" onClick={handleSaveOrden}>Guardar Orden</button>
        <button className="bg-orange-500 text-white px-2 py-1 rounded" onClick={handleReadOrdenes}>Leer Órdenes</button>
      </div>
      {message && <div className="mb-2 text-sm text-blue-700">{message}</div>}
      {user && <div className="mb-2 text-sm text-green-700">Usuario: {user.email}</div>}
      <div className="mt-4">
        <h3 className="font-bold">Clientes:</h3>
        <ul className="text-xs">
          {clientes.map(item => (
            <li key={item.id}>{item.nombre} ({item.email})</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="font-bold">Inventario:</h3>
        <ul className="text-xs">
          {inventario.map(item => (
            <li key={item.id}>{item.producto} - Cantidad: {item.cantidad}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <h3 className="font-bold">Órdenes:</h3>
        <ul className="text-xs">
          {ordenes.map(item => (
            <li key={item.id}>{item.cliente} - Total: ${item.total}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 
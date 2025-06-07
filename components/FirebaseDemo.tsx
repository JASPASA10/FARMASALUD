"use client";
import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function FirebaseDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);

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

  // Guardar dato en Firestore
  const handleSave = async () => {
    try {
      await addDoc(collection(db, "demo"), { texto: "Hola Firebase!", fecha: new Date() });
      setMessage("Dato guardado en Firestore");
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Leer datos de Firestore
  const handleRead = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "demo"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(docs);
      setMessage("Datos leídos de Firestore");
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
        <button className="bg-purple-500 text-white px-2 py-1 rounded" onClick={handleSave}>Guardar dato</button>
        <button className="bg-orange-500 text-white px-2 py-1 rounded" onClick={handleRead}>Leer datos</button>
      </div>
      {message && <div className="mb-2 text-sm text-blue-700">{message}</div>}
      {user && <div className="mb-2 text-sm text-green-700">Usuario: {user.email}</div>}
      <ul className="text-xs">
        {data.map(item => (
          <li key={item.id}>{item.texto} ({item.fecha && new Date(item.fecha.seconds ? item.fecha.seconds * 1000 : item.fecha).toLocaleString()})</li>
        ))}
      </ul>
    </div>
  );
} 
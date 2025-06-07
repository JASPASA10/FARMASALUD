import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor, define MONGODB_URI en el archivo .env');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise: Promise<MongoClient>;

async function initializeDatabase(client: MongoClient) {
  const db = client.db('farmacia');
  
  // Crear índices para las colecciones
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('inventory').createIndex({ sku: 1 }, { unique: true });
  await db.collection('customers').createIndex({ email: 1 }, { unique: true });
  await db.collection('orders').createIndex({ createdAt: -1 });
  
  console.log('Base de datos inicializada con índices');
  return client;
}

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usa una variable global para que la conexión persista entre recargas
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect()
      .then(client => {
        console.log('Conexión a MongoDB establecida en desarrollo');
        return initializeDatabase(client);
      })
      .catch(error => {
        console.error('Error al conectar a MongoDB:', error);
        throw error;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // En producción, es mejor no usar una variable global
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('Conexión a MongoDB establecida en producción');
      return initializeDatabase(client);
    })
    .catch(error => {
      console.error('Error al conectar a MongoDB:', error);
      throw error;
    });
}

export default clientPromise; 
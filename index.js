// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const servidor = express();
servidor.use(express.json());
servidor.use(cors());

let coleccion;

// 🔹 Conectar a MongoDB Atlas
async function conectarDB() {
    try {
        const cliente = await MongoClient.connect(process.env.URL_MONGO);
        coleccion = cliente.db("loginApp").collection("colores");
        console.log("✅ Conectado a MongoDB Atlas");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
        process.exit(1);
    }
}

conectarDB();

// 🔹 Rutas

// Obtener todos los colores
servidor.get("/colores", async (req, res) => {
    try {
        const colores = await coleccion.find({}).toArray();
        res.json(colores);
        console.log("GET /colores OK");
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error consiguiendo los colores" });
    }
});

// Crear un nuevo color
servidor.post("/colores/nuevo", async (req, res) => {
    const { r, g, b } = req.body;

    const valido = [r, g, b].every(
        v => v !== undefined && /^[0-9]{1,3}$/.test(v) && Number(v) <= 255
    );

    if (!valido) return res.status(400).json({ error: "Valores inválidos" });

    try {
        const resultado = await coleccion.insertOne({ r, g, b });
        res.status(201).json({ _id: resultado.insertedId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creando color" });
    }
});

// Borrar un color por ID
servidor.delete("/colores/borrar/:id", async (req, res) => {
    const valido = /^[0-9a-fA-F]{24}$/.test(req.params.id);

    if (!valido) return res.status(400).json({ error: "ID inválido" });

    try {
        const resultado = await coleccion.deleteOne({ _id: new ObjectId(req.params.id) });
        if (!resultado.deletedCount) return res.status(404).json({ error: "No se encontró el color" });
        res.sendStatus(204);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Middleware para manejar rutas no encontradas
servidor.use((req, res) => {
    res.status(404).json({ error: "Recurso no encontrado" });
});

// Middleware de errores
servidor.use((error, req, res, next) => {
    console.error(error);
    res.status(400).json({ error: "Error en la petición" });
});

// 🔹 Iniciar servidor
const PORT = process.env.PORT || 4000;
servidor.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

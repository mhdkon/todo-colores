import dotenv from "dotenv";
dotenv.config();
//-------------------------------

import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb"
import { ObjectId } from "mongodb";
let coleccion;

const urlMongo= "mongodb+srv://bertortizrod_db_user:admin@cluster0.w5muxl0.mongodb.net/";
MongoClient.connect(urlMongo)
.then( conexion => {
    coleccion = conexion.db("colores").collection("colores");
})
.catch(error => {
    console.error("Error conectando a MongoDB:", error);
});


const servidor = express();
servidor.use(express.json());
servidor.use(cors());


servidor.get("/colores", async (peticion, respuesta) => {
    try{
        const colores = await coleccion.find({}).toArray();
        respuesta.json(colores);
        console.log("todo ok");
        conexion.close();
    } catch(error){
    respuesta.status(500);
    respuesta.json({ error: "Error consiguiendo los colores" });
  }
});


servidor.post("/colores/nuevo", async (peticion, respuesta, siguiente) => {
    let { r, g, b } = peticion.body;

    let valido = true;

    [r,g,b].forEach( valor => valido = valido && valor != undefined && /^[0-9]{1,3}$/.test(valor) && Number(valor) <= 255);

    if(valido) try{
        const resultado = await coleccion.insertOne({ r, g, b });
        respuesta.send({ _id: resultado.insertedId });
        respuesta.status(201);      
    } catch(error){
    respuesta.json({ respuesta : "error creando color"});
    }
    conexion.close();
});


servidor.delete("/colores/borrar/:id", async (peticion,respuesta, siguiente) => {
    let valido = /^[0-9a-zA-Z]{24}$/.test(peticion.params.id);

    if(!valido){
        return siguiente(true);
    }

    try{
        let cantidad = await coleccion.deleteOne({ _id: new ObjectId(peticion.params.id) });
            if(!cantidad.deletedCount){
                return siguiente(true);
            }
        respuesta.sendStatus(204);
    }catch(error){
        console.log(error);
        respuesta.json({ error: "error en el servidor"});
        respuesta.status(500);
    }
});

servidor.use((error, peticion, respuesta, siguiente) => {
    respuesta.status(400);
    respuesta.json({ error: "error en la petición"})
});

servidor.use((peticion,respuesta) => {
    respuesta.status(404);
    respuesta.json({error: "recurso no encontrado"});
});

servidor.listen(4000);
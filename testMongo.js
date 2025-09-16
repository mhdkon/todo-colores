import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

async function testConexion() {
  try {
    const cliente = await MongoClient.connect(process.env.URL_MONGO);
    console.log("✅ Conectado correctamente a MongoDB Atlas");
    await cliente.close();
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
  }
}

testConexion();

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB local connecté");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB local:", error);
    process.exit(1);
  }
};

const connectDBCloud = async () => {
  try {
    const cloudConnection = mongoose.createConnection(process.env.CLOUD_DB_URI, {
     
    });
    cloudConnection.on("connected", () => {
      console.log("MongoDB cloud connecté");
    });
    cloudConnection.on("error", (error) => {
      console.error("Erreur de connexion à MongoDB cloud:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Erreur de connexion à MongoDB cloud:", error);
    process.exit(1);
  }
};

const startConnections = async () => {
  await connectDB();
  await connectDBCloud();
};

module.exports = { startConnections };

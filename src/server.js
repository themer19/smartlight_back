const express = require("express");
const { startConnections } = require("./config/db"); 
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require("cookie-parser");
require("dotenv").config();
const bodyParser = require("body-parser");
const app = express();
const userRoutes = require("./routes/userRoutes");
const siteRoutes = require("./routes/siteRoutes")
const bcrypt = require("bcryptjs");
const licenceRoutes = require('./routes/licenceRoutes');
const ligneRoutes=require('./routes/ligneRoutes')
const poteauRoutes = require('./routes/poteauRoutes')
console.log("Démarrage du serveur...");
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
startConnections();




app.get('/', (req, res) => {
  res.json({ message: 'hello' });
});

app.use("/api/users", userRoutes);
app.use("/api/site", siteRoutes);
app.use('/api/licences', licenceRoutes);
app.use('/api/ligne',ligneRoutes);
app.use('/api/poteau',poteauRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

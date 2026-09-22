require("dotenv").config();

const express = require("express");
const cors = require("cors");

const gestaoRoutes = require("./routes/gestaoroutes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/gestao", gestaoRoutes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "Backend do G.E.A funcionando!"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const port = process.env.PORT ?? 3001;
const corsOptions = {
  origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/dnd5e", require("./routes/dnd5e.routes"));
app.use("/api/v1/fate-core", require("./routes/fate-core.routes"));

app.listen(port);

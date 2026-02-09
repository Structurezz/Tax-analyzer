import express from "express";
import bodyParser from "body-parser";
import ledgerRoutes from "./routes/ledger.routes";
import taxRoutes from "./routes/tax.routes";

import { ENV } from "./config/env";  
import { connectDB } from "./config/db.config";

connectDB();

const app = express();
app.use(bodyParser.json());

app.use("/api/ledger", ledgerRoutes);
app.use("/api/tax", taxRoutes);


app.get("/", (req, res) => res.send("Smart Tax Engine API running"));

app.listen(ENV.PORT, () => console.log(`Server running on port ${ENV.PORT}`));

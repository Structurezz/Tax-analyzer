import express from "express";
import bodyParser from "body-parser";

// ⚠️ Add .js extension for Node ESM runtime
import ledgerRoutes from "./routes/ledger.routes.js";
import taxRoutes from "./routes/tax.routes.js";

import { ENV } from "./config/env.js";  
import { connectDB } from "./config/db.config.js";

connectDB();

const app = express();
app.use(bodyParser.json());

app.use("/api/ledger", ledgerRoutes);
app.use("/api/tax", taxRoutes);

app.get("/", (req, res) => res.send("Smart Tax Engine API running"));

app.listen(ENV.PORT, () => console.log(`Server running on port ${ENV.PORT}`));

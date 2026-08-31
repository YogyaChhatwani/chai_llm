import express from "express";
import  "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { registerRoutes } from "./routes/index.js";
import { inngest } from "./inngest/client.js";
import { serve } from "inngest/express";
import { functions } from "./inngest/index.js";
import { getClientOrigins, isOriginAllowed } from "./lib/client-origins.js";

const PORT = process.env.PORT;
const clientOrigins = getClientOrigins();
const app = express();

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, server-to-server) send no Origin.
      if (!origin) {
        callback(null, true);
        return;
      }
      callback(null, isOriginAllowed(origin, clientOrigins) ? origin : false);
    },
    credentials: true,
    exposedHeaders: ["X-Conversation-Id"],
  }),
);

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
app.use("/api/inngest", serve({ client: inngest, functions }));
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

registerRoutes(app);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
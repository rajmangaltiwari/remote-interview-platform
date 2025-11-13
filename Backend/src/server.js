import express from "express";
import path from "path"
import cors from "cors"
import {serve} from "inngest/express"
import { clerkMiddleware } from '@clerk/express'

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest,functions } from "./lib/inngest.js";
import { protectRoute } from "./middleware/protectRoute.js";
import chatRoutes from "./routes/chatRoutes.js"

const app = express();

const __dirname = path.resolve();

// middleware
app.use(express.json())
app.use(cors({origin:ENV.CLIENT_URL,credential:true}))
app.use(clerkMiddleware())

app.use("/api/inngest",serve({client:inngest, functions}))
app.use("/api/chat", chatRoutes)

app.get("/hello", (req,res)=>{
    res.status(200).json({ msg : "sucess from backend"});
});


if(ENV.NODE_ENV === "production") {
    // Serve static files from Frontend/dist
    app.use(express.static(path.join(__dirname, "../Frontend/dist")));

    app.get("/{*any}", (req, res) => {
        res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
    });
}

const startserver = async () => {
    try {
      await connectDB();
      app.listen(ENV.PORT, ()=>{console.log("server is running on port",ENV.PORT)});
    } catch (error) {
        console.error("error starting the error");
    }
}

startserver();
'use strict';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import "dotenv/config"

const app = express();

app.use("/u", express.static("uploads"));

app.get("/", (req: Request, res: Response) => {
    res.send({ message: true })
})

app.listen(process.env.PORT, () => console.log("ready"))
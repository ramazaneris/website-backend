'use strict';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import "dotenv/config"

const app = express();

app.use("/u", express.static("uploads"));

const createUniqId = () => {
    return (
        new Date().getTime().toString(36).substring(36) +
        Math.random().toString(36).slice(3)
    );
};

const storage: any = multer.diskStorage({
    destination: (req: any, res: any, cb: any) => {
        cb(null, "../uploads")
    },
    filename: (req: any, file: any, cb: any) => {
        const { originalname } = file
        cb(null, createUniqId() + "." + originalname.split(".").pop())
    }
})

const upload = multer({ storage })

app.get("/", (req: Request, res: Response) => {
    res.send({ message: true })
})

app.post("/upload", upload.single("images"), (req: any, res: Response) => {
    if (req.body.secret === process.env.TOKEN) {
        console.log("istek geldi");
        console.log(req.file.filename);
        console.log(req.file);
        res.json({
            thumbnail_url: "https://ramcho.xyz/u/" + req.file.filename.split(".")[0],
            url: req.file.filename,
            deletion_url: "none",
            status: 200
        });
    } else {
        console.log(req.body.secret);
        res.json({ error: "Access denied", status: 401 });
    }
})

app.listen(process.env.PORT, () => console.log("ready"))
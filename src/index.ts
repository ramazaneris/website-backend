'use strict';
import express, { Request, Response } from 'express';
import fs, { renameSync } from 'fs';
import path from 'path';
import multer from 'multer';
import "dotenv/config"
import mongoose from 'mongoose'
import File from '../schema/fileSchema'
import cors from 'cors'

mongoose.connect(`${process.env.MONGODB_URI}`)

const app = express();

app.use(cors({
    origin: [`${process.env.CORS_ORIGIN}`, `${process.env.CORS_ORIGIN_SECOND}`],
    credentials: true,
    methods: ["GET,POST"],
}))
app.use(express.json())

const createUniqId = () => {
    return (
        new Date().getTime().toString(36).substring(36) +
        Math.random().toString(36).slice(3)
    );
};
const storage: any = multer.memoryStorage()

const upload = multer({ storage })

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "hello" })
})

app.post("/upload", upload.single("images"), (req: any, res: Response) => {
    if (req.body.secret === process.env.RAMCHO_SECRET) {
        if (!req.file) return res.json({ error: "File not found", status: 404 })
        var filename = createUniqId()
        const file = new File({ _id: filename, buffer: req.file.buffer, type: req.file.mimetype })
        file.save()
        res.json({
            thumbnail_url: `https://api.ramcho.xyz/cdn/${filename}.${req.file.mimetype.split("/")[1]}`,
            url: filename,
            deletion_url: "none",
            status: 200
        });
    } else {
        console.log(req.body.secret);
        res.json({ error: "Access denied", status: 401 });
    }
})

app.get("/i/:id", async (req, res) => {
    try {
        const file: any = await File.findById(req.params.id)
        if (!req.params.id) return res.status(403).json({ error: "Not enough id" })
        res.json({ filename: file._id, type: file.type, url: `https://api.ramcho.xyz/cdn/${file._id}.${file.type.split("/")[1]}` })
    } catch (err) {
        console.log(err)
        res.status(403).json({ error: "Not enough id", status: 403 })
    }
})
app.get("/cdn/:id", async (req: any, res: any) => {
    try {
        const fileId = req.params.id.split(".")
        if (fileId.length === 1) return res.status(404).json({ error: "File not found", status: 404 })
        if (!fileId[1].match(/^(jpe?g|png|gif|mp4)$/)) return res.status(404).json({ error: "File not found", status: 404 })
        const file: any = await File.findById(fileId[0])
        if (file.type.split("/")[1] !== fileId[1]) return res.status(404).json({ error: "File not found", status: 404 })
        res.end(file.buffer)
    } catch (err) {
        console.log(err)
        res.status(404).json({ error: "File not found", status: 404 })
    }
})

app.listen(process.env.PORT, () => console.log("ready"))
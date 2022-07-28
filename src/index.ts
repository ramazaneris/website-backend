'use strict';
import express, { Request, Response } from 'express';
import fs, { renameSync } from 'fs';
import path from 'path';
import multer from 'multer';
import "dotenv/config"
import mongoose from 'mongoose'
import File from '../schema/fileSchema'
mongoose.connect(`${process.env.MONGODB_URI}`)

const app = express();

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
        const file = new File({ _id: filename, buffer: req.file.buffer, type: req.file.mimetype.split("/")[1] })
        file.save()
        res.json({
            thumbnail_url: "https://ramcho.xyz/u/" + filename + "." + req.file.originalname.split(".").pop(),
            url: req.file.filename,
            deletion_url: "none",
            status: 200
        });
    } else {
        console.log(req.body.secret);
        res.json({ error: "Access denied", status: 401 });
    }
})

app.get("/u/:id", async (req: any, res: any) => {
    try {
        const fileId = req.params.id.split(".")
        if (fileId.length === 1) return res.status(404).json({ error: "File not found", status: 404 })
        if (!fileId[1].match(/^(jpe?g|png|gif|mp4)$/)) return res.status(404).json({ error: "File not found", status: 404 })
        const file: any = await File.findById(fileId[0])
        if (file.type !== fileId[1]) return res.status(404).json({ error: "File not found", status: 404 })
        res.end(file.buffer)
    } catch (err) {
        console.log(err)
        res.json({ error: "File not found", status: 404 })
    }
})

app.listen(process.env.PORT, () => console.log("ready"))
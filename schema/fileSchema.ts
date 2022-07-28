import mongoose from "mongoose"

const fileSchema: any = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        buffer: { type: Buffer, required: true }
    }
);

const File = mongoose.model("file", fileSchema);
export default File;

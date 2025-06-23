const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SectionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['about', 'experience', 'education', 'projects', 'skills', 'links', 'contact'],
        required: true
    },
    title: { type: String },
    content: mongoose.Schema.Types.Mixed
}, { _id: false });

const LinkSchema = new mongoose.Schema({
    label: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });

const ShowfolioSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    showfolioId: { type: String, unique: true, default: uuidv4 },
    visibility: {
        type: String,
        enum: ["public", "unlisted", "private"],
        default: "public"
    },
    primaryColor: { type: String, default: "#6366f1" },
    sections: [SectionSchema],
    links: [LinkSchema]
}, { timestamps: true });

module.exports = mongoose.model('Showfolio', ShowfolioSchema);

// backend/ai.controller.js
import fetch from "node-fetch";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";
import { UploadOnCloudinary } from "../utils/cloudinary.utils.js";
dotenv.config();

const API_KEY = process.env.AI_API_KEY;


export const generateText = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "x-ai/grok-4.1-fast:free",
                reasoning: { enabled: true },
                messages: [
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        res.json({
            text: data?.choices?.[0]?.message?.content || "No response generated."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Text generation failed" });
    }
};


export async function generateImage(req, res) {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({
                error: "Prompt must be a non-empty string."
            });
        }

        if (!process.env.HF_API_KEY) {
            return res.status(500).json({
                error: "Server configuration error."
            });
        }

        const client = new InferenceClient(process.env.HF_API_KEY);

        // Step 1: Generate image from HuggingFace
        const blob = await client.textToImage({
            model: "black-forest-labs/FLUX.1-schnell",
            inputs: prompt,
            parameters: {
                num_inference_steps: 4,
                guidance_scale: 0
            },
        });

        if (!blob) {
            return res.status(500).json({
                error: "Image generation failed."
            });
        }

        // Step 2: Convert Blob → ArrayBuffer → Buffer
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Step 3: Upload to Cloudinary
        const cloudinaryResult = await UploadOnCloudinary(buffer);

        if (!cloudinaryResult) {
            return res.status(500).json({
                error: "Failed to upload image to Cloudinary."
            });
        }

        // Step 4: Send response with Cloudinary URL
        return res.status(200).json({
            message: "Image generated and uploaded successfully",
            imageUrl: cloudinaryResult.secure_url,
            publicId: cloudinaryResult.public_id
        });

    } catch (error) {
        console.error("Image Generation Error:", error.message);
        return res.status(500).json({
            error: `Image generation failed: ${error.message}`
        });
    }
}
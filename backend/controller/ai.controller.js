// backend/ai.controller.js
import fetch from "node-fetch";
import dotenv from "dotenv";
import axios from 'axios';
import { InferenceClient } from "@huggingface/inference";
import { UploadOnCloudinary } from "../utils/cloudinary.utils.js";
dotenv.config();

const API_KEY = process.env.AI_API_KEY;


export const generateText = async (req, res) => {
    try {
        
        
        const { prompt } = req.body;

        console.log('generate fn called');
        console.log(`prompt is : ${prompt}`);

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
                model: "allenai/olmo-3.1-32b-think:free",
                messages: [
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        console.log(data);
        

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



export const suggestYouTubeVideos = async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic || typeof topic !== "string") {
            return res.status(400).json({
                error: "Topic must be a non-empty string."
            });
        }

        if (!process.env.GOOGLE_API_KEY) {
            return res.status(500).json({
                error: "YouTube API key not configured."
            });
        }

        // Call YouTube Data API v3
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: process.env.GOOGLE_API_KEY,
                q: topic,
                part: 'snippet',
                type: 'video',
                maxResults: 5, 
                order: 'relevance', // Sort by relevance
                videoDefinition: 'any',
                safeSearch: 'moderate'
            }
        });

        // Format the results
        const videos = response.data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
        }));

        return res.status(200).json({
            message: "Videos fetched successfully",
            topic: topic,
            count: videos.length,
            videos: videos
        });

    } catch (error) {
        console.error("YouTube API Error:", error.response?.data || error.message);

        if (error.response?.status === 403) {
            return res.status(403).json({
                error: "YouTube API quota exceeded or invalid API key."
            });
        }

        return res.status(500).json({
            error: `Failed to fetch videos: ${error.message}`
        });
    }
};
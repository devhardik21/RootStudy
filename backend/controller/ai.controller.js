// backend/ai.controller.js
import fetch from "node-fetch";
import dotenv from "dotenv";
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



// export const generateImage = async (req, res) => {
//     try {
//         const { prompt } = req.body;
//         if (!prompt) {
//             return res.status(400).json({ error: "Prompt is required" });
//         }

//         console.log("API called with prompt:", prompt);

//         // Make sure API_KEY is defined (from environment variables)
//         const API_KEY = process.env.AI_API_KEY;
//         if (!API_KEY) {
//             return res.status(500).json({ error: "API key not configured" });
//         }

//      try {
//            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//                method: "POST",
//                headers: {
//                    "Authorization": `Bearer ${API_KEY}`,
//                    "Content-Type": "application/json",
//                },
//                body: JSON.stringify({
//                    model: "meta/ray-3.0-11b",
//                    messages: [
//                        {
//                            role: "user",
//                            content: [
//                                {
//                                    type: "text",
//                                    text: `Generate an image: ${prompt}`
//                                }
//                            ]
//                        }
//                    ]
//                })
//            });
   
//      } catch (error) {
//         console.log(error);
        
//         res.status(500).json({
//             err : `${error}`
//         })
        
//      }
//         if (!response.ok) {
//             throw new Error(`API request failed with status ${response.status}`);
//         }

//         const json = await response.json();
//         console.log("Full Response:", JSON.stringify(json, null, 2));

//         // Check the actual response structure from OpenRouter docs
//         const imageUrl = json?.choices?.[0]?.message?.content?.[0]?.image_url?.url;

//         if (!imageUrl) {
//             console.error("No image URL found in response:", json);
//             return res.status(500).json({ error: "No image generated" });
//         }

//         res.json({ success: true, image: imageUrl });

//     } catch (error) {
//         console.error("Error in generateImage:", error);
//         res.status(500).json({ error: error.message });
//     }
// };
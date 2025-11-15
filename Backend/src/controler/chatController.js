import { chatClient } from "../lib/stream.js"

export async function getStreamToken(req,res){
    try {
        const token = chatClient.createToken(req.user.clerkId)
        
        if (!token) {
            return res.status(500).json({msg: "Failed to generate token"});
        }

        res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            image: req.user.profileImage,
        })
    } catch (error) {
        console.error("Error in getStreamToken controller:", error);
        res.status(500).json({msg: "internal server error"});
    }
}
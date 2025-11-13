import { chatClient } from "../lib/stream.js"

export async function getStreamToken(req,res){
    try {
        const token = chatClient.createToken(req.user.clerkId)

        res.status(200).json({
            token,
            userId: req.user.clerkId,
            userName: req.user.name,
            image: req.user.image,
        })
    } catch (error) {
        console.log("Error in getStreamToken controller",error);
        res.status(500).json({msg:"internal server error"});
        
    }
}
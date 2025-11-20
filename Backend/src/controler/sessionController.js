import Session from "../models/Session.js";
import { chatClient, streamClient } from "../lib/stream.js";

export async function createSession(req, res) {
    try {
        let {problem, difficulty} = req.body;
        const userId = req.user.id;
        const clerkId = req.user.clerkId;

        if(!problem || !difficulty) {
            return res.status(400).json({msg: "problem and difficulty are required"});
        }
        
        // Capitalize first letter to match schema enum
        difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
        
        const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        // create session in db
        const session = await Session.create({problem, difficulty, host: userId, callId})
        //create stream video call
        await streamClient.video.call("default", callId).getOrCreate({
            data:{
                created_by_id: clerkId,
                custom: {problem,difficulty,sessionId:session._id.toString()}
            }
        })

        //chat messaging
        const channel = chatClient.channel("messaging", callId, {
            name: `${problem} session`,
            created_by_id: clerkId,
            members: [clerkId]
        });
        await channel.create();
        res.status(201).json({session: session});
    } catch (error) {
        console.error("Error in createSession controller:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({msg: "Internal server error", error: error.message});
    }
}
export async function getActiveSessions(req, res) {
    try {
        const session = await Session.find({status: "active"})
        .populate("host","name profileImage email clerkId")
        .populate("participants","name profileImage email clerkId")
        .sort({createdAt: -1})
        .limit(20);
        res.status(200).json({sessions: session});
    } catch (error) {
        console.log("Error in getActiveSession controller",error.message);
        res.status(500).json({msg: "Internal server error"});
        
    }
}
export async function getMyRecentSessions(req, res) {
    try {
        const userId = req.user.id;
        const sessions = await Session.find({
            status: "completed",
            $or: [{host: userId}, {participants: userId}]}).sort({updatedAt: -1}).limit(20);

        res.status(200).json({sessions});
        
    } catch (error) {
        console.log("Error in getMyRecentSessions controller",error.message);
        res.status(500).json({msg: "Internal server error"});
    }
}

export async function getSessionById(req, res) {
    try {
        const {id} = req.params;    
        const session = await Session.findById(id)
            .populate("host","name profileImage email clerkId")
            .populate("participants","name profileImage email clerkId");

        if(!session) {
            return res.status(404).json({msg: "session not found"});
        }

        // return the found session
        res.status(200).json({session});
    } catch (error) {
        console.log("Error in getSessionById controller",error.message);
        res.status(500).json({msg: "Internal server error"});
    }
}
export async function joinSession(req, res) {
    try {
        const {id} = req.params; 
        const userId = req.user.id;
        const clerkId = req.user.clerkId;

        const session = await Session.findById(id);
        if(!session) {
            return res.status(404).json({msg: "session not found"});
        }  
        
        if(session.status !== "active") {
            return res.status(400).json({msg: "cannot join a completed session"});
        }
        if(session.host.toString() === userId.toString()) {
            return res.status(400).json({msg: "host cannot join their own session"});
        }
        
        if(session.participants) {
            return res.status(409).json({msg: "session already full"});
        }
        session.participants = userId;
        await session.save();
        // add user to stream call
        const channel = chatClient.channel("messaging",session.callId);
        await channel.addMembers([clerkId]);

        res.status(200).json({session});
    } catch (error) {
        console.log("Error in joinSession controller",error.message);
        res.status(500).json({msg: "Internal server error"});
    }
}
export async function endSession(req, res) {
    try {
        const {id} = req.params;
        const userId = req.user.id;

        const session = await Session.findById(id);
        if(!session) {
            return res.status(404).json({msg: "session not found"});
        }
        if(session.host.toString() !== userId.toString()) {
            return res.status(403).json({msg: "only host can end the session"});
        }
    
        //end stream video call
        const call = streamClient.video.call("default", session.callId);
        await call.delete({hard: true});

        // end chat channel
        const channel = chatClient.channel("messaging",session.callId);
        await channel.delete();

        session.status = "completed";
        await session.save();

        res.status(200).json({session,message: "session ended successfully"});

    } catch (error) {
        console.log("Error in endSession controller",error.message); 
        res.status(500).json({msg: "Internal server error"});
    }
}
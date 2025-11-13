import {StreamChat} from "stream-chat"
import { ENV } from "./env.js"

const apiKey = ENV.STREAM_API_KEY
const apiSecret = ENV.STREAM_API_SECRET

if(!apiKey || !apiSecret){
    console.error("STREAM_API_KEY or STREAM_API_SECRET is Missing");
}
export const chatClient = StreamChat.getInstance(apiKey,apiSecret);

export const upsertStreamUser = async(userData) => {
    try {
        await chatClient.upsertUser(userData)
        console.log("stream user created successfully:",userData);
    } catch (error) {
        console.error("Error upserting user data:",error);
        
    }
};

export const deleteStreamUser = async(userId) => {
    try {
        await chatClient.upsertUsers(userId)
        console.log("stream user deleted successfully:",userId);
        
    } catch (error) {
        console.error("Error deleteing the stream user:",error);
        
    }
};
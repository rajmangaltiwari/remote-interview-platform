import { useState, useEffect, useRef } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  // Use refs to track initialization and prevent duplicate calls
  const isInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);

  // Extract stable values from session to avoid re-running on every refetch
  const callId = session?.callId;
  const sessionStatus = session?.status;

  useEffect(() => {
    let videoCall = null;
    let chatClientInstance = null;
    let cancelled = false;

    const initCall = async () => {
      console.log("[StreamClient] initCall triggered", {
        callId, sessionStatus, isHost, isParticipant,
        isInitialized: isInitializedRef.current,
        isInitializing: isInitializingRef.current,
      });

      // Skip if already initialized or currently initializing
      if (isInitializedRef.current || isInitializingRef.current) {
        console.log("[StreamClient] Skipping — already initialized or in progress");
        return;
      }
      if (!callId) { console.log("[StreamClient] Skipping — no callId"); return; }
      if (!isHost && !isParticipant) { console.log("[StreamClient] Skipping — not host or participant"); return; }
      if (sessionStatus === "completed") { console.log("[StreamClient] Skipping — session completed"); return; }

      isInitializingRef.current = true;

      try {
        console.log("[StreamClient] Fetching stream token...");
        const { token, userId, userName, image } = await sessionApi.getStreamToken();
        console.log("[StreamClient] Token received for user:", userId);

        if (cancelled) return;

        console.log("[StreamClient] Initializing video client...");
        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: image,
          },
          token
        );

        if (cancelled) return;

        setStreamClient(client);

        console.log("[StreamClient] Joining video call:", callId);
        videoCall = client.call("default", callId);
        await videoCall.join({ create: true });
        console.log("[StreamClient] Video call joined successfully");

        if (cancelled) return;

        setCall(videoCall);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        chatClientInstance = StreamChat.getInstance(apiKey);

        console.log("[StreamClient] Connecting chat user...");
        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: image,
          },
          token
        );

        if (cancelled) return;

        setChatClient(chatClientInstance);

        console.log("[StreamClient] Watching chat channel:", callId);
        const chatChannel = chatClientInstance.channel("messaging", callId);
        await chatChannel.watch();

        if (cancelled) return;

        setChannel(chatChannel);
        isInitializedRef.current = true;
        console.log("[StreamClient] Fully initialized successfully");
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to join video call");
          console.error("[StreamClient] Error init call:", error);
        }
      } finally {
        isInitializingRef.current = false;
        if (!cancelled) {
          setIsInitializingCall(false);
        }
      }
    };

    if (!loadingSession && callId) initCall();

    return () => {
      cancelled = true;
      (async () => {
        try {
          if (videoCall) await videoCall.leave();
          if (chatClientInstance) await chatClientInstance.disconnectUser();
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
        isInitializedRef.current = false;
        isInitializingRef.current = false;
      })();
    };
  }, [callId, sessionStatus, loadingSession, isHost, isParticipant]);

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
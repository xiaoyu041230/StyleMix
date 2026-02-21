import React, { useEffect, useRef, useState, useMemo } from "react";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../api/axios";
import { addMessage, fetchMessages, resetMessages } from "../features/messages/messagesSlice";
import toast from "react-hot-toast";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId: chatUserId } = useParams(); // 对方用户 id
  const { getToken } = useAuth();
  const { user } = useUser(); // 当前登录用户（Clerk）
  const myClerkId = user?.id;

  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const [chatUser, setChatUser] = useState(null); // 对方用户资料
  const [loadingUser, setLoadingUser] = useState(true);

  const messagesEndRef = useRef(null);

  // 1) 拉取聊天消息
  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId: chatUserId }));
    } catch (error) {
      toast.error(error?.message || "Failed to load messages");
    }
  };

  // 2) 拉取对方用户资料（不再依赖 connections）
  const fetchChatUser = async () => {
    try {
      setLoadingUser(true);
      const token = await getToken();

      // ✅ 把这个 URL 改成你后端真实的 “按 id 获取用户” 路由
      const { data } = await api.get(`/api/user/profile/${chatUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success && data?.user) {
        setChatUser(data.user);
      } else {
        toast.error(data?.message || "Failed to load user");
        setChatUser(null);
      }
    } catch (e) {
      toast.error(e?.message || "Failed to load user");
      setChatUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  // 3) 发送消息
  const sendMessage = async () => {
    try {
      if (!text && !image) return;

      const token = await getToken();
      const formData = new FormData();
      formData.append("to_user_id", chatUserId);
      formData.append("text", text);
      if (image) formData.append("image", image);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success) {
        setText("");
        setImage(null);
        dispatch(addMessage(data.message));
      } else {
        throw new Error(data?.message || "Failed to send");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to send");
    }
  };

  useEffect(() => {
    fetchChatUser();
    fetchUserMessages();

    return () => {
      dispatch(resetMessages());
    };
  }, [chatUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages]);

  if (loadingUser) return <div className="p-6">Loading...</div>;
  if (!chatUser) return <div className="p-6">User not found.</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
        <img src={chatUser.profile_picture} alt="" className="size-8 rounded-full" />
        <div>
          <p className="font-medium">{chatUser.full_name}</p>
          <p className="text-sm text-gray-500 -mt-1.5">@{chatUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-5 md:px-10 h-full overflow-y-scroll">
        <div className="space-y-4 max-w-4xl mx-auto">
          {sortedMessages.map((message, index) => {
            // ✅ 左右判断：from_user_id 是不是我
            // 注意：message.from_user_id 可能是 string，也可能是 populate 后的对象
            const fromId =
              typeof message.from_user_id === "string"
                ? message.from_user_id
                : message.from_user_id?._id || message.from_user_id?.id;

            const isMe = myClerkId && String(fromId) === String(myClerkId);

            return (
              <div key={index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`p-2 text-sm max-w-sm bg-white text-slate-700 rounded-lg shadow ${
                    isMe ? "rounded-br-none" : "rounded-bl-none"
                  }`}
                >
                  {message.message_type === "image" && (
                    <img src={message.media_url} className="w-full max-w-sm rounded-lg mb-1" alt="" />
                  )}
                  {!!message.text && <p>{message.text}</p>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-4">
        <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
          <input
            type="text"
            className="flex-1 outline-none text-slate-700"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
          />

          <label htmlFor="image">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="" className="h-8 rounded" />
            ) : (
              <ImageIcon className="size-7 text-gray-400 cursor-pointer" />
            )}
            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>

          <button
            onClick={sendMessage}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
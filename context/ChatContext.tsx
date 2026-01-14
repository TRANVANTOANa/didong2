// context/ChatContext.tsx
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { ChatMessage, processUserMessage } from "../lib/gemini";

type ChatContextType = {
    messages: ChatMessage[];
    isLoading: boolean;
    sendMessage: (content: string) => Promise<void>;
    clearHistory: () => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    // TODO: Thay thế bằng user ID thực từ Firebase Auth
    const userId = "demo-user-123";
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load chat history từ Firebase khi mount
    useEffect(() => {
        loadChatHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ load 1 lần khi mount

    const loadChatHistory = async () => {
        if (!userId) return;

        try {
            const chatRef = collection(db, "chatHistory");
            const q = query(
                chatRef,
                where("userId", "==", userId),
                orderBy("timestamp", "asc")
            );

            const snapshot = await getDocs(q);
            const history: ChatMessage[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            })) as ChatMessage[];

            setMessages(history);
        } catch (error) {
            console.error("Error loading chat history:", error);
        }
    };

    const saveChatMessage = async (message: ChatMessage) => {
        if (!userId) return;

        try {
            const chatRef = collection(db, "chatHistory");

            // Loại bỏ products nếu undefined để tránh lỗi Firebase
            const dataToSave: any = {
                role: message.role,
                content: message.content,
                userId,
                timestamp: new Date(),
            };

            // Chỉ thêm products nếu nó tồn tại và có length > 0
            if (message.products && message.products.length > 0) {
                dataToSave.products = message.products;
            }

            await addDoc(chatRef, dataToSave);
        } catch (error) {
            console.error("Error saving chat message:", error);
        }
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Tạo user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: content.trim(),
            timestamp: new Date(),
        };

        // Thêm vào state
        setMessages((prev) => [...prev, userMessage]);

        // Lưu vào Firebase
        await saveChatMessage(userMessage);

        // Bắt đầu loading
        setIsLoading(true);

        try {
            // Gọi AI để xử lý
            const { aiResponse, products } = await processUserMessage(content);

            // Tạo assistant message
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: aiResponse,
                timestamp: new Date(),
                products: products.length > 0 ? products : undefined,
            };

            // Thêm vào state
            setMessages((prev) => [...prev, assistantMessage]);

            // Lưu vào Firebase
            await saveChatMessage(assistantMessage);
        } catch (error) {
            console.error("Error sending message:", error);

            // Thêm error message
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Xin lỗi, có lỗi xảy ra. Bạn thử lại nhé! 😓",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = async () => {
        if (!userId) return;

        try {
            const chatRef = collection(db, "chatHistory");
            const q = query(chatRef, where("userId", "==", userId));
            const snapshot = await getDocs(q);

            // Xóa tất cả messages
            const deletePromises = snapshot.docs.map((document) =>
                deleteDoc(doc(db, "chatHistory", document.id))
            );

            await Promise.all(deletePromises);

            // Clear state
            setMessages([]);
        } catch (error) {
            console.error("Error clearing chat history:", error);
        }
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                isLoading,
                sendMessage,
                clearHistory,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within ChatProvider");
    }
    return context;
}

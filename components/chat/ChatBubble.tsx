// components/chat/ChatBubble.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ChatMessage } from "../../lib/gemini";
import ChatProductCard from "./ChatProductCard";

type ChatBubbleProps = {
    message: ChatMessage;
};

export default function ChatBubble({ message }: ChatBubbleProps) {
    const isUser = message.role === "user";

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
            {/* Avatar */}
            {!isUser && (
                <View style={styles.aiAvatar}>
                    <Text style={styles.aiAvatarText}>🤖</Text>
                </View>
            )}

            <View style={styles.contentWrapper}>
                {/* Message Bubble */}
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                    <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
                        {message.content}
                    </Text>
                </View>

                {/* Products List */}
                {message.products && message.products.length > 0 && (
                    <View style={styles.productsContainer}>
                        {message.products.map((product) => (
                            <ChatProductCard key={product.id} product={product} />
                        ))}
                    </View>
                )}

                {/* Timestamp */}
                <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
                    {formatTime(message.timestamp)}
                </Text>
            </View>

            {/* User Avatar */}
            {isUser && (
                <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>👤</Text>
                </View>
            )}
        </View>
    );
}

function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    userContainer: {
        justifyContent: "flex-end",
    },
    aiContainer: {
        justifyContent: "flex-start",
    },
    contentWrapper: {
        maxWidth: "75%",
    },
    bubble: {
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    userBubble: {
        backgroundColor: "#5B9EE1",
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: "#FFFFFF",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    text: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: "#FFFFFF",
    },
    aiText: {
        color: "#0F172A",
    },
    aiAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#EBF4FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    aiAvatarText: {
        fontSize: 18,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#FEF3C7",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    userAvatarText: {
        fontSize: 18,
    },
    productsContainer: {
        marginTop: 8,
        gap: 8,
    },
    timestamp: {
        fontSize: 11,
        marginTop: 4,
        color: "#94A3B8",
    },
    userTimestamp: {
        textAlign: "right",
    },
    aiTimestamp: {
        textAlign: "left",
    },
});

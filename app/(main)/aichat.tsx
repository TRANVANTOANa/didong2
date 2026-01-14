// app/(main)/aichat.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import ChatBubble from "../../components/chat/ChatBubble";
import { useChat } from "../../context/ChatContext";

export default function AIChatScreen() {
    const { messages, isLoading, sendMessage, clearHistory } = useChat();
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    // Tự động scroll xuống khi có message mới
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const text = inputText;
        setInputText("");

        await sendMessage(text);
    };

    const handleClearHistory = () => {
        // Bạn có thể thêm confirmation dialog ở đây
        clearHistory();
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🤖✨</Text>
            <Text style={styles.emptyTitle}>AI Shopping Assistant</Text>
            <Text style={styles.emptyDescription}>
                Xin chào! Mình có thể giúp bạn tìm kiếm sản phẩm.{"\n"}
                Hãy cho mình biết bạn đang tìm gì nhé!
            </Text>

            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>💡 Gợi ý:</Text>
                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() => setInputText("Tìm giày Nike dưới $400")}
                >
                    <Text style={styles.suggestionText}>Giày Nike dưới $400</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() => setInputText("Giày Adidas màu đỏ")}
                >
                    <Text style={styles.suggestionText}>Giày Adidas màu đỏ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() => setInputText("Có giày Puma không?")}
                >
                    <Text style={styles.suggestionText}>Giày Puma</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() => setInputText("Sản phẩm bán chạy nhất")}
                >
                    <Text style={styles.suggestionText}>Best Seller 🔥</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIcon}>
                        <Text style={styles.headerIconText}>🤖</Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>AI Assistant</Text>
                        <Text style={styles.headerSubtitle}>
                            {isLoading ? "Đang trả lời..." : "Online"}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearHistory}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ChatBubble message={item} />}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmpty}
                />

                {/* Loading Indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#5B9EE1" />
                        <Text style={styles.loadingText}>AI đang suy nghĩ...</Text>
                    </View>
                )}

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập câu hỏi của bạn..."
                            placeholderTextColor="#94A3B8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            editable={!isLoading}
                        />

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                            ]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={!inputText.trim() || isLoading ? "#CBD5E1" : "#FFFFFF"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#EBF4FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    headerIconText: {
        fontSize: 24,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#0F172A",
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#10B981",
        marginTop: 2,
    },
    clearButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#FEF2F2",
        alignItems: "center",
        justifyContent: "center",
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        paddingTop: 16,
        paddingBottom: 16,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 8,
    },
    emptyDescription: {
        fontSize: 15,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    suggestionsContainer: {
        width: "100%",
        alignItems: "flex-start",
    },
    suggestionsTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748B",
        marginBottom: 12,
    },
    suggestionChip: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    suggestionText: {
        fontSize: 14,
        color: "#5B9EE1",
        fontWeight: "500",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    loadingText: {
        fontSize: 13,
        color: "#64748B",
        fontStyle: "italic",
    },
    inputContainer: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: "#F8FAFC",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#0F172A",
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#5B9EE1",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: "#E2E8F0",
    },
});

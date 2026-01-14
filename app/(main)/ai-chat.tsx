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
    Alert,
} from "react-native";
import ChatBubble from "../../components/chat/ChatBubble";
import { useChat } from "../../context/ChatContext";

export default function AIChatScreen() {
    const { messages, isLoading, sendMessage, clearHistory } = useChat();
    const [inputText, setInputText] = useState("");
    const flatListRef = useRef<FlatList>(null);

    /* 🔽 Auto scroll */
    useEffect(() => {
        if (messages.length > 0) {
            requestAnimationFrame(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            });
        }
    }, [messages]);

    /* 📤 Send message */
    const handleSend = async (text?: string) => {
        const message = text ?? inputText;
        if (!message.trim() || isLoading) return;

        setInputText("");

        try {
            await sendMessage(message);
        } catch (err) {
            Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
        }
    };

    /* 🧹 Clear chat */
    const handleClearHistory = () => {
        if (isLoading) return;

        Alert.alert(
            "Xóa hội thoại",
            "Bạn có chắc muốn xóa toàn bộ lịch sử chat?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Xóa", style: "destructive", onPress: clearHistory },
            ]
        );
    };

    /* 💡 Suggestion click = send */
    const handleSuggestion = (text: string) => {
        handleSend(text);
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🤖✨</Text>
            <Text style={styles.emptyTitle}>AI Shopping Assistant</Text>
            <Text style={styles.emptyDescription}>
                Xin chào! Mình có thể giúp bạn tìm sản phẩm phù hợp nhất 👟
            </Text>

            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>💡 Gợi ý:</Text>

                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() =>
                        handleSuggestion("Có giày Nike màu xanh dưới 4 triệu không?")
                    }
                >
                    <Text style={styles.suggestionText}>Giày Nike xanh dưới 4tr</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() =>
                        handleSuggestion("Tìm giày chạy bộ Adidas giá khoảng 3 triệu")
                    }
                >
                    <Text style={styles.suggestionText}>Giày chạy bộ Adidas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestion("Giày streetwear màu đen")}
                >
                    <Text style={styles.suggestionText}>Streetwear màu đen</Text>
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
                    disabled={isLoading}
                >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                style={styles.chatContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={90}
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

                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#5B9EE1" />
                        <Text style={styles.loadingText}>AI đang suy nghĩ...</Text>
                    </View>
                )}

                {/* Input */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Hỏi về sản phẩm, giá, màu..."
                            placeholderTextColor="#94A3B8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            editable={!isLoading}
                            onSubmitEditing={() => handleSend()}
                        />

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isLoading) &&
                                    styles.sendButtonDisabled,
                            ]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <Ionicons name="send" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

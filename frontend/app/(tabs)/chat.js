import { View, Text, Pressable, StyleSheet, Image } from 'react-native'
import { useChat } from '../../context/chat-context'
import React from 'react'
import { globalStyles } from '../../styles/global'
import { router } from 'expo-router'
import Screen from '../../components/screen'
import LoadingSpinner from '../../components/loading-spinner'

const ChatScreen = () => {
    const { chats, otherUsers, unreadCount, loading, error } = useChat()

    const handleChatPress = chat => {
        router.push(`/chat-view?chatId=${chat.id || chat._id}`)
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return (
            <View>
                <Text>{error}</Text>
            </View>
        )
    }

    return (
        <Screen>
            <View>
                {chats.length === 0 ? (
                    <Text>No hay chats disponibles.</Text>
                ) : (
                    chats.map(chat => {
                        const otherUser = otherUsers[chat.id || chat._id]
                        return (
                            <Pressable
                                key={chat.id || chat._id}
                                onPress={() => handleChatPress(chat)}
                            >
                                <View
                                    style={[
                                        globalStyles.card,
                                        {
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 10,
                                        },
                                    ]}
                                >
                                    {otherUser?.profile_pic ? (
                                        <Image
                                            source={{ uri: otherUser.profile_pic }}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 25,
                                                backgroundColor: '#f0f0f0',
                                            }}
                                        />
                                    ) : (
                                        <View
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 25,
                                                backgroundColor: '#e0e0e0',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ fontSize: 20, color: '#888' }}>
                                                {otherUser?.name?.[0]?.toUpperCase() || '?'}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                                            {otherUser?.name || 'Usuario'}
                                        </Text>
                                        <Text 
                                            style={{ 
                                                color: chat.hasUnreadMessages ? '#000' : '#666', 
                                                fontSize: 14,
                                                fontWeight: chat.hasUnreadMessages ? '600' : 'normal'
                                            }}
                                            numberOfLines={1}
                                        >
                                            {chat.hasUnreadMessages && chat.unreadMessageCount > 0
                                                ? `${chat.unreadMessageCount} mensaje${chat.unreadMessageCount > 1 ? 's' : ''} nuevo${chat.unreadMessageCount > 1 ? 's' : ''}`
                                                : chat.last_message || 'No hay mensajes aún'}
                                        </Text>
                                    </View>
                                    {chat.hasUnreadMessages && chat.unreadMessageCount > 0 && (
                                        <View style={styles.dot} />
                                    )}
                                </View>
                            </Pressable>
                        )
                    })
                )}
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
    }
})

export default ChatScreen

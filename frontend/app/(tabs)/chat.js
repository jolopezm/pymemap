import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Image,
    ActivityIndicator,
} from 'react-native'
import { useChat } from '../../context/chat-context'
import React from 'react'
import { globalStyles, colors } from '../../styles/theme'
import { router, useFocusEffect } from 'expo-router'
import Screen from '../../components/screen'
import { Ionicons } from '@expo/vector-icons'

const ChatScreen = () => {
    const {
        chats,
        otherUsers,
        unreadCount,
        loading,
        error,
        isFromCache,
        refreshChats,
    } = useChat()

    useFocusEffect(
        React.useCallback(() => {
            refreshChats()
        }, [])
    )

    const handleChatPress = chat => {
        const chatId = chat.id || chat._id
        router.push(`/chat-view?chatId=${chatId}`)
    }

    if (error && chats.length === 0) {
        return (
            <Screen>
                <View style={globalStyles.container}>
                    <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
                    <Text
                        style={{
                            color: '#FF6B6B',
                            marginTop: 16,
                            textAlign: 'center',
                        }}
                    >
                        {error}
                    </Text>
                    <Pressable
                        style={[globalStyles.button, { marginTop: 16 }]}
                        onPress={refreshChats}
                    >
                        <Text style={globalStyles.buttonText}>Reintentar</Text>
                    </Pressable>
                </View>
            </Screen>
        )
    }

    return (
        <Screen>
                {loading && !isFromCache && (
                    <View style={{ paddingVertical: 8, alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#9B59B6" />
                    </View>
                )}
                {isFromCache && (
                    <View style={styles.cacheIndicator}>
                        <Ionicons
                            name="cloud-offline"
                            size={16}
                            color="#856404"
                        />
                        <Text style={styles.cacheText}>
                            Mostrando datos guardados
                        </Text>
                        <Pressable onPress={refreshChats}>
                            <Text style={styles.refreshText}>
                                Actualizar
                            </Text>
                        </Pressable>
                    </View>
                )}

                {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                            {unreadCount} mensaje
                            {unreadCount > 1 ? 's' : ''} sin leer
                        </Text>
                    </View>
                )}

                {chats.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons
                                name="chatbubbles-outline"
                                size={64}
                                color="#CCC"
                            />
                            <Text style={styles.emptyText}>
                                No hay chats disponibles
                            </Text>
                            <Text style={styles.emptySubtext}>
                                Inicia una conversación desde el perfil de un
                                negocio
                            </Text>
                        </View>
                    ) : (
                        chats.map(chat => {
                            const chatId = chat.id || chat._id
                            const otherUser = otherUsers[chatId]

                            // ✅ CORRECCIÓN: Extraer el contenido del último mensaje
                            const lastMessageText =
                                chat.last_message?.content ||
                                chat.lastMessage?.content ||
                                'No hay mensajes aún'

                            return (
                                <Pressable
                                    key={chatId}
                                    onPress={() => handleChatPress(chat)}
                                    style={({ pressed }) => [
                                        globalStyles.card,
                                        {
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 10,
                                            opacity: pressed ? 0.7 : 1,
                                            backgroundColor:
                                                chat.hasUnreadMessages
                                                    ? '#F8F4FF'
                                                    : '#FFF',
                                        },
                                    ]}
                                >
                                    {/* Avatar */}
                                    {otherUser?.profile_pic ? (
                                        <Image
                                            source={{
                                                uri: otherUser.profile_pic,
                                            }}
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
                                                backgroundColor: '#9B59B6',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 20,
                                                    color: '#FFF',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {otherUser?.name?.[0]?.toUpperCase() ||
                                                    '?'}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Contenido del chat */}
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{
                                                fontWeight: '600',
                                                fontSize: 16,
                                                color: '#333',
                                            }}
                                        >
                                            {otherUser?.name || 'Usuario'}
                                        </Text>
                                        <Text
                                            style={{
                                                color: chat.hasUnreadMessages
                                                    ? '#000'
                                                    : '#666',
                                                fontSize: 14,
                                                fontWeight:
                                                    chat.hasUnreadMessages
                                                        ? '600'
                                                        : 'normal',
                                                marginTop: 4,
                                            }}
                                            numberOfLines={1}
                                        >
                                            {lastMessageText}
                                        </Text>
                                    </View>

                                    {/* Indicador de mensajes no leídos */}
                                    {chat.hasUnreadMessages &&
                                        chat.unreadMessageCount > 0 && (
                                            <View
                                                style={styles.unreadCountBadge}
                                            >
                                                <Text
                                                    style={
                                                        styles.unreadCountText
                                                    }
                                                >
                                                    {chat.unreadMessageCount > 9
                                                        ? '9+'
                                                        : chat.unreadMessageCount}
                                                </Text>
                                            </View>
                                        )}

                                    {/* Flecha */}
                                    <Ionicons
                                        name="chevron-forward"
                                        size={20}
                                        color="#999"
                                    />
                                </Pressable>
                            )
                        })  
                    )}
        </Screen>
    )
}

const styles = StyleSheet.create({
    cacheIndicator: {
        backgroundColor: '#FFF3CD',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    cacheText: {
        color: '#856404',
        fontSize: 13,
        flex: 1,
    },
    refreshText: {
        color: '#9B59B6',
        fontWeight: '600',
        fontSize: 13,
    },
    unreadBadge: {
        backgroundColor: '#9B59B6',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    unreadText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },
    unreadCountBadge: {
        backgroundColor: '#FF6B6B',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    unreadCountText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#BBB',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
})

export default ChatScreen

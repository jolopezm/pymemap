import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { useAuth } from '../context/auth-context'
import { useChat } from '../context/chat-context'
import {
    getMessages,
    sendMessage,
    markChatAsRead as markChatAsReadAPI,
} from '../api/chat-service'
import React from 'react'
import { globalStyles, colors } from '../styles/global'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import Screen from '../components/screen'
import LoadingSpinner from '../components/loading-spinner'

export default function ChatView() {
    const { user } = useAuth()
    const { markChatAsRead, updateLastMessage, otherUsers, chats } = useChat()
    const navigation = useNavigation()
    const [messageText, setMessageText] = React.useState('')
    const [messages, setMessages] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const { chatId } = useLocalSearchParams()
    const scrollViewRef = React.useRef(null)

    // Validar chatId
    const validChatId = React.useMemo(() => {
        if (!chatId) return null

        const cleanId = String(chatId).trim()

        // Validar que sea un ObjectId válido de MongoDB (24 caracteres hexadecimales)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId)

        if (!isValidObjectId) {
            console.error('❌ chatId inválido:', {
                chatId,
                cleanId,
                length: cleanId.length,
                format: 'Expected 24 hex characters',
            })
            return null
        }

        return cleanId
    }, [chatId])

    // Obtener información del otro usuario
    const otherUser = otherUsers[validChatId]

    // Actualizar el título del header con el nombre del otro usuario
    React.useEffect(() => {
        if (otherUser?.name) {
            navigation.setOptions({
                title: otherUser.name,
            })
        }
    }, [otherUser, navigation])

    React.useEffect(() => {
        const fetchMessages = async () => {
            if (!validChatId) {
                console.error('❌ No valid chat ID provided')
                setError('ID de chat inválido')
                setLoading(false)
                return
            }

            if (!user) {
                console.error('❌ User not authenticated')
                setError('Usuario no autenticado')
                setLoading(false)
                return
            }

            try {
                // 1. Obtener mensajes
                const messageData = await getMessages(validChatId)
                setMessages(messageData)

                // 2. Intentar marcar como leído (con manejo de errores)
                try {
                    const userId = user.id || user._id

                    await markChatAsReadAPI(validChatId, userId)

                    // Marcar el chat como leído en el contexto local
                    markChatAsRead(validChatId)
                } catch (markError) {
                    // No bloquear la carga de mensajes si falla marcar como leído
                    console.error('⚠️ Error marcando chat como leído:', {
                        error: markError.message,
                        status: markError.response?.status,
                        data: markError.response?.data,
                        chatId: validChatId,
                    })

                    // Aún así, intentar marcar en el contexto local
                    markChatAsRead(validChatId)

                    // Solo mostrar error si es crítico
                    if (markError.response?.status === 400) {
                        console.error(
                            '🚨 Error crítico 400 - chatId posiblemente inválido'
                        )
                    }
                }
            } catch (error) {
                console.error('❌ Error fetching messages:', {
                    error: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                })
                setError('Error al cargar los mensajes')
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
    }, [validChatId, user, markChatAsRead])

    // Auto-scroll al final cuando se cargan mensajes o se envía uno nuevo
    React.useEffect(() => {
        if (messages.length > 0 && scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true })
            }, 100)
        }
    }, [messages.length])

    const newMessage = async () => {
        if (!messageText.trim() || !validChatId) return

        const messageData = {
            chatId: validChatId,
            sender_id: user.id || user._id,
            content: messageText.trim(),
            read: false,
            timestamp: new Date().toISOString(),
        }

        const tempMessage = {
            ...messageData,
            id: `temp-${Date.now()}`,
            _id: `temp-${Date.now()}`,
        }

        try {
            // Agregar mensaje temporalmente
            setMessages(prev => [...prev, tempMessage])
            setMessageText('')

            // Enviar al servidor
            const sentMessage = await sendMessage(messageData)

            // Reemplazar mensaje temporal con el real
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempMessage.id || msg._id === tempMessage._id
                        ? {
                              ...sentMessage,
                              id: sentMessage.id || sentMessage._id,
                              _id: sentMessage._id || sentMessage.id,
                          }
                        : msg
                )
            )

            // Actualizar el último mensaje en el contexto
            updateLastMessage(validChatId, sentMessage)
        } catch (error) {
            console.error('❌ Error enviando mensaje:', {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data,
            })

            // Eliminar mensaje temporal
            setMessages(prev =>
                prev.filter(
                    msg =>
                        msg.id !== tempMessage.id && msg._id !== tempMessage._id
                )
            )

            // Restaurar texto para reintentar
            setMessageText(messageData.content)

            // Mostrar error al usuario
            setError('No se pudo enviar el mensaje. Intenta de nuevo.')

            // Limpiar error después de 3 segundos
            setTimeout(() => setError(null), 3000)
        }
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (!validChatId) {
        return (
            <Screen>
                <View
                    style={[
                        globalStyles.container,
                        { justifyContent: 'center', alignItems: 'center' },
                    ]}
                >
                    <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
                    <Text
                        style={{
                            color: '#FF6B6B',
                            marginTop: 16,
                            textAlign: 'center',
                            fontSize: 16,
                        }}
                    >
                        ID de chat inválido
                    </Text>
                    <Text
                        style={{
                            color: '#999',
                            marginTop: 8,
                            textAlign: 'center',
                        }}
                    >
                        El formato del ID no es correcto
                    </Text>
                    <Pressable
                        style={[globalStyles.button, { marginTop: 16 }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={globalStyles.buttonText}>Volver</Text>
                    </Pressable>
                </View>
            </Screen>
        )
    }

    if (error && messages.length === 0) {
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
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={globalStyles.buttonText}>Volver</Text>
                    </Pressable>
                </View>
            </Screen>
        )
    }

    return (
        <Screen>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={{ flex: 1, position: 'relative' }}>
                    {/* Mostrar error temporal si hay pero no bloquear UI */}
                    {error && (
                        <View style={styles.errorBanner}>
                            <Ionicons
                                name="warning"
                                size={16}
                                color="#856404"
                            />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    <ScrollView
                        ref={scrollViewRef}
                        style={{ flex: 1, marginBottom: 70 }}
                        contentContainerStyle={{
                            paddingTop: 10,
                            paddingBottom: 20,
                        }}
                    >
                        {messages.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons
                                    name="chatbubbles-outline"
                                    size={64}
                                    color="#CCC"
                                />
                                <Text style={styles.emptyText}>
                                    No hay mensajes aún
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    Envía el primer mensaje
                                </Text>
                            </View>
                        ) : (
                            messages.map((msg, index) => {
                                if (!msg) return null

                                const isMyMessage =
                                    msg.sender_id === (user.id || user._id)
                                const previousMessage = messages[index - 1]
                                const isSameSender =
                                    previousMessage?.sender_id === msg.sender_id
                                const isTemporary = msg.id
                                    ?.toString()
                                    .startsWith('temp-')

                                return (
                                    <View
                                        key={msg.id || msg._id}
                                        style={[
                                            styles.messageContainer,
                                            isMyMessage
                                                ? styles.myMessage
                                                : styles.theirMessage,
                                            {
                                                marginLeft: isMyMessage
                                                    ? 50
                                                    : 0,
                                                marginRight: isMyMessage
                                                    ? 0
                                                    : 50,
                                                marginTop: isSameSender
                                                    ? 2
                                                    : 12,
                                                opacity: isTemporary ? 0.6 : 1,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                isMyMessage
                                                    ? styles.myMessageText
                                                    : styles.theirMessageText,
                                            ]}
                                        >
                                            {msg.content}
                                        </Text>
                                        {isTemporary && (
                                            <Ionicons
                                                name="time-outline"
                                                size={12}
                                                color={
                                                    isMyMessage
                                                        ? colors.textPrimary
                                                        : colors.textSecondary
                                                }
                                                style={{ marginLeft: 4 }}
                                            />
                                        )}
                                    </View>
                                )
                            })
                        )}
                    </ScrollView>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[
                                globalStyles.textField,
                                { fontSize: 14, flex: 1, marginBottom: 0 },
                            ]}
                            placeholder="Mensaje"
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={500}
                        />
                        <Pressable
                            onPress={newMessage}
                            disabled={!messageText.trim()}
                            style={[
                                styles.button,
                                { opacity: messageText.trim() ? 1 : 0.5 },
                            ]}
                        >
                            <Ionicons
                                name="send"
                                size={24}
                                color={colors.white}
                            />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Screen>
    )
}

const styles = StyleSheet.create({
    messageContainer: {
        padding: 12,
        marginVertical: 1,
        borderRadius: 20,
        maxWidth: '80%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    myMessage: {
        backgroundColor: colors.secondary,
        alignSelf: 'flex-end',
    },
    theirMessage: {
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    myMessageText: {
        color: colors.textPrimary,
        fontSize: 15,
    },
    theirMessageText: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: colors.lightGray || '#ddd',
        paddingVertical: 8,
    },
    button: {
        marginLeft: 10,
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 25,
    },
    errorBanner: {
        backgroundColor: '#FFF3CD',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#FFE69C',
    },
    errorText: {
        color: '#856404',
        fontSize: 13,
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
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
        marginTop: 4,
    },
})

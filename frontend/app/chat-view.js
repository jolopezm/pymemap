import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    TextInput,
} from 'react-native'
import { useAuth } from '../context/auth-context'
import { getMessages, sendMessage } from '../api/chat-service'
import React from 'react'
import { globalStyles, colors } from '../styles/global'
import { useSearchParams } from 'expo-router/build/hooks'
import Ionicons from '@expo/vector-icons/Ionicons'
import Screen from '../components/screen'
import LoadingSpinner from '../components/loading-spinner'

export default function ChatView() {
    const { user } = useAuth()
    const [messageText, setMessageText] = React.useState('')
    const [tempMessage, setTempMessage] = React.useState(null)
    const [message, setMessage] = React.useState({})
    const [messages, setMessages] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const params = useSearchParams()
    const chatId = params?.get('chatId')

    React.useEffect(() => {
        const fetchMessages = async () => {
            if (!chatId) {
                setError('No chat ID provided')
                setLoading(false)
                return
            }

            try {
                const messageData = await getMessages(chatId)
                setMessages(messageData)
            } catch (error) {
                console.error('Error fetching messages:', error)
                setError('Error fetching messages')
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
    }, [chatId])

    const newMessage = async () => {
        if (!messageText.trim()) return

        const messageData = {
            chatId,
            sender_id: user.id || user._id,
            content: messageText,
            read: false,
            timestamp: new Date().toISOString(),
        }

        // Create temporary message with a unique ID for optimistic update
        const tempMessage = {
            ...messageData,
            id: Date.now().toString(), // temporary ID
        }

        try {
            console.log('Sending message:', messageData)

            // Optimistically add message to UI immediately
            setMessages(prev => [...prev, tempMessage])
            setMessageText('')

            // Send message to server
            const sentMessage = await sendMessage(messageData)

            // Replace temporary message with server response
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempMessage.id
                        ? {
                              ...sentMessage,
                              id: sentMessage.id || sentMessage._id,
                          }
                        : msg
                )
            )
        } catch (error) {
            console.error('Error sending message:', error)
            // Remove failed message from UI
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
            // Restore message text so user can try again
            setMessageText(messageData.content)
        }
    }

    if (loading) {
        return <LoadingSpinner />
    }

    if (error) {
        return (
            <View style={globalStyles.container}>
                <Text>{error}</Text>
            </View>
        )
    }

    return (
        <Screen>
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }}>
                    {messages.map(msg => {
                        if (!msg) return null
                        return (
                            <View
                                key={msg.id || msg._id}
                                style={[
                                    styles.messageContainer,
                                    msg.sender_id === (user.id || user._id)
                                        ? {
                                              backgroundColor: colors.secondary,
                                              alignSelf: 'flex-end',
                                              borderTopRightRadius: 0,
                                          }
                                        : {
                                              backgroundColor: colors.white,
                                              alignSelf: 'flex-start',
                                              borderTopLeftRadius: 5,
                                          },
                                    {
                                        marginLeft:
                                            msg.sender_id ===
                                            (user.id || user._id)
                                                ? 50
                                                : 0,
                                    },
                                    {
                                        marginRight:
                                            msg.sender_id ===
                                            (user.id || user._id)
                                                ? 0
                                                : 50,
                                    },
                                    messages[messages.indexOf(msg) - 1] &&
                                    messages[messages.indexOf(msg) - 1]
                                        .sender_id === msg.sender_id
                                        ? {
                                              marginTop: 1,
                                              borderTopRightRadius: 25,
                                          }
                                        : { marginTop: 15 },
                                ]}
                            >
                                <Text
                                    style={[
                                        msg.sender_id === (user.id || user._id)
                                            ? { color: colors.textPrimary }
                                            : { color: colors.textSecondary },
                                    ]}
                                >
                                    {msg.content}
                                </Text>
                            </View>
                        )
                    })}
                </ScrollView>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[globalStyles.textField, { fontSize: 14 }]}
                        placeholder="Mensaje"
                        value={messageText}
                        onChangeText={setMessageText}
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
                            color={colors.primary}
                            style={{
                                transform: [
                                    { translateY: -8 },
                                    { translateX: -35 },
                                ],
                            }}
                        />
                    </Pressable>
                </View>
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    messageContainer: {
        padding: 8,
        marginVertical: 1,
        borderRadius: 25,
    },
    messageSender: {
        fontWeight: 'bold',
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderTopColor: colors.lightGray,
    },
})

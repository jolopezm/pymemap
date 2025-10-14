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
import globalStyles from '../styles/global'
import { useSearchParams } from 'expo-router/build/hooks'

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
        return (
            <View style={globalStyles.container}>
                <Text>Loading messages...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={globalStyles.container}>
                <Text>{error}</Text>
            </View>
        )
    }

    return (
        <View style={globalStyles.container}>
            <Text style={globalStyles.title}>Messages</Text>
            <ScrollView>
                {messages.map(msg => {
                    if (!msg) return null // Guard against null messages
                    return (
                        <View
                            key={msg.id || msg._id}
                            style={[
                                styles.messageContainer,
                                msg.sender_id === (user.id || user._id)
                                    ? { backgroundColor: '#daf8e3ff' }
                                    : { backgroundColor: '#c5c2c2ff' },
                            ]}
                        >
                            <Text style={styles.messageSender}>
                                {msg.sender_id}
                            </Text>
                            <Text style={styles.messageText}>
                                {msg.content}
                            </Text>
                        </View>
                    )
                })}
            </ScrollView>

            <TextInput
                style={globalStyles.input}
                placeholder="Type your message..."
                value={messageText}
                onChangeText={setMessageText}
            />

            <Pressable style={globalStyles.button} onPress={newMessage}>
                <Text style={[{ color: 'white' }]}>New Message</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    messageContainer: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
    },
    messageSender: {
        fontWeight: 'bold',
    },
    messageText: {
        color: 'gray',
    },
})

import { View, Text, Pressable } from 'react-native'
import { getChats } from '../../api/chat-service'
import { useAuth } from '../../context/auth-context'
import React from 'react'
import globalStyles from '../../styles/global'
import { router } from 'expo-router'
import Screen from '../../components/screen'

const ChatScreen = () => {
    const { user } = useAuth()
    const [chats, setChats] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)

    const handleChatPress = chat => {
        router.push(`/chat-view?chatId=${chat.id || chat._id}`)
    }

    React.useEffect(() => {
        const fetchChats = async () => {
            try {
                const chatData = await getChats(user.id || user._id)
                setChats(chatData)
            } catch (error) {
                console.error('Error fetching chats:', error)
                setError('Error fetching chats')
            } finally {
                setLoading(false)
            }
        }

        fetchChats()
    }, [user])

    if (loading) {
        return (
            <View>
                <Text>Cargando...</Text>
            </View>
        )
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
            <Text style={globalStyles.title}>Chats</Text>
            {chats.length === 0 ? (
                <Text>No hay chats disponibles.</Text>
            ) : (
                chats.map(chat => (
                    <Pressable
                        key={chat.id || chat._id}
                        onPress={() => handleChatPress(chat)}
                    >
                        <View
                            key={chat.id || chat._id}
                            style={globalStyles.card}
                        >
                            <Text>Chat ID: {chat.id || chat._id}</Text>
                            <Text>
                                Participants: {chat.participants.join(', ')}
                            </Text>
                            <Text>
                                Last Message:{' '}
                                {chat.lastMessage || 'No messages yet'}
                            </Text>
                        </View>
                    </Pressable>
                ))
            )}
        </View>
        </Screen>
    )
}

export default ChatScreen

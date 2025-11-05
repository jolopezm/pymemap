import { View, Text, Pressable, StyleSheet, Image } from 'react-native'
import { getChats } from '../../api/chat-service'
import { useAuth } from '../../context/auth-context'
import React from 'react'
import { globalStyles } from '../../styles/global'
import { router } from 'expo-router'
import Screen from '../../components/screen'
import LoadingSpinner from '../../components/loading-spinner'
import { getUserById } from '../../api/auth-service'

const ChatScreen = () => {
    const { user } = useAuth()
    const [chats, setChats] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)

    const seller = {
        id: user ? user.id || user._id : null,
        name: user ? user.name || user.username || 'Unknown' : 'Unknown',
    }

    const handleChatPress = chat => {
        router.push(`/chat-view?chatId=${chat.id || chat._id}`)
    }

    React.useEffect(() => {
        const fetchChats = async () => {
            try {
                if (!user) {
                    setError('User not authenticated')
                    setLoading(false)
                    return
                }
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
                    chats.map(chat => (
                        <Pressable
                            key={chat.id || chat._id}
                            onPress={() => handleChatPress(chat)}
                        >
                            <View
                                key={chat.id || chat._id}
                                style={[
                                    globalStyles.card,
                                    {
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 10,
                                    },
                                ]}
                            >
                                <Image
                                    source={require('../../assets/default-profile-pic.svg')}
                                    style={{
                                        width: 50,
                                        height: 50,
                                    }}
                                />
                                <View>
                                    <Text>{chat.participants.join(', ')}</Text>
                                    <Text>
                                        {chat.lastMessage || 'No messages yet'}
                                    </Text>
                                </View>
                            </View>
                        </Pressable>
                    ))
                )}
            </View>
        </Screen>
    )
}

const styles = StyleSheet.create({
    debugText: {
        fontSize: 12,
        color: 'gray',
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    serviceContainer: {
        marginBottom: 10,
    },
})

export default ChatScreen

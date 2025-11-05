import { View, Text, Pressable, StyleSheet, Image } from 'react-native'
import { getChats } from '../../api/chat-service'
import { useAuth } from '../../context/auth-context'
import React from 'react'
import { globalStyles } from '../../styles/global'
import { router } from 'expo-router'
import Screen from '../../components/screen'
import LoadingSpinner from '../../components/loading-spinner'
import { getUserById } from '../../api/user-service'

const ChatScreen = () => {
    const { user } = useAuth()
    const [chats, setChats] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
    const [owner, setOwner] = React.useState(null)
    const [owners, setOwners] = React.useState({})

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
                const chatsWithOwners = await fetchOwners(chatData)
                setChats(chatsWithOwners)
            } catch (error) {
                console.error('Error fetching chats:', error)
                setError('Error fetching chats')
            } finally {
                setLoading(false)
            }
        }

        const fetchOwners = async chatsToFetch => {
            return Promise.all(
                chatsToFetch.map(async chat => {
                    const otherParticipantId = chat.participants.find(
                        id => id !== (user.id || user._id)
                    )
                    const ownerData = await getUserById(otherParticipantId)
                    setOwner(ownerData)
                    console.log('👤 Owner data:', ownerData)
                    return { ...chat, owner: ownerData }
                })
            )
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
                                    source={{ uri: owner?.profile_pic }}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                    }}
                                />
                                <View>
                                    <Text>{chat.owner?.name || 'Unknown'}</Text>
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

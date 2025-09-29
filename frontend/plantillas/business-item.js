import { View, Text } from 'react-native'
import globalStyles from '../styles/global'

export default function Item({ business }) {
    return (
        <View style={globalStyles.card}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {business.name}
                </Text>
                <Text
                    style={{
                        ...globalStyles.badge,
                        marginLeft: 'auto',
                        textAlign: 'right',
                    }}
                >
                    {business.category}
                </Text>
            </View>
            <Text style={{ color: '#555' }}>{business.address}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail">
                {business.description}
            </Text>
        </View>
    )
}

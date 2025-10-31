import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function BenefitItem({ icon, text }) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: 10,
                borderRadius: 10,
            }}
        >
            <View
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: 7,
                    borderRadius: 8,
                    marginRight: 10,
                }}
            >
                <Ionicons name={icon} size={18} color="#FFFFFF" />
            </View>
            <Text
                style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '500',
                    flex: 1,
                }}
                numberOfLines={1}
            >
                {text}
            </Text>
        </View>
    )
}
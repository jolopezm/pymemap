import { View, Text, StyleSheet } from 'react-native'
import Screen from '../../components/screen'
import SearchBar from '../../components/search-bar'
import { getBusiness } from '../../api/business-service'
import Item from '../../plantillas/business-item'
import React from 'react'

export default function SearchScreen() {
    const [searchTerm, setSearchTerm] = React.useState('')
    const [results, setResults] = React.useState([])

    React.useEffect(() => {
        if (searchTerm.length === 0) {
            setResults([])
            return
        }
        let isMounted = true
        getBusiness()
            .then(data => {
                if (isMounted) {
                    const filtered = data.filter(b =>
                        b.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    setResults(filtered)
                }
            })
            .catch(() => setResults([]))
        return () => {
            isMounted = false
        }
    }, [searchTerm])

    return (
        <Screen>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {results.length > 0 ? (
                <View
                    style={{
                        flex: 1,
                        padding: 16,
                    }}
                >
                    {results.map(business => (
                        <Item key={business.id} business={business} />
                    ))}
                </View>
            ) : (
                <View style={styles.container}>
                    <Text>No hay resultados</Text>
                </View>
            )}
        </Screen>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

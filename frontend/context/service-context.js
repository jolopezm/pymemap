import { getServices } from '../../api/business-service'
import React from 'react'
import { useAuth } from '../../context/auth-context'

const ServiceContext = React.createContext({})

export const ServiceProvider = ({ children }) => {
    const { user } = useAuth()
    const [services, setServices] = React.useState([])

    const fetchServices = async () => {
        try {
            const servicesData = await getServices()
            setServices(servicesData)
        } catch (error) {
            console.error('Error fetching services:', error)
            setServices([])
        }
    }

    React.useEffect(() => {
        fetchServices()
    }, [])

    return (
        <ServiceContext.Provider value={{ services, fetchServices }}>
            {children}
        </ServiceContext.Provider>
    )
}

export const useService = () => React.useContext(ServiceContext)

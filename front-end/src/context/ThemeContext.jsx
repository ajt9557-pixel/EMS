import {createContext, useContext, useState, useEffect} from 'react'

const ThemeContext = createContext()

export const useTheme = () => useContext(ThemeContext)

const ThemeContextProvider = ({children}) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light'
    })    
    useEffect(() => {
        const root = document.documentElement
        if(theme === 'dark'){
            root.classList.add('dark')
        }
        else{
            root.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }
    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )

}

   
    



export default ThemeContextProvider
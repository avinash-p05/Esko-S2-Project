import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
    const [message,setMessage] = useState("")
    const getData = async() => {
        const response = await axios.get('/api/v1/get-message')
        setMessage(response.data.message)
        console.log(message)
    }
    return (
        <>
            <button onClick={getData}>
                Click me ssss!
            </button>
            {message}
        </>
    )
}

export default App
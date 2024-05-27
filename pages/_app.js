import '../styles/globals.css'
import { MoralisProvider } from 'react-moralis'
import { NomadsProvider } from '../context/NomadsContext'

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider
    serverUrl='https://a299-203-202-242-131.ngrok-free.app/server'
    appId='001'
    >
      <NomadsProvider>
        <Component {...pageProps} />
      </NomadsProvider>
    </MoralisProvider>
  )
}

export default MyApp

import '../styles/globals.css'
import { MoralisProvider } from 'react-moralis'
import { NomadsProvider } from '../context/NomadsContext'

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider
    serverUrl='http://localhost:1337/server'
    appId='001'
    >
      <NomadsProvider>
        <Component {...pageProps} />
      </NomadsProvider>
    </MoralisProvider>
  )
}

export default MyApp

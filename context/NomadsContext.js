import { useState, createContext, useEffect } from 'react'
import { useMoralis } from 'react-moralis'
import { faker } from '@faker-js/faker'

export const NomadsContext = createContext()

export const NomadsProvider = ({ children }) => {
  const { authenticate, isAuthenticated, user, Moralis, enableWeb3 } = useMoralis()
  const [cardsData, setCardsData] = useState([])
  const [currentAccount, setCurrentAccount] = useState()
  const [currentUser, setCurrentUser] = useState()
  const [userRegister,setUserRegister] = useState(false)

  useEffect(() => {
    checkWalletConnection()

    if (userRegister && isAuthenticated) {
      requestUsersData(user.get('ethAddress'))
      requestCurrentUserData(user.get('ethAddress'))
    }
  }, [isAuthenticated,userRegister])

  const checkWalletConnection = async () => {
    if (isAuthenticated) {
      const address = user.get('ethAddress')
      setCurrentAccount(address)
      const response = await fetch(
        `/api/fetchCurrentUserData?activeAccount=${address}`,
      )
      const data = await response.json();
      if(data.data!=undefined){
        console.log("yes")
        setUserRegister(true)
      }
    } else {
      setCurrentAccount('')
    }
  }

  const connectWallet = async () => {
    
    if (!isAuthenticated) {
      try {
        console.log("Enable web3 trying...");
        await enableWeb3({
          throwOnError: true,
          provider: "metamask"
        })

        const {account, chainId} = Moralis
        if (!account) {
          throw new Error(
            "Connecting to chain failed, as no connected account was found"
          );
        }
        if (!chainId) {
          throw new Error(
            "Connecting to chain failed, as no connected chain was found"
          );
        }

        console.log(account, chainId);

        // Get message to sign from the auth api
      const { message } = await Moralis.Cloud.run("requestMessage", {
        address: account,
        chain: parseInt(chainId, 16),
        network: "evm",
      });

        console.log("Attempting to authenticate");
        await authenticate({
          signingMessage: message,
          throwOnError: true
        });
        console.log("Authenticated", user);
      } catch (error) {
        console.error("Authentication error:", error);
      }
    } else {
      console.log("Already authenticated");
    }
  }

  const disconnectWallet = async () => {
    await Moralis.User.logOut()
    setCurrentAccount('')
  }

  const handleRightSwipe = async (cardData, currentUserAddress) => {
    const likeData = {
      likedUser: cardData.walletAddress,
      currentUser: currentUserAddress,
    }

    try {
      await fetch('/api/saveLike', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(likeData),
      })

      const response = await fetch('/api/checkMatches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(likeData),
      })

      const responseData = await response.json()

      const matchStatus = responseData.data.isMatch

      if (matchStatus) {
        console.log('match')

        const mintData = {
          walletAddresses: [cardData.walletAddress, currentUserAddress],
          names: [cardData.name, currentUser.name],
        }

        await fetch('/api/mintMatchNft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mintData),
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const requestToCreateUserProfile = async (walletAddress, name ,imageAsset ) => {
    try {
      await fetch(`/api/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userWalletAddress: walletAddress,
          name: name,
          imageAsset: imageAsset,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }
  
  const requestCurrentUserData = async walletAddress => {
    try {
      const response = await fetch(
        `/api/fetchCurrentUserData?activeAccount=${walletAddress}`,
      )
      const data = await response.json()

      setCurrentUser(data.data)
      
    } catch (error) {
      console.error(error)
    }
  }

  const requestUsersData = async activeAccount => {
    try {
      const response = await fetch(
        `/api/fetchUsers?activeAccount=${activeAccount}`,
      )
      const data = await response.json()

      setCardsData(data.data)
    } catch (error) {
      console.error(error)
    }
  }

  

  return (
    <NomadsContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        cardsData,
        handleRightSwipe,
        currentAccount,
        currentUser,
        userRegister,
        requestToCreateUserProfile,
      }}
    >
      {children}
    </NomadsContext.Provider>
  )
}

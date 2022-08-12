import React from 'react';
import {web3Accounts,web3Enable,isWeb3Injected, web3FromSource} from './extension-dapp';
import {Provider,Signer as EvmSigner} from '@reef-defi/evm-provider'
import {Contract,ContractInterface} from '@ethersproject/contracts';
import * as PolkadotProvider from "@polkadot/api";

export const provider=PolkadotProvider;
// const WS_URL = 'wss://rpc.reefscan.com/ws  
type ReefData={ 
    isInjected:boolean,
    address:string,
    wallet:EvmSigner|null,
    provider:Provider|null,
    connect:any

}

type props ={
    // A name to identify your app to the wallet
    appName:string,
    provider:Provider,
    children:React.ReactNode
}
const ReefContext=React.createContext<ReefData|null>(null) 

export const useInjector=()=>{
    const injectedData=React.useContext(ReefContext);
    return injectedData;
}

export const useContract=(addressOrName:string,contractInterface: ContractInterface)=>{
    if(useInjector()?.wallet){
      return  new Contract(addressOrName, contractInterface, useInjector()?.wallet as any);
    }
   
}



export function ReefProvider({provider,appName,children}:props){
    const WALLET_INITAILIZED='wallet_initialized'
    const [isInjected,setIsInjected]=React.useState(false)
    const [address,setAddress]=React.useState('')
    const [wallet,setWallet]=React.useState<EvmSigner|null>(null);
    const [walletInitialized,setWalletInitialized]=React.useState(false)
   
    
    React.useEffect(()=>{
    (async()=>{
          if(localStorage.getItem(WALLET_INITAILIZED)){
            await connect();
            setIsInjected(isWeb3Injected)
          }
         
    })()
   
    },[])
    React.useEffect(()=>{
        if(!localStorage.getItem(WALLET_INITAILIZED)){
            localStorage.setItem(WALLET_INITAILIZED,'true') 
        } 
    },[walletInitialized])
    const connect=async()=>{
        try {
        await web3Enable(appName);
        
        const reefExt=await web3Accounts();
        
        const injected=await web3FromSource(reefExt[0].meta.source)
        setWalletInitialized(true)

        const reefAddr=reefExt[0]?.address;
        if(reefAddr){
          const signer = new EvmSigner(provider, reefAddr, injected?.signer)
          setAddress(reefAddr)
          setWallet(signer)
          
        }else{
            setAddress('you have not created any account in your wallet')
        }
            
        } catch (error) {
            console.log(error)
        }
        
       

    }
    return(
        <ReefContext.Provider value={{
        isInjected,
        address,
        wallet,
        provider,
        connect
    }}>{children}</ReefContext.Provider>
    )
}
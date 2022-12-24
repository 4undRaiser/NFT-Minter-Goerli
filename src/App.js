import './App.css';
import React from "react";
import { useState, useCallback } from 'react';
import Cover from "./components/Cover";
import {Notification} from "./components/ui/Notifications";
import Wallet from "./components/wallet";
import Nfts from "./components/minter";
import {Container, Nav} from "react-bootstrap";
import MyNFTAbi from "./contracts/MyNFT.json";
import MyNFTAddress from "./contracts/MyNFT-address.json";
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import axios from "axios";
import { ethers } from 'ethers';
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
require('dotenv').config({path: '.env'});


function App() {
  

  const [address, setAddress] = useState(null);

  const web3 = createAlchemyWeb3("https://eth-goerli.g.alchemy.com/v2/xiHtgd59SRD24sRMW9wQiUsLsikMmD0v");
  const minterContract = new web3.eth.Contract(MyNFTAbi.abi, MyNFTAddress.MyNFT);
  
  const getAccessToken = () => { return process.env.REACT_APP_STORAGE_API_KEY }
  const makeStorageClient = () => { return new Web3Storage({ token: getAccessToken() }) }
  
  
  const upload = (file) => {
    const client = makeStorageClient();
    const file_cid = client.put(file);
    return file_cid;
  }
  
  const makeFileObjects = (file, file_name) => {
    const blob = new Blob([JSON.stringify(file)], { type: "application/json" })
    const files = [new File([blob], `${file_name}.json`)]
  
    return files
  }


   const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const addressArray = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAddress(addressArray[0]);
        const obj = {
          status: "",
          address: addressArray[0],
        };
       
        return obj;
      } catch (err) {
        return {
          address: "",
          status: "😞" + err.message,
        };
      }
    } else {
      return {
        address: "",
        status: (
          <span>
            <p>
              {" "}
              🦊{" "}
              <a target="_blank" href="https://metamask.io/download.html">
                You must install MetaMask, a virtual Ethereum wallet, in your
                browser.
              </a>
            </p>
          </span>
        ),
      };
    }
  };


  const addNFT = async (name, ipfsurl, description, address )=>{
     

     // convert NFT metadata to JSON format
     const data = JSON.stringify({
         name: name,
         ipfsurl: ipfsurl,
         description: description,
         owner: address,
     });

     try {

      const files = makeFileObjects(data, name);
      const file_cid = await upload(files);

      const url = `https://${file_cid}.ipfs.w3s.link/${name}.json`;
      console.log(url);

       
        // mint the NFT and save the IPFS url to the blockchain
         await minterContract.methods
         .mint(url)
         .send({ from: address });
         
       
     } catch (error) {
         console.log("Error uploading file: ", error);
     }

  }

  const uploadImage = async (e) => {
    const image = e.target.files;
    const image_name = image[0].name;
  
    if (!image) return;
    // Pack files into a CAR and send to web3.storage
    const cid = await upload(image) // Promise<CIDString>
    const image_url = `https://${cid}.ipfs.w3s.link/${image_name}`
  
    return image_url;
  };


  // get the metedata for an NFT from IPFS
 const fetchNftMeta = async (ipfsUrl) => {
  try {
      if (!ipfsUrl) return null;
      const meta = await axios.get(ipfsUrl);
      const data = JSON.parse(meta.data)
      return data;
  } catch (e) {
      console.log({e});
  }
};

  const getNfts = useCallback( async () => {
   
    try {
        const nfts = [];
        const nftsLength = await minterContract.methods.totalSupply().call();
        for (let i = 0; i < Number(nftsLength); i++) {
            const nft = new Promise(async (resolve) => {
                const res = await minterContract.methods.tokenURI(i).call();
                const meta = await fetchNftMeta(res);
                
                resolve({
                    index: i,
                    name: meta.name,
                    description: meta.description,
                    owner: meta.owner,
                    ipfsurl: meta.ipfsurl,
                });
            });
            nfts.push(nft);
        }
        return Promise.all(nfts);
    } catch (e) {
        console.log({e});
    }
});



  
  

   
  
     

    return (
        <>
            <Notification/>

            {address ? (
                <Container fluid="md">
                    <Nav className="justify-content-end pt-3 pb-5">
                        <Nav.Item>
                            {/*display user wallet*/}
                            <Wallet
                                address={address}
                            />
                        </Nav.Item>
                    </Nav>
                    <main>

                        {/*list NFTs*/}
                        <Nfts
                            addNFT={addNFT}
                            getNfts={getNfts}
                            name="NFT Minter"
                            minterContract={minterContract}
                            address={address} 
                            uploadImage={uploadImage}
                        />
                    </main>
                </Container>
            ) : (
                //  if user wallet is not connected display cover page
                <Cover name="META ADS MARKETPLACE" coverImg="https://www.cnet.com/a/img/resize/180806b9e13bc1d1750aeef34e28f173dc2ee7e3/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=940" connect={connectWallet}/>
            )}
        </>
    );
}

export default App;

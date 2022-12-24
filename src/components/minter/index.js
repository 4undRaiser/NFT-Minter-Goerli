
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from ".././ui/Loader";
import { NotificationSuccess, NotificationError } from ".././ui/Notifications";
import { Row } from "react-bootstrap";

const NftList = ({addNFT, getNfts, name, address, uploadImage}) => {


  

  /* performActions : used to run smart contract interactions in order
  *  address : fetch the address of the connected wallet
  */
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  



  const getAssets = useCallback(async () => {
    try {
      setLoading(true);

      // fetch all nfts from the smart contract
      const allNfts = await getNfts();
      if (!allNfts) return
      setNfts(allNfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [getNfts]);

  const addNft = async (name, ipfsImage, description, address) => {
    try {
      setLoading(true);
      await addNFT(name, ipfsImage, description, address);

     
      toast(<NotificationSuccess text="Updating NFT list...."/>);
      getAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    try {
      if (address) {
        getAssets();
      
      }
    } catch (error) {
      console.log({ error });
    }
  }, [address, getAssets]);
  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-4 fw-bold mb-0">{name}</h1>

                  <AddNfts save={addNft} address={address} uploadImage={uploadImage}/>
            
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">

              {/* display all NFTs */}
              {nfts.map((_nft) => (
                  <Nft
                      key={_nft.index}
                      nft={{
                        ..._nft,
                      }}
                  />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {

  // props passed into this component
  minterContract: PropTypes.instanceOf(Object),
};

NftList.defaultProps = {
  minterContract: null,
};

export default NftList;

"use client"
import { useState, useEffect } from "react";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'; // Import icons
import { RefreshCcw } from 'lucide-react';
import { Wallet, HDNodeWallet } from "ethers";
export default function Home() {
  const [mnemonic, setMnemonic] = useState("");
  const [seed, setSeed] = useState("");
  const [solanaIndex, setSolanaIndex] = useState(0);
  const [wallets, setWallets] = useState([]);
  const[ethWallet , setEthwallet ] = useState([]);
  const [ethIndex, setEthIndex] = useState(0);
  const [mnemonicCopied, setMnemonicCopied] = useState(false); // New state

  async function generateSeed() {
    setSeed(await mnemonicToSeed(mnemonic));
  }

  async function generateEthWallet() {
    const path = `m/44'/501'/${ethIndex}'/0'`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(path);
    const privateKey = child.privateKey;

    console.log(`deriveSeed = ${deriveSeed.toString("hex")}`);

    const secret = nacl.sign.keyPair.fromSeed(deriveSeed).secretKey;
    
    const base58PrivateKey = bs58.encode(privateKey);
    const keypair = Keypair.fromSecretKey(secret);
    const publicKey = keypair.publicKey.toBase58();

    setSolanaIndex(solanaIndex + 1);
    setWallets([{ 
      number: solanaIndex + 1, 
      publicKey, 
      privateKey: base58PrivateKey, 
      balance: "0.00 SOL",
      publicKeyCopied: false,
      privateKeyCopied: false
    }, ...wallets]);
  }


  async function generateSolanaWallet() {
    const path = `m/44'/501'/${solanaIndex}'/0'`;
    const deriveSeed = derivePath(path, seed.toString("hex")).key;
    console.log(`deriveSeed = ${deriveSeed.toString("hex")}`);

    const secret = nacl.sign.keyPair.fromSeed(deriveSeed).secretKey;
    const privateKey = secret.slice(0, 32);
    const base58PrivateKey = bs58.encode(privateKey);
    const keypair = Keypair.fromSecretKey(secret);
    const publicKey = keypair.publicKey.toBase58();

    setSolanaIndex(solanaIndex + 1);
    setWallets([{ 
      number: solanaIndex + 1, 
      publicKey, 
      privateKey: base58PrivateKey, 
      balance: "0.00 SOL",
      publicKeyCopied: false,
      privateKeyCopied: false
    }, ...wallets]);
  }

  function copyToClipboard(text, index, type) {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'mnemonic') {
        setMnemonicCopied(true); // Set mnemonicCopied to true
        setTimeout(() => setMnemonicCopied(false), 3000); // Revert after 3 seconds
      } else {
        updateCopyStatus(index, type);
      }
    }, (err) => {
      console.error("Failed to copy text: ", err);
    });
  }

  function updateCopyStatus(index, type) {
    const updatedWallets = [...wallets];
    if (updatedWallets[index]) {
      updatedWallets[index][`${type}Copied`] = true;
      setWallets(updatedWallets);
      setTimeout(() => {
        const revertedWallets = [...wallets];
        if (revertedWallets[index]) {
          revertedWallets[index][`${type}Copied`] = false;
          setWallets(revertedWallets);
        }
      }, 3000);
    }
  }

  function handleRefresh(index) {
    console.log(`Refresh balance for wallet ${index}`);
  }

  useEffect(() => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    generateSeed();
  }, []);

  return (
    <div className=" h-full w-screen p-8 bg-gray-100 dark:bg-gray-900 flex flex-col items-center">
      <div className="mt-7 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Seed Phrase</h2>
          <Button
            onClick={() => copyToClipboard(mnemonic, null, 'mnemonic')}
            className="flex items-center text-blue-500 dark:text-blue-300"
          >
            {mnemonicCopied ? (
              <CheckIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ClipboardIcon className="w-5 h-5 mr-2" />
            )}
            Copy
          </Button>
        </div>
        <div className="text-center font-mono break-all">{mnemonic}</div>
      </div>
      //f
     <div  className=" w-full h-full flex justify-start" >
      <div>
      <Button
        onClick={generateSolanaWallet}
        className="mt-8 bg-blue-500 text-white hover:bg-blue-600 "
      >
        Generate Solana Wallet
      </Button>
      <div className="mt-8 w-full max-w-md">
        {wallets.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Generated Solana Wallets</h3>
            {wallets.map((wallet, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:shadow-lg relative">
                <div className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700">
                  
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">Wallet #{wallet.number}</span>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">Public Key:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 break-all">{wallet.publicKey}</span>
                    <button
                      onClick={() => copyToClipboard(wallet.publicKey, index, 'publicKey')}
                      className="text-blue-500 dark:text-blue-300 hover:text-blue-600"
                    >
                      {wallet.publicKeyCopied ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">Private Key:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300 break-all">{wallet.privateKey}</span>
                    <button
                      onClick={() => copyToClipboard(wallet.privateKey, index, 'privateKey')}
                      className="text-blue-500 dark:text-blue-300 hover:text-blue-600"
                    >
                      {wallet.privateKeyCopied ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Balance:</span>
                  <div className="flex items-center space-x-2">
                    <span>{wallet.balance}</span>
                    <button
                      onClick={() => handleRefresh(index)}
                      className="text-gray-500 dark:text-gray-300 hover:text-gray-700"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

     </div>
    </div>
  );
}

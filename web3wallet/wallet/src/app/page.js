"use client";
import { useState, useEffect } from "react";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { ClipboardIcon, CheckIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { RefreshCcw } from "lucide-react";
import { Wallet, HDNodeWallet } from "ethers";

export default function Home() {
  const [mnemonic, setMnemonic] = useState("");
  const [seed, setSeed] = useState("");
  const [solanaIndex, setSolanaIndex] = useState(0);
  const [wallets, setWallets] = useState([]);
  const [ethWallets, setEthWallets] = useState([]);
  const [ethIndex, setEthIndex] = useState(0);
  const [mnemonicCopied, setMnemonicCopied] = useState(false);
  const [showPrivateKeys, setShowPrivateKeys] = useState({});

  async function generateSeed() {
    setSeed(await mnemonicToSeed(mnemonic));
  }

  async function generateEthWallet() {
    const path = `m/44'/60'/${ethIndex}'/0/0`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(path);
    const privateKey = child.privateKey;
    const wallet = new Wallet(privateKey);

    setEthIndex(ethIndex + 1);
    setEthWallets([
      {
        number: ethIndex + 1,
        publicKey: wallet.address,
        privateKey,
        balance: "0.00 ETH",
        publicKeyCopied: false,
        privateKeyCopied: false,
      },
      ...ethWallets,
    ]);
  }

  async function generateSolanaWallet() {
    const path = `m/44'/501'/${solanaIndex}'/0'`;
    const deriveSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(deriveSeed).secretKey;
    const privateKey = secret.slice(0, 32);
    const base58PrivateKey = bs58.encode(privateKey);
    const keypair = Keypair.fromSecretKey(secret);
    const publicKey = keypair.publicKey.toBase58();

    setSolanaIndex(solanaIndex + 1);
    setWallets([
      {
        number: solanaIndex + 1,
        publicKey,
        privateKey: base58PrivateKey,
        balance: "0.00 SOL",
        publicKeyCopied: false,
        privateKeyCopied: false,
      },
      ...wallets,
    ]);
  }

  function copyToClipboard(text, index, type, isEth = false) {
    navigator.clipboard.writeText(text).then(
      () => {
        if (type === "mnemonic") {
          setMnemonicCopied(true);
          setTimeout(() => setMnemonicCopied(false), 3000);
        } else if (isEth) {
          updateCopyStatusEth(index, type);
        } else {
          updateCopyStatus(index, type);
        }
      },
      (err) => {
        console.error("Failed to copy text: ", err);
      }
    );
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

  function updateCopyStatusEth(index, type) {
    const updatedWallets = [...ethWallets];
    if (updatedWallets[index]) {
      updatedWallets[index][`${type}Copied`] = true;
      setEthWallets(updatedWallets);
      setTimeout(() => {
        const revertedWallets = [...ethWallets];
        if (revertedWallets[index]) {
          revertedWallets[index][`${type}Copied`] = false;
          setEthWallets(revertedWallets);
        }
      }, 3000);
    }
  }

  function togglePrivateKeyVisibility(walletNumber, isEth = false) {
    const updatedVisibility = {
      ...showPrivateKeys,
      [`${walletNumber}-${isEth ? "eth" : "sol"}`]:
        !showPrivateKeys[`${walletNumber}-${isEth ? "eth" : "sol"}`],
    };
    setShowPrivateKeys(updatedVisibility);
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
    <div className="min-h-screen w-full p-8 bg-gradient-to-r from-blue-950 via-purple-900 to-indigo-900 flex flex-col items-center text-white transition-all duration-500">
      <div className="mt-7 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200">
            Your Seed Phrase
          </h2>
          <Button
            onClick={() => copyToClipboard(mnemonic, null, "mnemonic")}
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
        <div className="grid grid-cols-2 gap-2 text-center font-mono break-all">
          {mnemonic.split(" ").map((word, index) => (
            <span
              key={index}
              className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-gray-800 dark:text-gray-300"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between w-full mt-10 space-x-8">
        {/* Left Column - Solana Wallets */}
        <div className="w-1/2 h-fit max-h-[170vh] overflow-y-auto scrollbar-hide">
          <div className=" flex w-full justify-center items-center">
          <Button
            onClick={generateSolanaWallet}
            className="mt-4  p-4 px-7 bg-pink-500 hover:bg-pink-600 transition-colors duration-300"
          >
            Generate Solana Wallet
          </Button>
          </div>
          <div className="mt-8 space-y-6">
            {wallets.length > 0 ? (
              wallets.map((wallet, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Wallet #{wallet.number}</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Public Key:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {wallet.publicKey}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(wallet.publicKey, index, "publicKey")
                        }
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
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Private Key:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {showPrivateKeys[`${wallet.number}-sol`]
                          ? wallet.privateKey
                          : "••••••••••••"}
                      </span>
                      <button
                        onClick={() => togglePrivateKeyVisibility(wallet.number, false)}
                        className="text-blue-500 dark:text-blue-300 hover:text-blue-600"
                      >
                        {showPrivateKeys[`${wallet.number}-sol`] ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(wallet.privateKey, index, "privateKey")
                        }
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
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800 dark:text-gray-200">Balance:</span>
                      <span className="text-gray-800 dark:text-gray-400">{wallet.balance}</span>
                    </div>
                    <button
                      onClick={() => handleRefresh(index)}
                      className="text-blue-500 dark:text-blue-300 hover:text-blue-600"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-300">No Solana wallets generated yet.</p>
            )}
          </div>
        </div>

        {/* Right Column - Ethereum Wallets */}
        <div className="w-1/2 h-fit max-h-[130vh] overflow-y-auto scrollbar-hide">
         <div className=" flex justify-center items-center w-full   z-10">
         <Button
            onClick={generateEthWallet}
            className="mt-4  p-4  px-6 bg-teal-500 hover:bg-teal-600 transition-colors duration-300"
          >
            Generate Ethereum Wallet
          </Button>

         </div>
          <div className="mt-8 space-y-6">
            {ethWallets.length > 0 ? (
              ethWallets.map((wallet, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Wallet #{wallet.number}</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Public Key:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {wallet.publicKey}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(wallet.publicKey, index, "publicKey", true)
                        }
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
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200">Private Key:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {showPrivateKeys[`${wallet.number}-eth`]
                          ? wallet.privateKey
                          : "••••••••••••"}
                      </span>
                      <button
                        onClick={() => togglePrivateKeyVisibility(wallet.number, true)}
                        className="text-blue-500 dark:text-blue-300 hover:text-blue-600"
                      >
                        {showPrivateKeys[`${wallet.number}-eth`] ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(wallet.privateKey, index, "privateKey", true)
                        }
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
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-800 dark:text-gray-200">Balance:</span>
                      <span className="text-gray-800 dark:text-gray-400">{wallet.balance}</span>
                    </div>
                    <button
                      onClick={() => handleRefresh(index)}
                      className="text-blue-500 dark:text-blue-300 hover:text-blue-600"
                    >
                      <RefreshCcw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-300">No Ethereum wallets generated yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

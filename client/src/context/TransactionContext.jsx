import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionsContract;
};

export const TransactionsProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableOptions, setAvailableOptions] = useState();
  const [allTransactions, setAllTransactions] = useState();

  const buyPower = async ({ receiverAddress, amountOfPower, pricePerKW }) => {
    try {
      if (ethereum) {
        setIsLoading(true);
        const transactionsContract = createEthereumContract();

        const parsedAmount = ethers.utils.parseEther(
          `${amountOfPower * pricePerKW}`
        );

        await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: currentAccount,
              to: receiverAddress,
              gas: "0x5208",
              value: parsedAmount._hex,
            },
          ],
        });

        const transactionHash = await transactionsContract.addToBlockchain(
          receiverAddress,
          amountOfPower,
          pricePerKW,
          parsedAmount
        );

        await transactionHash.wait();

        setIsLoading(false);
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error(error);
    }
  };

  // done
  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        await getAvailableOptions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // DONE
  const addToAvailableOptions = async ({
    powerSource,
    amountOfPower,
    pricePerKW,
    duration,
    timeToStart,
  }) => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        setIsLoading(true);

        const transactionHash =
          await transactionsContract.addToAvailableOptions(
            powerSource,
            amountOfPower,
            pricePerKW,
            duration,
            timeToStart
          );

        await transactionHash.wait();

        setIsLoading(false);
        // window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  // DONE
  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const availableTransactions =
          await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map(
          ({ sender, receiver, amountOfPower, pricePerKW, parsedAmount }) => ({
            sender,
            receiver,
            amountOfPower: parseInt(amountOfPower._hex, 16),
            pricePerKW,
            parsedAmount: parseInt(parsedAmount._hex, 16),
          })
        );
        setAllTransactions(structuredTransactions);
        return structuredTransactions;
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };
  // DONE
  const getAvailableOptions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const availableTransactions =
          await transactionsContract.getAvailableOptions();

        const structuredTransactions = availableTransactions.map(
          ({
            id,
            sender,
            powerSource,
            amountOfPower,
            pricePerKW,
            duration,
            timeToStart,
          }) => ({
            id,
            sender,
            powerSource,
            amountOfPower,
            pricePerKW,
            duration,
            timeToStart,
          })
        );
        setAvailableOptions(structuredTransactions);
        return structuredTransactions;
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // DONE
  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const currentTransactionCount =
          await transactionsContract.getTransactionCount();

        window.localStorage.setItem(
          "transactionCount",
          currentTransactionCount
        );
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  // DONE
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  // const getAllTransactions = async () => {
  //   try {
  //     if (ethereum) {
  //       const transactionsContract = createEthereumContract();
  //       const availableTransactions =
  //         await transactionsContract.getAllTransactions();
  //       console.log(availableTransactions);

  //       const structuredTransactions = availableTransactions.map(
  //         (transaction) => ({
  //           addressTo: transaction.receiver,
  //           addressFrom: transaction.sender,
  //           timestamp: new Date(
  //             transaction.timestamp.toNumber() * 1000
  //           ).toLocaleString(),
  //           message: transaction.message,
  //           keyword: transaction.keyword,
  //           amount: parseInt(transaction.amount._hex) / 10 ** 18,
  //         })
  //       );

  //       console.log(structuredTransactions);

  //       setTransactions(structuredTransactions);
  //     } else {
  //       console.log("Ethereum is not present");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const sendTransaction = async () => {
  //   try {
  //     if (ethereum) {
  //       const { addressTo, amount, keyword, message } = formData;
  //       const transactionsContract = createEthereumContract();
  //       const parsedAmount = ethers.utils.parseEther(amount);

  //       await ethereum.request({
  //         method: "eth_sendTransaction",
  //         params: [
  //           {
  //             from: currentAccount,
  //             to: addressTo,
  //             gas: "0x5208",
  //             value: parsedAmount._hex,
  //           },
  //         ],
  //       });

  //       const transactionHash = await transactionsContract.addToBlockchain(
  //         addressTo,
  //         parsedAmount,
  //         message,
  //         keyword
  //       );

  //       setIsLoading(true);
  //       console.log(`Loading - ${transactionHash.hash}`);
  //       await transactionHash.wait();
  //       console.log(`Success - ${transactionHash.hash}`);
  //       setIsLoading(false);

  //       const transactionsCount =
  //         await transactionsContract.getTransactionCount();

  //       setTransactionCount(transactionsCount.toNumber());
  //       window.location.reload();
  //     } else {
  //       console.log("No ethereum object");
  //     }
  //   } catch (error) {
  //     console.log(error);

  //     throw new Error("No ethereum object");
  //   }
  // };

  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
    getAllTransactions();
    getAvailableOptions();
  }, [availableOptions, allTransactions]);

  return (
    <TransactionContext.Provider
      value={{
        addToAvailableOptions,
        getAvailableOptions,
        buyPower,
        getAllTransactions,
        connectWallet,
        currentAccount,
        isLoading,
        availableOptions,
        allTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

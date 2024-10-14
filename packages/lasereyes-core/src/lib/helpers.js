import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import { FRACTAL_MAINNET, FRACTAL_TESTNET, MAINNET, SIGNET, TESTNET, TESTNET4, } from '../constants/networks';
import axios from 'axios';
import { getMempoolSpaceUrl } from './urls';
import * as ecc from '@bitcoinerlab/secp256k1';
bitcoin.initEccLib(ecc);
export const getBitcoinNetwork = (network) => {
    if (network === TESTNET || network === TESTNET4 || network === SIGNET) {
        return bitcoin.networks.testnet;
    }
    else {
        return bitcoin.networks.bitcoin;
    }
};
export const findOrdinalsAddress = (addresses) => {
    return addresses.find(({ purpose }) => purpose === 'ordinals');
};
export const findPaymentAddress = (addresses) => {
    return addresses.find(({ purpose }) => purpose === 'payment');
};
export const getBTCBalance = async (address, network) => {
    try {
        const utxos = await getAddressUtxos(address, network);
        if (!utxos)
            return 0n;
        return utxos.reduce((acc, utxo) => acc + BigInt(utxo.value), 0n);
    }
    catch (error) {
        console.error('Error fetching BTC balance:', error);
        throw new Error('Failed to fetch BTC balance');
    }
};
export const satoshisToBTC = (satoshis) => {
    if (Number.isNaN(satoshis) || satoshis === undefined)
        return '--';
    const btcValue = satoshis / 100000000;
    return btcValue.toFixed(8);
};
export const isBase64 = (str) => {
    const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*?(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
    return base64Regex.test(str);
};
export const isHex = (str) => {
    const hexRegex = /^[a-fA-F0-9]+$/;
    return hexRegex.test(str);
};
export function estimateTxSize(taprootInputCount, nonTaprootInputCount, outputCount) {
    const baseTxSize = 10;
    const taprootInputSize = 57;
    const nonTaprootInputSize = 41;
    const outputSize = 34;
    const totalInputSize = taprootInputCount * taprootInputSize +
        nonTaprootInputCount * nonTaprootInputSize;
    const totalOutputSize = outputCount * outputSize;
    return baseTxSize + totalInputSize + totalOutputSize;
}
export async function getAddressUtxos(address, network) {
    if (address.startsWith('t')) {
        if (network === MAINNET) {
            return [];
        }
        if (network === FRACTAL_MAINNET) {
            return [];
        }
        if (network === FRACTAL_TESTNET) {
            return [];
        }
    }
    return (await axios
        .get(`${getMempoolSpaceUrl(network)}/api/address/${address}/utxo`)
        .then((response) => response.data));
}
export async function createSendBtcPsbt(address, paymentAddress, recipientAddress, amount, paymentPublicKey, network, feeRate = 7) {
    const isTaprootOnly = address === paymentAddress;
    const utxos = await getAddressUtxos(paymentAddress, network);
    if (!utxos) {
        throw new Error('No UTXOs found');
    }
    const sortedUtxos = utxos.sort((a, b) => b.value - a.value);
    const psbt = new bitcoin.Psbt({ network: getBitcoinNetwork(network) });
    const estTxSize = estimateTxSize(1, 0, 2);
    const satsNeeded = Math.floor(estTxSize * feeRate) + amount;
    let amountGathered = 0;
    let counter = 0;
    for await (let utxo of sortedUtxos) {
        const { txid, vout, value } = utxo;
        const script = bitcoin.address.toOutputScript(paymentAddress, getBitcoinNetwork(network));
        psbt.addInput({
            hash: txid,
            index: vout,
            witnessUtxo: {
                script,
                value: BigInt(value),
            },
        });
        if (!isTaprootOnly) {
            const redeemScript = getRedeemScript(paymentPublicKey, network);
            psbt.updateInput(counter, { redeemScript });
        }
        amountGathered += value;
        if (amountGathered >= satsNeeded) {
            break;
        }
    }
    if (amountGathered < satsNeeded) {
        throw new Error('Insufficient funds');
    }
    psbt.addOutput({
        address: recipientAddress,
        value: BigInt(amount),
    });
    if (amountGathered > satsNeeded) {
        psbt.addOutput({
            address: paymentAddress,
            value: BigInt(amountGathered - satsNeeded - amount),
        });
    }
    return {
        psbtBase64: psbt.toBase64(),
        psbtHex: psbt.toHex(),
    };
}
export function getRedeemScript(paymentPublicKey, network) {
    const p2wpkh = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(paymentPublicKey, 'hex'),
        network: getBitcoinNetwork(network),
    });
    const p2sh = bitcoin.payments.p2sh({
        redeem: p2wpkh,
        network: getBitcoinNetwork(network),
    });
    return p2sh?.redeem?.output;
}
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
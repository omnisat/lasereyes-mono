// eslint-disable
import * as ecc from '@cmdcode/crypto-utils'
import { Address, Signer, Tap, Tx } from '@cmdcode/tapscript'
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc2 from '@bitcoinerlab/secp256k1'
import {
  broadcastTx,
  calculateValueOfUtxosGathered,
  getAddressType,
  getAddressUtxos,
  getBitcoinNetwork,
  getRedeemScript,
} from './helpers'
import { MAINNET, P2SH } from '../constants'
import axios from 'axios'
import { getMempoolSpaceUrl } from './urls'
import * as bip39 from 'bip39'
import {
  ContentType,
  MempoolTransactionResponse,
  MempoolUtxo,
  NetworkType,
} from '../types'
import { BIP32Factory, BIP32Interface } from 'bip32'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { TEXT_PLAIN } from '../constants/content'

const bip32 = BIP32Factory(ecc2)
bitcoin.initEccLib(ecc2)

export const inscribeContent = async ({
  contentBase64,
  mimeType,
  ordinalAddress,
  paymentAddress,
  paymentPublicKey,
  signPsbt,
}: {
  contentBase64: string
  mimeType: ContentType
  ordinalAddress: string
  paymentAddress: string
  paymentPublicKey?: string
  signPsbt: any
}) => {
  try {
    const privKeyBuff = await generatePrivateKey()
    const privKey = Buffer.from(privKeyBuff!).toString('hex')
    const commitTx = await getCommitTx({
      contentBase64,
      mimeType,
      ordinalAddress,
      paymentAddress,
      paymentPublicKey,
      privKey,
    })

    if (!commitTx || !commitTx?.psbtHex) {
      throw new Error("couldn't get commit tx")
    }

    const commitTxHex = String(commitTx?.psbtHex)
    const commitTxBase64 = String(commitTx?.psbtBase64)
    const response = await signPsbt(
      null,
      commitTxHex,
      commitTxBase64,
      true,
      false
    )
    if (!response) throw new Error('sign psbt failed')
    const psbt = bitcoin.Psbt.fromHex(response?.signedPsbtHex || '')
    const extracted = psbt.extractTransaction()
    const commitTxId = await broadcastTx(extracted.toHex(), MAINNET)
    if (!commitTxId) throw new Error('commit tx failed')
    return await executeReveal({
      contentBase64,
      mimeType,
      ordinalAddress,
      privKey,
      commitTxId,
    })
  } catch (e) {
    throw e
  }
}

// export async function generateSeed() {
//   const entropy = crypto.getRandomValues(new Uint8Array(32)) // 256-bit entropy
//   const mnemonic = bip39.entropyToMnemonic(Buffer.from(entropy))
//
//   console.log('Mnemonic:', mnemonic)
//
//   // Get the seed from the mnemonic (BIP-32 seed)
//   const seed = await bip39.mnemonicToSeed(mnemonic)
//
//   console.log('Bitcoin Seed (BIP-32):', seed.toString('hex'))
//   return seed
// }

export async function generatePrivateKey() {
  const entropy = crypto.getRandomValues(new Uint8Array(32))
  const mnemonic = bip39.entropyToMnemonic(Buffer.from(entropy))
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root: BIP32Interface = bip32.fromSeed(seed)
  return root?.derivePath("m/44'/0'/0'/0/0").privateKey
}

export const createInscriptionScript = (
  pubKey: any,
  contentBase64: string,
  mimeType: ContentType
) => {
  const ec = new TextEncoder()
  const marker = ec.encode('ord')

  let contentBuffer: Buffer
  if (mimeType === TEXT_PLAIN) {
    const decodedText = Buffer.from(contentBase64, 'base64').toString('utf-8')
    contentBuffer = Buffer.from(decodedText, 'utf-8')
  } else {
    contentBuffer = Buffer.from(contentBase64, 'base64')
  }

  // Split content into chunks of 520 bytes
  const contentChunks = []
  for (let i = 0; i < contentBuffer.length; i += 520) {
    contentChunks.push(contentBuffer.slice(i, i + 520))
  }

  return [
    pubKey,
    'OP_CHECKSIG',
    'OP_0',
    'OP_IF',
    marker,
    '01',
    ec.encode(mimeType),
    'OP_0',
    ...contentChunks.map((chunk) => chunk),
    'OP_ENDIF',
  ]
}

export const createRevealAddressAndKeys = (
  pubKey: any,
  content: string,
  mimeType: ContentType
) => {
  const script = createInscriptionScript(pubKey, content, mimeType)
  const tapleaf = Tap.encodeScript(script)
  const [tpubkey] = Tap.getPubKey(pubKey, { target: tapleaf })
  const inscriberAddress = Address.p2tr.fromPubKey(tpubkey)

  return {
    inscriberAddress,
    tpubkey,
    tapleaf,
  }
}

export const getCommitTx = async ({
  contentBase64,
  mimeType,
  ordinalAddress,
  paymentAddress,
  paymentPublicKey,
  privKey,
}: {
  contentBase64: string
  mimeType: ContentType
  ordinalAddress: string
  paymentAddress: string
  paymentPublicKey?: string
  privKey: string
  isDry?: boolean
}): Promise<
  | {
      psbtHex: string
      psbtBase64: string
    }
  | undefined
> => {
  try {
    const contentSize = Buffer.from(contentBase64).length
    if (contentSize > 390000)
      throw new Error('Content size is too large, must be less than 390kb')

    const { fastestFee } = await getRecommendedFees(MAINNET)
    const pubKey = ecc.keys.get_pubkey(String(privKey), true)
    const psbt = new bitcoin.Psbt({
      network: bitcoin.networks.bitcoin,
    })

    const { inscriberAddress } = createRevealAddressAndKeys(
      pubKey,
      contentBase64,
      mimeType
    )

    // give me estimated size for a blank btc tx
    const estimatedSize = 5 * 34
    const commitSatsNeeded = Math.floor(estimatedSize * fastestFee)
    const revealSatsNeeded =
      Math.floor((contentSize * fastestFee) / 3) + 1000 + 546
    const inscribeFees = Math.floor(commitSatsNeeded + revealSatsNeeded)
    const utxosGathered: MempoolUtxo[] = await getAddressUtxos(
      paymentAddress,
      MAINNET
    )
    const filteredUtxos = utxosGathered
      .filter((utxo: MempoolUtxo) => utxo.value > 3000)
      .sort((a, b) => b.value - a.value)

    const amountRetrieved = calculateValueOfUtxosGathered(filteredUtxos)
    if (amountRetrieved === 0) {
      throw new Error('insufficient funds')
    }

    if (amountRetrieved < inscribeFees) {
      throw new Error('insufficient funds')
    }

    let redeemScript
    if (ordinalAddress !== paymentAddress && paymentPublicKey) {
      redeemScript = getRedeemScript(paymentPublicKey, MAINNET)
    }

    let accSats = 0
    const addressScript = await bitcoin.address.toOutputScript(paymentAddress)
    let counter = 0
    for await (const utxo of filteredUtxos) {
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: { value: BigInt(utxo.value), script: addressScript },
        tapInternalKey: toXOnly(Buffer.from(paymentPublicKey!, 'hex')),
      })

      if (getAddressType(paymentAddress, getBitcoinNetwork(MAINNET)) === P2SH) {
        psbt.updateInput(counter, { redeemScript })
      }
      counter++
      accSats += utxo.value

      if (accSats > inscribeFees) {
        break
      }
    }

    const reimbursement = accSats - inscribeFees

    psbt.addOutput({
      value: BigInt(revealSatsNeeded),
      address: inscriberAddress,
    })

    if (reimbursement > 546) {
      psbt.addOutput({
        value: BigInt(reimbursement),
        address: paymentAddress,
      })
    }

    return {
      psbtHex: psbt.toHex(),
      psbtBase64: psbt.toBase64(),
    }
  } catch (e: any) {
    throw e
  }
}

export const executeReveal = async ({
  contentBase64,
  mimeType,
  ordinalAddress,
  commitTxId,
  privKey,
  isDry,
}: {
  contentBase64: string
  mimeType: ContentType
  ordinalAddress: string
  commitTxId: string
  privKey: string
  isDry?: boolean
}) => {
  try {
    const secKey = ecc.keys.get_seckey(privKey)
    const pubKey = ecc.keys.get_pubkey(privKey, true)
    const script = createInscriptionScript(pubKey, contentBase64, mimeType)
    const tapleaf = Tap.encodeScript(script)
    const [tpubkey, cblock] = Tap.getPubKey(pubKey, { target: tapleaf })

    const txResult = await waitForTransaction(String(commitTxId))
    if (!txResult) {
      throw new Error('ERROR WAITING FOR COMMIT TX')
    }

    const commitTxOutputValue = await getOutputValueByVOutIndex(commitTxId, 0)
    if (commitTxOutputValue === 0 || !commitTxOutputValue) {
      throw new Error('ERROR GETTING FIRST INPUT VALUE')
    }

    const txData = Tx.create({
      vin: [
        {
          txid: commitTxId,
          vout: 0,
          prevout: {
            value: commitTxOutputValue,
            scriptPubKey: ['OP_1', tpubkey],
          },
        },
      ],
      vout: [
        {
          value: 546,
          scriptPubKey: Address.toScriptPubKey(ordinalAddress),
        },
      ],
    })

    const sig = Signer.taproot.sign(secKey, txData, 0, { extension: tapleaf })
    txData.vin[0].witness = [sig, script, cblock]
    if (isDry) {
      return Tx.util.getTxid(txData)
    }

    return await broadcastTx(Tx.encode(txData).hex, MAINNET)
  } catch (e: any) {
    throw e
  }
}

export async function getTransaction(
  txId: string,
  network: NetworkType = MAINNET
): Promise<MempoolTransactionResponse> {
  try {
    return await axios
      .get(`${getMempoolSpaceUrl(network)}/api/tx/${txId}`)
      .then((res) => res.data)
  } catch (e: any) {
    throw e
  }
}

export async function getRawTransaction(
  txId: string,
  network: NetworkType = MAINNET
): Promise<any> {
  try {
    return await axios
      .get(`${getMempoolSpaceUrl(network)}/api/tx/${txId}/raw`)
      .then((res) => res.data)
  } catch (e: any) {
    throw e
  }
}

export async function waitForTransaction(txId: string): Promise<boolean> {
  const timeout: number = 60000
  const startTime: number = Date.now()
  while (true) {
    try {
      const rawTx: any = await getRawTransaction(txId)
      if (rawTx) {
        console.log('Transaction found in mempool:', txId)
        return true
      }

      if (Date.now() - startTime > timeout) {
        return false
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
      if (Date.now() - startTime > timeout) {
        return false
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

export const getRecommendedFees = async (network: NetworkType) => {
  return await axios
    .get(`${getMempoolSpaceUrl(network)}/api/v1/fees/recommended`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((res) => res.data)
}

export async function getOutputValueByVOutIndex(
  commitTxId: string,
  vOut: number
): Promise<number | null> {
  const timeout: number = 60000
  const startTime: number = Date.now()

  while (true) {
    try {
      const rawTx: any = await getTransaction(commitTxId)

      if (rawTx && rawTx.vout && rawTx.vout.length > 0) {
        return Math.floor(rawTx.vout[vOut].value)
      }

      if (Date.now() - startTime > timeout) {
        return null
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
      console.error('Error fetching transaction output value:', error)
      if (Date.now() - startTime > timeout) {
        return null
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

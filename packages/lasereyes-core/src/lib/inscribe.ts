// eslint-disable
import * as ecc from '@cmdcode/crypto-utils'
import { Address, Signer, Tap, Tx } from '@cmdcode/tapscript'
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc2 from '@bitcoinerlab/secp256k1'
import {
  broadcastTx,
  calculateValueOfUtxosGathered,
  getAddressUtxos,
  getRedeemScript,
} from './helpers'
import { MAINNET } from '../constants'
import axios from 'axios'
import { getMempoolSpaceUrl } from './urls'
import * as bip39 from 'bip39'
import { MempoolTransactionResponse, MempoolUtxo, NetworkType } from '../types'
import { BIP32Factory, BIP32Interface } from 'bip32'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'

const bip32 = BIP32Factory(ecc2)

bitcoin.initEccLib(ecc2)

export const inscribeContent = async ({
  content,
  mimeType,
  ordinalAddress,
  paymentAddress,
  paymentPublicKey,
  signPsbt,
}: {
  content: string
  mimeType: string
  ordinalAddress: string
  paymentAddress: string
  paymentPublicKey?: string
  signPsbt: any
}) => {
  try {
    const privKeyBuff = await generatePrivateKey()
    const privKey = Buffer.from(privKeyBuff!).toString('hex')
    const commitTx = await getCommitTx({
      content,
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
    const response = await signPsbt(commitTxHex, commitTxHex, '', true, false)
    if (!response) throw new Error('sign psbt failed')
    const psbt = bitcoin.Psbt.fromHex(response?.signedPsbtHex || '')
    const extracted = psbt.extractTransaction()
    const commitTxId = await broadcastTx(extracted.toHex(), MAINNET)
    if (!commitTxId) throw new Error('commit tx failed')
    return await executeReveal({
      content,
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
  // Generate 256-bit entropy
  const entropy = crypto.getRandomValues(new Uint8Array(32))
  const mnemonic = bip39.entropyToMnemonic(Buffer.from(entropy))

  // Get the seed from the mnemonic (BIP-32 seed)
  const seed = await bip39.mnemonicToSeed(mnemonic)

  // Use bitcoinjs-lib to derive the root key from the seed
  const root: BIP32Interface = bip32.fromSeed(seed)

  // Derive the private key (account 0, receiving address 0)
  const privateKey = root?.derivePath("m/44'/0'/0'/0/0").privateKey

  console.log('Private Key:', privateKey)

  return privateKey
}

export const createInscriptionScript = (
  pubKey: any,
  contentBase64: string,
  mimeType: string
) => {
  const ec = new TextEncoder()
  const marker = ec.encode('ord')

  // Adjust encoding based on mimeType
  let contentBuffer: Buffer
  if (mimeType === 'text/plain;charset=utf-8') {
    // Decode the base64 to a UTF-8 string, then encode it to bytes
    const decodedText = Buffer.from(contentBase64, 'base64').toString('utf-8')
    contentBuffer = Buffer.from(decodedText, 'utf-8')
  } else {
    // Default to base64 encoding for other MIME types
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
  mimeType: string
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
  content,
  mimeType,
  ordinalAddress,
  paymentAddress,
  paymentPublicKey,
  privKey,
}: {
  content: string
  mimeType: string
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
    const contentSize = Buffer.from(content).length
    if (contentSize > 390000)
      throw new Error('Content size is too large, must be less than 390kb')

    const { fastestFee } = await getRecommendedFees(MAINNET)
    const secret = privKey
    const pubKey = ecc.keys.get_pubkey(String(secret), true)
    const psbt = new bitcoin.Psbt({
      network: bitcoin.networks.bitcoin,
    })

    const { inscriberAddress } = createRevealAddressAndKeys(
      pubKey,
      content,
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
      .filter((utxo: MempoolUtxo) => utxo.value > 10000)
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

      if (ordinalAddress !== paymentAddress && paymentPublicKey) {
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
  content,
  mimeType,
  ordinalAddress,
  commitTxId,
  privKey,
  isDry,
}: {
  content: string
  mimeType: string
  ordinalAddress: string
  commitTxId: string
  privKey?: string
  isDry?: boolean
}) => {
  try {
    const secret = privKey ?? String(process.env['MCND_PRIVATE_KEY'])
    const secKey = ecc.keys.get_seckey(secret)
    const pubKey = ecc.keys.get_pubkey(secret, true)
    const script = createInscriptionScript(pubKey, content, mimeType)
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

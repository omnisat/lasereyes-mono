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
import { getCmDruidNetwork, MAINNET, P2SH, P2TR } from '../constants'
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
  quantity = 1,
  inscriptions,
  ordinalAddress,
  paymentAddress,
  paymentPublicKey,
  signPsbt,
  network = MAINNET,
}: {
  contentBase64?: string
  mimeType?: ContentType
  quantity?: number
  inscriptions?: { content: string; mimeType: ContentType }[]
  ordinalAddress: string
  paymentAddress: string
  paymentPublicKey?: string
  signPsbt: (
    tx: string,
    psbtHex: string,
    psbtBase64: string,
    finalize?: boolean,
    broadcast?: boolean,
    network?: NetworkType
  ) => Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string
    }
    | undefined
  >
  network: NetworkType
}) => {
  try {
    if (!contentBase64 && !inscriptions) {
      throw new Error('contentBase64 or inscriptions is required')
    }
    const privKeyBuff = await generatePrivateKey(network)
    const privKey = Buffer.from(privKeyBuff!).toString('hex')
    const ixs = inscriptions
      ? inscriptions
      : Array(quantity).fill({
        content: contentBase64,
        mimeType,
      })

    const commitTx = await getCommitTx({
      inscriptions: ixs,
      paymentAddress,
      paymentPublicKey,
      privKey,
      network,
    })

    if (!commitTx || !commitTx?.psbtHex) {
      throw new Error("couldn't get commit tx")
    }

    const commitTxHex = String(commitTx?.psbtHex)
    const commitTxBase64 = String(commitTx?.psbtBase64)
    const response = await signPsbt(
      '',
      commitTxHex,
      commitTxBase64,
      true,
      false,
      network
    )
    if (!response) throw new Error('sign psbt failed')
    const psbt = bitcoin.Psbt.fromHex(response?.signedPsbtHex || '')
    const extracted = psbt.extractTransaction()
    const commitTxId = await broadcastTx(extracted.toHex(), network)
    if (!commitTxId) throw new Error('commit tx failed')
    return await executeReveal({
      inscriptions: ixs,
      ordinalAddress,
      privKey,
      commitTxId,
      network,
    })
  } catch (e) {
    throw e
  }
}

export const getCommitTx = async ({
  inscriptions,
  paymentAddress,
  paymentPublicKey,
  privKey,
  network,
}: {
  inscriptions: { content: string; mimeType: ContentType }[]
  paymentAddress: string
  paymentPublicKey?: string
  privKey: string
  network: NetworkType
  isDry?: boolean
}): Promise<
  | {
    psbtHex: string
    psbtBase64: string
  }
  | undefined
> => {
  try {
    const quantity = inscriptions.length
    const contentSize = inscriptions.reduce(
      (a, b) => a + Buffer.from(b.content).length,
      0
    )
    if (contentSize > 390000)
      throw new Error('Content size is too large, must be less than 390kb')

    const { fastestFee } = await getRecommendedFees(network)
    const pubKey = ecc.keys.get_pubkey(String(privKey), true)
    const psbt = new bitcoin.Psbt({
      network: getBitcoinNetwork(network),
    })

    const { inscriberAddress } = createRevealAddressAndKeys(
      pubKey,
      inscriptions,
      network
    )

    const estimatedSize = 5 * 34 * quantity
    const commitSatsNeeded = Math.floor(estimatedSize * fastestFee * quantity)
    const revealSatsNeeded =
      Math.floor((contentSize * fastestFee) / 3) + 1000 + 546 * quantity
    const inscribeFees = Math.floor(commitSatsNeeded + revealSatsNeeded)
    const utxosGathered: MempoolUtxo[] = await getAddressUtxos(
      paymentAddress,
      network
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

    let accSats = 0
    const addressScript = await bitcoin.address.toOutputScript(
      paymentAddress,
      getBitcoinNetwork(network)
    )
    let counter = 0
    for await (const utxo of filteredUtxos) {
      const paymentAddressType = getAddressType(paymentAddress, network)
      console.log({ paymentAddressType })
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: { value: BigInt(utxo.value), script: addressScript },
      })

      if (paymentAddressType === P2TR) {
        psbt.updateInput(counter, {
          tapInternalKey: toXOnly(Buffer.from(paymentPublicKey!, 'hex')),
        })
      }

      if (paymentAddressType === P2SH) {
        let redeemScript = getRedeemScript(paymentPublicKey!, network)
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
  inscriptions,
  ordinalAddress,
  commitTxId,
  privKey,
  network,
  isDry,
}: {
  inscriptions: { content: string; mimeType: ContentType }[]
  ordinalAddress: string
  commitTxId: string
  privKey: string
  network: NetworkType
  isDry?: boolean
}) => {
  try {
    const secKey = ecc.keys.get_seckey(privKey)
    const pubKey = ecc.keys.get_pubkey(privKey, true)
    const script = createInscriptionScript(pubKey, inscriptions)
    const tapleaf = Tap.encodeScript(script)
    const [tpubkey, cblock] = Tap.getPubKey(pubKey, { target: tapleaf })

    const txResult = await waitForTransaction(String(commitTxId), network)
    if (!txResult) {
      throw new Error('ERROR WAITING FOR COMMIT TX')
    }

    const commitTxOutputValue = await getOutputValueByVOutIndex(
      commitTxId,
      0,
      network
    )
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
        ...Array(inscriptions.length).fill({
          value: 546,
          scriptPubKey: Address.toScriptPubKey(ordinalAddress),
        }),
      ],
    })

    const sig = Signer.taproot.sign(secKey, txData, 0, { extension: tapleaf })
    txData.vin[0].witness = [sig, script, cblock]
    if (isDry) {
      return Tx.util.getTxid(txData)
    }

    return await broadcastTx(Tx.encode(txData).hex, network)
  } catch (e: any) {
    throw e
  }
}

export async function generatePrivateKey(network: NetworkType) {
  const entropy = crypto.getRandomValues(new Uint8Array(32))
  const mnemonic = bip39.entropyToMnemonic(Buffer.from(entropy))
  const seed = await bip39.mnemonicToSeed(mnemonic)
  const root: BIP32Interface = bip32.fromSeed(seed, getBitcoinNetwork(network))
  return root?.derivePath("m/44'/0'/0'/0/0").privateKey
}

export const createInscriptionScript = (
  pubKey: any,
  inscriptions: { content: string; mimeType: ContentType }[]
) => {
  const ec = new TextEncoder()
  const marker = ec.encode('ord')
  const INSCRIPTION_SIZE = 546 // Constant for inscription size

  // Function to create content chunks for each inscription
  const createContentChunks = (
    contentBase64: string,
    mimeType: ContentType
  ) => {
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

    return contentChunks
  }

  // Construct the script starting with pubKey and OP_CHECKSIG
  const script: any = [pubKey, 'OP_CHECKSIG']

  // Add envelopes for each inscription
  inscriptions.forEach((inscription, index) => {
    const { content, mimeType } = inscription
    const contentChunks = createContentChunks(content, mimeType)

    // Start the inscription envelope
    script.push('OP_0', 'OP_IF', marker, '01', ec.encode(mimeType), 'OP_0')

    // Add pointer logic only if it's not the first inscription
    if (index > 0) {
      const pointer = INSCRIPTION_SIZE * (index + 1)
      const pointerBuffer = Buffer.from([pointer])

      script.push(Buffer.from([0x02])) // Pointer tag
      script.push(pointerBuffer) // Pointer value in minimal format
    }

    // Add content chunks and close the conditional block
    script.push(...contentChunks.map((chunk) => chunk), 'OP_ENDIF')
  })

  // Return the complete script with all envelopes
  return script
}

export const createRevealAddressAndKeys = (
  pubKey: any,
  inscriptions: { content: string; mimeType: ContentType }[],
  network: NetworkType = MAINNET
) => {
  const script = createInscriptionScript(pubKey, inscriptions)
  const tapleaf = Tap.encodeScript(script)
  const [tpubkey] = Tap.getPubKey(pubKey, { target: tapleaf })
  const inscriberAddress = Address.p2tr.fromPubKey(
    tpubkey,
    getCmDruidNetwork(network)
  )

  return {
    inscriberAddress,
    tpubkey,
    tapleaf,
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

export async function waitForTransaction(
  txId: string,
  network: NetworkType
): Promise<boolean> {
  const timeout: number = 60000
  const startTime: number = Date.now()
  while (true) {
    try {
      const rawTx: any = await getTransaction(txId, network)
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
  vOut: number,
  network: NetworkType
): Promise<number | null> {
  const timeout: number = 60000
  const startTime: number = Date.now()

  while (true) {
    try {
      const rawTx: any = await getTransaction(commitTxId, network)

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

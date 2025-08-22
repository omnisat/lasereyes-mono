// eslint-disable
import * as ecc from '@cmdcode/crypto-utils'
import { Address, Signer, Tap, Tx } from '@cmdcode/tapscript'
import * as bitcoin from 'bitcoinjs-lib'
import * as ecc2 from '@bitcoinerlab/secp256k1'
import { calculateValueOfUtxosGathered, getBitcoinNetwork } from './helpers'
import { getCmDruidNetwork } from '../constants/networks'
import { MAINNET, P2SH, P2TR } from '../constants'
import type { ContentType, MempoolUtxo, NetworkType } from '../types'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { TEXT_PLAIN } from '../constants/content'
import { generatePrivateKey, getAddressType, getRedeemScript } from './btc'
import type { DataSourceManager } from './data-sources/manager'
import type { WalletProviderSignPsbtOptions } from '../client/types'

bitcoin.initEccLib(ecc2)

const stripHexPrefix = function (v: string) { return v.substr(0, 2) === '0x' ? v.substr(2) : v; }

export const inscribeContent = async ({
  contentBase64,
  mimeType,
  quantity = 1,
  inscriptions,
  ordinalAddress,
  paymentAddress,
  paymentPublicKey,
  signPsbt,
  dataSourceManager,
  opReturn,
  network = MAINNET,
}: {
  contentBase64?: string
  mimeType?: ContentType
  quantity?: number
  inscriptions?: { content: string; mimeType: ContentType }[]
  ordinalAddress: string
  paymentAddress: string
  paymentPublicKey?: string
  signPsbt: (signPsbtOptions: WalletProviderSignPsbtOptions) => Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string
    }
    | undefined
  >
  dataSourceManager: DataSourceManager
  opReturn?: string
  network: NetworkType
}) => {
  if (!contentBase64 && !inscriptions) {
    throw new Error('contentBase64 or inscriptions is required')
  }

  if (!dataSourceManager) {
    throw new Error('missing data source')
  }

  if (!dataSourceManager.broadcastTransaction) {
    throw new Error('missing broadcastTransaction')
  }

  const privKeyBuff = await generatePrivateKey(network)
  const privKey = Buffer.from(privKeyBuff).toString('hex')
  const ixs = inscriptions
    ? inscriptions
    : Array(quantity).fill({
      content: contentBase64,
      mimeType,
    })

  const commitTx = await getCommitPsbt({
    inscriptions: ixs,
    paymentAddress,
    paymentPublicKey,
    privKey,
    dataSourceManager,
    network,
  })

  if (!commitTx || !commitTx?.psbtHex) {
    throw new Error("couldn't get commit tx")
  }

  const commitTxHex = String(commitTx?.psbtHex)
  const commitTxBase64 = String(commitTx?.psbtBase64)
  const response = await signPsbt({
    tx: commitTxHex,
    psbtHex: commitTxHex,
    psbtBase64: commitTxBase64,
    finalize: true,
    broadcast: false,
    network,
  })
  if (!response) throw new Error('sign psbt failed')
  const psbt = bitcoin.Psbt.fromHex(response?.signedPsbtHex || '')
  const extracted = psbt.extractTransaction()
  const commitTxId = await dataSourceManager.broadcastTransaction(
    extracted.toHex()
  )
  if (!commitTxId) throw new Error('commit tx failed')
  return await executeRevealTransaction({
    inscriptions: ixs,
    ordinalAddress,
    privKey,
    commitTxId,
    dataSourceManager,
    opReturn,
  })
}

export const getCommitPsbt = async ({
  inscriptions,
  paymentAddress,
  paymentPublicKey,
  privKey,
  dataSourceManager,
  network,
}: {
  inscriptions: { content: string; mimeType: ContentType }[]
  paymentAddress: string
  paymentPublicKey?: string
  privKey: string
  dataSourceManager: DataSourceManager
  network: NetworkType
  isDry?: boolean
}): Promise<
  | {
    psbtHex: string
    psbtBase64: string
  }
  | undefined
> => {
  const quantity = inscriptions.length
  const contentSize = inscriptions.reduce(
    (a, b) => a + Buffer.from(b.content).length,
    0
  )
  if (contentSize > 390000)
    throw new Error('Content size is too large, must be less than 390kb')

  if (!dataSourceManager) {
    throw new Error('missing data source')
  }

  if (!dataSourceManager.getRecommendedFees) {
    throw new Error('missing getRecommendedFees')
  }

  if (!dataSourceManager.getAddressUtxos) {
    throw new Error('missing getAddressUtxos')
  }

  const { fastFee } = await dataSourceManager.getRecommendedFees()
  const pubKey = ecc.keys.get_pubkey(String(privKey), true)
  const psbt = new bitcoin.Psbt({
    network: getBitcoinNetwork(network),
  })

  const { inscriberAddress } = createInscriptionRevealAddressAndKeys(
    pubKey,
    inscriptions,
    network
  )

  const estimatedSize = 5 * 34 * quantity
  const commitSatsNeeded = Math.floor(estimatedSize * fastFee * quantity)
  const revealSatsNeeded =
    Math.floor((contentSize * fastFee) / 3) + 1000 + 546 * quantity
  const inscribeFees = Math.floor(commitSatsNeeded + revealSatsNeeded)
  const utxosGathered: MempoolUtxo[] =
    await dataSourceManager.getAddressUtxos(paymentAddress)
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
  const addressScript = bitcoin.address.toOutputScript(
    paymentAddress,
    getBitcoinNetwork(network)
  )
  let counter = 0
  for await (const utxo of filteredUtxos) {
    const paymentAddressType = getAddressType(paymentAddress, network)
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: { value: BigInt(utxo.value), script: addressScript },
    })

    if (paymentAddressType === P2TR) {
      psbt.updateInput(counter, {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        tapInternalKey: toXOnly(Buffer.from(paymentPublicKey!, 'hex')),
      })
    }

    if (paymentAddressType === P2SH) {
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      const redeemScript = getRedeemScript(paymentPublicKey!, network)
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
}

export const executeRevealTransaction = async ({
  inscriptions,
  ordinalAddress,
  commitTxId,
  privKey,
  dataSourceManager,
  opReturn,
  isDry,
}: {
  inscriptions: { content: string; mimeType: ContentType }[]
  ordinalAddress: string
  commitTxId: string
  privKey: string
  dataSourceManager: DataSourceManager
  opReturn?: string
  isDry?: boolean
}): Promise<string> => {
  const secKey = ecc.keys.get_seckey(privKey)
  const pubKey = ecc.keys.get_pubkey(privKey, true)
  const script = createInscriptionScript(pubKey, inscriptions)
  const tapleaf = Tap.encodeScript(script)
  const [tpubkey, cblock] = Tap.getPubKey(pubKey, { target: tapleaf })

  if (!dataSourceManager) {
    throw new Error('missing data source')
  }

  if (!dataSourceManager.waitForTransaction) {
    throw new Error('missing waitForTransaction')
  }

  if (!dataSourceManager.getOutputValueByVOutIndex) {
    throw new Error('missing waitForTransaction')
  }

  if (!dataSourceManager.broadcastTransaction) {
    throw new Error('missing broadcastTransaction')
  }

  const txResult = await dataSourceManager.waitForTransaction(
    String(commitTxId)
  )
  if (!txResult) {
    throw new Error('ERROR WAITING FOR COMMIT TX')
  }

  const commitTxOutputValue = await dataSourceManager.getOutputValueByVOutIndex(
    commitTxId,
    0
  )
  if (commitTxOutputValue === 0 || !commitTxOutputValue) {
    throw new Error('ERROR GETTING FIRST INPUT VALUE')
  }

  console.log("opreturn in lasereyes inscribe: ", opReturn);
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
    ].concat(opReturn ? [{ value: 0, scriptPubKey: ['OP_RETURN', stripHexPrefix(opReturn)] }] : [])
  })

  console.log("txData: ", txData);

  const sig = Signer.taproot.sign(secKey, txData, 0, { extension: tapleaf })
  txData.vin[0].witness = [sig, script, cblock]
  if (isDry) {
    return Tx.util.getTxid(txData)
  }

  return await dataSourceManager.broadcastTransaction(Tx.encode(txData).hex)
}

export const createInscriptionScript = (
  pubKey: string | Uint8Array<ArrayBufferLike>,
  inscriptions: { content: string; mimeType: ContentType }[]
) => {
  const ec = new TextEncoder()
  const marker = ec.encode('ord')
  const INSCRIPTION_SIZE = 546
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

    const contentChunks = []
    for (let i = 0; i < contentBuffer.length; i += 520) {
      contentChunks.push(contentBuffer.slice(i, i + 520))
    }

    return contentChunks
  }

  const script = [pubKey, 'OP_CHECKSIG']
  inscriptions.forEach((inscription, index) => {
    const { content, mimeType } = inscription
    const contentChunks = createContentChunks(content, mimeType)
    script.push('OP_0', 'OP_IF', marker, '01', ec.encode(mimeType), 'OP_0')
    if (index > 0) {
      const pointer = INSCRIPTION_SIZE * (index + 1)
      const pointerBuffer = Buffer.from([pointer])
      script.push(Buffer.from([0x02]))
      script.push(pointerBuffer)
    }
    script.push(...contentChunks.map((chunk) => chunk), 'OP_ENDIF')
  })

  return script
}

export const createInscriptionRevealAddressAndKeys = (
  pubKey: string | Uint8Array<ArrayBufferLike>,
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

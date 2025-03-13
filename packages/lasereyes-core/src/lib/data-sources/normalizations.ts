import { Inscription } from "../../types/lasereyes";
import { NetworkType } from "../../types";
import { getUnisatContentUrl, getUnisatPreviewUrl } from "../urls";

/**
 * Helper function to extract a string value from an object using multiple possible keys
 * @param obj The object to extract from
 * @param keys Array of possible keys to try
 * @param defaultValue Default value if no key is found
 * @returns Extracted string value
 */
function extractStringValue(obj: any, keys: string[], defaultValue: string | undefined): string | undefined {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }

  for (const key of keys) {
    if (obj[key] !== undefined) {
      // Convert to string if needed
      return obj[key]?.toString() || defaultValue;
    }
  }

  return defaultValue;
}

/**
 * Helper function to extract a number value from an object using multiple possible keys
 * @param obj The object to extract from
 * @param keys Array of possible keys to try
 * @param defaultValue Default value if no key is found
 * @returns Extracted number value
 */
function extractNumberValue(obj: any, keys: string[], defaultValue: number): number {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }

  for (const key of keys) {
    if (obj[key] !== undefined) {
      // Convert to number if needed
      const num = Number(obj[key]);
      return isNaN(num) ? defaultValue : num;
    }
  }

  return defaultValue;
}

/**
 * Normalizes an inscription object from any data source
 * @param insc The inscription data from the data source
 * @param address The address that owns the inscription
 * @param source The name of the data source (for logging)
 * @returns Normalized inscription object
 */
export function normalizeInscription(insc: any, source: string = "unknown", network: NetworkType): Inscription {
  if (!insc) {
    console.warn(`Invalid inscription data from source: ${source}`);
    return {
      id: "",
      inscriptionId: "",
      content: "",
      number: 0,
      address: "",
      contentType: "unknown",
      output: "",
      location: "",
      preview: "",
      genesisTransaction: "",
      height: 0,
      outputValue: 0
    };
  }

  // Extract the inscription ID
  const id = extractStringValue(insc, [
    'id', 'inscription_id', 'inscriptionId'
  ], "");

  // Extract inscription number
  const number = extractNumberValue(insc, [
    'num', 'number', 'inscriptionNumber'
  ], 0);

  // Extract owner address
  const address = extractStringValue(insc, [
    'address', 'owner', 'ownerAddress'
  ], "");

  // Extract content type
  const contentType = extractStringValue(insc, [
    'content_type', 'contentType', 'mime', 'mimeType'
  ], "unknown");


  const txid = extractStringValue(insc, ['utxo_txid', 'txid', 'transaction_id'], "");
  const vout = extractNumberValue(insc, ['vout', 'utxo_vout'], 0);

  let output = extractStringValue(insc, ['output'], "");
  if (!output) {
    if (txid) {
      output = `${txid}:${vout}`;
    }
  }

  const outputValue = extractNumberValue(insc, ['output_value', 'value', 'outputValue'], 0);
  const height = extractNumberValue(insc, ['height', 'block_height'], 0);

  let genesisTransaction = extractStringValue(insc, [
    'genesis_tx_id', 'genesisTx', 'genesis_txid', 'genesisTransaction'
  ], insc.inscription_id?.split("i")?.[0] || insc.txid || "");

  const offset = insc.utxo_sat_offset !== undefined ? insc.utxo_sat_offset : undefined;

  if (!id) {
    console.warn(`Invalid inscription data from source: ${source}`);
    throw new Error(`Invalid inscription data from source: ${source}`);
  }

  if (!address) {
    console.warn(`Invalid inscription address from source: ${source}`);
    throw new Error(`Invalid inscription address from source: ${source}`);
  }

  if (!output) {
    console.warn(`Invalid inscription output from source: ${source}`);
    throw new Error(`Invalid inscription output from source: ${source}`);
  }

  if (!contentType) {
    console.warn(`Invalid inscription content type from source: ${source}`);
    throw new Error(`Invalid inscription content type from source: ${source}`);
  }

  if (!genesisTransaction) {
    genesisTransaction = id.split("i")[0]
  }

  return {
    address,
    id,
    inscriptionId: id,
    number,
    outputValue,
    contentType,
    output,
    location: `${txid}:${vout}:${offset}`,
    content: `${getUnisatContentUrl(network)}/${id}`,
    preview: `${getUnisatPreviewUrl(network)}/${id}`,
    genesisTransaction,
    height,
    offset
  };
}


// /**
//  * Normalizes a BTC balance response from any data source
//  * @param balance The balance data from the data source
//  * @param source The name of the data source (for logging)
//  * @returns Normalized balance object
//  */
// export function normalizeBalance(balance: any, source: string): NormalizedBalance {
//   if (typeof balance === 'string') {
//     // Simple string balance
//     return {
//       confirmed: balance,
//       unconfirmed: "0",
//       total: balance
//     };
//   } else if (typeof balance === 'number') {
//     // Number balance
//     const balanceStr = balance.toString();
//     return {
//       confirmed: balanceStr,
//       unconfirmed: "0",
//       total: balanceStr
//     };
//   } else if (typeof balance === 'object') {
//     // Object with balance properties
//     const confirmed = extractStringValue(balance, [
//       'confirmed', 'confirmedBalance', 'confirmed_balance'
//     ], "0");
//
//     const unconfirmed = extractStringValue(balance, [
//       'unconfirmed', 'unconfirmedBalance', 'unconfirmed_balance'
//     ], "0");
//
//     // If we have the 'total' already, use it, otherwise compute it
//     const total = extractStringValue(balance, [
//       'total', 'totalBalance', 'total_balance'
//     ], String(BigInt(confirmed || "0") + BigInt(unconfirmed || "0")));
//
//     return { confirmed, unconfirmed, total };
//   }
//
//   // Default for unknown formats
//   console.warn(`Unknown balance format from source: ${source}`, balance);
//   return {
//     confirmed: "0",
//     unconfirmed: "0",
//     total: "0"
//   };
// }
//
// /**
//  * Normalizes a BRC-20 token balance from any data source
//  * @param token The token data from the data source
//  * @param source The name of the data source (for logging)
//  * @returns Normalized BRC-20 balance object
//  */
// export function normalizeBrc20Balance(token: any, source: string): NormalizedBrc20Balance {
//   if (!token) {
//     console.warn(`Invalid token data from source: ${source}`);
//     return {
//       ticker: "",
//       availableBalance: "0",
//       transferableBalance: "0",
//       overallBalance: "0",
//       decimals: 0
//     };
//   }
//
//   const ticker = extractStringValue(token, ['ticker', 'name', 'tick'], "");
//
//   const availableBalance = extractStringValue(token, [
//     'available_balance', 'availableBalance', 'available', 'avail'
//   ], "0");
//
//   const transferableBalance = extractStringValue(token, [
//     'transferable_balance', 'transferableBalance', 'transferable', 'transfer'
//   ], "0");
//
//   // Extract or calculate overall balance
//   let overallBalance = extractStringValue(token, [
//     'overall_balance', 'overallBalance', 'overall', 'balance', 'total'
//   ], "");
//
//   // If not found, calculate from available and transferable
//   if (!overallBalance) {
//     try {
//       overallBalance = String(BigInt(availableBalance || "0") + BigInt(transferableBalance || "0"));
//     } catch (e) {
//       overallBalance = "0";
//     }
//   }
//
//   // Extract decimals with fallback to 0
//   const decimals = extractNumberValue(token, ['decimals', 'decimal'], 0);
//
//   return {
//     ticker,
//     availableBalance,
//     transferableBalance,
//     overallBalance,
//     decimals
//   };
// }
//
//
// /**
//  * Normalizes a Rune balance from any data source
//  * @param rune The rune data from the data source
//  * @param source The name of the data source (for logging)
//  * @returns Normalized rune balance object
//  */
// export function normalizeRuneBalance(rune: any, source: string): NormalizedRuneBalance {
//   if (!rune) {
//     console.warn(`Invalid rune data from source: ${source}`);
//     return {
//       name: "",
//       id: "",
//       balance: "0",
//       symbol: undefined,
//       decimals: 0
//     };
//   }
//
//   // Extract rune name
//   const name = extractStringValue(rune, [
//     'name', 'rune_name', 'runeName'
//   ], "");
//
//   // Extract rune ID
//   const id = extractStringValue(rune, [
//     'id', 'rune_id', 'runeId'
//   ], "");
//
//   // Extract balance
//   const balance = extractStringValue(rune, [
//     'balance', 'amount', 'value'
//   ], "0");
//
//   // Extract symbol if available
//   const symbol = extractStringValue(rune, [
//     'symbol', 'tick'
//   ], undefined);
//
//   // Extract decimals
//   const decimals = extractNumberValue(rune, [
//     'decimals', 'decimal', 'divisibility'
//   ], 0);
//
//   return {
//     name,
//     id,
//     balance,
//     symbol,
//     decimals
//   };
// }
//
// /**
//  * Normalizes a transaction from any data source
//  * @param tx The transaction data from the data source
//  * @param source The name of the data source (for logging)
//  * @returns Normalized transaction object
//  */
// export function normalizeTransaction(tx: any, source: string): NormalizedTransaction {
//   if (!tx) {
//     console.warn(`Invalid transaction data from source: ${source}`);
//     return {
//       txid: "",
//       status: {
//         confirmed: false
//       },
//       fee: 0,
//       size: 0,
//       inputs: [],
//       outputs: []
//     };
//   }
//
//   // Extract txid
//   const txid = extractStringValue(tx, [
//     'txid', 'tx_id', 'hash', 'id'
//   ], "");
//
//   // Extract confirmation status
//   const confirmed = tx.status?.confirmed || tx.confirmed || false;
//
//   // Extract block height if confirmed
//   const blockHeight = confirmed ?
//     extractNumberValue(tx, ['height', 'block_height', 'blockHeight'],
//       extractNumberValue(tx.status || {}, ['block_height', 'height'], undefined)) :
//     undefined;
//
//   // Extract block time if confirmed
//   const blockTime = confirmed ?
//     extractNumberValue(tx, ['time', 'timestamp', 'block_time', 'blockTime'],
//       extractNumberValue(tx.status || {}, ['block_time', 'time'], undefined)) :
//     undefined;
//
//   // Extract fee
//   const fee = extractNumberValue(tx, ['fee'], 0);
//
//   // Extract size
//   const size = extractNumberValue(tx, ['size', 'vsize', 'weight'], 0);
//
//   // Extract inputs
//   const inputs = Array.isArray(tx.vin || tx.inputs) ?
//     (tx.vin || tx.inputs).map((input: any) => ({
//       txid: extractStringValue(input, ['txid', 'tx_id', 'prev_hash'], ""),
//       vout: extractNumberValue(input, ['vout', 'output_index', 'prev_index'], 0),
//       address: extractStringValue(input, ['address', 'addr', 'prevout.address'], undefined),
//       value: extractNumberValue(input, ['value', 'amount', 'prevout.value'], 0)
//     })) : [];
//
//   // Extract outputs
//   const outputs = Array.isArray(tx.vout || tx.outputs) ?
//     (tx.vout || tx.outputs).map((output: any) => ({
//       address: extractStringValue(output, [
//         'address', 'addr', 'scriptpubkey_address'
//       ], undefined),
//       value: extractNumberValue(output, ['value', 'amount'], 0),
//       scriptPubKey: extractStringValue(output, [
//         'scriptPubKey.hex', 'scriptpubkey', 'script_pubkey'
//       ], "")
//     })) : [];
//
//   return {
//     txid,
//     status: {
//       confirmed,
//       blockHeight,
//       blockTime
//     },
//     fee,
//     size,
//     inputs,
//     outputs
//   };
// }

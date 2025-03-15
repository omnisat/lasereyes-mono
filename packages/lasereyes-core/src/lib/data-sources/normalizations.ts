import { Brc20Balance, Inscription } from "../../types/lasereyes";
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
 * @param source The name of the data source (for logging)
 * @param network The network type
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


  let txid = extractStringValue(insc, ['utxo_txid', 'txid', 'transaction_id'], "");
  let vout = extractNumberValue(insc, ['vout', 'utxo_vout'], 0);

  let output = extractStringValue(insc, ['output'], "");
  if (!output) {
    if (txid) {
      output = `${txid}:${vout}`;
    }
  }

  if (output) {
    if (!txid || !vout) {
      console.warn(`Invalid inscription location from source: ${source}`);
      txid = output.split(":")[0];
      vout = parseInt(output.split(":")[1]);
    }
  }

  const outputValue = extractNumberValue(insc, ['output_value', 'value', 'outputValue', 'postage', 'satoshis'], 0);
  const height = extractNumberValue(insc, ['height', 'block_height'], 0);

  let genesisTransaction = extractStringValue(insc, [
    'genesis_tx_id', 'genesisTx', 'genesis_txid', 'genesisTransaction'
  ], insc.inscription_id?.split("i")?.[0] || insc.txid || "");

  const offset = insc.utxo_sat_offset !== undefined ? insc.utxo_sat_offset : 0;

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

/**
 * Normalizes BRC20 balances from various API formats into a consistent structure
 * @param data - The input data which could be in various formats
 * @param source - The source of the data (for logging purposes)
 * @returns An array of normalized BRC20 balances
 */
export function normalizeBrc20Balances(data: any, source: string = "unknown"): Brc20Balance[] {
  const normalized: Brc20Balance[] = [];

  // Handle case when data is null or undefined
  if (!data) {
    console.warn(`Invalid BRC20 balance data from source: ${source}`);
    return normalized;
  }

  // Handle Maestro-style response format
  if (data.data && typeof data.data === 'object') {
    // Maestro format: { data: { ticker1: { total: "100", available: "50" }, ticker2: {...} } }
    Object.entries(data.data).forEach(([ticker, balanceData]: [string, any]) => {

      const overall = extractStringValue(balanceData, ['overall', 'overallBalance', 'total', 'totalBalance'], "0");
      const transferable = extractStringValue(balanceData, ['transferable', 'transferableBalance'], "na");
      const available = extractStringValue(balanceData, ['available', 'availableBalance'], "0")

      if (!overall || !available) {
        console.warn(`Invalid BRC20 balance data from source: ${source}`);
        return; // Skip this item
      }

      const balance: Brc20Balance = {
        ticker,
        overall: overall,
        transferable: transferable ?? "na",
        available
      };

      normalized.push(balance);
    });

    return normalized;
  }

  // Handle array-style format
  if (Array.isArray(data)) {
    // Format: [{ ticker: "text", overallBalance: "text", ... }, ...]
    data.forEach((item) => {
      const ticker = extractStringValue(item, ['ticker', 'tick', 'token'], '');

      if (!ticker) {
        console.warn(`Missing ticker in BRC20 balance from source: ${source}`);
        return; // Skip this item
      }

      const overall = extractStringValue(item, ['overall', 'overallBalance', 'total', 'totalBalance'], "0");
      const transferable = extractStringValue(item, ['transferable', 'transferableBalance'], "0");
      const available = extractStringValue(item, ['available', 'availableBalance'], "0")

      if (!overall || !available) {
        console.warn(`Invalid BRC20 balance data from source: ${source}`);
        return; // Skip this item
      }

      const balance: Brc20Balance = {
        ticker,
        overall: overall,
        transferable: transferable ?? "na",
        available
      };

      normalized.push(balance);
    });

    return normalized;
  }

  // Handle single balance object format
  if (typeof data === 'object' && !Array.isArray(data)) {
    const ticker = extractStringValue(data, ['ticker', 'tick', 'token'], '');

    if (!ticker) {
      console.warn(`Missing ticker in BRC20 balance from source: ${source}`);
      return normalized;
    }


    const overall = extractStringValue(data, ['overall', 'overallBalance', 'total', 'totalBalance'], "0");
    const transferable = extractStringValue(data, ['transferable', 'transferableBalance'], "0");
    const available = extractStringValue(data, ['available', 'availableBalance'], "0")

    if (!overall || !available) {
      console.warn(`Invalid BRC20 balance data from source: ${source}`);
      throw new Error(`Invalid BRC20 balance data from source: ${source}`);
    }

    const balance: Brc20Balance = {
      ticker,
      overall: overall,
      transferable: transferable ?? "na",
      available
    };


    normalized.push(balance);

    return normalized;
  }

  console.warn(`Unrecognized BRC20 balance format from source: ${source}`);
  return normalized;
}

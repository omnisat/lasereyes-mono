import axios from "axios"
import { OrdAddress, OrdAddressResponse, OrdOutputs, OrdRune, RuneBalance } from "../types/ord"
import { EsploraTx, SingleRuneOutpoint } from "../types/sandshrew"
import { getPublicKeyHash } from "./btc"
import { MAINNET } from "../constants"
export const SANDSHREW_URL: string = "https://mainnet.sandshrew.io/v1/lasereyes"

export const callSandshrewRPC = async (method: string, params: string | any) => {
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: method,
    method: method,
    params: params,
  })

  if (!SANDSHREW_URL) {
    throw new Error('SANDSHREW_URL is not set')
  }

  return await axios
    .post(SANDSHREW_URL, data, {
      headers: {
        'content-type': 'application/json',
      },
    })
    .then((res) => res.data)
    .catch((e) => {
      throw e
    })
}

export const getOrdAddress = async (address: string) => {
  try {
    const response = await callSandshrewRPC('ord_address', [address]) as OrdAddressResponse
    return response.result as OrdAddress
  } catch (e) {
    throw e
  }
}

export const getRuneById = async (rune_id: string) => {
  try {
    const response = await callSandshrewRPC('ord_rune', [rune_id])
    return response.result as OrdRune
  } catch (e) {
    throw e
  }
}

export const getRuneByName = async (rune_name: string) => {
  try {
    const response = await callSandshrewRPC('ord_rune', [rune_name])
    return response
  } catch (e) {
    throw e
  }
}

export const getTxInfo = async (txId: string): Promise<EsploraTx> => {
  try {
    return await callSandshrewRPC('esplora_tx', [txId])
  } catch (e) {
    console.error(e)
    throw e
  }
}

export const batchOrdOutput = async ({
  outpoints,
  rune_name
}: {
  outpoints: string[]
  rune_name: string
}): Promise<OrdOutputs[]> => {
  const MAX_OUTPOINTS_PER_CALL = 1000;
  const ordOutputs: OrdOutputs[] = [];
  for (let i = 0; i < outpoints.length; i += MAX_OUTPOINTS_PER_CALL) {
    const batch = outpoints.slice(i, i + MAX_OUTPOINTS_PER_CALL);
    const multiCall = batch.map((outpoint) => {
      return ["ord_output", [outpoint]];
    });

    const { result } = await callSandshrewRPC("sandshrew_multicall", multiCall);
    for (let i = 0; i < result.length; i++) {
      result[i].result["output"] = batch[i];
    }

    const filteredResult = result.filter((output: OrdOutputs) => Object.keys(output.result.runes).includes(rune_name));
    ordOutputs.push(...filteredResult);
  }
  return ordOutputs;
}

export const getAddressRunesBalances = async (address: string) => {
  try {
    const response = await getOrdAddress(address)
    const runesData = response.runes_balances;
    if (!runesData) {
      throw new Error('No runes data found')
    }

    return runesData.map((rune: any) => ({
      name: rune[0],
      balance: rune[1],
      symbol: rune[2],
    })) as RuneBalance[];
  } catch (error) {
    console.error("Error fetching ord address:", error);
  }
};

export const mapRuneBalances = async ({
  ordOutputs,
}: {
  ordOutputs: OrdOutputs[]
}): Promise<SingleRuneOutpoint[]> => {
  try {
    const runeOutpoints: SingleRuneOutpoint[] = [];
    for (let i = 0; i < ordOutputs.length; i++) {
      const ordOutput = ordOutputs[i];
      const { result } = ordOutput;
      if (!result.output?.split(":")) {
        throw new Error('No output found')
      }

      const { output, address, runes } = result;
      const singleRuneOutpoint: SingleRuneOutpoint = {
        output,
        wallet_addr: address,
        script: "",
        balances: [],
        decimals: [],
        rune_ids: [],
        value: result.value,
      };

      const [txId, txIndex] = output.split(":");
      console.log(txId, txIndex, output);
      singleRuneOutpoint["script"] = Buffer.from(getPublicKeyHash(address, MAINNET)).toString("hex");
      if (typeof runes === "object" && !Array.isArray(runes)) {
        for (const rune in runes) {
          singleRuneOutpoint.balances.push(runes[rune].amount);
          singleRuneOutpoint.decimals.push(runes[rune].divisibility);
          singleRuneOutpoint.rune_ids.push((await getRuneByName(rune)).id);
        }
      }

      runeOutpoints.push(singleRuneOutpoint);
    }
    return runeOutpoints;
  } catch (e) {
    throw e
  }
}

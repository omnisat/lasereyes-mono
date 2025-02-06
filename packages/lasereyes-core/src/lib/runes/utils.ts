import { SingleRuneOutpoint } from "../../types/sandshrew";
import { batchOrdOutput, getOrdAddress, getRuneById, mapRuneBalances } from "../sandshrew";

export const getRuneOutpoints = async ({
  address,
  runeId,
}: {
  address: string
  runeId: string
}): Promise<SingleRuneOutpoint[]> => {
  const addressOutpoints = await getOrdAddress(address);
  const { entry } = await getRuneById(runeId);
  const runeName = entry.spaced_rune;

  const ordOutputs = await batchOrdOutput({
    outpoints: addressOutpoints.outputs,
    rune_name: runeName
  })

  const runeUtxosOutpoints = await mapRuneBalances({
    ordOutputs: ordOutputs,
  })

  return runeUtxosOutpoints;
}

import { MAESTRO } from "../../constants/data-sources";
import { Config } from "../../types";
import { DataSource } from "../../types/data-source";
import { Inscription } from "../../types/lasereyes";
import { MaestroAddressInscription, MaestroGetAddressInscriptions } from "../../types/maestro";
import { BaseNetwork } from "../../types/network";
import { getMempoolSpaceUrl, MAESTRO_API_KEY_MAINNET, SANDSHREW_LASEREYES_KEY, SANDSHREW_URL } from "../urls";
import { normalizeInscription } from "./normalizations";
import { MaestroDataSource } from "./sources/maestro-ds";
import { MempoolSpaceDataSource } from "./sources/mempool-space-ds";
import { SandshrewDataSource } from "./sources/sandshrew-ds";

const ERROR_METHOD_NOT_AVAILABLE = 'Method not available on any data source';

export class DataSourceManager {
  private static instance: DataSourceManager;
  private dataSources: Map<string, DataSource> = new Map();

  private constructor(config?: Config) {
    const network = config?.network || BaseNetwork.MAINNET;

    this.dataSources.set('mempool', new MempoolSpaceDataSource(
      config?.dataSources?.mempool?.url || getMempoolSpaceUrl(network),
      network
    ));

    this.dataSources.set('sandshrew', new SandshrewDataSource(
      config?.dataSources?.sandshrew?.url || SANDSHREW_URL,
      config?.dataSources?.sandshrew?.apiKey || SANDSHREW_LASEREYES_KEY,
      network
    ));

    this.dataSources.set('maestro', new MaestroDataSource(
      config?.dataSources?.maestro?.apiKey || MAESTRO_API_KEY_MAINNET,
      network,
    ));
  }

  public static init(config?: Config) {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager(config);
    }
  }

  public static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      throw new Error('DataSourceManager has not been initialized');
    }

    return DataSourceManager.instance;
  }

  public updateNetwork(newNetwork: string) {
    for (const ds of this.dataSources.values()) {
      ds.setNetwork?.(newNetwork);
    }
  }

  public getSource(source: string): DataSource | undefined {
    return this.dataSources.get(source);
  }

  public async getAddressBtcBalance(address: string): Promise<string> {
    const dataSource = this.findAvailableSource('getAddressBtcBalance');
    if (!dataSource || !dataSource.getAddressBtcBalance) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE);
    }

    return await dataSource.getAddressBtcBalance(address);
  }

  public async getAddressBrc20Balances(address: string): Promise<any> {
    const dataSource = this.findAvailableSource('getAddressBrc20Balances');
    if (!dataSource || !dataSource.getAddressBrc20Balances) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE);
    }

    return await dataSource.getAddressBrc20Balances(address);
  }

  /**
   * Get inscriptions for an address
   * @param address The address to query
   * @param offset Optional pagination offset
   * @param limit Optional pagination limit
   * @returns Array of normalized inscription objects
   */
  public async getAddressInscriptions(
    address: string,
    offset?: number,
    limit?: number
  ): Promise<Inscription[]> {
    const dataSource = this.findAvailableSource('getAddressInscriptions');
    if (!dataSource || !dataSource.getAddressInscriptions) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE);
    }

    const inscriptionsResult = await dataSource.getAddressInscriptions(address, offset, limit);
    const sourceName = dataSource.getName();

    // Handle different data structures from different sources
    if (sourceName === MAESTRO && inscriptionsResult.data) {
      return inscriptionsResult.data.map((insc: MaestroAddressInscription) =>
        normalizeInscription(insc, sourceName)
      );
    } else if (inscriptionsResult.inscriptions) {
      // Some sources return { inscriptions: [...inscriptions] }
      return inscriptionsResult.inscriptions.map((insc: any) =>
        normalizeInscription(insc, sourceName)
      );
    } else if (Array.isArray(inscriptionsResult)) {
      // Some sources return [...inscriptions] directly
      return inscriptionsResult.map((insc: any) =>
        normalizeInscription(insc, sourceName)
      );
    }

    console.warn('Unable to normalize inscriptions from data source', sourceName);
    return [];
  }

  public async getAddressRunesBalances(address: string): Promise<any> {
    const dataSource = this.findAvailableSource('getAddressRunesBalances');
    if (!dataSource || !dataSource.getAddressRunesBalances) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE);
    }

    return await dataSource.getAddressRunesBalances(address);
  }

  public async broadcastTransaction(rawTx: string): Promise<string> {
    const dataSource = this.findAvailableSource('broadcastTransaction');
    if (!dataSource || !dataSource.broadcastTransaction) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE);
    }
    return await dataSource.broadcastTransaction(rawTx);
  }

  public async withFallback<T>(
    primarySource: string,
    method: (ds: DataSource) => Promise<T>
  ): Promise<T> {
    const sources = [primarySource, ...Array.from(this.dataSources.keys()).filter(s => s !== primarySource)];
    for (const source of sources) {
      try {
        const ds = this.getSource(source);
        if (!ds) continue;
        return await method(ds);
      } catch (error) {
        console.warn(`Fallback: ${source} failed`, error);
      }
    }
    throw new Error('All data sources failed');
  }

  private findAvailableSource(method: keyof DataSource): DataSource | undefined {
    for (const source of this.dataSources.values()) {
      if (typeof source[method] === 'function') {
        return source;
      }
    }
    return undefined;
  }
}

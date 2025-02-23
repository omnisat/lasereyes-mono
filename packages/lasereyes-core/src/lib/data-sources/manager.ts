import { Config } from "../../types";
import { DataSource } from "../../types/data-source";
import { BaseNetwork } from "../../types/network";
import { getMempoolSpaceUrl, MAESTRO_API_KEY, SANDSHREW_LASEREYES_KEY, SANDSHREW_URL } from "../urls";
import { MaestroDataSource } from "./sources/maestro-ds";
import { MempoolSpaceDataSource } from "./sources/mempool-space-ds";
import { SandshrewDataSource } from "./sources/sandshrew-ds";

export class DataSourceManager {
  private static instance: DataSourceManager;
  private dataSources: Map<string, DataSource> = new Map();

  private constructor(config: Config) {
    const network = config.network || BaseNetwork.MAINNET;

    this.dataSources.set('mempool', new MempoolSpaceDataSource(
      config.dataSources?.mempool?.url || getMempoolSpaceUrl(network),
      network
    ));

    this.dataSources.set('sandshrew', new SandshrewDataSource(
      config.dataSources?.sandshrew?.url || SANDSHREW_URL,
      config.dataSources?.sandshrew?.apiKey || SANDSHREW_LASEREYES_KEY,
      network
    ));

    this.dataSources.set('maestro', new MaestroDataSource(
      config.dataSources?.maestro?.apiKey || MAESTRO_API_KEY,
      network,
    ));
  }

  public static init(config: Config) {
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
}

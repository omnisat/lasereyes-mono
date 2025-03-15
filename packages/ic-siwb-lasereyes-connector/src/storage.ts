/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const KEY_ICSTORAGE_KEY = 'identity';
export const KEY_ICSTORAGE_DELEGATION = 'delegation';
export const KEY_ICSTORAGE_WALLET = 'wallet';
export const KEY_DELEGATION_PARAMS = 'delegation_params';
export const IDENTITY_PROVIDER_DEFAULT = 'https://identity.ic0.app';
export const IDENTITY_PROVIDER_ENDPOINT = '#authorize';

export async function _deleteStorage(storage: any) {
  await storage.remove(KEY_ICSTORAGE_KEY);
  await storage.remove(KEY_ICSTORAGE_DELEGATION);
  await storage.remove(KEY_ICSTORAGE_WALLET);
  await storage.remove(KEY_DELEGATION_PARAMS);
}

export class ICStorage {
  constructor(public readonly prefix = 'ic-siwb-', private readonly _localStorage?: Storage) {}

  public get(key: string): Promise<string | null> {
    return Promise.resolve(this._getICStorage().getItem(this.prefix + key));
  }

  public set(key: string, value: string): Promise<void> {
    this._getICStorage().setItem(this.prefix + key, value);
    return Promise.resolve();
  }

  public remove(key: string): Promise<void> {
    this._getICStorage().removeItem(this.prefix + key);
    return Promise.resolve();
  }

  private _getICStorage() {
    if (this._localStorage) {
      return this._localStorage;
    }

    const ls =
      typeof window === 'undefined'
        ? typeof global === 'undefined'
          ? typeof self === 'undefined'
            ? undefined
            : self.localStorage
          : global.localStorage
        : window.localStorage;

    if (!ls) {
      throw new Error('Could not find local storage.');
    }

    return ls;
  }
}

export const storage = new ICStorage('ic-siwb-');

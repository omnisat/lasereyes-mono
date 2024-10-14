import { MapStore, WritableAtom } from 'nanostores';
import { NetworkType } from '../types';
import { LaserEyesStoreType } from './types';
export declare function triggerDOMShakeHack(): void;
export declare function createStores(): {
    $store: MapStore<LaserEyesStoreType>;
    $network: WritableAtom<NetworkType>;
    $library: WritableAtom;
};
export declare function createConfig({ network }: {
    network: NetworkType;
}): {
    network: NetworkType;
};
//# sourceMappingURL=utils.d.ts.map
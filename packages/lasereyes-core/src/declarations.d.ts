import type { LeatherProvider as LeatherRPC } from '@leather.io/rpc';

declare global {
    interface Window {
        LeatherProvider?: LeatherRPC;
    }
}

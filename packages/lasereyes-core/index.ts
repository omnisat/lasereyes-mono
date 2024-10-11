import * as lib from "./src";

globalThis.lasereyes = lib;
(window as any).lasereyes = lib;

const client = new lib.LaserEyesClient(lib.createStores());
globalThis.lasereyesClient = client;
(window as any).lasereyesClient = client;

client.$store.listen((state) => {
  console.log("state changed", state);
});

client.$network.listen((network) => {
  console.log("Network changed", network);
});

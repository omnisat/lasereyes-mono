import { defineConfig } from "vocs";

export default defineConfig({
  head: (
    <>
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content="Laser Eyes · Web Hooks For Bitcoin Ordinals"
      />
      <meta
        property="og:image"
        content="https://lasereyes.build/og-image.png"
      />
      <meta property="og:url" content="https://lasereyes.build/" />
      <meta
        property="og:description"
        content="One seamless wallet connect for your Ordinals frontend"
      />
    </>
  ),

  title: "Laser Eyes",
  description: "Web Hooks For Bitcoin Ordinals",
  sidebar: [
    {
      text: "Getting Started",
      link: "/docs/getting-started",
    },
    {
      text: "The Why",
      link: "/docs/why",
    },
    {
      text: "Contributing",
      link: "/docs/contributing",
    },
  ],
  topNav: [
    { text: "Docs", link: "/docs/getting-started" },
    { text: "Try It Out", link: "https://demo.lasereyes.build" },
    {
      text: "Laser Eyes",
      items: [
        {
          text: "Contributing",
          link: "/docs/contributing",
        },
      ],
    },
  ],
  iconUrl: {
    light: "/LaserEyesIcon.svg",
    dark: "/LaserEyesIcon.svg",
  },
  logoUrl: {
    light: "/LogoLight.svg",
    dark: "/LogoDark.svg",
  },
  socials: [
    {
      icon: "github",
      link: "https://github.com/omnisat",
    },

    {
      icon: "x",
      link: "https://x.com/Omnisats",
    },
  ],
  sponsors: [
    // { commented out
    //   name: "Collaborator",
    //   height: 120,
    //   items: [
    //     [
    //       {
    //         name: "CTRL",
    //         link: "https://seizectrl.io",
    //         image: "/CTRL.svg",
    //       },
    //     ],
    //   ],
    // },
    {
      name: "Ecosystem Partner",
      height: 60,
      items: [
        [
          {
            name: "UTXO",
            link: "https://www.utxo.management/",
            image: "/utxo.svg",
          },
          {
            name: "OrdinalsBot",
            link: "https://ordinalsbot.com/",
            image: "/OrdinalsBot.svg",
          },
        ],
        [
          {
            name: "Layer 1 Foundation",
            link: "https://layer1.foundation/",
            image: "/l1f-logo-default.svg",
          },
          {
            name: "CTRL",
            link: "https://seizectrl.io",
            image: "/CTRL.svg",
          },
          {
            name: "Sat Ventures",
            link: "https://satsventures.com/",
            image: "/satsventure.svg",
          },
        ],
      ],
    },
    {
      name: "Start Ups",
      height: 30,
      items: [
        [
          {
            name: "Leather Wallet",
            link: "https://leather.io/",
            image: "/Leather.svg",
          },
          {
            name: "Orange Wallet",
            link: "https://www.orangecrypto.com/",
            image: "/OrangeWalletLogo.svg",
          },
        ],
      ],
    },
  ],
  font: {
    default: {
      google: "Windows",
    },
  },
  theme: {
    accentColor: "#FF701E",
    colorScheme: "dark",
  },
  editLink: {
    pattern: "https://github.com/wevm/viem/edit/main/site/pages/:path",
    text: "Suggest changes to this page",
  },
});

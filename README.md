# WalkInWallet | The NFT Gallery App

<p align="left">
<img alt="Release" src="https://img.shields.io/github/actions/workflow/status/fabianbormann/WalkInWallet/release.yml?style=for-the-badge" />
<a href="https://discord.gg/Ya9M4upcjM"><img alt="Discord" src="https://img.shields.io/discord/925005287935574047?style=for-the-badge"></a>
<a href="https://conventionalcommits.org"><img alt="conventionalcommits" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&style=for-the-badge" /></a>
</p>

### WalkInWallet allows you to walk in wallets as you walk in galleries.

WalkInWallet is an open-source React project that allows you to walk through wallets as you would walk in galleries. It generates a random 3D gallery out of every NFT in your wallet. The project is based on [Babylon.js](https://www.babylonjs.com/) for the 3D rendering. The galleries are created using *the wallet address as a seed* for the random function, ensuring that a gallery would only be extended by new NFTs but never changed completely. The application is built on the [Cardano blockchain](https://cardano.org/discover-cardano/) and uses [Koios](https://www.koios.rest/) to query the chain data.

![WalkInWallet preview](https://github.com/fabianbormann/WalkInWallet/assets/1525818/3dbf9788-84e2-41bc-a0ee-601c7a082b17)

## ✨ Features

- **3D Galleries**: Explore NFTs in visually appealing 3D galleries.
- **Random Seed Based**: Each gallery is generated based on a random seed, preserving the uniqueness.
- **Koios Integration**: Query Cardano on-chain data seamlessly using Koios integration.
- **jpg.store Link**: The link displayed below every NFT will bring you directly to [jpg.store](https://jpg.store).
- **[ADA Handles](https://adahandle.com/) Support**: Resolve simple and memorable names to Cardano addresses.

## 🎬 Demo

See the project in action by visiting our [demo wallet](https://walkinwallet.com/stake1u8yf3kcjaaa6hwp9jankxql49kyh2mu02q8454zxzkvzxgg6uhtm4/2).

## 🛠️ Installation

1. Clone the repository: `git clone https://github.com/fabianbormann/WalkInWallet.git`
2. Change directory: `cd WalkInWallet`
3. Install dependencies: `npm i`
4. Start the development server: `npm start`

## 🚀 Usage

1. Make sure you have an [ADA Handle](https://adahandle.com/), stake address or payment address of a Cardano wallet containing NFTs.
2. Open the application in your browser or goto https://walkinwallet.com/<ADA_HANDLE | ADDRESS | POLICY_ID>.
3. Enjoy walking through 3D galleries!

## 🤝 Contributing

We appreciate every kind of contribution! If you want to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m 'feat: add some feature'`
4. Push the changes to your fork: `git push origin feature/your-feature-name`
5. Submit a pull request to the main repository.

Please ensure your code follows the project's coding style and that tests pass before submitting the pull request.

## 📜 License

WalkInWallet is licensed under the GPLv3 License. See the [LICENSE](LICENSE) file for more details.

## 🙏 Acknowledgments

- [Babylon.js](https://babylonjs.com) - One of the most powerful, beautiful, simple, and open web rendering engines in the world.
- [Koios](https://www.koios.rest/) - A distributed & open-source public API query layer for Cardano.

## 📞 Support

If you have any questions or need assistance, please reach out to support@walkinwallet.com or contact us on Discord.

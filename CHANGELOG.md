# Changelog

## [1.6.3](https://github.com/fabianbormann/WalkInWallet/compare/v1.6.2...v1.6.3) (2024-03-11)


### Bug Fixes

* add default Koios api token to prevent CORS issues ([effe997](https://github.com/fabianbormann/WalkInWallet/commit/effe9979ac83e360c4d44be72cfc37ca700a7254))

## [1.6.2](https://github.com/fabianbormann/WalkInWallet/compare/v1.6.1...v1.6.2) (2023-10-16)


### Bug Fixes

* repair build by fixing typescript bug ([b4c51e8](https://github.com/fabianbormann/WalkInWallet/commit/b4c51e83e07e42ccac3f3ff5c66e75f375fd6689))

## [1.6.1](https://github.com/fabianbormann/WalkInWallet/compare/v1.6.0...v1.6.1) (2023-10-15)


### Bug Fixes

* add correct config for connecting wallets on testnets, prevent axios cors error ([f11d0d5](https://github.com/fabianbormann/WalkInWallet/commit/f11d0d5dc8ec49e0b263d835f2e0b43636239a6e))

## [1.6.0](https://github.com/fabianbormann/WalkInWallet/compare/v1.5.0...v1.6.0) (2023-09-10)


### Features

* add support for preprod and preview networks ([7692893](https://github.com/fabianbormann/WalkInWallet/commit/769289338bae077efbb6f01187d0035b94e32562))

## [1.5.0](https://github.com/fabianbormann/WalkInWallet/compare/v1.4.1...v1.5.0) (2023-08-31)


### Features

* re-enable automatically firebase hosting deployment ([fb916ea](https://github.com/fabianbormann/WalkInWallet/commit/fb916ea1b91742dbf4e89a43881360bf1473a112))

## [1.4.1](https://github.com/fabianbormann/WalkInWallet/compare/v1.4.0...v1.4.1) (2023-08-31)


### Bug Fixes

* frame description was missing as the default for isOffline was always true ([bb54c6d](https://github.com/fabianbormann/WalkInWallet/commit/bb54c6d88f2068ee991dd0dd45cd66dcbc51d131))
* implement a retry mechanism for handling IPFS timeouts and increase the overall image loading experience by handling non cip25 compliant edge cases closes [#8](https://github.com/fabianbormann/WalkInWallet/issues/8) ([f4de95b](https://github.com/fabianbormann/WalkInWallet/commit/f4de95bbd4d1d3e36821eac60be7f4795d1d16ab))

## [1.4.0](https://github.com/fabianbormann/WalkInWallet/compare/v1.3.0...v1.4.0) (2023-08-30)


### Features

* add doors and change api to handle general room element rendering ([7a83f2d](https://github.com/fabianbormann/WalkInWallet/commit/7a83f2d32350de989e5bd84aa2c033a8559218b5))
* add light sources at the ceiling ([7201a9d](https://github.com/fabianbormann/WalkInWallet/commit/7201a9d1fe9fed3a3ff2497f0ba7a72c36418598))
* add real exit door to navigate back to the welcome screen ([114016a](https://github.com/fabianbormann/WalkInWallet/commit/114016ae61983d32f4c51177b2edf2cb3e803081))
* show instruction dialog for users visiting WalkInWallet for their first time ([f1a97d6](https://github.com/fabianbormann/WalkInWallet/commit/f1a97d6b42cfd4acf5575631ff2237108beb496b))
* simulate mouse click in fullscreen always from center ([f773b21](https://github.com/fabianbormann/WalkInWallet/commit/f773b210173d0c2681f0c0d71274aec0d4e943a9))


### Bug Fixes

* register double click on mobile instead of space to enter new rooms ([5439482](https://github.com/fabianbormann/WalkInWallet/commit/54394827901d200e5c1b1944e2d2637320690ff4))

## [1.3.0](https://github.com/fabianbormann/WalkInWallet/compare/v1.2.0...v1.3.0) (2023-08-08)


### Features

* enable CIP45 to connect wallets on mobile devices ([e0dbcba](https://github.com/fabianbormann/WalkInWallet/commit/e0dbcba66302d4e7f4557d3fe225af76f671181b))


### Bug Fixes

* update dependencies and connect-with-wallet button ([1460147](https://github.com/fabianbormann/WalkInWallet/commit/1460147eab338ee19072b81e17f94a3857f27857))

## [1.2.0](https://github.com/fabianbormann/WalkInWallet/compare/v1.1.0...v1.2.0) (2023-07-31)


### Features

* add adahandle and policy_id support ([edb654b](https://github.com/fabianbormann/WalkInWallet/commit/edb654b862cc68ef96d1bdbf14b45a551d79c1e1))
* add link to jpg.store ([f063491](https://github.com/fabianbormann/WalkInWallet/commit/f063491e9eb76065949dfaac5b282c52b0ae7272))
* add room pagination and fix button connect with wallet settings ([cfe5c2e](https://github.com/fabianbormann/WalkInWallet/commit/cfe5c2e7fd3a50c45af03f8ea1a0c5a1b9d23a50))
* use caching to prevent spamming koios with requests ([339dc4a](https://github.com/fabianbormann/WalkInWallet/commit/339dc4a42f3038e8e9fc9e1de2f1f29f14b0e985))

## [1.1.0](https://github.com/fabianbormann/WalkInWallet/compare/v1.0.1...v1.1.0) (2023-07-30)


### Features

* use koios community service instead of blockfrost ([8dcf2f0](https://github.com/fabianbormann/WalkInWallet/commit/8dcf2f0cbbf9bc25a56b14138d9f9cc547fa95ea))


### Bug Fixes

* remove functions folder and adjust deployment to use koios instead of blockfrost ([6239d53](https://github.com/fabianbormann/WalkInWallet/commit/6239d533a80811015ace3b656e5b999f18c6b2b1))

## [1.0.1](https://github.com/fabianbormann/WalkInWallet/compare/v1.0.0...v1.0.1) (2023-01-18)


### Bug Fixes

* deploy only on PR for main ([8a1a301](https://github.com/fabianbormann/WalkInWallet/commit/8a1a3012b6b4340d4155c8d9443d9276f060876f))
* remove function deployment for now ([a8b7985](https://github.com/fabianbormann/WalkInWallet/commit/a8b798515b15be34104df944055f1653cccb32a5))
* repair deployment workflow ([988facb](https://github.com/fabianbormann/WalkInWallet/commit/988facb615c68b22d9d33576bc579bfc3290d31b))
* repair deployment workflow ([7b354b1](https://github.com/fabianbormann/WalkInWallet/commit/7b354b14806aaaff51960ef80a9f4c091d85ec68))

## 1.0.0 (2023-01-17)


### Features

* add github actions for release please and firebase deployment ([ddb5777](https://github.com/fabianbormann/WalkInWallet/commit/ddb57777075e45b09c45becb38d1af5e49adf3b7))
* update babylon version and publish code under GPLv3 license ([b39cf0c](https://github.com/fabianbormann/WalkInWallet/commit/b39cf0c5bfc14ede0cc4e8ff378689ba65f15f09))


### Bug Fixes

* adjust github workflow ([5856283](https://github.com/fabianbormann/WalkInWallet/commit/58562837aa85ac79ca0dcfb795e0c3b62a1ea54f))
* reset version ([20ec110](https://github.com/fabianbormann/WalkInWallet/commit/20ec11063f48b7771e584dfe9ecf524409dc4fb4))

# Changes

## [2.1.0](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v2.0.3...cyclistsofmsn-backend-v2.1.0) (2024-11-25)


### Features

* add atproto support ([4bde062](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/4bde0626c5027d470fdcd629da97e53a69e8a278))

## [2.0.3](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v2.0.2...cyclistsofmsn-backend-v2.0.3) (2024-11-03)


### Bug Fixes

* issue posting due to null focus and/or description fields ([f68c19e](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/f68c19e33a4bcc243b92f56299e713fc0e2b8869))

## [2.0.2](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v2.0.1...cyclistsofmsn-backend-v2.0.2) (2024-11-01)


### Bug Fixes

* bump exifreader from 4.23.5 to 4.25.0 ([594480f](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/594480f3ea12c8156ae727e8e25f2370d1f0e9cf))
* bump pino from 9.4.0 to 9.5.0 ([17cf993](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/17cf9934f50399abb4c0a6369511efc8160fe8fd))
* bump pino-pretty from 11.2.2 to 11.3.0 ([6bce9d0](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/6bce9d038b0f14afe8c0b5a92a521a40632473ea))
* enforce no circular dependencies in lint ([5be7e66](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/5be7e660b5cf46b76ecd8491cc494fd598f67d9a))
* invalid cache key generation ([03a7432](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/03a7432def9ca7e8bc20aa17a99716100726e0a5))
* should mask mongodb password in uri ([3aae230](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/3aae2301ff5ae91728d4f2fe26b044b03ccf0da2))

## [2.0.1](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v2.0.0...cyclistsofmsn-backend-v2.0.1) (2024-10-31)


### Bug Fixes

* use memory in dev mode for cache, valkey instead of sqlite in production ([91795f8](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/91795f85cb195767f086da192dfa2613e254b80d))

## [2.0.0](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.1.1...cyclistsofmsn-backend-v2.0.0) (2024-10-31)


### ⚠ BREAKING CHANGES

* remove internal scheduling, instead rely on external cron w/exposed endpoints in API

### Features

* production build archived with release ([ebe1a7d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/ebe1a7d62c3a6a533f7531092568859d1173c9f9))
* remove internal scheduling, instead rely on external cron w/exposed endpoints in API ([14f2b85](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/14f2b8533cba88901ae7c794675a59a3cc5667bf))


### Bug Fixes

* add coverage to eslint exclusions ([98bf904](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/98bf9048c736d29c394b6bb27b9731226fcff107))
* bump @typegoose/typegoose from 12.2.0 to 12.4.0 ([51b3920](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/51b39206bdbbc6876dbbadf44de184cb483ab011))
* bump @typegoose/typegoose from 12.4.0 to 12.5.0 ([e12a5c1](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/e12a5c1f264ada7a92be16b1e1c628517ac26253))
* bump @typegoose/typegoose from 12.5.0 to 12.6.0 ([bb01825](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/bb01825cf1b8570ddf5b1cff34d2ee06ae1fc527))
* bump @typegoose/typegoose from 12.6.0 to 12.7.0 ([b2f73b3](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/b2f73b36331b6329034ad13f92c1fa7faac2f185))
* bump @typegoose/typegoose from 12.7.0 to 12.8.0 ([6eff40a](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/6eff40afb89086b9f8c13070dfc2e21a1ad59c6d))
* bump date-fns from 3.6.0 to 4.1.0 ([c060b73](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/c060b737a5bf3bf1fa58876c9450f8a2c908444c))
* bump exifreader from 4.21.1 to 4.22.1 ([a156d19](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a156d190016841380d5a89bf7fc5d724ed2b8887))
* bump exifreader from 4.22.1 to 4.23.2 ([8532744](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/85327446805b1686f367b3aff0a3d2d9317e349f))
* bump exifreader from 4.23.2 to 4.23.3 ([f058326](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/f058326f2efbbe9a81dde8974fa8366605f40296))
* bump exifreader from 4.23.3 to 4.23.5 ([7c7384e](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/7c7384e23acabf295b7997a7dca84c8c753aa768))
* bump helmet from 7.1.0 to 8.0.0 ([3e2293e](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/3e2293ea1797ba3b92d0345849525c49c806525b))
* bump lru-cache from 10.2.0 to 10.2.2 ([256d7d0](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/256d7d0057fa7c1c86b06f068689ef83baeec75e))
* bump lru-cache from 10.2.2 to 10.3.0 ([488d2a4](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/488d2a4a1380bf528fb15a0f9308012096be01a9))
* bump lru-cache from 10.3.0 to 11.0.0 ([ac90d17](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/ac90d171578e175521aa323db3bff83c86b0c5c9))
* bump lru-cache from 11.0.0 to 11.0.1 ([e19224a](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/e19224afd31ea021bc962a018759b1c91e6059f6))
* bump pino from 8.19.0 to 9.0.0 ([5f51ea9](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/5f51ea9ac25e1c1df127e48c00251223ee88ab2e))
* bump pino from 9.0.0 to 9.1.0 ([790b1a5](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/790b1a5fe874c02015fbaa69af79c466515c2dc6))
* bump pino from 9.1.0 to 9.2.0 ([d271c3d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/d271c3d061d618fb7fcb2d9b99c627c26786fb97))
* bump pino from 9.2.0 to 9.3.2 ([b276e6d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/b276e6d1c69947d39c08d81009206ee70290dbce))
* bump pino from 9.3.2 to 9.4.0 ([a45850b](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a45850bc2c8511fd6b3ae7834dd76ea38ac42296))
* bump pino-pretty from 11.0.0 to 11.1.0 ([df2ed7b](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/df2ed7b1fa349a67a7168ca3de01c4f8d61766fb))
* bump pino-pretty from 11.1.0 to 11.2.1 ([5403718](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/5403718e5b7c70b4e869765cfccbcf000f140bb3))
* bump pino-pretty from 11.2.1 to 11.2.2 ([336075b](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/336075bb001fcbbfbd8de2486f95ce6222504b13))
* bump pm2 from 5.3.1 to 5.4.0 ([ff7f2c5](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/ff7f2c5c040826e76f5a0865d9fa5ea9b4022f26))
* bump pm2 from 5.4.0 to 5.4.1 ([4e7fae0](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/4e7fae080acd980eb0de40ca1a781892c4bc1c19))
* bump pm2 from 5.4.1 to 5.4.2 ([0b3ccc3](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/0b3ccc34264157f682f06b4c0c5ce60740c9a047))
* bump redis from 4.6.13 to 4.6.14 ([11ebb48](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/11ebb4893cdbbc48feb28d1e827f17421364578b))
* bump redis from 4.6.14 to 4.7.0 ([a5029f2](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a5029f26383901ee0f91ac4bf0dc25bb20bbde56))
* bump superagent from 8.1.2 to 9.0.2 ([ce6a76d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/ce6a76d4ef4f7f59ac06e312d7e8f4a8ad75da7d))
* bump superagent from 9.0.2 to 10.1.0 ([378b7e3](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/378b7e3aa70ae89199de58063d9b49f69385baa0))
* bump zod from 3.22.4 to 3.23.5 ([5c0ad52](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/5c0ad52c98551642bbb77fee11553816e1d6b967))
* bump zod from 3.23.5 to 3.23.8 ([e4fa50d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/e4fa50d310b45bb1de8a3f352f83f961c900c4d4))
* cron routes weren't working properly, add test cases ([ee0abcb](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/ee0abcb03c9765e1f4693616d230a56c39ace509))
* incorrect use of for await () of ([e801777](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/e80177738188ab0ba013406b78ee8b0f4db39b0b))
* lint errors ([7b4af58](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/7b4af58135132f933c30a9c8a29bf71691292bab))
* migrate to eslint 9 and flat file config ([c7c0968](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/c7c0968dbe2c31cf59f238201b20f3b2392f806e))
* remove incorrect use of "for await" loop in server shutdown ([3b51dbc](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/3b51dbc3a377eda90b17d21ddddbff583fe95ff2))
* remove pm2 as dependency ([a4bc9ce](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a4bc9ce81110aa1e2f000af996188c1072ef1a19))
* remove scheduling component, use external cron on server instead ([d22c0d7](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/d22c0d747fcfb5b8fc785c168d4f0c8425ca6801))
* rename cron endpoint to dispatchPost ([32db633](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/32db6338b5c0e05bf78ccd8b8cf9619595c9666b))
* update to express 5.0.1 ([bb6a18d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/bb6a18d27887fe86065b023bb34407a7498fc9a2))
* updated eslint config ([6450d1c](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/6450d1c09e01365c03e191cb19c154b97d195a8d))
* use fs_cache w/sqlite for caching images ([d537fa1](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/d537fa15f2de7d7a87d88067f6c2f52ba2a7f42a))
* use new husky script reqs ([0ecbb7c](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/0ecbb7c7a26a330581d97eff2e0fca65fae3e025))

## [1.1.1](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.1.0...cyclistsofmsn-backend-v1.1.1) (2024-04-17)


### Bug Fixes

* scan for new files when populating posts ([a922177](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a9221779b37e826c09f5c44b062d225810ce22df))

## [1.1.0](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.0.9...cyclistsofmsn-backend-v1.1.0) (2024-04-03)


### Features

* add backend version number api ([4bf6790](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/4bf67908f591f18d5c9b3d663bbfb8146dfebefb))

## [1.0.9](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.0.8...cyclistsofmsn-backend-v1.0.9) (2024-04-02)


### Bug Fixes

* ecosystem startup uses wrong path ([bd22a2f](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/bd22a2fa0af7a1957d0e97ae7b00437c5db7e020))

## [1.0.8](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.0.7...cyclistsofmsn-backend-v1.0.8) (2024-04-02)


### Bug Fixes

* bump date-fns from 3.5.0 to 3.6.0 ([d1ecf6a](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/d1ecf6ac187c38ecd8f028d11b566350309a09a5))
* bump date-fns from 3.5.0 to 3.6.0 ([745a86b](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/745a86b099a64bef325688d76b6ab43fcaff932d))
* bump pino-pretty from 10.3.1 to 11.0.0 ([d47a07f](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/d47a07fb9550d3bed367898d967a9926a6f2cfd2))
* bump pino-pretty from 10.3.1 to 11.0.0 ([d2f31db](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/d2f31db4896d90c9ce98ab15005a34b5307d8211))
* more strict lint fixes ([b49a1dc](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/b49a1dc8eaac53f610bd32f33f32f9d9a502646c))

## [1.0.7](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.0.6...cyclistsofmsn-backend-v1.0.7) (2024-03-26)


### Bug Fixes

* don't need ts-node at runtime any more ([102b9b0](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/102b9b04bb51aab3ec17d807a2596f48220666d8))

## [1.0.6](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.0.5...cyclistsofmsn-backend-v1.0.6) (2024-03-26)


### Bug Fixes

* errors related to async dispatcher ([7cf2788](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/7cf27885c4cf01fcb0ef34df3838b0f972576577))

## [1.0.5](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.0.4...cyclistsofmsn-backend-v1.0.5) (2024-03-26)


### Bug Fixes

* update release to set major/minor release tags ([23ba7e1](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/23ba7e1bcf7dfba84a57b58a7f40c1087d73fda5))

## [1.0.4](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/cyclistsofmsn-backend-v1.0.3...cyclistsofmsn-backend-v1.0.4) (2024-03-26)


### Bug Fixes

* update pm2 config to run dist and run raw js files ([6e35d87](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/6e35d8715a0f115076e77f1f22485ca1126ec1b8))

## 1.0.3 (2024-03-25)


### Features

* change description in image files ([7123fc2](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/7123fc249a4df498554d63f8ea1f6ab57b077068))


### Bug Fixes

* adapt to typegoose 12 signatures ([07e215d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/07e215df87e16aa1f20eea42473e75e97a1fbcce))
* adapt to typegoose 12 signatures ([30581f9](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/30581f9c304239800addc2e006ccf1bcc4edd865))
* add migration tool to push descriptions from database back to images ([f59fe77](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/f59fe779df7c73a494e561e42baf4ef8a703fe74))
* allow unauthenticated requests for postlist ([d75f741](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/d75f74148bd7bb56ae1ad9a62c3226e41aa7768a))
* better handling of update file metadata ([71f4bdf](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/71f4bdf6c8105f4a466990acc6c38b00f7c88194))
* bump @typegoose/typegoose from 11.0.2 to 11.1.0 ([e82ee63](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/e82ee63b5d4605e1f848b01c1dd84ce53c9aa835))
* bump @typegoose/typegoose from 11.1.0 to 11.2.0 ([eec6612](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/eec6612743cd0d3e729d454478ad8849e588da39))
* bump @typegoose/typegoose from 11.2.0 to 11.5.0 ([57d666f](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/57d666f2478982518149557bea1a960e0883f078))
* bump @typegoose/typegoose from 11.6.0 to 12.0.0 ([e8af593](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/e8af593e7b7417dae0ea20751b92a2975f85e6da))
* bump @typegoose/typegoose from 11.6.0 to 12.0.0 ([b143803](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/b14380314ecdf18f5c9a7342b4c7720600c75e29))
* bump @typegoose/typegoose from 12.0.0 to 12.1.0 ([a9b1774](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a9b177418e65437e521d5065068f6de077d0187b))
* bump @typegoose/typegoose from 12.1.0 to 12.2.0 ([7d85797](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/7d8579744c254172b8cefe0458e0e054b4d85598))
* bump connect-redis from 7.0.1 to 7.1.0 ([982e527](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/982e5276e9eaa41d19897c36091763431e2d342b))
* bump connect-redis from 7.1.0 to 7.1.1 ([8526add](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/8526add43926e57b7099c3258dfc52d74561df76))
* bump date-fns from 2.29.3 to 2.30.0 ([6730185](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/6730185baad5d0b2f3ae5003ec1f55865fe524ec))
* bump date-fns from 2.30.0 to 3.0.6 ([5072643](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/507264332c1f6ea8bc824508e2cc764b27f53db9))
* bump date-fns from 3.0.6 to 3.3.1 ([be738c8](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/be738c85b19e6c0a28ec3de83ee1cfde6167d1df))
* bump date-fns from 3.3.1 to 3.5.0 ([08bc9eb](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/08bc9eb7ceab22cd01e5a556acf467e13918a1c9))
* bump dotenv from 16.0.3 to 16.1.4 ([87efa4c](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/87efa4c02e612678c12ddf550ffa54da7e1670fd))
* bump dotenv from 16.1.4 to 16.3.1 ([a5a3f6f](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a5a3f6f1ee07c4aad890c3ced60e6b8c0051ffcb))
* bump dotenv from 16.3.1 to 16.4.1 ([324340c](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/324340cd70e600209f409a764183886e2087b580))
* bump dotenv from 16.4.1 to 16.4.5 ([dad74ae](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/dad74ae7c18b365c3a3701a53040f3f6f51ba3eb))
* bump exifreader from 4.12.0 to 4.12.1 ([eaeeef2](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/eaeeef24e2e76e77c55195cc1b5469c44c45442e))
* bump exifreader from 4.12.1 to 4.13.1 ([2c8d4f0](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/2c8d4f0882ab956b6d5d728d36ea392e824d46c2))
* bump exifreader from 4.13.2 to 4.16.0 ([3213adc](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/3213adc77ce0b499562d93bb2a8bb463e6317040))
* bump exifreader from 4.16.0 to 4.17.0 ([cb48b17](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/cb48b17441d49c3a1289974cd5e653217de36c5c))
* bump exifreader from 4.16.0 to 4.17.0 ([fd4fb2a](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/fd4fb2a2f085f8ff0597dbb7677592a037475df8))
* bump exifreader from 4.16.0 to 4.17.0 ([df9a86f](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/df9a86f8447897a1e9c0e0c5879c2e1e089aa619))
* bump exifreader from 4.17.0 to 4.20.0 ([62536c8](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/62536c8e7c8a8983e22ec729deda8ad1d7ea1976))
* bump exifreader from 4.20.0 to 4.21.0 ([051fc95](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/051fc95aa13843c36df09a130a0737790e431f23))
* bump exifreader from 4.21.0 to 4.21.1 ([3ebd8df](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/3ebd8df35a5b6869f3fe8706a59aac036a6d37a5))
* bump express from 4.18.2 to 4.18.3 ([d4d5241](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/d4d5241d59f318d891dba29ae63f4c5ade53488b))
* bump express-session from 1.17.3 to 1.18.0 ([46cca6b](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/46cca6b52c54cdb34feb04bd1d905cce557f29b9))
* bump helmet from 6.1.5 to 7.0.0 ([f15f6d2](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/f15f6d2dd72ed3654c762e1c0db83d5c0f603484))
* bump helmet from 7.0.0 to 7.1.0 ([448f78c](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/448f78c4e8aa32f857b0e1c308020085a4ae6395))
* bump helmet from 7.0.0 to 7.1.0 ([7b61bc5](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/7b61bc5a856cdcb23943f5ba68bcfb436e7b6aa7))
* bump lru-cache from 10.0.1 to 10.1.0 ([8fa9ba8](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/8fa9ba87e9d15cf0d599235496d80060cd72bbc7))
* bump lru-cache from 10.0.1 to 10.1.0 ([316484f](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/316484f0f42b0faadb521b06b2b28c26edcaef6e))
* bump lru-cache from 10.1.0 to 10.2.0 ([87a3b0e](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/87a3b0ef3a3a2307650c80729c2cf71042e4e1ad))
* bump lru-cache from 9.0.3 to 9.1.1 ([1acd81d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/1acd81d71a34d2fa78791bf34053c90fe2211c83))
* bump lru-cache from 9.1.1 to 9.1.2 ([f96adf7](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/f96adf70a5261cc89a6ecdfebae0e92498d8166a))
* bump lru-cache from 9.1.2 to 10.0.1 ([2a27185](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/2a27185c762853f606d3f31bf19127fe471597a7))
* bump mongoose from 7.0.4 to 7.0.5 ([5970afc](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/5970afcfca9fc77cd6a56b87737805923a80b26e))
* bump mongoose from 7.1.0 to 7.1.1 ([edf94f2](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/edf94f2f440cce222a093fba913ff9c44ec5c630))
* bump mongoose from 7.1.1 to 7.1.2 ([9c01d6b](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/9c01d6b6d5787786b30c9ef84018955ff260a82d))
* bump mongoose from 7.2.0 to 7.2.1 ([c2e60eb](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/c2e60eb2169aae10a883f4928bf40ef691f8063c))
* bump mongoose from 7.2.1 to 7.2.2 ([f752fe4](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/f752fe4634ae4f0754b0a51729f6d3ea6f4f94b6))
* bump mongoose from 7.2.2 to 7.2.3 ([a33396c](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a33396c37d6eb6c06ac422371baa9895563a4ba1))
* bump passport from 0.6.0 to 0.7.0 ([b824ebc](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/b824ebcef011f7871b34015a8e07e7365c46add8))
* bump passport from 0.6.0 to 0.7.0 ([9572ff6](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/9572ff64255447d347822d7341a0a08a29845883))
* bump pino from 8.11.0 to 8.12.1 ([6e5b4db](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/6e5b4dbfbfee35fd79f1b8575783321df13a7a82))
* bump pino from 8.12.1 to 8.14.1 ([1c40160](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/1c40160098371e2ecc2ce4e935987711194ef75d))
* bump pino from 8.14.1 to 8.15.0 ([7fadddc](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/7fadddceb4f2a00816a393f839794f9057a0c035))
* bump pino from 8.16.0 to 8.16.1 ([57905ce](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/57905ce4fd63727be80f198d53ef80108115d237))
* bump pino from 8.16.1 to 8.16.2 ([de8fe73](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/de8fe73740e0ad1a2e9db83562cf77289bee7f47))
* bump pino from 8.16.2 to 8.17.2 ([1d0a969](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/1d0a96965ec75359a2ac0fa7a484e501140506fe))
* bump pino from 8.17.2 to 8.19.0 ([53641be](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/53641be5e61e655adb40b81e301301de0f42eac8))
* bump pino-pretty from 10.2.3 to 10.3.1 ([99076fa](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/99076fa61af4239e308cd5b401d99323efa67523))
* bump pm2 from 5.3.0 to 5.3.1 ([22934aa](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/22934aae0e116ca2a4a953a2b9c0c23b09565c08))
* bump redis from 4.6.10 to 4.6.12 ([323b905](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/323b905dc4c06d587f73c1ed557470f0c79ae1d1))
* bump redis from 4.6.12 to 4.6.13 ([c2f97f4](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/c2f97f4b9f902df9786714ea61b41f226df77c52))
* bump redis from 4.6.5 to 4.6.6 ([9fbbd61](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/9fbbd6103d938b0d232dbd53544fd320d842de5d))
* bump redis from 4.6.6 to 4.6.7 ([3421688](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/342168899971b2020a59459e6f405c7aaf47f282))
* bump reflect-metadata from 0.1.13 to 0.2.1 ([653891f](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/653891fc728d7c80641f8b55f4f5ffb882c593fc))
* bump sharp from 0.32.0 to 0.32.1 ([b35bf48](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/b35bf48fe5707b1441028fb2957939d5717cfe03))
* bump sharp from 0.32.6 to 0.33.1 ([12bb4b5](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/12bb4b5814847519f572199c9cbf226d801e441a))
* bump sharp from 0.33.1 to 0.33.2 ([3eab6a7](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/3eab6a788e43e3ff1f61e2f40bc8eb74f9ca219f))
* bump ts-node to work with TS &gt;= 5.3 ([f01a599](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/f01a5992733a5cdbbb1fe00ef189760aaa3e4a8b))
* bump tsyringe from 4.7.0 to 4.8.0 ([7fd780a](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/7fd780a798eac23b9998992d7d0acdb9a172b206))
* dyamic log level for some errors to reduce clutter ([dfd2cf0](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/dfd2cf0123d20ce3debb2f4876c98030b9f92cb0))
* eliminate es2019 target ([1a2d963](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/1a2d9638baf28a4c8bc5c36d534dc0bc2e5550af))
* filter out p-limit from package-updates npm run ([600c0f6](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/600c0f6db37ecb221b6d2ea4cebea4aa1010e371))
* handle potentially undefined level in targets ([a855c87](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/a855c8741335061dfbddcf34fda4812bd19e1c9d))
* inverted image description flag ([64064d9](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/64064d9439246fb77ee5e33946bf0fc32b27bffc))
* lint issue ([2baf3d4](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/2baf3d443fc21c67271e5857f56346d48a01e0a5))
* logging error in dispatcher ([99275d5](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/99275d557767cd4edb76028bc3f735d9f339b29b))
* metadata migration tool not properly limiting processes ([9d6aa4d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/9d6aa4dd92aa08c76bf24297b86615d8d7e9060f))
* migration tool should just migrate all images with descriptions ([04d23b5](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/04d23b580749be245d8afd1198e4b37545c98a8d))
* minor cleanups to exiftool and test resource location ([3accb7e](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/3accb7ea3f770862185ccdaeac01b2cba3d18274))
* proper error handling for the migration ([c1b68d8](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/c1b68d8d8286285ace2882ca7b59a63689850f5f))
* remove unnecessary setting of description_from_exif, prepare for removal in future ([0d943ae](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/0d943ae357c2d08f4ffd79c9de74b7f9463164b4))
* resolve test config from test container ([8c4d026](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/8c4d02605002fab4ba92904040d056339a518740))
* revert sharp to 0.32.6 to avoid deployment errors on opalstack ([e9a5d51](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/e9a5d51645bcda8d138b5754085e6e81f3fb3051))
* rework exiftool to perhaps be safer ([356dbe4](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/356dbe4345b63fd8e340b696b5726ec09c25fa92))
* store image width/heigh metadata to allow smarter viewing options ([ae925e6](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/ae925e6401c1bcb29df46c8c59c85f265a9f2475))
* style checks ([ba5a87c](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/ba5a87c87c79e36b984277429889ed2eee29f65c))
* use args file for exiftool description ([e170f3c](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/e170f3c424e3ad5367d3405fb6e3141c36cc3d08))
* use parse instead of remove parseDate ([983f02d](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/983f02d22523ed595c8edc7d42877a3ab113845a))
* working exiftool description update ([42cf073](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/42cf073cd081e182326955559db44e6481cbd36c))


### Miscellaneous Chores

* release 1.0.3 ([8e2dd29](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/8e2dd292846581b70f984108558e596ac69e6981))

## [1.0.2](https://github.com/madisonbikes/cyclistsofmsn-backend/compare/v1.0.1...v1.0.2) (2023-01-12)

### Bug Fixes

- cannot use "version" collection, it's reserved ([4bdeec1](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/4bdeec1ee497ffccf824181ef680e7bf72c9efe2))
- limit the number concurrent scan processes ([4763ae9](https://github.com/madisonbikes/cyclistsofmsn-backend/commit/4763ae9aff579c4aeee532f7c9e7ea116648db59))

## 1.0.0 (2023-01-12)

### Features

- Initial release. Support for Mastodon and Twitter.
- Lots of other stuff

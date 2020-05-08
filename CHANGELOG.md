# [](https://github.com/AliceO2Group/Bookkeeping/compare/v0.2.0...v) (2020-05-08)


### Bug Fixes

* Added executable permission on docker build script ([2299c2d](https://github.com/AliceO2Group/Bookkeeping/commit/2299c2de9f11929e30b0d7a3f189bd2448bf5fd7))
* addressed bug that brought down code coverage ([9d6608f](https://github.com/AliceO2Group/Bookkeeping/commit/9d6608f7aeb798bcf744b72827c67d33267efcdf))
* Addressed bug which would cause log detail page to fetch every log entry ([2a87b58](https://github.com/AliceO2Group/Bookkeeping/commit/2a87b5824f0fcea2b2e3e8a42c5eee88eb5892f1))
* database should use UTF-8 encoding ([344c1c9](https://github.com/AliceO2Group/Bookkeeping/commit/344c1c9ddab572da314dc07fcdbf0173a0699cf5))
* Fix the mapping error (x is undefined)  in the detail view ([60eda29](https://github.com/AliceO2Group/Bookkeeping/commit/60eda293793dab1947845900b335052688d9b9a1))
* route error handler should distinguish between async and regular functions ([5bbd025](https://github.com/AliceO2Group/Bookkeeping/commit/5bbd025a28d33bf3746a5b0e8e0bd76677daa197))
* use try catch to return instead of Promise catch ([7373267](https://github.com/AliceO2Group/Bookkeeping/commit/7373267b9f8363353161bf21c5b3a0d3183f5117))
* **docker:** added missing node_modules volume ([cce1233](https://github.com/AliceO2Group/Bookkeeping/commit/cce123384c7e945ffb2bde9405b44184ce40982e))
* **docker:** production compose should expose port 80 ([302c745](https://github.com/AliceO2Group/Bookkeeping/commit/302c745ae7e601bb5c1e211968ffd16514255c47))
* **docker:** wait for database to be up ([c6c3fd7](https://github.com/AliceO2Group/Bookkeeping/commit/c6c3fd79a8be8ec57818f5e9255228ed201c6f22))
* **spec:** use relative instead of absolute server url ([90d7cb8](https://github.com/AliceO2Group/Bookkeeping/commit/90d7cb86eca90a44df5daa0c5e7656d8336e3d6d))
* **test:** test should only start the application once ([df16d2d](https://github.com/AliceO2Group/Bookkeeping/commit/df16d2de56ed46eec1a09ad9077309ee15896bda))


### Features

* added Application interface ([3c3b488](https://github.com/AliceO2Group/Bookkeeping/commit/3c3b488c3fe315d309da980445d50cd795153b70))
* added Configuration ([57655be](https://github.com/AliceO2Group/Bookkeeping/commit/57655be667cd6828449123468b2738ff4bc2a3dd))
* added count method to Repository ([d8319b5](https://github.com/AliceO2Group/Bookkeeping/commit/d8319b55bee85c0c57b7a429ab2b6f6da4b0ef6e))
* added CreateLogUseCase ([5e24f73](https://github.com/AliceO2Group/Bookkeeping/commit/5e24f73fdb436f01bf9e9eaad3f13ab3ea1ab14b))
* added Database interface ([fdf97e2](https://github.com/AliceO2Group/Bookkeeping/commit/fdf97e2e8c6a3b8b1ed9c5efec1dd85870014324))
* added dedicated test database ([0e905a5](https://github.com/AliceO2Group/Bookkeeping/commit/0e905a584a6d4e9862f74776a4df4d319fdf924e))
* added GetDeployInformationUseCase ([eac217f](https://github.com/AliceO2Group/Bookkeeping/commit/eac217fe49bdc193cf637772af21e933683e9e97))
* added isInTestMode method to Application ([e56c70d](https://github.com/AliceO2Group/Bookkeeping/commit/e56c70dd72b514c2f9193a59f1ed03c7556bf4d5))
* added Log adapter ([fed335a](https://github.com/AliceO2Group/Bookkeeping/commit/fed335a73dae483b9be3794b90e448154dcf1031))
* added Log model and repository implementation ([be96df7](https://github.com/AliceO2Group/Bookkeeping/commit/be96df7188ac6d0396738d4404952b9883ee8526))
* added Logger interface and implementation ([015859b](https://github.com/AliceO2Group/Bookkeeping/commit/015859b1a3460fc78cfaf56193bd2d7eddf4df3f))
* added population sql ([cc1d9b5](https://github.com/AliceO2Group/Bookkeeping/commit/cc1d9b5054b6e5ae1bf78870e1811c70bddeae2d))
* added Sequelize CLI ([d45658b](https://github.com/AliceO2Group/Bookkeeping/commit/d45658bdb8a66383a6ad29c674a04d86cf0da56f))
* added Sequelize database ([a5d80b8](https://github.com/AliceO2Group/Bookkeeping/commit/a5d80b87dc349401d6df3fd22498c1ffa9f43d45))
* added Sequelize migration ([bcdfb40](https://github.com/AliceO2Group/Bookkeeping/commit/bcdfb40940795e5e96d70e0efe7d7ca75b64ffb2))
* added Sequelize seeder ([b3301c7](https://github.com/AliceO2Group/Bookkeeping/commit/b3301c7ba2332f117ece3d2194da7ad03882403c))
* added Structure package ([ca7dcc6](https://github.com/AliceO2Group/Bookkeeping/commit/ca7dcc657b6d0e5a20ee6715f54aa7579cf0040d))
* added TransactionHelper ([4649722](https://github.com/AliceO2Group/Bookkeeping/commit/4649722160b94408c546bde6e0154e0f77ce002b))
* implemented graceful shutdown process ([0088052](https://github.com/AliceO2Group/Bookkeeping/commit/0088052b74dce052231efe87e401658ccf0c3687))
* mount MariaDB data directory on host ([11f0e56](https://github.com/AliceO2Group/Bookkeeping/commit/11f0e567535933d3c669d965e5a811f8cf805172))



# [R.Arsenic.sp2.v0.1.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.1.0...v) (2020-04-24)


### Bug Fixes

* **docker:** production compose should expose port 80 ([302c745](https://github.com/AliceO2Group/Bookkeeping/commit/302c745ae7e601bb5c1e211968ffd16514255c47))
* **docs:** markdown depth ([a30cbb6](https://github.com/AliceO2Group/Bookkeeping/commit/a30cbb617a27fddfed2436358c838e8a290d621e))
* Added code for coverage compatibility in the tests ([8301188](https://github.com/AliceO2Group/Bookkeeping/commit/8301188b08f97ca779dd833d5256b7e0715d1460))
* Added licenses ([fd0a064](https://github.com/AliceO2Group/Bookkeeping/commit/fd0a0644c734cd117347d9a6cd4d0785bc192198))
* Adjusted in indent in Model.js ([e80ae57](https://github.com/AliceO2Group/Bookkeeping/commit/e80ae5702e5fb8ba872e07ba1943e58aebbc40a5))
* Changed the structure of the tests and added an empty line between methods in Overview.js ([ce16582](https://github.com/AliceO2Group/Bookkeeping/commit/ce16582c1b0418a62a73fb652992b9d0a2a07933))
* Extended timeout on the filter test ([2ae6781](https://github.com/AliceO2Group/Bookkeeping/commit/2ae67812d188d3d01d99c240ed6ef92593e8830a))
* Fixed appendPath utility and its test ([334d4c2](https://github.com/AliceO2Group/Bookkeeping/commit/334d4c2a688a29ccf70d7b01e6a2738df504144e))
* Fixed deepmerge in appendPath utility ([2d51a70](https://github.com/AliceO2Group/Bookkeeping/commit/2d51a70899bb34ab630f74affa88c3e9e6cf90dd))
* Fixed indentation ([4fc26d6](https://github.com/AliceO2Group/Bookkeeping/commit/4fc26d61c3d801f491afc23df537ae235d7cd088))
* Fixed jdoc in controllers and routes ([ca86375](https://github.com/AliceO2Group/Bookkeeping/commit/ca8637565bd94c6a29fe0ad46c84802de13914d1))
* Fixed linting erros ([d201276](https://github.com/AliceO2Group/Bookkeeping/commit/d20127685c87484730cfcf45662e9f52333b6814))
* Fixed route argument inheritance issue ([a8134fd](https://github.com/AliceO2Group/Bookkeeping/commit/a8134fd3fe92808782a4b969870a8b905b78dd72))
* Fixed the compatiblity issue with Firefox ([70b7d1a](https://github.com/AliceO2Group/Bookkeeping/commit/70b7d1a07e88487468b3129f22649639511d81f2))
* NGINX does not yet have a production configuration ([94955e1](https://github.com/AliceO2Group/Bookkeeping/commit/94955e13d71556ae41d2b29cbc7dbcd4ab4f7ca3))
* Removed the tags header, added comment in the start-dev script for its purpose ([2424e0b](https://github.com/AliceO2Group/Bookkeeping/commit/2424e0b0b8d9b735ba1af59f41ac45a75ab99123))
* Renamed tag and user controller to be a bit more verbose ([b0de0c6](https://github.com/AliceO2Group/Bookkeeping/commit/b0de0c62f285f916035bbc9e2205f2532d1f7fb3))
* route /tag is not plural ([efecacd](https://github.com/AliceO2Group/Bookkeeping/commit/efecacd73316fe40de2c687c73e666fa92d39ed8))
* starting the application via NPM not Node ([860b5ab](https://github.com/AliceO2Group/Bookkeeping/commit/860b5aba8b161002bc41e24ada520a5457aa34a5))
* starting the application via NPM not Node ([8d444a9](https://github.com/AliceO2Group/Bookkeeping/commit/8d444a91f32358972628bbdb7f3f6328bf392b44))


### Features

* Added appendPath to route builder ([d3d3ebd](https://github.com/AliceO2Group/Bookkeeping/commit/d3d3ebd7a8db7454e6d40bb2b5a9458f58980e7d))
* added appendPath utility ([9a740ad](https://github.com/AliceO2Group/Bookkeeping/commit/9a740ad4d3bbe7d31857e72c9099012e62ea9704))
* Added attachment endpoint ([dfba079](https://github.com/AliceO2Group/Bookkeeping/commit/dfba079de104e199c70d10311be468ed3fad8f77))
* Added auth endpoints ([39066f8](https://github.com/AliceO2Group/Bookkeeping/commit/39066f836ed10374a052f62ef5e348299d5886f6))
* Added createpdf endpoint ([724f854](https://github.com/AliceO2Group/Bookkeeping/commit/724f85462f11f4adf9adb685e0cddd67ff28de61))
* Added deepmerge dependency ([e854ac3](https://github.com/AliceO2Group/Bookkeeping/commit/e854ac3ca4538538746d7e19ff413e4edc5ee215))
* Added deepmerge wrapper ([0e1ea71](https://github.com/AliceO2Group/Bookkeeping/commit/0e1ea719c46e25c75e843c0437d8205c5fa9d9e8))
* Added detail screen ([e0bc9e3](https://github.com/AliceO2Group/Bookkeeping/commit/e0bc9e30b701cae19014c7c0a6c83fb87de93c6c))
* Added flp endpoint ([6f0c890](https://github.com/AliceO2Group/Bookkeeping/commit/6f0c8907af9efaffc6df22069e4d88468b257901))
* added GetAllLogsUseCase ([64eeb62](https://github.com/AliceO2Group/Bookkeeping/commit/64eeb62c00f833a0bf6202c2ab29a4964e7c2fb2))
* added GetServerInformationUseCase ([c368b20](https://github.com/AliceO2Group/Bookkeeping/commit/c368b2019a3d388e11d3f69779347f8f21fd5a9e))
* Added logs endpoint ([dc85779](https://github.com/AliceO2Group/Bookkeeping/commit/dc85779ddd7b3bf6c08cc84043962277de62da9a))
* added Nginx integration ([0d7868a](https://github.com/AliceO2Group/Bookkeeping/commit/0d7868a05ff4dc794b8f3d9a0387b7814a095d10))
* Added overviews endpoint ([57b64bb](https://github.com/AliceO2Group/Bookkeeping/commit/57b64bb5f0e0d16ac577932872c7fd1194de1b96))
* Added reusable table components and start on the mock table with static data ([e899de4](https://github.com/AliceO2Group/Bookkeeping/commit/e899de4cc8f437a813ae3a58e5adac3c5d240cce))
* Added routerBuilder ([995f8a1](https://github.com/AliceO2Group/Bookkeeping/commit/995f8a1532367798fba175cb7855cb6f22c827b5))
* Added runs endpoint ([8e1c15a](https://github.com/AliceO2Group/Bookkeeping/commit/8e1c15a4873656c08df23ef8a750c7e1a34da800))
* Added settings endpoint ([1b03bf7](https://github.com/AliceO2Group/Bookkeeping/commit/1b03bf70e42d295e4b48490e3cd87ff73120a377))
* Added subsystem controller ([7564524](https://github.com/AliceO2Group/Bookkeeping/commit/7564524e6e99c069f6534836b186dae91b432db6))
* Added subsystems router ([521c828](https://github.com/AliceO2Group/Bookkeeping/commit/521c8282b0e302d6bfe8093372959da638d0737d))
* Added tags controller and route ([00866d1](https://github.com/AliceO2Group/Bookkeeping/commit/00866d1339bf1ca6b9122f915bdd043af6eac0e5))
* Added tests ([a7e1047](https://github.com/AliceO2Group/Bookkeeping/commit/a7e1047b3b42418024ae453d3cc2142f1b89b895))
* Added user controller ([c0a5f75](https://github.com/AliceO2Group/Bookkeeping/commit/c0a5f75111287de5ebf7292e8234d21d0d69f4ac))
* Added user route ([4b3506d](https://github.com/AliceO2Group/Bookkeeping/commit/4b3506d1655c46132669c32f6483bee099c8db22))
* Added utils index ([8cffbbd](https://github.com/AliceO2Group/Bookkeeping/commit/8cffbbd6854d210a70818dc62606970447f00107))
* allow Framework to override interfaces ([623181d](https://github.com/AliceO2Group/Bookkeeping/commit/623181d9191190e4ce3d27782d82f12589cc39b5))
* Codecov integration for backend ([032ea1c](https://github.com/AliceO2Group/Bookkeeping/commit/032ea1c29ff5f6253ba0a9103118d485d3384e3b))
* ESLint integration ([c86b116](https://github.com/AliceO2Group/Bookkeeping/commit/c86b1166f558839c920c267ea86b58f72b2b89df))
* GitHub actions integrations for backend ([db06cb3](https://github.com/AliceO2Group/Bookkeeping/commit/db06cb396081227e4a9e493ace7f10f92beb5c0f))
* GitHub actions integrations for frontend ([d5dd04f](https://github.com/AliceO2Group/Bookkeeping/commit/d5dd04f773f8f0f40091ebb15e6e99894c41684a))
* GitHub actions integrations for spec ([db62696](https://github.com/AliceO2Group/Bookkeeping/commit/db62696bcd167fda789b92ae6cd01922d2babece))
* Got filtering working, reflects on the actual table now ([5b56dcc](https://github.com/AliceO2Group/Bookkeeping/commit/5b56dcc511a468666688a046138fdc92fa0afcff))
* Upgraded appendPath utility ([40f366b](https://github.com/AliceO2Group/Bookkeeping/commit/40f366b1964536c87de6efdbdc3f081d0e45c9b8))




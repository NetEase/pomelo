0.4.2 / 2013-6-5
==================

* fix duplicated bind session bug
* add `disconnectOnTimeout` option for hybridconnector
* fix empty group push bug in channel
* fix protobuf encode bug

0.4.1 / 2013-5-28
==================

* refactor protocol layers
* support multiple sessions of the same user

0.3.10 / 2013-5-20
==================

* `pomelo-protocol` upgrades to 0.3.4
* fix session bind bug in backend server
* replace `childprocess.exec` with `spawn` in `starter.js`

* fix configure bug

0.3.9 / 2013-5-8
==================

* fix configure bug

0.3.8 / 2013-5-6
==================

* fix tcpsocket close event bug
* fix error handler bug

0.3.7 / 2013-4-16
==================

* update templates
* sioconnector supports flashsocket
* add `distinctHost` to hybridconnector
* fix rpc `cacheMsg` configure bugs

0.3.6 / 2013-4-9
==================

* compatible with node 0.10 version
* fix daemon forever bugs
* add some unit test case

0.3.5 / 2013-3-25
==================

* fix log4js not compatible bug
* fix function redefined in localSessionServie

0.3.4 / 2013-3-19
==================

* fix server not verifing useDict, useProtobuf bug
* fix can not start pomelo from ide bug
* add host param in listen for hybridconnector, which is important for some load balance strategy

0.3.3 / 2013-3-12
==================

* fix double string decode bug when not compressing route

0.3.2 / 2013-3-11
==================

* fix init template bug
* modify command line help, version to --help, --version

0.3.1 / 2013-3-7
==================

* add hybridconnector to support socket and websocket
* add route dictionary and protobuf for binary protocol
* add localSession query interfaces
* add broadcast method for ChannelService

0.2.5 / 2013-2-28
==================

* dynamic add and remove servers (watchdog module)
* fix filterService before filter bug
* fix connector component bug

0.2.4 / 2013-1-4
==================

* fix stop components bug
* add windows install .bat
* add comand line windows compatible feature


0.2.3 / 2012-12-25
==================

* add mkdirp, update pomelo-admin version
* solve windows comptaible problem

0.2.2 / 2012-12-9
==================

* add fail ids for channel push method
* code format standardize


0.2.0 / 2012-11-20
==================

* establish project on github


0.1.x / before 2012-11
==================

* internal development for 11 months

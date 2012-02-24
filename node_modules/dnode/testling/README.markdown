running the dnode testling tests
================================

1. first spin up the dnode server locally

```
$ node server.js 
Listening on :8420
```

2. allocate a tunnel

Make sure you've
 [uploaded your private key](http://testling.com/docs/#uploading-your-public-key)
first.

```
$ curl -u you@example.com testling.com/tunnel/open
Enter host password for user 'you@example.com':
Your tunnel is ready!
To tunnel from localhost:8080 just do:

  ssh -NR 59543:localhost:8080 you_example_com@tunnel.browserling.com

Now your localhost:8080 is available from your tests at

  http://tunnel.browserling.com:59543

$ 
```

3. punch a tunnel from localhost:8420 through to testling.com

```
$ ssh -NR 59543:localhost:8420 you_example_com@tunnel.browserling.com
Enter passphrase for key '/home/you/.ssh/id_dsa': 
```

4. use the tunnel.browserling.com:XXXXX address in place of localhost:8420

$ curl -u you@example.com -sSNT test.js 'http://testling.com/?script=http://tunnel.browserling.com:59543/dnode.js&browsers=chrome/14.0'
Enter host password for user 'you@example.com':
Bundling...  done

chrome/14.0         0/0    0 % ok^C
$ 

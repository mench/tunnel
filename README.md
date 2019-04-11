# tunnel

Tunnel exposes your localhost to the world.


## installation ##

```
npm install -g @tunnels/cli --registry=http://packs.sites.li
```



## Usage ##

### connect

just use the ```tunnel connect``` command to start the tunnel.

```
tunnel connect --port=8000 --auth=username:password 
```

#### connect options:

* `--port` listen on this port for outside requests
* `--auth` your username and password like (username:password) 
* `--subdomain` request a named subdomain on the tunnel server (default is random characters)
* `--host`  proxy to a localhost [default: "0.0.0.0"]
* `--domain` tunnels domain to use [default: "mamble.io"]
* `--secure`  use this flag to indicate proxy over https  [default: "true"]

### serve

The default tunnel client connects to the mamble.io server. You can, however, easily set up and run your own server.

use the ```tunnel serve``` command to start the tunnel server.


```
tunnel serve --config=./your/path/config.json 
```
#### serve options:

* `--config` path for your config.json file

##### EX: config.json

```json
{
  "port": 80,
  "address": "0.0.0.0",
  "ssl": {
    "port": 443,
    "enabled": true,
    "cert": "./your/certs.crt",
    "key": "./your/certs.key"
  },
  "domain": "example.com",
  "users": {
    "username": "password"
  }
}
```

To see the requests and/or manage your users 
you can install ```npm install -g @tunnels/admin --registry=http://packs.sites.li``` on your server.



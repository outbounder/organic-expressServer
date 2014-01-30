# organic-expressserver v0.4.0

The organelle wraps expressjs server [http://expressjs.com/](http://expressjs.com/) v3.x.x

## DNA structure and defaults

    {
      "log": false,
      "port": 1337 || Number,
      "emitReady": "ExpressServer" || String,
      "emitServer": "HttpServer" || String,
      "middleware": Array,
      "afterware": Array,
      "reactOn": String
    }

* `reactOn` : String, optional if set will wait for given chemical type(without aggregating it). If not set, will start listening once instantiated.

### "middleware" and "afterware" items

        {
          "source": "path/to/middleware/module",
          "arguments": Array
        }

  * `arguments` are applied to middleware module with context of the organelle

#### thereafter middleware module has the following signature/interface

    module.exports = function(/* arguments */) {
       var plasma = this.plasma;
       var expressApp = this.app;
       var httpServer = this.server;
       // .... either do something with above without returning anything
       // or
       // return middleware function to be passed to express app.use
       return function(req, res, next) {
         // middleware implementation
       }
    }

- Organelle loads synchroniously all middleware modules.
- Those of them which return function will be assigned respectively as middleware function to express app.
- Middleware items are placed before express app router and afterware items are placed after the router.
- Note that paths to middlware modules are relative to the current working directory.
- Note that the organelle can load general purpose express/connect middlewares as well.

## Emits chemicals when

### started listening

Emitted with Chemical type value of `emitReady`.
Chemical's structure:

    {
      "type": `emitReady`,
      "data": ExpressApp
    }

Optionally if `emitServer` is defined, emits Chemical type with value of `emitServer`.
Chemical's structure:

    {
      "type": `emitServer`,
      "data": HttpServer
    }

## Reacts to chemicals

### type: "kill"

Closes underlaying httpServer instance.
The organelles doesn't aggragates the chemical and leaves it passing forward.

## Example DNA configuration

    {
      "port": 8090,
      "middleware": [
        {
          "source": "node_modules/express/node_modules/connect/lib/middleware/cookieParser",
          "arguments": ["secret"]
        },
        { 
          "source": "node_modules/express/node_modules/connect/lib/middleware/bodyParser",
          "arguments": []
        },
        {
          "source": "xware/allowCrossDomain",
          "arguments": [],
        }
        { 
          "source": "xware/mongoSessions", 
          "arguments": [
            { "dbname": "test-webcell", "cookie_secret": "test" } 
          ]
        }
      ]
    }
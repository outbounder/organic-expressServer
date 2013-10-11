# organic-expressserver

The organelle wraps expressjs server [http://expressjs.com/](http://expressjs.com/) v3.x.x

## DNA structure and defaults

    {
      "log": false,
      "port": 1337 || Number,
      "emitReady": "ExpressServer" || String,
      "emitServer": String,
      "middleware": Array,
      "afterware": Array
    }

### "middleware" and "afterware" items

In general they are two forms:

* As String

    "path/to/middelware/module"

* As Object

    {
      "source": "path/to/middleware/module",
      ... // configuration options
    }

#### thereafter middleware module has the following signature/interface

    module.exports = function(options, expressServer) {
       var plasma = expressServer.plasma;
       var expressApp = expressServer.app;
       var httpServer = expressServer.server;
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


This organelle wraps expressjs server [http://expressjs.com/](http://expressjs.com/) v3.x.x and starts it upon construction. 

It is general purpose membrane hole for handling any incoming http requests.

organel | dna & defaults:

* middleware - [ `Middleware Object` ]

  #### Middleware Object 
  
  * `String` - full path to Middlware source code or

            {
             source: full path to Middleware source code
             ... `config` of Middlware
            }

  #### middleware source code example

        module.exports = function(`config`, httpServer){
         var app = httpServer.app; // express app object
         return function(req, res, next) {} // optional, will be passed to app.use(fn)
        }

* afterware - [ `Middleware Object` ]

  see `middleware` attribute for definition of `Middleware Object`

* routes - { `path: Route object` }

  ### path: `Route object`

  * `path` is String passed to `app.all(path, fn)`
  * `Route object` is Chemical to be emitted in plasma including:
    * `req` express object
    * `res` express object
  
    expected callback chemical will trigger `res.send` based on returned:
    
      * `content-type` - String
      * `data` - mixed
      * `statusCode` - Number, defaults to `200`

* notfoundRoute - `Route object`

  see `routes` attribute for Route object details. This simply adds middleware to express server emitting chemical with given route object definition.

* log - `false`
* port - `1337`


# incoming | kill

Closes the underlying express app.

# outgoing | HttpServer

* data - express App instance
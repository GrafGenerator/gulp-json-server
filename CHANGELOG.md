## Release notes

### v0.2.0
* Added ability to add rewrite rules to static files.
* Added ability to use custom routes (reflect json-server changes)
* Use body-parser to parse req.body (allows to use req.body f.e. with custom routes).

### v0.1.1
* Forced hotfix because previous not properly published to NPM because of bug in `npm pack`.

### v0.1.0
* Added `static` option to serve static files using json-server.
* Starting to use semantic versioning.

### v0.0.7
* Fixed typo in server reloading sample and updated sample itself.

### v0.0.6
* Added reloading functionality. Now DB could be easily reloaded either from file or from object.
* Added ability to kill the server.
* Added deferredStart option, allowing to define server instance, but start it later.

### v0.0.5
* The `id` key, used to match objects in collections now could be changed using `id` parameter in options. Useful to simulate other DBs, for example MongoDB's `_id`.

### v0.0.4
* Added ability to change server's base URL.
* Added ability to use rewrite rules.

### v0.0.0 - v0.0.3
Basic version of plugin with ability to start json-server from specified file or object, on specific port.


## License

MIT © Nikita Ivanov (http://borodatik.net)

NANO
----

nano is used to copy only the files you need to a new directory. A build gives
you the entire dojo toolkit, which can be unweildy if you have to copy the files
to an FTP. Even copying to a local server can be a pain.

If you would like a nano-copy after the build completes, add a "nano" object to
your profile. The nano object should have three properties:

* **`src`:** The `releaseDir` location (after the build). This location should
 be relative to the build script, preferably in the root of the project folder.
* **`dst`:** The destination of the nano-copied folder. This location should
 be relative to the build script, preferably in the root of the project folder.
* **`files`:** An object that represents the hierachy of the directory structure
that includes the files to be copied.

To create a directory structure, use:

* **`string`:** represents a file
* **`array`:** represents a folder that only contains files. The name of the
array is the folder name.
* **`string`:** represents a folder that contains folders and maybe files The
name of the object is the folder name.

Example:
--------

```js
nano:{
	src:'/release',
	dst:'/release-nano',
	files:{
		'/':'index.html',
		'css':[
			{
				img:[
					'logo.png'
				]
			},
			'styles.css'
		},
		dojo:[
			'dojo.js'
		]
	}

}
```

A good tip to get this structure right is start with a simpe structure, like that
included in `profiles/basic.nano.profiles.js`. Run the build, and check the Net
tab in Firebug to see what files are missing, and add them to the structure.

License
-------

The Dojo AMD Scaffold is available via Academic Free License >= 2.1 OR the
modified BSD license. see: http://dojotoolkit.org/license for details

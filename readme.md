# ext-build

The ext-build is an extension to the Dojo build tool.

Version
-------

This version is designed to work with features in the Dojo 1.8 build system.


Setup
-----

0. Clone the ext-build repository using git clone --recursive.
1. Run the build script, which can be as simple as `./build.sh -p myProfile`

You need Java or Node.js to run a build, preferably Node.js. ext-build works on
either Mac or Windows. There is a build.bat for Windows users, although better
command line tools would be recommended.

command line options
--------------------

The main purpose of ext-build is to provide a simple way of doing a build without
extensive use of the command line or shell scripting. The build scripts are fairly
simple - they test for Java or Node, and execute dojo in one of those environments.
the first file to execute after dojo is ext-build/bootstrap, which parses arguments
and sets defaults and shortcuts. By default, the build does not do compression to
the JavaScript (but it does for the CSS). Therefore, the build can be executed by
simply running:

```
./build.sh -p myProfile
```

This will build using the /`<project>`/profiles/myProfile.profile.js file.

The file will be found by appending ".profile.js" to the name. It is expected
that the profiles will be in the root of the project file (or specifically two
directories above dojo.js). Like:

```text
/project
	/src
		/dojo
		/dijit
		/dojox
		/util
		/myApp
	/profiles
		myProfile.profile.js
	/ext-build
```

Any dojo build options can be used and will pass through. The ext-build options,
followed by the actual build switch equivalent if applicable are as follows.

* `--clean`: Delete release directory. This is a special process run by
ext-build (the dojo build does not support this). Note that your profile needs a
root project name, such as `projectName:'dojo-scaffold'` in order for this process
to run to ensure no mistakes that may wipe out your hard drive.

* `[no optimize switch]`: Layer modules are not optimized; the `stripConsole`
profile property, if any, is ignored.

* `-c ["comment"]`: All comments are removed form all layer modules; new-lines
are not preserved; the stripConsole profile property, if any, is ignored.
* `-ck ["comment.keeplines"]`: All comments are removed from all layer modules;
new-lines are preserved; the stripConsole profile property, if any, is ignored.
* `-s ["shrinksafe"]`:  All layer modules are processed by shrinksafe; new-lines
are not preserved; the semantics of the stripConsole property are executed.
* `-sk ["shrinksafe.keeplines"]`: All layer modules are processed by shrinksafe;
new-lines are preserved; the semantics of the stripConsole property are executed.
* `-o ["closure"]`: All layer modules are processed by the Google Closure
compiler, simple-mode; new-lines are not preserved; the semantics of the
`stripConsole` property are executed.
* `-ok ["closure.keepLines"]`: All layer modules are processed by the Google Closure
compiler, simple-mode; new-lines are preserved; the semantics of the stripConsole
property are executed.
* `-oa`: All optimize switches operate on the layer only which is much faster and
best for most cases. If you would like all files in all directories optimized,
use this switch.


For reference (no shortcuts)

* stripConsole (default = "normal")
	* ["none"] No console applications are stripped.
	* ["normal"] All console applications are stripped except console.error and console.warn.
	* ["warn"] All console applications are stripped except console.error.
	* ["all"] All console applications are stripped.

Debug switches for reference (no shortcuts)

* `--check`: Process all command line switches and dump the computed profile to the console.
* `--check-args`: Process all command line switches and dump the raw profile resources to the console (the profile resources are not aggregated).
* `--check-discovery`: Echo all discovered resources and exit


Custom Transforms
-----------------

The driving force behind ext-build was that some parts of the build are hard. In
particular, the simple matter of moving the index.html and other HTML files had
been done with a shell script. If transforms need to be done to the HTML files
a rather high degree of shell script skills are needed. This didn't make sense,
because you have this build tool here, and you have Node.js running... these
things need to work with me!

You can get them to work for you, but it's a little tricky. ext-build does the
tricky part so you only need to create your transform file, and point to it in
your profile. `ext-build/transforms/pageHtml.js` is the example used in the
basic profiles, and `ext-build/transforms/libPageHtml.js` is a somewhat different
version for the /lib example.

These are basic transforms that read, modify and write. You could copy them and
make your own transforms of course, or look through the code and find ways of
making more complex transforms.

More details on transforms can be found in the comments of the basic profile
as well as throughout the ext-build code.

Acknowledgements
----------------

* Author: Mike Wilcox
* Email: anm9tr@gmail.com
* Website: [http://clubajax.org](http://clubajax.org)
* Twitter: @clubajax
* Special credit to Rawld Gill, primary author of the Dojo loader and build tool
* Website: [http://www.altoviso.com/](http://www.altoviso.com/)

References
----------

* [Dojo Tutorials](http://dojotoolkit.org/documentation/)
* [Dojo Reference Guide](http://dojotoolkit.org/reference-guide/)
* [Dojo AMD Loader](http://dojotoolkit.org/reference-guide/1.8/loader/)
* [Dojo Build Overview](http://dojotoolkit.org/reference-guide/1.8/build/index.html#build-index)
* [Dojo Build in Depth](http://dojotoolkit.org/reference-guide/1.8/build/buildSystem.html#build-buildsystem)
* [Dojo Boilerplate](https://github.com/csnover/dojo-boilerplate)

License
-------

The Dojo AMD Scaffold is available via Academic Free License >= 2.1 OR the
modified BSD license. see: http://dojotoolkit.org/license for details
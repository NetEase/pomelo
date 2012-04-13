Manyally create extjs/ directory inside this dir.

Either copy over ExtJS directory or create symlink to it.

    $ cp -r /path/to/ext-4.0.0 template/extjs

or

    $ ln -s /path/to/ext-4.0.0 template/extjs

Then run compass to generate custom ExtJS theme:

    $ compass template/resources/sass


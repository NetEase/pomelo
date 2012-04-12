# Class System
______________________________________________

For the first time in its history, Ext JS went through a huge refactoring from the ground up with the new class system. The new architecture stands behind almost every single class written in Ext JS 4.x, hence it's important to understand it well before you start coding.

This manual is intended for any developer who wants to create new or extend existing classes in Ext JS 4.x. It's divided into 4 sections:

- Section I: "Overview" explains the need for a robust class system
- Section II: "Naming Conventions" discusses the best practices for naming classes, methods, properties, variables and files.
- Section III: "Hands-on" provides detailed step-by-step code examples
- Section IV: "Errors Handling & Debugging" gives useful tips & tricks on how to deal with exceptions

## I. Overview
______________

Ext JS 4 ships with more than 300 classes. We have a huge community of more than 200,000 developers to date, coming from various programming backgrounds all over the world. At that scale of a framework, we face a big challange of providing a common code architecture that is:

- familiar and simple to learn
- fast to develop, easy to debug, painless to deploy
- well-organized, extensible and maintainable

JavaScript is a classless, [prototype-oriented][] language. Hence by nature, one of the language's most powerful features is flexibility. It can get the same job done by many different ways, in many different coding styles and techniques. That feature, however, comes with the cost of unpredictability. Without a unified structure, JavaScript code can be really hard to understand, maintain and re-use.

[Class-based][] programming, on the other hand, still stays as the most popular model of OOP. [Class-based languages][] usually require strong-typing, provide encapsulation, and come with standard coding convention. By generally making developers adhere to a large set of principles, written code is more likely to be predictable, extensible and scalable over time. However, they don't have the same dynamic capability found in such language as JavaScript.

Each approach has its own pros and cons, but can we have the good parts of both at the same time while concealing the bad parts? The answer is yes, and we've implemented the solution in Ext JS 4.


## II. Naming Conventions
______________

Using consistent naming conventions throughout your code base for classes, namespaces and filenames helps keep your code organized, structured and readable.

### 1) Classes

Class names may only contain **alphanumeric** characters. Numbers are permitted but are discouraged in most cases, unless they belong to a technical term. Do not use underscores, hyphens, or any other nonalphanumeric character. For example:

  - `MyCompany.useful_util.Debug_Toolbar` is discouraged
  - `MyCompany.util.Base64` is acceptable

Class names should be grouped into packages where appropriate and properly namespaced using object property dot-notation (.). At the minimum, there should be one unique top-level namespace followed by the class name. For example:

    MyCompany.data.CoolProxy
    MyCompany.Application

The top-level namespaces and the actual class names should be in CamelCased, everything else should be all lower-cased. For example:

    MyCompany.form.action.AutoLoad

Classes that are not distributed by Sencha should never use `Ext` as the top-level namespace.

Acronyms should also follow CamelCased convention listed above. For example:

  - `Ext.data.JsonProxy` instead of `Ext.data.JSONProxy`
  - `MyCompany.util.HtmlParser` instead of `MyCompary.parser.HTMLParser`
  - `MyCompany.server.Http` instead of `MyCompany.server.HTTP`


### 2) Source Files

The names of the classes map directly to the file paths in which they are stored. As a result, there must only be one class per file. For example:

  - `Ext.util.Observable` is stored in `path/to/src/Ext/util/Observable.js`
  - `Ext.form.action.Submit` is stored in `path/to/src/Ext/form/action/Submit.js`
  - `MyCompany.chart.axis.Numeric` is stored in `path/to/src/MyCompany/chart/axis/Numeric.js`

`path/to/src` is the directory of your application's classes. All classes should stay under this common root and should be properly namespaced for the best development, maintenance and deployment experience.

### 3) Methods and Variables

- Similarly to class names, method and variable names may only contain **alphanumeric** characters. Numbers are permitted but are discouraged in most cases, unless they belong to a technical term. Do not use underscores, hyphens, or any other nonalphanumeric character.

- Method and variable names should always be in camelCased. This also applies to acronyms.

- Examples
    - Acceptable method names:
        encodeUsingMd5()
        getHtml() instead of getHTML()
        getJsonResponse() instead of `getJSONResponse()
        parseXmlContent() instead of `parseXMLContent()
    - Acceptable variable names:
        var isGoodName
        var base64Encoder
        var xmlReader
        var httpServer

### 4) Properties

- Class property names follow the exact same convention with methods and variables mentioned above, except the case when they are static constants.

- Static class properties that are constants should be all upper-cased. For example:
    - `Ext.MessageBox.YES = "Yes"`
    - `Ext.MessageBox.NO  = "No"`
    - `MyCompany.alien.Math.PI = "4.13"`


## III. Hands-on
_______________

### 1. Declaration

#### 1.1) The Old Way
If you have ever used any previous version of Ext JS, you are certainly familiar with `Ext.extend` to create a class:

    var MyWindow = Ext.extend(Object, { ... });

This approach is easy to follow to create a new class that inherits from another. Other than direct inheritance, however, we didn't have a fluent API for other aspects of class creation, such as configuration, statics and mixins. We will be reviewing these items in details shortly.

Let's take a look at another example:

    My.cool.Window = Ext.extend(Ext.Window, { ... });

In this example we want to [namespace][] our new class, and make it extend from `Ext.Window`. There are two concerns we need to address:

  1. `My.cool` needs to be an existing object before we can assign `Window` as its property
  2. `Ext.Window` needs to exist / loaded on the page before it can be referenced

The first item is usually solved with `Ext.namespace` (aliased by `Ext.ns`). This method recursively transverse through the object / property tree and create them if they don't exist yet. The  boring part is you need to remember adding them above `Ext.extend` all the time.

    Ext.ns('My.cool');
    My.cool.Window = Ext.extend(Ext.Window, { ... });

The second issue, however, is not easy to address because `Ext.Window` might depend on many other classes that it directly / indirectly inherits from, and in turn, these dependencies might depend on other classes to exist. For that reason, applications written before Ext JS 4 usually include the whole library in the form of `ext-all.js` even though they might only need a small portion of the framework.

### 1.2) The New Way

Ext JS 4 eliminates all those drawbacks with just one single method you need to remember for class creation: `Ext.define`. Its basic syntax is as follows:

    Ext.define(className, members, onClassCreated);

- `className`: The class name
- `members` is an object represents a collection of class members in key-value pairs
- `onClassCreated` is an optional function callback to be invoked when all dependencies of this class are ready, and the class itself is fully created. Due to the [new asynchronous nature](#) of class creation, this callback can be useful in many situations. These will be discussed further in [Section IV](#)

**Example:**

    Ext.define('My.sample.Person', {
        name: 'Unknown',

        constructor: function(name) {
            if (name) {
                this.name = name;
            }

            return this;
        },

        eat: function(foodType) {
            alert(this.name + " is eating: " + foodType);

            return this;
        }
    });

    var aaron = Ext.create('My.sample.Person', 'Aaron');
        aaron.eat("Salad"); // alert("Aaron is eating: Salad");

Note we created a new instance of `My.sample.Person` using the `Ext.create()` method.  We could have used the `new` keyword (`new My.sample.Person()`).  However it is recommended to get in the habit of always using `Ext.create` since it allows you to take advantage of dynamic loading.  For more info on dynamic loading see the [Getting Started guide](#/guide/getting_started)

### 2. Configuration

In Ext JS 4, we introduce a dedicated `config` property that gets processed by the powerful Ext.Class pre-processors before the class is created. Features include:

 - Configurations are completely encapsulated from other class members
 - Getter and setter, methods for every config property are automatically generated into the class' prototype during class creation if the class does not have these methods already defined.
 - An `apply` method is also generated for every config property.  The auto-generated setter method calls the `apply` method internally before setting the value.  Override the `apply` method for a config property if you need to run custom logic before setting the value. If `apply` does not return a value then the setter will not set the value. For an example see `applyTitle` below.

Here's an example:

    Ext.define('My.own.Window', {
       /** @readonly */
        isWindow: true,

        config: {
            title: 'Title Here',

            bottomBar: {
                enabled: true,
                height: 50,
                resizable: false
            }
        },

        constructor: function(config) {
            this.initConfig(config);

            return this;
        },

        applyTitle: function(title) {
            if (!Ext.isString(title) || title.length === 0) {
                alert('Error: Title must be a valid non-empty string');
            }
            else {
                return title;
            }
        },

        applyBottomBar: function(bottomBar) {
            if (bottomBar && bottomBar.enabled) {
                if (!this.bottomBar) {
                    return Ext.create('My.own.WindowBottomBar', bottomBar);
                }
                else {
                    this.bottomBar.setConfig(bottomBar);
                }
            }
        }
    });

And here's an example of how it can be used:

    var myWindow = Ext.create('My.own.Window', {
        title: 'Hello World',
        bottomBar: {
            height: 60
        }
    });

    alert(myWindow.getTitle()); // alerts "Hello World"

    myWindow.setTitle('Something New');

    alert(myWindow.getTitle()); // alerts "Something New"

    myWindow.setTitle(null); // alerts "Error: Title must be a valid non-empty string"

    myWindow.setBottomBar({ height: 100 }); // Bottom bar's height is changed to 100


### 3. Statics

Static members can be defined using the `statics` config

    Ext.define('Computer', {
        statics: {
            instanceCount: 0,
            factory: function(brand) {
                // 'this' in static methods refer to the class itself
                return new this({brand: brand});
            }
        },

        config: {
            brand: null
        },

        constructor: function(config) {
            this.initConfig(config);

            // the 'self' property of an instance refers to its class
            this.self.instanceCount ++;

            return this;
        }
    });

    var dellComputer = Computer.factory('Dell');
    var appleComputer = Computer.factory('Mac');

    alert(appleComputer.getBrand()); // using the auto-generated getter to get the value of a config property. Alerts "Mac"

    alert(Computer.instanceCount); // Alerts "2"


## IV. Errors Handling & Debugging
_________________

Ext JS 4 includes some useful features that will help you with debugging and error handling.

- You can use `Ext.getDisplayName()` to get the display name of any method.  This is especially useful for throwing errors that have the class name and method name in their description:

        throw new Error('['+ Ext.getDisplayName(arguments.callee) +'] Some message here');

- When an error is thrown in any method of any class defined using `Ext.define()`, you should see the method and class names in the call stack if you are using a WebKit based browser (Chrome or Safari).  For example, here is what it would look like in Chrome:

{@img call-stack.png Call Stack}

[prototype-oriented]: http://en.wikipedia.org/wiki/Prototype-based_programming
[class-based]: http://en.wikipedia.org/wiki/Class-based_programming
[Class-based languages]: http://en.wikipedia.org/wiki/Category:Class-based_programming_languages
[namespace]: http://en.wikipedia.org/wiki/Namespace_(computer_science)
[examples-download]: #download

## See Also

- [Dynamic Loading and the New Class System](http://www.sencha.com/blog/countdown-to-ext-js-4-dynamic-loading-and-new-class-system)
- [Classes in Ext JS 4: Under the Hood](http://edspencer.net/2011/01/classes-in-ext-js-4-under-the-hood.html)
- [The Class Definition Pipeline](http://edspencer.net/2011/01/ext-js-4-the-class-definition-pipeline.html)

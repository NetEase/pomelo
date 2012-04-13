# Architecting Your App in Ext JS 4, Part 1

The scalability, maintainability and flexibility of an application is mostly determined by the quality of the application’s architecture. Unfortunately, it’s often treated as an afterthought. Proofs of concept and prototypes turn into massive applications, and example code is copied and pasted into the foundations of many applications. You may be tempted to do this because of the quick progress that you see at the start of a project.

However, the time saved will be relatively low compared to the time spent on having to maintain, scale and often refactor your application later in the project. One way to better prepare for writing a solid architecture is to follow certain conventions and define application views, models, stores and controllers before actually implementing them. In this article, we’ll take a look at a popular application and discuss how we might architect the user interface to create a solid foundation.

## Code Organization

Application architecture is as much about providing structure and consistency as it is about actual classes and framework code. Building a good architecture unlocks a number of important benefits:

 - Every application works the same way so you only have to learn it once
 - It’s easy to share code between apps because they all work the same way
 - You can use Ext JS build tools to create optimized versions of your applications for production use

In Ext JS 4, we have defined conventions that you should consider following when building your applications — most notably a unified directory structure. This simple structure places all classes into the app folder, which in turn contains sub-folders to namespace your models, views, controllers and stores.

While Ext JS 4 offers best practices on how to structure your application, there’s room to modify our suggested conventions for naming your files and classes. For example, you might decide that in your project you want to add a suffix to your controllers with “Controller,” e.g. “Users” becomes “UsersController.” In this case, remember to always add a suffix to both the controller file and class. The important thing is that you define these conventions before you start writing your application and consistently follow them. Finally, while you can call your classes whatever you want, we strongly suggest following our convention for the names and structure of folders (controller, model, store, view). This will ensure that you get an optimized build using our SDK Tools beta.

## Striking a Balance

### Views

Splitting up the application’s UI into views is a good place to start. Often, you are provided with wireframes and UI mockups created by designers. Imagine we are asked to rebuild the (very attractive) Pandora application using Ext JS, and are given the following mockup by our UI Designer.

{@img base_layout.png}

What we want to achieve is a balance between the views being too granular and too generic. Let’s start by seeing what happens if we divide our UI into too many views.

{@img too-granular.png}

Splitting up the UI into too many small views will make it difficult to manage, reference and control the views in our controllers. Also, since every view will be in its own file, creating too many views might make it hard to locate the view file where a piece of the UI or view logic is defined.

On the other hand, we don’t want our views to be too generic because it will impact our flexibility to change things.

{@img too-general.png}

In this scenario, each one of our views has been overly simplified. When several parts of a view require custom view-logic, the view class will end up having too many responsibilities, resulting in the view class becoming harder to maintain. In addition, when the designers change their mind about the arrangement of the UI, we will end up having to refactor our view definition and view logic; which can get tedious.

The right balance is achieved when we can easily rearrange the views on the page without having to refactor them every time. For example, we want to make the Ad a separate view, so we can easily move it around or even remove it later.

{@img balanced.png}

In this version, we’ve separated our UI by the roles of each view. Once you have a general idea of the views that will make up your UI, you can still tweak the granularity when you’re actually implementing them. Sometimes you may find that two views should really become one, or a view is too generic and should be split into multiple views, but it helps to start out with a good base. I think we’ve done that here.

### Models

Now that we have the basic structure of our views in place, it’s time to look at the models. By looking at the types of dynamic data in our UI, we can get an idea of the different models needed for our application.

{@img models.png}

We’ve decided to use only two models — Song and Station. We could have defined two more models called Artist and Album. However, just as with views, we don’t want to be too granular when defining our models. In this case, we don’t have to separate artist and album information because the app doesn’t allow the user to select a specific song by a given artist. Instead, the data is organized by station, the song is the center point, and the artist and album are properties of the song. That means we’re able to combine the song, artist and album data into one model. This greatly simplifies the data side of our app. It also simplifies the API that we have to implement on the server-side because we don’t have to load individual artists or albums. To summarize, for this example, we’ll only have two models — Song and Station.

### Stores

Now that we’ve thought about the models our application will use, lets do the same for stores.

{@img stores.png}

Figuring out the different stores you need is often relatively easy. A good strategy is to determine all the data bound components on the page. In this case, we have a list with all of the user’s favorite stations, a scroller with the recently played songs, and a search field that will display search results. Each of these views will need to be bound to stores.

### Controllers

There are several ways you can distribute the application’s responsibilities across your application’s controllers. Let’s start by thinking about the different controllers we need in this example.

{@img controllers.png}

Here we have two basic controllers — a SongController and a StationController. Ext JS 4 allows you to have one controller that can control several views at the same time. Our StationController will handle the logic for both creating new stations as well as loading the user’s favorite stations into the StationsList view. The SongController will take care of managing the SongInfo view and RecentSong store as well as the user’s actions of liking, disliking, pausing and skipping songs. Controllers can interact with each other by firing and listening for application events. While we could have created additional Controllers, one for managing playback and another for searching stations, I think we’ve found a good separation of responsibilities.

## Measure Twice, Cut Once

I hope that sharing our thoughts on the importance of planning your application architecture prior to writing code was helpful. We find that talking through the details of the application helps you to build a much more flexible and maintainable architecture.
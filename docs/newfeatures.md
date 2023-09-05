# Stylo v2.0: New Version, New Features

**Stylo gets a makeover!**

Dear Stylo users,

For the new year, we designed a new version of Stylo to keep up with your scholarly writing/editing needs!

What's new in Stylo 2.0 ? Below is an overview of the changes:
* Improvements to the graphical user interface
* Implementation of a new text editor (with advanced find-replace functions)
* Autocomplte bibliographic refernces directly in the text
* New metadata entries (particualy for editing mode)
* A new export module
* A separate service for using Pandoc software (in SaaS mode)
* Stabilization of the article and account sharing features
* GraphQL API (soon to be documented)

Here are some details about these changes: 

## Graphical User Interface
A few graphical changes have been made to refresh the interface:
* The management columns (editing and metadata) have been slightly redesigned;
* the preview and export bottons have been moved: they are no longer inside the left pane, but in the central part of the screen, above the text editor.

![interface](uploads/images/stylo-v2-interface-eng.png)

![open panels](uploads/images/stylo-v2-openPanels-eng.png)

## A New Text Editor
The text editor, the central feature of Stylo, has been completely rebuilt! We have integrated a new editor: Monaco. New features are now available:
* Find and replace functions are available via the shortcuts `CTRL/Cmd+F` and `CTRL/Cmd+H`
* The use of regular expresions
* Compare different versions of the same document more precicesly (line by line)

![regex](uploads/images/stylo-v2-regex-eng.png)

![changes](uploads/images/stylo-v2-diff-eng.png)

## Autocomplete
Thanks to the new text ediotr, we can automate certain aspects of the writing process by using autocomplete. We have added the ability to autocomplete BibTeX keys to make adding your bibliographic references easier and error-free. You can start to write `\[@` or simply `@` and the text editor will prompt you with all your references assocated with the article. If you wish to refine the autocompltetion, just add the first letter of the name of the author to reduce the suggestions. 

## Export Module
Based on our experience with cahins based on the idea of *single source publishing* (generating multiple export formats from a single source), we have started from scratch to create a new export module that is more stable, better looking, and better performing. Unlike  the *legacy* module(old export), the new export module now allows for the export of XML-TEI Commons Publishing format, a system shared with [Métopes](http://www.metopes.fr/) and [OpenEdition's](https://www.openedition.org/) infrastructures. 

![export](uploads/images/stylo-v2-export-eng.png)

## Pandoc Web Service
The technological heart of Sylo's export module is based in [Pandoc's](https://pandoc.org/) conversion software. To best meet the users' needs, we decided to decertaize Pandoc into a web interface indepdent of Stylo. Thus, Pandoc is now accesible via a graphical user interface, creating the option for you to customize the documents that you wish to convert as you like! This service is based on an API that we use for Stylo's export module. 

It is possible to access the Stylo export module indepdently:

https://export.stylo.huma-num.fr

## API GraphQL
The API grants access to Stylo's data thanks to the query language GraphQL! From the endpoint(https://stylo.huma-num.fr/graphql), you can connect Stylo to a variety of custimized features.For example, the API allows you to retreive your articles and integrate them in your site manger of the your favorite static site generator. Demonstrations will be provided soon. 

To execute a POST request, you first need to get your APIkeys from you your Stylo account. Then you can write your request in your prefered environment (ex: GraphQL Playground) and begin playing with your Stylo data! If you use GraphQL Playground, the API auto-documents directly in your interface! You will be able to access all queries and usable parameters in only a few clicks.

Here is an example of a request for fathering your articles:

```
query AllMyArticles {
    user {
        _id
        email
        
        articles {
            _id
            title
        }
    }
}
```

## Coming Soon

The Sylo documentation has been updated to reflect these changes (English language version in progress). 

We are already planning other improvements to Stylo, like the replacement of account sharing with a new feature or the improvement of the book feature! Do not hesitate to follow us on [Twitter](https://twitter.com/ENumeriques/) or the [CRCEN website](https://ecrituresnumeriques.ca/) to get the latest information on Stylo.


À vos Stylo(s)!

Team CRCEN




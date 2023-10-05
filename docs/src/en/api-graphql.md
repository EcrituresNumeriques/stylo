---
title: "API GraphQL"
---

## Setting up your GraphQl query

Stylo now incorporates a GraphQL API that users can read and write to.

The API provides access to Stylo data via the GraphQL query language.
From the endpoint [https://stylo.huma-num.fr/graphql](https://stylo.huma-num.fr/graphql), you can connect Stylo to a whole range of customized functionalities.
For example, the API allows you to retrieve your articles and integrate them into your favorite static site generator.

To execute a request, you must first retrieve your *APIkeys* from your Stylo account settings.
Your user account settings can be found in the drop-down menu that appears when you click on your username at the top of the interface.

The user key for API configuration can be found in the second section of the account parameters under the entry `API Key`.
A button allows you to copy the entire key to the clipboard.

Then you can write your query in your preferred environment (e.g. [GraphQL Playground](https://github.com/graphql/graphql-playground)) and start playing with your Stylo data.
If you're using GraphQL Playground, the API self-documents directly in your interface.
You'll have access to all the queries and parameters you can use in just a few clicks.

Here's an example of a query to retrieve all your items:

```graphql
query tousMesArticles {
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

## Examples and applications

Coming soon.
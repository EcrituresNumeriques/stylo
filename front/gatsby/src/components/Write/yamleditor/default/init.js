import { categories } from './categories';
import { rubriques } from './rubriques';
import { keywords_en,keywords_fr} from './keywords';
const defaultYaml = `title_f: ""
title: ""
subtitle_f: ""
subtitle: ""
authors: []
date: ""
year: ""
month: ""
day: ""
abstract: []
keywords: []
controlledKeywords: []
lang: ""
id: ""
url_article: ""
typeArticle: []
publisher: ""
journal: ""
issnnum: ""
directors: []
prod: ""
prodnum: ""
diffnum: ""
rights: ""
dossier: []
issueDirectors: []
reviewers: []
translators: []
transcriber: []
translationOf: []
bibliography: ""
link-citations: true
nocite: "@*"
`
export let init = {
  obj:{},
  misc:{
    rubriques:[...[],...rubriques],
    categories:[...[],...categories],
    uncontrolled_fr:[...keywords_fr.map(o=>o.label)],
    uncontrolled_en:[...keywords_en.map(o=>o.label)],
    uncontrolledKeywords:[],
    keywords_fr:[],
    keywords_en:[],
  },
  yaml:defaultYaml
};

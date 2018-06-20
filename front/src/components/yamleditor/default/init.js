import { categories } from './categories';
import { rubriques } from './rubriques';
import { defaultYaml } from 'data/defaultYaml.js';
export let init = {
  obj:defaultYaml,
 misc:{
   rubriques:[...[],...rubriques],
   categories:[...[],...categories],
   uncontrolledKeywords:[],
   "keywords_fr":[],
   "keywords_en":[],
 }
};

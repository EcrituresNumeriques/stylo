import { categories } from './categories';
import { rubriques } from './rubriques';
import { keywords_en,keywords_fr} from './keywords';
import { defaultYaml } from '../../../data/defaultYaml';
export let init = {
  obj:defaultYaml,
 misc:{
   rubriques:[...[],...rubriques],
   categories:[...[],...categories],
   uncontrolled_fr:[...keywords_fr.map(o=>o.label)],
   uncontrolled_en:[...keywords_en.map(o=>o.label)],
   uncontrolledKeywords:[],
   "keywords_fr":[],
   "keywords_en":[],
 }
};

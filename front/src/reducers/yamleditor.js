import initialState from './initialState';
import objectAssign from 'object-assign';
import _ from 'lodash';


export default function reducer(state = initialState.yamleditor,action){
  let newState = objectAssign({}, state);
  //enable mass console.logs
  //console.log("dispatch to reducers:",action);
  if(action.type == "FORM_UPDATE"){
    _.set(newState.obj, action.target, action.value);
    _.set(newState.misc, "changed", true);
    //console.log("update",newState);
    return newState;
  }
  if(action.type == "FORM_IMPORT"){
    newState = objectAssign({},{misc:newState.misc},{obj:action.value});
    newState = decompileKeywords(newState,action.value);
    newState = compileKeywords(newState);
    //console.log("import",newState);
    return newState;
  }
  if(action.type == "FORM_WIPE"){
    _.set(newState, "obj", {});
    _.set(newState, "misc", {uncontrolledKeywords:[]});
    //console.log("wipe");
    return newState;
  }
  if(action.type == "FORM_REGISTERED"){
    _.set(newState.misc, "changed", false);
    return newState;
  }
  if(action.type == "MISC_UPDATE"){
    _.set(newState.misc, action.target, action.value);
    newState = compileKeywords(newState);
    _.set(newState.misc, "changed", true);
    return newState;
  }
  return newState;
}




function decompileKeywords(state){
  //console.log("decompile preState",JSON.stringify(state));
  //get all the typeArticle
  let typeArticle = _.get(state.obj,"typeArticle",[]);
  let toEnable = typeArticle.map((a)=>(_.get(state.misc,"rubriques",[]).map((c)=>(c.label)).indexOf(a)));
  for(let i=0;i<toEnable.length;i++){
    if(toEnable[i] > -1){
      state.misc.rubriques[toEnable[i]].selected = true;
    }
  }

  //get all the controlled keywords
  let controlledKeywords = _.get(state.obj,"controlledKeywords",[]);
  let toSelect = controlledKeywords.map((a)=>(_.get(state.misc,"categories",[]).map((c)=>(c.fr)).indexOf(a.fr)));
  for(let i=0;i<toSelect.length;i++){
    if(toSelect[i] > -1){
      state.misc.categories[toSelect[i]].selected = true;
    }
  }


  //get all the uncontrolledKeywords
  let keyword_fr = _.get(state.obj,"keywords_fr","").split(',');
  let keyword_en = _.get(state.obj,"keywords_en","").split(',');
  for(let i=0;i<keyword_fr.length&&i<keyword_en.length;i++){
    if(keyword_fr[i]!="" || keyword_en[i]!=""){
      state.misc.uncontrolledKeywords.push({fr:keyword_fr[i],en:keyword_en[i]});
    }
  }

  console.log("decompile",JSON.stringify(state.misc));
  return state;
}



function compileKeywords(state){
  //Compute selected controlled keywords
  let rubriques = _.get(state.misc,"rubriques",[]).filter(function(rubrique){
    return rubrique.selected === true;
  });
  state.obj.typeArticle = rubriques.map((r)=>(r.label));

  //compute typeArticle
  let categories = _.get(state.misc,"categories",[]).filter(function(category){
    return category.selected === true;
  });
  state.misc.controlledKeywords = categories;
  state.obj.controlledKeywords = categories.map((o)=>(Object.assign({},o))).map(function(o){delete o.selected;return o;});

  //Compute uncontrolledKeywords
  let keyword_fr = [];
  let keyword_en = [];
  //console.log(keyword_fr,keyword_en);
  for(let i=0;i<_.get(state.misc,"uncontrolledKeywords",[]).length;i++){
    keyword_fr.push(state.misc.uncontrolledKeywords[i].fr);
    keyword_en.push(state.misc.uncontrolledKeywords[i].en);
  }
  //console.log(keyword_fr,keyword_en);
  state.obj.keywords_fr = keyword_fr.join(',');
  state.obj.keywords_en = keyword_en.join(',');
  //console.log("update keywords");
    console.log("compile",JSON.stringify(state.obj));
  return state;
}

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
    //console.log("import",newState);
    return newState;
  }
  if(action.type == "FORM_WIPE"){
    _.set(newState, "obj", {});
    //console.log("wipe");
    return newState;
  }
  if(action.type == "FORM_REGISTERED"){
    _.set(newState.misc, "changed", false);
    return newState;
  }
  return newState;
}

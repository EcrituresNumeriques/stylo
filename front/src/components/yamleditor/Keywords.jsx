import React from 'react'
import _ from 'lodash'

export function Keywords(props){
  let keyword_fr_f = _.get(props.state,"obj.keyword_fr_f",'');
  let keyword_en_f = _.get(props.state,"obj.keyword_en_f",'');

  if(!Array.isArray(keyword_en_f)){keyword_en_f = keyword_en_f == '' ? []:keyword_en_f.split(', ')}
  else{props.updateState(keyword_en_f.join(', '),'keyword_en_f')}
  if(!Array.isArray(keyword_fr_f)){keyword_fr_f = keyword_fr_f == '' ? []:keyword_fr_f.split(', ')}
  else{props.updateState(keyword_en_f.join(', '),'keyword_fr_f')}

  //If imported, add in misc state
  if(props.state.misc.keywords_fr.length != keyword_fr_f.length){props.updateMisc(keyword_fr_f,'keywords_fr');}
  if(props.state.misc.keywords_en.length != keyword_en_f.length){props.updateMisc(keyword_en_f,'keywords_en');}

  let uncontrolledKeywords = [];
  for(let i=0;i<keyword_fr_f.length || i<keyword_en_f.length;i++){
    uncontrolledKeywords.push({fr:_.get(keyword_fr_f,"["+i+"]",""),en:_.get(keyword_en_f,"["+i+"]","")});
  }
  return(
      <section className="group">
        <h1><i className="fa fa-tag" aria-hidden="true"></i> Mots clés</h1>
        <datalist id="keywordsUCFR">
          {props.state.misc.uncontrolled_fr && props.state.misc.uncontrolled_fr.map((o,i)=>(<option key={"keywordsUCFR"+i} value={o}/>))}
        </datalist>
        <datalist id="keywordsUCEN">
          {props.state.misc.uncontrolled_en && props.state.misc.uncontrolled_en.map((o,i)=>(<option key={"keywordsUCeN"+i} value={o}/>))}
        </datalist>


        {uncontrolledKeywords.map((o,i)=>(<Keyword key={"keywords"+i} index={i} object={o} removeKeyword={props.removeKeyword} updateMisc={props.updateMisc}/>))}
        <InputKeyword state={props.state.misc} addKeyword={props.addKeyword} updateMisc={props.updateMisc}/>
      </section>
    )
  }

  function Keyword(props){


      return(
        <div className="keywords">
          <input className="free" type="text" placeholder="FR" value={props.object.fr} onChange={(e)=>props.updateMisc(e.target.value,'keywords_fr[' + props.index + ']','uncontrolledKeywords')}/>
          <input className="free" type="text" placeholder="EN" value={props.object.en} onChange={(e)=>props.updateMisc(e.target.value,'keywords_en[' + props.index + ']','uncontrolledKeywords')}/>
          <i className="fa fa-minus-circle" aria-hidden="true" data-id={props.index} onClick={()=>props.removeKeyword(props.index)}></i>
        </div>
      )
  }


function InputKeyword(props){
    return(
      <div className="keywords">
        <input type="text" id="kwFR" placeholder="mot clé" list="keywordsUCFR" value={_.get(props.state,"keyword_fr_f","")} onInput={(e)=>props.updateMisc(e.target.value,'keyword_fr_f')}/>
        <input type="text" id="kwEN" placeholder="Keyword" list="keywordsUCEN" value={_.get(props.state,"keyword_en_f","")} onInput={(e)=>props.updateMisc(e.target.value,'keyword_en_f')}/>
        <i className="fa fa-check validate" aria-hidden="true" onClick={()=>props.addKeyword()}></i>
      </div>
    )
}

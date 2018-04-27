export default function prompt(text = "text", placeholder = "placeholder",callback = (i)=>i,allowEmpty = false){
    let recipient = window.prompt(text,placeholder);
    if(recipient == null || (!allowEmpty && recipient == "")){
        return "";
    }
    else{
        return callback(recipient);
    }
}

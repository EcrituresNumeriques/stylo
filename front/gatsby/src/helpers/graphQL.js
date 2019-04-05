import env from '../helpers/env'

const askGraphQL = async (payload,action = 'fetching from the server',token = null) => {
    const response = await fetch(env.GRAPHQL_ENDPOINT,{
        method: "POST",
        mode: "cors",
        credentials: 'include', 
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": token? "Session "+token:null
        },
        body: JSON.stringify(payload),
    })

    if(!response.ok){

        let res = await response.json()
        if(res){res = res.errors || [{message:"problem"}]}
        if(res){res = res[0].message}
        alert(`${JSON.stringify(res)}.\nSomething wrong happened during: ${action} =>  ${response.status}, ${response.statusText}.`);
        

        throw new Error(await response.json())
    }
    
    const json = await response.json()
    if(json.errors){throw new Error(json.errors[0].message)}
    return json.data
}

export default askGraphQL
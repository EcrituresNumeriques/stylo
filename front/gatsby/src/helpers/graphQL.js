import env from '../helpers/env'

const askGraphQL = async (payload,action = 'fetching from the server') => {

    const response = await fetch(env.GRAPHQL_ENDPOINT,{
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
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
    return json.data
}

export default askGraphQL
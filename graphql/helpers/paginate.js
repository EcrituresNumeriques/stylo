const paginate = (array,limit,page) => {
    if(limit){
        if(page && page > 1){
            array = array.slice(-(limit * page),-(limit * (page - 1)))
        }
        else{
            array = array.slice(-limit)
        }
    }
    return array
}

module.exports = paginate

function readInt(name, value){
    let msg;
    if(value === undefined || value === null || value === "" || value.trim() === ""){
        return {
            ok:false,
            msg:`${name} must exist and can not be empty`
        }
    }else{
        let v 
        try {
            v = parseInt(value)
            return {
                ok:true,
                value:v
            }
        } catch (error) {
            return {
                ok:false,
                msg:`${name} must be an integer`
            }
        }
    }

}


module.exports = readInt
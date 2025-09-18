
const jwt = require("jsonwebtoken")


SECRET = "1234567"

const token = jwt.sign({
    username:"Tie Wang"
}, SECRET)

console.log(token)


const obj = jwt.verify(token, SECRET)

for(let p in obj){
    console.log(`${p} = ${obj[p]}`)
}



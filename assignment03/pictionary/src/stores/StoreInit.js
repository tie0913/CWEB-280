import { useUserStore } from "./UserStore";
import { useModeStore } from './ModeStore'
import { apiRequest } from "../network/Request";
export async function init() {

    let clean = true
    try {
        const result = await apiRequest('/users/self', {
            method: "GET"
        })
        if(result.code === 0){
            const user = result.body
            useModeStore().init()
            useUserStore().setAuth(user)
            if(!user.admin && useModeStore().isAdminMode()){
                useModeStore().toggle()
            }
            clean = false
        }
    } catch (e) {

    }

    if(clean){
        useUserStore().logout()
        useModeStore().clear()
        useModeStore().init()
    }
}
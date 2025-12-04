import { useUserStore } from "./UserStore";
import { useModeStore } from './ModeStore'
import { apiRequest } from "../network/Request";

/**
 * Initialize application session state.
 *
 * - Calls `/users/self` to fetch current user.
 * - On success:
 *   - Initializes mode store.
 *   - Sets authenticated user.
 *   - Ensures non-admin users cannot stay in Admin Mode.
 * - On failure or missing/invalid user:
 *   - Logs out user.
 *   - Clears mode and reinitializes to default.
 *
 * @async
 * @function init
 * @returns {Promise<void>}
 */
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
        console.error('Reading local storage has error', e)
    }

    if(clean){
        useUserStore().logout()
        useModeStore().clear()
        useModeStore().init()
    }
}
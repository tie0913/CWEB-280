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

    const modeStore = useModeStore()
    const userStore = useUserStore()
    let clean = true
    try {
        const result = await apiRequest('/users/self', {
            method: "GET"
        })
        if(result.code === 0){
            const user = result.body
            modeStore.init()
            userStore.set(user)
            if(!user.admin && modeStore.isAdminMode()){
                modeStore.toggle()
            }
            clean = false
        }
    } catch (e) {
        console.error('Reading local storage has error', e)
    }

    if(clean){
        userStore.logout()
        modeStore.clear()
        modeStore.init()
    }
}
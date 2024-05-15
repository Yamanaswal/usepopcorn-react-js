import { useEffect } from "react";

export function useKey(key, action) {

    useEffect(() => {

        function callback(e) {

            //Keyboard Esc Button
            if (e.code.toLowerCase() === key.toLowerCase()) {
                action()
            }

        }
        //Adding Listener.
        document.addEventListener("keydown", callback);

        //Clean Up Effect. 
        //Note: Called After UnMounted
        return function () {

            //Remove Listener.
            document.removeEventListener("keydown", callback);
        }

    }, [action, key]);

}
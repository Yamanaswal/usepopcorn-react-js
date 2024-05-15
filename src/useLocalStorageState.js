import { useEffect, useState } from "react";

export function useLocalStorageState(initState, key) {


    // //Lazy lodaing => useState we can pass callback function
    const [value, setValue] = useState(function () {
        const storeData = localStorage.getItem(key);
        if (storeData) {
            return JSON.parse(storeData);
        } else {
            return initState;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key])

    return [value, setValue];

}
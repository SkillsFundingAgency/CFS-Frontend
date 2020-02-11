import {useEffect} from "react";

export const useEffectOnce = (func:any) => useEffect(func, []);
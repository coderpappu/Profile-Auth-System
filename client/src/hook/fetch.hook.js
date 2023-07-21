import { useEffect, useState } from "react";
import axios from "../helper/api";
import { getUsername } from "../helper/helper";

export default function useFetch(query){
    const [getData, setData ] = useState({isLoading : false, apiData : undefined, status : null , serverError : null});
    useEffect(() =>{
        // if(!query) return;

        const fetchData = async () =>{
            try {
                setData(prev => ({...prev, isLoading : true}))

                let {username} = !query ? await getUsername() : "";
               
                
              
                const {data, status} = !query ? await axios.get(`/api/user/${username}`) : await axios.get(`/api/${query}`);
              
                if(status == 200){
                    setData(prev => ({...prev, isLoading : false}));
                    setData(prev => ({...prev, apiData:data, status : status}));
                
                }
                setData(prev => ({...prev, isLoading : false}));
            } catch (error) {
                setData(prev => ({...prev, isLoading : false, serverError : error}))
            }
        };
        fetchData();
    }, [query]);

    return [getData, setData]
}
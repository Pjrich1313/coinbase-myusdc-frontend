import { useQuery } from "@tanstack/react-query"
import { getTransfers } from "../api"
import { useAuth } from "@clerk/clerk-react"

export const useGetTransfers = () => {
    const { getToken, isSignedIn, isLoaded } = useAuth();

    return useQuery({
        queryKey: ["getTransfers"],
        queryFn: async () => getTransfers((await getToken()) as string),
        refetchOnWindowFocus: false,
        enabled: isLoaded && !!isSignedIn
    })
}
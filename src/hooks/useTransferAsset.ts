import { useMutation, useQueryClient } from "@tanstack/react-query"
import { transferAsset } from "../api"
import { useAuth } from "@clerk/clerk-react"
import { toast } from "react-toastify";
import { useAppUser } from "../contexts/user.context";

export const useTransferAsset = (recipient: string, asset: string, amount: number) => {
    const queryClient = useQueryClient();
    const { getToken } = useAuth();
    const { user } = useAppUser();

    const mutation = useMutation({
        mutationFn: async () =>
            transferAsset((await getToken()) as string, { asset, data: { recipient: recipient.trim(), amount } }),
        onSuccess: async () => {
            try {
                await queryClient.invalidateQueries({ queryKey: ['getUser'] })
            } catch (err) {
                console.error(err);
            }
        }
    });

    const _transferAsset = () => {
        if (!user) return;

        const cleanedRecipient = recipient.trim();
        if (!cleanedRecipient)
            return toast.error("Enter a recipient wallet or email");
        if (!Number.isFinite(amount) || amount <= 0)
            return toast.error("Enter a valid transfer amount");
        if ((user.wallet.usdcBalance || 0) < amount)
            return toast.error("Insufficient USDC balance");

        const _promise = mutation.mutateAsync();
        toast.promise(_promise, {
            pending: "Sending...",
            success: "Transfer successful!",
            error: "Transfer failed, please check history or try again!"
        })
    }

    return {
        transferAsset: _transferAsset,
        ...mutation
    }
}
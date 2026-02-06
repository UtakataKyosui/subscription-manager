import { auth } from "@my-better-t-app/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Subscriptions from "./subscriptions";

export default async function SubscriptionsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div>
            <Subscriptions />
        </div>
    );
}

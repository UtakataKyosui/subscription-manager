"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async () => {
        setLoading(true);
        await authClient.signIn.email({
            email,
            password,
            fetchOptions: {
                onSuccess: () => {
                    toast.success("ログインしました");
                    router.push("/dashboard");
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message);
                },
            },
        });
        setLoading(false);
    };

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>ログイン</CardTitle>
                <CardDescription>メールアドレスとパスワードを入力してください。</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="email">メールアドレス</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="password">パスワード</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" onClick={handleSignIn} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    ログイン
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={onSwitchToSignUp}>
                    アカウントをお持ちでない方はこちら
                </Button>
            </CardFooter>
        </Card>
    );
}

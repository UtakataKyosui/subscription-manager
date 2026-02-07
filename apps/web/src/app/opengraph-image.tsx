import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "〜サブスク管理アプリ〜";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "linear-gradient(to bottom right, #4f46e5, #06b6d4)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.1)",
                        padding: "40px 80px",
                        borderRadius: "20px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                    }}
                >
                    <div
                        style={{
                            color: "white",
                            fontSize: 80,
                            fontWeight: "bold",
                            textAlign: "center",
                            lineHeight: 1.2,
                        }}
                    >
                        〜サブスク管理アプリ〜
                    </div>
                </div>
                <div
                    style={{
                        marginTop: 40,
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: 32,
                        fontWeight: "normal",
                    }}
                >
                    サブスク管理しようね〜
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}

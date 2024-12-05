"use client";

import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import Link from "next/link";
import PulseImage from "../components/UI/Image";
import { useDynamicForm } from "@/hooks/useCustomForm";
import { signInSchema } from "@/schemas/signInSchema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useVideoContext } from "../context/VideoContext";

type SignInInputs = {
    username: string;
    password: string;
};

const fields = [
    { name: "username", placeholder: "username", type: "text" },
    { name: "password", placeholder: "password", type: "password" },
];

export default function SignIn() {
    const router = useRouter();
    const { state, dispatch } = useVideoContext();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: SignInInputs) => {
        setError(null); 
        setIsLoading(true);
        const structureData = {
            Username: data.username,
            Password: data.password,
        };

        try {
            const response = await fetch("http://localhost:8080/login", {
                method: "POST",
                body: JSON.stringify(structureData),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const responseData = await response.json();

                if (responseData?.token) {
                    dispatch({ type: "SET_TOKEN", payload:{token:responseData.token,username:String(data.username)} });
                    router.push("/screens/dashboard");
                } else {
                    setError("Invalid credentials. Please try again.");
                }
            } else {
                setError("Unexpected response from the server. Please try again later.");
            }
        } catch (err) {
            console.error("Error:", err);
            setError("An error occurred while signing in. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    };

    const { register, onSubmitHandler, errors } = useDynamicForm<SignInInputs>(
        signInSchema,
        onSubmit
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                gap: 4,
                flexWrap: "wrap",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
                width: "100%",
                borderRadius: "10px",
                justifyContent: "center",
                fontFamily: "Arial, sans-serif",
                padding: "30px",
                boxSizing: "border-box",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
        >
            <div
                style={{
                    flex: 1,
                    maxWidth: "800px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <h1
                    style={{
                        fontSize: "2rem",
                        marginBottom: "20px",
                        color: "#333",
                        textAlign: "center",
                    }}
                >
                    Welcome Back!
                </h1>
                <p
                    style={{
                        fontSize: "1rem",
                        color: "#555",
                        textAlign: "center",
                        marginBottom: "30px",
                    }}
                >
                    Please sign in to continue to your account.
                </p>
                <div className="flex flex-col items-start justify-start gap-2 w-80">
                    <form
                        onSubmit={onSubmitHandler}
                        className="flex flex-col items-start justify-center gap-2 w-80"
                    >
                        {fields.map(({ name, placeholder, type }) => (
                            <div key={name} style={{ marginBottom: "10px", width: "100%" }}>
                                <Input
                                    color="danger"
                                    placeholder={placeholder}
                                    type={type}
                                    style={{ marginBottom: "10px", color: "white" }}
                                    {...register(name as keyof SignInInputs, {
                                        required: `${placeholder} is required`,
                                    })}
                                />
                                {errors[name as keyof SignInInputs] && (
                                    <span className="text-red-500">
                                        {errors[name as keyof SignInInputs]?.message}
                                    </span>
                                )}
                            </div>
                        ))}
                        {error && (
                            <div
                                style={{
                                    color: "red",
                                    fontSize: "0.875rem",
                                    marginBottom: "10px",
                                }}
                            >
                                {error}
                            </div>
                        )}
                        <p className="text-black">
                            Don't have an account?{" "}
                            <Link className="text-blue-400" href="/screens/auth/signUp">
                                Sign Up
                            </Link>
                        </p>
                        <Button
                            isLoading={isLoading}
                            type="submit"
                            style={{
                                padding: "10px 20px",
                                fontSize: "1rem",
                                borderRadius: "5px",
                            }}
                        >
                            Sign In
                        </Button>
                    </form>
                </div>
            </div>

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <PulseImage
                    src="/let-talk-logo.jpg"
                    alt="Let's Talk Logo"
                    width={250}
                    height={250}
                    enablePulse={true}
                />
            </div>
        </div>
    );
}

"use client";

import { Input } from "@nextui-org/input";

import Link from "next/link";
import { useDynamicForm } from "@/hooks/useCustomForm";
import { signUpSchema } from "@/schemas/signUpSchema";
import Button from "../components/UI/Button";
import PulseImage from "../components/UI/Image";
import { useRouter } from "next/navigation";


type SignUpInputs = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUp() {
  const router = useRouter()

  const onSubmit =async (data: SignUpInputs) => {
    console.log("Form submitted:", data);
    const structureData = {
      Username: data.fullName,
      Email: data.email,
      Password: data.password,
  };

  try {
      const response = await fetch("http://localhost:8080/register", {
          method: "POST",
          body: JSON.stringify(structureData),
          headers: {
              "Content-Type": "application/json",
          },
      });
      const contentType = response.headers.get("content-type");
  
      if (contentType && contentType.includes("application/json")) {
          const responseData = await response.json();
          
          console.log("Success:", responseData);
          
          router.push("/dashboard")
      } else {
          const textResponse = await response.text();
          console.error("Unexpected response:", textResponse);
      }

  } catch (error) {
      console.error("Error:", error);
  }
  };

  const { register, onSubmitHandler, errors, } = useDynamicForm<SignUpInputs>(
    signUpSchema,
    onSubmit
  );

  console.log("re rendered")

  const fields = [
    { name: "fullName", placeholder: "Full Name", type: "text" },
    { name: "email", placeholder: "Email", type: "email" },
    { name: "password", placeholder: "Password", type: "password" },
    { name: "confirmPassword", placeholder: "Confirm Password", type: "password" },
  ];

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
          Create Your Account
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#555",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Fill in your details to start your journey with us.
        </p>
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col items-start justify-center gap-2 w-80"
        >
          {fields.map(({ name, placeholder, type }) => (
            <div key={name} style={{ marginBottom: "10px", width: "100%" }}>
              <Input
                {...register(name as keyof SignUpInputs, {
                  required: `${placeholder} is required`,
                })}
                placeholder={placeholder}
                type={type}
                color="danger"
              />
              {errors[name as keyof SignUpInputs] && (
                <span className="text-red-500">
                  {errors[name as keyof SignUpInputs]?.message}
                </span>
              )}
            </div>
          ))}
          <p className="text-black">
            Already have an account?{" "}
            <Link className="text-blue-400" href="/">
              Sign In
            </Link>
          </p>
          <Button
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              borderRadius: "5px",
            }}
            type="submit"
          >
            Register
          </Button>
        </form>
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

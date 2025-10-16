// src/pages/SignUpPage.tsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser, type CreateUserPayload } from "@/features/auth/authSlice";
import { toast } from "sonner";

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Hospital } from "lucide-react";
import { useAppDispatch } from "@/hooks/hooks";

// Import assets
import backgroundImage from "@/assets/background.png";
import authreeIcon from "@/assets/authree_logo.png"; // Import the icon

const ROLES = {
  DOCTOR: 3,
  PATIENT: 4,
};

const SignUpPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role_id: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role_id: value }));
  };

  const handleSignUpSuccess = () => {
    toast.success("Account created successfully!", {
      description:
        "Please check your email for a message with your login password.",
      duration: 5000,
    });
    navigate("/login");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role_id) {
      toast.error("Please select a role for this account.");
      return;
    }
    setIsLoading(true);

    const userData: CreateUserPayload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      role_id: parseInt(formData.role_id, 10),
    };

    const promise = dispatch(createUser(userData)).unwrap();

    toast.promise(promise, {
      loading: "Creating your account...",
      success: () => {
        handleSignUpSuccess();
        return "Account setup is in progress.";
      },
      error: (err) => {
        console.error("Sign-up failed:", err);
        return "Could not create account. The email may already be in use.";
      },
      finally: () => setIsLoading(false),
    });
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Panel */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Hospital className="size-4" />
            </div>
            Gong Clinic
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an Account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  A secure password will be generated and sent to your email.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      placeholder="Emily"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      placeholder="Carter"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="emily.carter@clinic.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role_id">Role</Label>
                  <Select
                    name="role_id"
                    onValueChange={handleRoleChange}
                    value={formData.role_id}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={String(ROLES.DOCTOR)}>
                        Doctor
                      </SelectItem>
                      <SelectItem value={String(ROLES.PATIENT)}>
                        Patient
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* --- Start: Added Footer --- */}
        <footer className="mt-auto text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <span>Powered by</span>
            <a
              href="" // Add your link here
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
            >
              <img
                src={authreeIcon}
                alt="Authree Logo"
                className="h-5 w-5"
                width={32}
                height={32}
              />
              Authree
            </a>
          </p>
        </footer>
        {/* --- End: Added Footer --- */}
      </div>

      {/* Right Panel (Image) */}
      <div className="bg-muted relative hidden lg:block">
        <img
          width={1920}
          height={1080}
          src={backgroundImage}
          alt="Abstract background"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>
    </div>
  );
};

export default SignUpPage;

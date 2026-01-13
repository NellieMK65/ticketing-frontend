import React, { createContext } from "react";

type User = {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
};

type Auth = {
  isLoggedIn: boolean;
  user: User | undefined;
  access_token: string | undefined;
};

// 1. Create context with the default values (Inferring)

export const AuthContext = createContext<Auth>({
  isLoggedIn: false,
  user: undefined,
  access_token: undefined,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let user = undefined;

  // we are handle parsing via the try/catch block since JSON.parse usually throws
  // errors when it`s unable to do parsing
  try {
    user = JSON.parse(localStorage.getItem("user") ?? "") as User;
  } catch (error) {
    console.log(error);
    user = undefined;
  }

  const access_token = localStorage.getItem("access_token") as
    | string
    | undefined;

  // derived state -> getting state from other values
  const isLoggedIn = !!user && !!access_token;

  return (
    <AuthContext.Provider value={{ access_token, isLoggedIn, user }}>
      {children}
    </AuthContext.Provider>
  );
};

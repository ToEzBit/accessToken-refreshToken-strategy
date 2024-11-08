"use client";

import { useAuth } from "@/providers/auth-provider";
import axiosInstance from "@/config/axios-config";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuth, accessToken, addAccessToken, handleLogOut } = useAuth();
  const [user, setUser] = useState();

  const login = async () => {
    const response = await axiosInstance.post("auth/login", null, {
      withCredentials: true,
    });

    if (response.statusText === "OK") {
      const { accessToken } = response.data;
      addAccessToken(accessToken);
    } else {
      console.error("Login failed");
    }
  };

  const fetchMe = async () => {
    try {
      const res = await axiosInstance.get("auth/me");

      console.log(res.data);
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const onClickLogout = async () => {
    await axiosInstance.get("auth/logout", {
      withCredentials: true,
    });
    handleLogOut();
  };

  useEffect(() => {
    // fetchMe();
    console.log("first");
  }, []);

  return (
    <div className="">
      <div className="text-center mt-10">
        <p className="text-xl">{isAuth ? "is authen" : "is not authen"}</p>
        <p className="text">{accessToken}</p>
      </div>
      <div className="mx-10">
        <button className="bg-teal-400 p-2 rounded-md" onClick={login}>
          login
        </button>
        <div className="mx-10"></div>
        <button className="bg-orange-300 p-2 rounded-md" onClick={fetchMe}>
          get me
        </button>
        <button
          className="bg-orange-300 p-2 rounded-md"
          onClick={onClickLogout}
        >
          log out
        </button>

        <p>
          name :{user?.name} stand : {user?.stand}
        </p>
      </div>
    </div>
  );
}

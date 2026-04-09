import { useEffect } from "react";
import { api } from "../../api/axios";
import { useAuthStore } from "../store";
import type { User } from "../../types";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthChecked = useAuthStore((state) => state.setAuthChecked);

  useEffect(() => {
    api
      .get<User>("/auth/me")
      .then((res) => {
        if (res.data && res.data.id) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, [setUser, setAuthChecked]);

  return <>{children}</>;
}
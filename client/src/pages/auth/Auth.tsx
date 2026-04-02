import { useParams } from "react-router-dom";
import { AuthView } from "@daveyplate/better-auth-ui";

const Auth = () => {
  const { pathname } = useParams();
  return (
    <main className="p-6 flex flex-col justify-center items-center h-[80vh]">
      <AuthView
        pathname={pathname}
        classNames={{ base: "bg-black/10 ring ring-indigo-900" }}
      />
    </main>
  );
};

export default Auth;

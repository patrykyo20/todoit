import { signInAction } from "@/actions/authAction";
import { Button } from "../../ui/Button";

export const Login = () => {
  return (
    <form action={signInAction}>
      <Button type="submit">Login</Button>
    </form>
  );
};

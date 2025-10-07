import { useNavigate } from "react-router-dom";

export function useNavigation() {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    navigate(path);
  };

  const goBack = () => {
    navigate(-1);
  };

  const replace = (path: string) => {
    navigate(path, { replace: true });
  };

  return { goTo, goBack, replace };
}

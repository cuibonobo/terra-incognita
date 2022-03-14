import { useContext } from "preact/hooks";
import { Store } from "../store";

const useStore = () => {
  return useContext(Store);
};

export default useStore;

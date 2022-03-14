import { h, ComponentChildren } from "preact";
import { useReducer } from "preact/hooks";
import { appReducer } from "../reducers";
import { initialState, Store } from "../store";

const Provider = (props: {children: ComponentChildren}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <Store.Provider value={{state, dispatch}}>{props.children}</Store.Provider>
  );
};

export default Provider;

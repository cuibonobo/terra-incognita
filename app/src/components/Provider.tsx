import { h, ComponentChildren } from "preact";
import { useReducer } from "preact/hooks";
import { appReducer } from "../reducers";
import { initialState, Store } from "../store";
import { createDispatchActions } from "../actions";

const Provider = (props: {children: ComponentChildren}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const actions = createDispatchActions(dispatch);
  return (
    <Store.Provider value={{state, actions}}>{props.children}</Store.Provider>
  );
};

export default Provider;

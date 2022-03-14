import { createContext } from "preact";
import { Meta } from "../../shared";
import { Action } from "./actions";

export interface AppState {
  isLoading: boolean,
  meta: Meta | null,
  numImagesSqrt: number | null,
  imgSquareSize: number | null,
  resizedImages: string[] | null
}

export const initialState: AppState = {
  isLoading: true,
  meta: null,
  numImagesSqrt: null,
  imgSquareSize: null,
  resizedImages: null
}

interface ContextProps {
  state: AppState;
  dispatch: (action: Action) => void;
}

export const Store = createContext({} as ContextProps);

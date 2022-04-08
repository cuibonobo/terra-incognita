import { createContext } from "preact";
import { Meta } from "../../shared";
import { DispatchActions } from "./actions";

export interface AppState {
  isLoading: boolean,
  meta: Meta | null,
  numImagesSqrt: number | null,
  imgSquareSize: number | null,
  imgArray: number[] | null,
  resizedImages: string[] | null,
  messenger: {send: (data: any) => void} | null,
  alerts: AlertItem[],
  isReloading: boolean,
  isOffline: boolean
}

export const initialState: AppState = {
  isLoading: true,
  meta: null,
  numImagesSqrt: null,
  imgSquareSize: null,
  imgArray: null,
  resizedImages: null,
  messenger: null,
  alerts: [],
  isReloading: false,
  isOffline: false
}

interface ContextProps {
  state: AppState;
  actions: DispatchActions;
}

export const Store = createContext({} as ContextProps);

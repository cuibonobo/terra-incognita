import { Meta } from "../../shared"

export enum ActionTypes {
  UpdateLoadingStatus,
  UpdateMeta,
  UpdateNumImagesSqrt,
  UpdateImgSquareSize,
  UpdateResizedImages,
  UpdateMessenger
}

interface UpdateLoadingStatus {
  type: ActionTypes.UpdateLoadingStatus,
  isLoading: boolean
}
interface UpdateMeta {
  type: ActionTypes.UpdateMeta,
  meta: Meta
}
interface UpdateNumImagesSqrt {
  type: ActionTypes.UpdateNumImagesSqrt,
  numImagesSqrt: number
}
interface UpdateImgSquareSize {
  type: ActionTypes.UpdateImgSquareSize,
  imgSquareSize: number
}
interface UpdateResizedImages {
  type: ActionTypes.UpdateResizedImages,
  resizedImages: string[]
}
interface UpdateMessenger {
  type: ActionTypes.UpdateMessenger,
  messenger: {send: (data: any) => void}
}

export type Action = UpdateLoadingStatus | UpdateMeta | UpdateNumImagesSqrt | UpdateImgSquareSize | UpdateResizedImages | UpdateMessenger;

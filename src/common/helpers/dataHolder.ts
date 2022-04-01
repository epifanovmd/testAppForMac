import { makeAutoObservable } from "mobx";
import isEmpty from "lodash/isEmpty";

enum DataHolderState {
  READY = 0,
  LOADING = 2,
  ERROR = 500,
}

interface IDataHolderError {
  type?: string;
  code?: string;
  msg: string;
}

export interface IDataHolderState {
  isLoading(): boolean;

  isError(): boolean;

  isReady(): boolean;

  isFilled(): boolean;

  isEmpty(): boolean;
}

export class DataHolder<T> implements IDataHolderState {
  public data: T | undefined;
  public error?: IDataHolderError;
  private _state!: DataHolderState;

  constructor(data?: T) {
    if (data) {
      this.setData(data);
    } else {
      this.setLoading();
    }
    makeAutoObservable(this, {}, { autoBind: true });
  }

  public setLoading() {
    this._state = DataHolderState.LOADING;

    return this;
  }

  public setData(data: T) {
    this.data = data;
    this._state = DataHolderState.READY;

    return this;
  }

  public setError(error: IDataHolderError) {
    this.error = error;
    this._state = DataHolderState.ERROR;

    return this;
  }

  public isReady() {
    return this._state === DataHolderState.READY;
  }

  public isLoading() {
    return this._state === DataHolderState.LOADING;
  }

  public isError() {
    return this._state === DataHolderState.ERROR;
  }

  public isEmpty() {
    return this.isReady() && isEmpty(this.data);
  }

  public isFilled() {
    return this.isReady() && !isEmpty(this.data);
  }
}

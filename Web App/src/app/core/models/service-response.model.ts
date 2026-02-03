export class ServiceResponse<T> {
  data?: T;
  message: string = '';
  isSuccess: boolean = false;
  timeStamp?: Date;

  constructor(init?: Partial<ServiceResponse<T>>) {
    Object.assign(this, init);
    if (!this.timeStamp) this.timeStamp = new Date();
  }

  // Static method for success
  static Success<T>(data: T, message: string = 'Success'): ServiceResponse<T> {
    return new ServiceResponse<T>({
      data,
      isSuccess: true,
      message,
      timeStamp: new Date()
    });
  }

  // Static method for failure
  static Failure<T>(message: string = 'Failure'): ServiceResponse<T> {
    return new ServiceResponse<T>({
      data: undefined,
      isSuccess: false,
      message,
      timeStamp: new Date()
    });
  }
}
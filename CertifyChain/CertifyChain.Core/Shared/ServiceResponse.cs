namespace CertifyChain.Infrastructure.Shared;

using System;

public class ServiceResponse<T>
{
    public T? Data { get; set; }

    public string Message { get; set; } = string.Empty;

    public bool IsSuccess { get; set; }

    public DateTime? TimeStamp { get; set; }

    public static ServiceResponse<T> Success(T data, string message = "Success")
    {
        return new ServiceResponse<T>()
        {
            TimeStamp = new DateTime?(DateTime.Now),
            Data = data,
            IsSuccess = true,
            Message = message
        };
    }

    public static ServiceResponse<T> Failure(string message = "Failure")
    {
        return new ServiceResponse<T>()
        {
            TimeStamp = new DateTime?(DateTime.Now),
            Data = default,
            IsSuccess = false,
            Message = message
        };
    }
}
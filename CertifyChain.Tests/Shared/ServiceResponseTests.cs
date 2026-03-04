using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Tests.Shared;

public class ServiceResponseTests
{
    [Fact]
    public void Success_ReturnsIsSuccessTrue_WithData()
    {
        var response = ServiceResponse<string>.Success("result", "OK");

        Assert.True(response.IsSuccess);
        Assert.Equal("result", response.Data);
        Assert.Equal("OK", response.Message);
        Assert.NotNull(response.TimeStamp);
    }

    [Fact]
    public void Success_DefaultMessage_IsSuccess()
    {
        var response = ServiceResponse<int>.Success(42);

        Assert.True(response.IsSuccess);
        Assert.Equal(42, response.Data);
        Assert.Equal("Success", response.Message);
    }

    [Fact]
    public void Failure_ReturnsIsSuccessFalse_WithNullData()
    {
        var response = ServiceResponse<string>.Failure("Something went wrong");

        Assert.False(response.IsSuccess);
        Assert.Null(response.Data);
        Assert.Equal("Something went wrong", response.Message);
        Assert.NotNull(response.TimeStamp);
    }

    [Fact]
    public void Failure_DefaultMessage_IsFailure()
    {
        var response = ServiceResponse<string>.Failure();

        Assert.False(response.IsSuccess);
        Assert.Equal("Failure", response.Message);
    }
}

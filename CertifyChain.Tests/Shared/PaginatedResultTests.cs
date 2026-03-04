using CertifyChain.Infrastructure.Shared;

namespace CertifyChain.Tests.Shared;

public class PaginatedResultTests
{
    [Fact]
    public void Constructor_SetsPropertiesCorrectly()
    {
        var items = new List<string> { "A", "B", "C" };

        var result = new PaginatedResult<string>(items, count: 10, pageNumber: 2, pageSize: 3);

        Assert.Equal(items, result.Items);
        Assert.Equal(10, result.TotalCount);
        Assert.Equal(2, result.PageNumber);
        Assert.Equal(3, result.PageSize);
        Assert.Equal(4, result.TotalPages); // ceil(10/3) = 4
    }

    [Fact]
    public void HasPreviousPage_ReturnsFalse_WhenOnFirstPage()
    {
        var result = new PaginatedResult<string>([], count: 10, pageNumber: 1, pageSize: 5);

        Assert.False(result.HasPreviousPage);
    }

    [Fact]
    public void HasPreviousPage_ReturnsTrue_WhenNotOnFirstPage()
    {
        var result = new PaginatedResult<string>([], count: 10, pageNumber: 2, pageSize: 5);

        Assert.True(result.HasPreviousPage);
    }

    [Fact]
    public void HasNextPage_ReturnsFalse_WhenOnLastPage()
    {
        var result = new PaginatedResult<string>([], count: 10, pageNumber: 2, pageSize: 5);

        Assert.False(result.HasNextPage);
    }

    [Fact]
    public void HasNextPage_ReturnsTrue_WhenNotOnLastPage()
    {
        var result = new PaginatedResult<string>([], count: 10, pageNumber: 1, pageSize: 5);

        Assert.True(result.HasNextPage);
    }

    [Fact]
    public void TotalPages_RoundsUp_WhenCountNotEvenlyDivisible()
    {
        var result = new PaginatedResult<string>([], count: 7, pageNumber: 1, pageSize: 3);

        Assert.Equal(3, result.TotalPages); // ceil(7/3) = 3
    }
}

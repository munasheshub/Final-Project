using CertifyChain.Domain.ValueObject;

namespace CertifyChain.Tests.Entities;

public class AddressTests
{
    [Fact]
    public void Create_WithValidData_ReturnsAddressWithExpectedProperties()
    {
        var address = Address.Create("123 Main St", "Harare", "Harare", "Zimbabwe", "00263");

        Assert.Equal("123 Main St", address.Street);
        Assert.Equal("Harare", address.City);
        Assert.Equal("Harare", address.Province);
        Assert.Equal("Zimbabwe", address.Country);
        Assert.Equal("00263", address.PostalCode);
    }

    [Fact]
    public void Create_WithNullPostalCode_Succeeds()
    {
        var address = Address.Create("123 Main St", "Harare", "Harare", "Zimbabwe");

        Assert.Null(address.PostalCode);
    }

    [Fact]
    public void Update_ChangesAllFields()
    {
        var address = Address.Create("Old Street", "Old City", "Old Province", "Old Country", "00000");

        address.Update("New Street", "New City", "New Province", "New Country", "11111");

        Assert.Equal("New Street", address.Street);
        Assert.Equal("New City", address.City);
        Assert.Equal("New Province", address.Province);
        Assert.Equal("New Country", address.Country);
        Assert.Equal("11111", address.PostalCode);
    }

    [Fact]
    public void Update_WithNullPostalCode_SetsToNull()
    {
        var address = Address.Create("Street", "City", "Province", "Country", "12345");

        address.Update("Street", "City", "Province", "Country");

        Assert.Null(address.PostalCode);
    }
}

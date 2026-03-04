using CertifyChain.Domain.Entities;

namespace CertifyChain.Tests.Entities;

public class StudentTests
{
    [Fact]
    public void Create_WithValidData_ReturnsStudentWithExpectedProperties()
    {
        var student = Student.Create(
            studentNumber: "STU-001",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            dateOfBirth: new DateTime(2000, 1, 15),
            phoneNumber: "+263771234567",
            photoUrl: "https://example.com/photo.jpg");

        Assert.Equal("STU-001", student.StudentNumber);
        Assert.Equal("John", student.FirstName);
        Assert.Equal("Doe", student.LastName);
        Assert.Equal("john@example.com", student.Email);
        Assert.Equal(new DateTime(2000, 1, 15), student.DateOfBirth);
        Assert.Equal("+263771234567", student.PhoneNumber);
        Assert.Equal("https://example.com/photo.jpg", student.PhotoUrl);
    }

    [Fact]
    public void UpdateProfile_WithValidData_UpdatesAllFields()
    {
        var student = Student.Create("STU-001", "John", "Doe", "john@example.com",
            new DateTime(2000, 1, 15), "+263771234567", "photo.jpg");

        student.UpdateProfile("Jane", "Smith", "jane@example.com", "+263779999999", "new-photo.jpg");

        Assert.Equal("Jane", student.FirstName);
        Assert.Equal("Smith", student.LastName);
        Assert.Equal("jane@example.com", student.Email);
        Assert.Equal("+263779999999", student.PhoneNumber);
        Assert.Equal("new-photo.jpg", student.PhotoUrl);
    }

    [Fact]
    public void UpdateProfile_WithNullOptionalFields_SetsToNull()
    {
        var student = Student.Create("STU-001", "John", "Doe", "john@example.com",
            new DateTime(2000, 1, 15), "+263771234567", "photo.jpg");

        student.UpdateProfile("John", "Doe", "john@example.com", null, null);

        Assert.Null(student.PhoneNumber);
        Assert.Null(student.PhotoUrl);
    }

    [Fact]
    public void UpdateProfile_WithWhitespaceFirstName_KeepsOriginal()
    {
        var student = Student.Create("STU-001", "John", "Doe", "john@example.com",
            new DateTime(2000, 1, 15), "+263771234567", "photo.jpg");

        student.UpdateProfile("  ", "NewLast", "new@example.com", null, null);

        Assert.Equal("John", student.FirstName);
        Assert.Equal("NewLast", student.LastName);
    }

    [Fact]
    public void Create_CertificatesCollection_IsInitializedEmpty()
    {
        var student = Student.Create("STU-001", "John", "Doe", "john@example.com",
            new DateTime(2000, 1, 15), "", "");

        Assert.NotNull(student.Certificates);
        Assert.Empty(student.Certificates);
    }
}

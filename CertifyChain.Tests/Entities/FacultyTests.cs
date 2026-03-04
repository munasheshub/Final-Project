using CertifyChain.Domain.Entities;

namespace CertifyChain.Tests.Entities;

public class FacultyTests
{
    [Fact]
    public void Create_WithValidData_ReturnsFacultyWithExpectedProperties()
    {
        var faculty = Faculty.Create("Engineering", "ENG", institutionId: 1);

        Assert.Equal("Engineering", faculty.Name);
        Assert.Equal("ENG", faculty.Code);
        Assert.Equal(1, faculty.InstitutionId);
    }

    [Fact]
    public void Update_WithValidData_UpdatesProperties()
    {
        var faculty = Faculty.Create("Old Name", "OLD", 1);

        faculty.Update("New Name", "NEW");

        Assert.Equal("New Name", faculty.Name);
        Assert.Equal("NEW", faculty.Code);
    }

    [Fact]
    public void Update_WithWhitespaceName_KeepsOriginal()
    {
        var faculty = Faculty.Create("Engineering", "ENG", 1);

        faculty.Update("  ", "  ");

        Assert.Equal("Engineering", faculty.Name);
        Assert.Equal("ENG", faculty.Code);
    }

    [Fact]
    public void Create_ProgramsCollection_IsInitializedEmpty()
    {
        var faculty = Faculty.Create("Engineering", "ENG", 1);

        Assert.NotNull(faculty.Programs);
        Assert.Empty(faculty.Programs!);
    }
}

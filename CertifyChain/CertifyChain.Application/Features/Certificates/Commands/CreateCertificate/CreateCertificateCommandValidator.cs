namespace CertifyChain.Application.Features.Certificates.Commands.CreateCertificate;

public class CreateCertificateCommandValidator : AbstractValidator<CreateCertificateCommand>
{
    public CreateCertificateCommandValidator()
    {
        RuleFor(x => x.StudentId)
            .NotEmpty().WithMessage("Student ID is required");
        
        RuleFor(x => x.ProgramName)
            .NotEmpty().WithMessage("Program name is required")
            .MaximumLength(200).WithMessage("Program name too long");
        
        RuleFor(x => x.GraduationDate)
            .LessThanOrEqualTo(DateTime.Today).WithMessage("Graduation date cannot be in the future");
        
        RuleFor(x => x.CertificateFile)
            .NotNull().WithMessage("Certificate file is required")
            .Must(BeValidFileType).WithMessage("Invalid file type. Only PDF and images are allowed")
            .Must(BeValidFileSize).WithMessage("File size must not exceed 5MB");
    }
    
    private bool BeValidFileType(IFormFile file)
    {
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        return allowedExtensions.Contains(extension);
    }
    
    private bool BeValidFileSize(IFormFile file)
    {
        return file.Length <= 5 * 1024 * 1024; // 5MB
    }
}
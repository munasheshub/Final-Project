using CertifyChain.Infrastructure.Interfaces;
using CertifyChain.Infrastructure.Shared;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;

namespace CertifyChain.Infrastructure.Services;

public class EmailService : IEmailService
    {
        private readonly AppSettings _appSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<AppSettings> appSettings, ILogger<EmailService> logger)
        {
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        public async Task Send(string to, string subject, string code)
        {
            try
            {
                string currentDirectory = Environment.CurrentDirectory;
                var PathToFile = currentDirectory + Path.DirectorySeparatorChar.ToString() + "EmailTemplates" + Path.DirectorySeparatorChar.ToString() + "email.html";
                // create message
                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(_appSettings.EmailFrom));
                email.To.Add(MailboxAddress.Parse(to));
                email.Subject = subject;

                //edit html and add template
                string HTMLBody = "";
                using (StreamReader streamReader = File.OpenText(PathToFile))
                {
                    HTMLBody = streamReader.ReadToEnd();
                }

                string messageBody = string.Format(HTMLBody,
                       "Your Verification Code", 
                       "Use the following 6-digit code to reset your password. This code is valid for 30 minutes.", 
                       code 
                       );

                email.Body = new TextPart(TextFormat.Html) { Text = messageBody };

                // send email
                using var smtp = new MailKit.Net.Smtp.SmtpClient();
                await smtp.ConnectAsync(_appSettings.SmtpHost, int.Parse(_appSettings.SmtpPort), SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_appSettings.SmtpUser, _appSettings.SmtpPass);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email");
                throw;
            }
        }

        
        private class EmailTemplate
        {

        }

    }
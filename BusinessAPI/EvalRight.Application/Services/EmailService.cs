using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using EvalRight.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EvalRight.Application.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        _smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        _smtpUsername = _configuration["Email:SmtpUsername"] ?? "";
        _smtpPassword = _configuration["Email:SmtpPassword"] ?? "";
        _fromEmail = _configuration["Email:FromEmail"] ?? "noreply@evalright.com";
        _fromName = _configuration["Email:FromName"] ?? "EvalRight";
    }

    public async Task SendManualOrderNotificationAsync(string candidateEmail, string candidateName, string clientName, string packageName)
    {
        var subject = "Background Verification Initiated – EvalRight";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #B30022 0%, #3D007A 100%); color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f9f9f9; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>EvalRight</h1>
        </div>
        <div class=""content"">
            <p>Dear {candidateName},</p>
            <p>We are writing to inform you that <strong>{clientName}</strong> has initiated a background verification process for you through EvalRight.</p>
            <p><strong>Verification Package:</strong> {packageName}</p>
            <h3>Next Steps:</h3>
            <ul>
                <li>Our verification team will be in touch with you shortly</li>
                <li>You may be asked to provide certain documents for verification</li>
                <li>The verification process is currently in progress</li>
            </ul>
            <p>If you have any questions, please contact {clientName} directly.</p>
            <p>Best regards,<br>The EvalRight Team</p>
        </div>
        <div class=""footer"">
            <p>This is an automated message from EvalRight. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(candidateEmail, subject, body);
    }

    public async Task SendInvitationEmailAsync(string candidateEmail, string clientName, string invitationLink, DateTimeOffset? expiresAt)
    {
        var subject = "Action Required: Complete Your Background Verification";
        
        var expiryText = expiresAt.HasValue 
            ? $"<p><strong>Important:</strong> This invitation expires on {expiresAt.Value:MMMM dd, yyyy}.</p>"
            : "";

        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #B30022 0%, #3D007A 100%); color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background: #f9f9f9; }}
        .button {{ display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #B30022 0%, #3D007A 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>EvalRight</h1>
        </div>
        <div class=""content"">
            <p>Dear Candidate,</p>
            <p><strong>{clientName}</strong> has requested that you complete a background verification process through EvalRight.</p>
            <p>To proceed with your verification, please click the button below to access the secure verification portal:</p>
            <div style=""text-align: center;"">
                <a href=""{invitationLink}"" class=""button"">Start Verification</a>
            </div>
            {expiryText}
            <p>This is a secure, one-time link. Please do not share it with anyone.</p>
            <p>If you have any questions, please contact {clientName} directly.</p>
            <p>Best regards,<br>The EvalRight Team</p>
        </div>
        <div class=""footer"">
            <p>This is an automated message from EvalRight. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(candidateEmail, subject, body);
    }

    private async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        // Validate SMTP configuration
        if (string.IsNullOrEmpty(_smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
        {
            var errorMessage = "SMTP credentials are not configured. Please set Email:SmtpUsername and Email:SmtpPassword in appsettings.json";
            _logger.LogError(errorMessage);
            throw new InvalidOperationException(errorMessage);
        }

        try
        {
            _logger.LogInformation("Attempting to send email to {Email} with subject: {Subject}", toEmail, subject);

            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                Timeout = 30000 // 30 seconds timeout
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(toEmail);

            await client.SendMailAsync(message);
            
            _logger.LogInformation("Successfully sent email to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}. Error: {ErrorMessage}", toEmail, ex.Message);
            throw new Exception($"Failed to send email to {toEmail}: {ex.Message}", ex);
        }
    }
}







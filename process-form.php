<?php
// Start session for CSRF protection
session_start();

// Configuration settings
$recipient_email = 'msdigitalmarketingagency90@gmail.com'; // Change this to your actual email address
$email_subject = 'New Contact Form Submission from MS Digital Marketing Website';
$success_redirect = 'thank-you.html'; // Page to redirect to after successful submission
$error_redirect = 'error.html'; // Page to redirect to if there's an error

// Security settings
$max_submissions_per_hour = 5; // Maximum number of submissions allowed per hour from the same IP
$honeypot_field = 'website'; // Name of the honeypot field to catch bots

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // CSRF Protection - Verify token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        // Invalid CSRF token
        error_log("CSRF token validation failed: " . $_SERVER['REMOTE_ADDR']);
        header("Location: $error_redirect?error=csrf");
        exit;
    }

    // Bot detection - Honeypot check
    if (isset($_POST[$honeypot_field]) && !empty($_POST[$honeypot_field])) {
        // If the honeypot field is filled, it's likely a bot
        error_log("Honeypot trap triggered: " . $_SERVER['REMOTE_ADDR']);
        // Redirect to success page to avoid alerting the bot
        header("Location: $success_redirect");
        exit;
    }

    // IP-based rate limiting
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $submission_log_file = 'form_submissions.log';
    $current_time = time();
    $hour_ago = $current_time - 3600;

    // Load existing submission log
    $submissions = [];
    if (file_exists($submission_log_file)) {
        $submissions = json_decode(file_get_contents($submission_log_file), true) ?: [];
    }

    // Clean up old entries
    $submissions = array_filter($submissions, function($entry) use ($hour_ago) {
        return $entry['time'] >= $hour_ago;
    });

    // Count submissions from this IP in the last hour
    $ip_submissions = array_filter($submissions, function($entry) use ($ip_address) {
        return $entry['ip'] === $ip_address;
    });

    if (count($ip_submissions) >= $max_submissions_per_hour) {
        error_log("Rate limit exceeded: " . $ip_address);
        header("Location: $error_redirect?error=rate_limit");
        exit;
    }

    // Add this submission to the log
    $submissions[] = [
        'ip' => $ip_address,
        'time' => $current_time
    ];
    file_put_contents($submission_log_file, json_encode($submissions));

    // Collect and sanitize form data
    $name = isset($_POST['name']) ? htmlspecialchars(trim($_POST['name']), ENT_QUOTES, 'UTF-8') : '';
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = isset($_POST['phone']) ? htmlspecialchars(trim($_POST['phone']), ENT_QUOTES, 'UTF-8') : '';
    $company = isset($_POST['company']) ? htmlspecialchars(trim($_POST['company']), ENT_QUOTES, 'UTF-8') : '';
    $service = isset($_POST['service']) ? htmlspecialchars(trim($_POST['service']), ENT_QUOTES, 'UTF-8') : '';
    $message = isset($_POST['message']) ? htmlspecialchars(trim($_POST['message']), ENT_QUOTES, 'UTF-8') : '';

    // Session-based rate limiting - Check if submission is too frequent
    if (isset($_SESSION['last_submission_time'])) {
        $time_since_last = time() - $_SESSION['last_submission_time'];
        if ($time_since_last < 60) { // 60 seconds = 1 minute
            header("Location: $error_redirect?error=rate_limit");
            exit;
        }
    }
    $_SESSION['last_submission_time'] = time();

    // Validate form data
    if (empty($name) || empty($email) || empty($message)) {
        // Redirect to error page if required fields are missing
        header("Location: $error_redirect");
        exit;
    }

    // Validate email address
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: $error_redirect");
        exit;
    }

    // Construct the email message with better formatting
    $email_content = "<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h2 { color: #0284c7; }
        .info-item { margin-bottom: 10px; }
        .label { font-weight: bold; }
        .message-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0284c7; margin-top: 20px; }
    </style>
</head>
<body>
    <div class='container'>
        <h2>New Contact Form Submission</h2>
        <p>You have received a new message from your website contact form.</p>

        <div class='info-item'><span class='label'>Name:</span> $name</div>
        <div class='info-item'><span class='label'>Email:</span> $email</div>
        <div class='info-item'><span class='label'>Phone:</span> $phone</div>
        <div class='info-item'><span class='label'>Company:</span> $company</div>
        <div class='info-item'><span class='label'>Service Interested In:</span> $service</div>

        <div class='message-box'>
            <p><span class='label'>Message:</span></p>
            <p>" . nl2br($message) . "</p>
        </div>

        <p style='font-size: 12px; color: #666; margin-top: 30px;'>This email was sent from the contact form on MS Digital Marketing Agency website.</p>
    </div>
</body>
</html>";

    // Plain text alternative for email clients that don't support HTML
    $plain_text = "New Contact Form Submission\n\n";
    $plain_text .= "Name: $name\n";
    $plain_text .= "Email: $email\n";
    $plain_text .= "Phone: $phone\n";
    $plain_text .= "Company: $company\n";
    $plain_text .= "Service Interested In: $service\n\n";
    $plain_text .= "Message:\n$message\n\n";
    $plain_text .= "This email was sent from the contact form on MS Digital Marketing Agency website.";

    // Generate a boundary for the multipart message
    $boundary = md5(time());

    // Set email headers for multipart message
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "From: MS Digital Marketing <noreply@msdigitalmarketing.com>\r\n";
    $headers .= "Reply-To: $name <$email>\r\n";
    $headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";

    // Construct the multipart message body
    $message_body = "--$boundary\r\n";
    $message_body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $message_body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message_body .= $plain_text . "\r\n\r\n";

    $message_body .= "--$boundary\r\n";
    $message_body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message_body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message_body .= $email_content . "\r\n\r\n";

    $message_body .= "--$boundary--";

    // Log the submission attempt
    $log_message = date('Y-m-d H:i:s') . " - Form submission from: $name ($email)\n";
    file_put_contents('contact_form.log', $log_message, FILE_APPEND);

    // Send the email
    $mail_success = mail($recipient_email, $email_subject, $message_body, $headers);

    // Check if mail was sent successfully
    if ($mail_success) {
        // Log successful submission
        file_put_contents('contact_form.log', "  SUCCESS: Email sent\n", FILE_APPEND);

        // Redirect to thank you page
        header("Location: $success_redirect");
        exit;
    } else {
        // Log failed submission
        file_put_contents('contact_form.log', "  ERROR: Email failed to send\n", FILE_APPEND);

        // Try an alternative method to send email or notify admin
        $backup_message = "Form submission failed to send. Please check the server mail configuration.\n\n";
        $backup_message .= "Submission details:\n$plain_text";
        error_log($backup_message);

        // Redirect to error page
        header("Location: $error_redirect");
        exit;
    }
} else {
    // If someone tries to access this script directly, redirect them to the contact page
    header("Location: pages/contact.html");
    exit;
}
?>
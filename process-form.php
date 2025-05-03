<?php
// Configuration settings
$recipient_email = 'msdigitalmarketingagency90@gmail.com'; // Change this to your actual email address
$email_subject = 'New Contact Form Submission from MS Digital Marketing Website';
$success_redirect = 'thank-you.html'; // Page to redirect to after successful submission
$error_redirect = 'error.html'; // Page to redirect to if there's an error

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $company = filter_input(INPUT_POST, 'company', FILTER_SANITIZE_STRING);
    $service = filter_input(INPUT_POST, 'service', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
    
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
    
    // Construct the email message
    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Phone: $phone\n";
    $email_content .= "Company: $company\n";
    $email_content .= "Service Interested In: $service\n\n";
    $email_content .= "Message:\n$message\n";
    
    // Set email headers
    $headers = "From: $name <$email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    
    // Send the email
    $mail_success = mail($recipient_email, $email_subject, $email_content, $headers);
    
    // Check if mail was sent successfully
    if ($mail_success) {
        // Redirect to thank you page
        header("Location: $success_redirect");
        exit;
    } else {
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
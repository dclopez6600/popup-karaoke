<?php
$name = $_Post['name'];
$email = $_Post['email'];
$phone = $_Post['phone'];
$event = $_Post['event'];
$date = $_Post['date'];
$count = $_Post['guest-count'];
$message = $_Post['message'];



$email_from = 'BOOKING@POPUPKARAOKE.NET';
$email_subject = 'New Popup Karaoke Submission';
$email_body = "User Name: $name .\n"
                "Email: $email .\n"
                "Phone: $phone .\n"
                "Event Type: $event .\n"
                "Event Date: $date .\n"
                "Guest Count: $count .\n"
                "Message: $message .\n";

$to = "BOOKING@POPUPKARAOKE.NET";
$headers = "From: $email_from \r\n";
$headers .= "Reply-To: $email \r\n";

mail($to,$email_subject,$email_body,$headers);
header("Location: Index.html");


?>

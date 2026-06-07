<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color:#1f2937;">Your verification code</h2>
    <p>Hello,</p>
    <p>Your one-time verification code for Digital Records System is:</p>
    <p style="font-size: 1.5rem; font-weight: 700; letter-spacing: 0.05em;">{{ $code }}</p>
    <p>This code will expire at {{ $expiresAt->format('h:i A') }}.</p>
    <p>If you did not request this code, please ignore this message.</p>
    <p>Thanks,<br>Digital Records System</p>
</body>
</html>

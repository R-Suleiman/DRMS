<?php

namespace App\Mail;

use App\Models\OtpCode;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OtpCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public OtpCode $otp;

    public function __construct(OtpCode $otp)
    {
        $this->otp = $otp;
    }

    public function build()
    {
        return $this->subject('Your verification code')
            ->view('emails.otp-code')
            ->with([
                'code' => $this->otp->code,
                'expiresAt' => $this->otp->expires_at,
            ]);
    }
}

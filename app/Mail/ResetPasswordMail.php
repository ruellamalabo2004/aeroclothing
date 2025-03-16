<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class ResetPasswordMail extends Mailable
{
    public $resetLink;

    // Constructor to pass the reset link
    public function __construct($resetLink)
    {
        $this->resetLink = $resetLink;
    }

    public function build()
    {
        return $this->subject('Password Reset Request')
                    ->view('emails.reset-password') // Reference the email view you created
                    ->with([
                        'resetLink' => $this->resetLink,
                    ]);
    }
}



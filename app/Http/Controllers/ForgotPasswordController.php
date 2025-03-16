<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Password;
use Illuminate\Http\Request;

class ForgotPasswordController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        // Validate the email input
        $request->validate([
            'email' => 'required|email|exists:users,email',  // Ensure the email exists in the 'users' table
        ]);

        // Send the reset link
        $response = Password::sendResetLink($request->only('email'));

        if ($response == Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Password reset link sent to your email.']);
        }

        return response()->json(['message' => 'Unable to send reset link.'], 400);
    }
}

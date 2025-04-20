<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <style>
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f5f7fa;
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
        }

        .reset-password {
            background: #ffffff;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 100%;
            text-align: center;
        }

        .reset-password__title {
            font-size: 28px;
            font-weight: 700;
            color: #333;
            margin: 0 0 8px;
        }

        .reset-password__subtitle {
            font-size: 14px;
            color: #666;
            margin: 0 0 24px;
        }

        .reset-password__form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .reset-password__field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            text-align: left;
        }

        .reset-password__label {
            font-size: 14px;
            font-weight: 600;
            color: #666;
        }

        .reset-password__input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }

        .reset-password__input-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
        }

        .reset-password__input-icon svg {
            width: 20px;
            height: 20px;
        }

        .reset-password__input {
            padding: 12px 16px 12px 40px;
            font-size: 14px;
            color: #333;
            background-color: #f5f5f5;
            border: none;
            border-radius: 8px;
            outline: none;
            width: 100%;
            box-sizing: border-box;
        }

        .reset-password__input:focus {
            background-color: #e8ecef;
        }

        .reset-password__input:read-only {
            background-color: #f0f0f0;
            cursor: not-allowed;
        }

        .reset-password__toggle-password {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #999;
            padding: 0;
        }

        .reset-password__toggle-password svg {
            width: 20px;
            height: 20px;
        }

        .reset-password__error {
            font-size: 14px;
            color: #dc2626;
            margin: -10px 0 10px;
            text-align: center;
        }

        .reset-password__success {
            font-size: 14px;
            color: #28aa28;
            margin: -10px 0 10px;
            text-align: center;
        }

        .reset-password__submit-button {
            padding: 12px;
            background-color: #3AA6B9;
            color: #fff;
            font-size: 16px;
            font-weight: 500;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .reset-password__submit-button:hover {
            background-color: #3AA6B9;
        }

        .reset-password__submit-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }

        .reset-password__links {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }

        .reset-password__links a {
            color: #3AA6B9;
            text-decoration: none;
            margin: 0 5px;
            transition: color 0.2s ease;
        }

        .reset-password__links a:hover {
            color: #3AA6B9;
        }

        /* Right-Side Pop-up Notification */
        .success-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28aa28; /* Light green as requested */
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: none; /* Hidden by default */
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease-in-out;
            max-width: 320px;
            width: auto;
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .success-notification__icon {
            color: #fff; /* White icon */
        }

        .success-notification__icon svg {
            width: 20px;
            height: 20px;
        }

        .success-notification__message {
            font-size: 14px;
            color: #fff; /* White text */
            margin: 0;
        }

        .error-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336; /* Red background */
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            display: none; /* Hidden by default */
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease-in-out;
            max-width: 320px;
            width: auto;
        }

        .error-notification__icon {
            color: #fff; /* White icon */
        }

        .error-notification__icon svg {
            width: 20px;
            height: 20px;
        }

        .error-notification__message {
            font-size: 14px;
            color: #fff; /* White text */
            margin: 0;
        }

        @media (max-width: 768px) {
            .reset-password {
                padding: 24px;
                max-width: 90%;
            }

            .reset-password__title {
                font-size: 24px;
            }

            .reset-password__subtitle {
                font-size: 13px;
            }

            .reset-password__label {
                font-size: 13px;
            }

            .reset-password__input {
                padding: 10px 14px 10px 36px;
                font-size: 13px;
            }

            .reset-password__input-icon svg,
            .reset-password__toggle-password svg {
                width: 18px;
                height: 18px;
            }

            .reset-password__error,
            .reset-password__success {
                font-size: 13px;
            }

            .reset-password__submit-button {
                padding: 10px;
                font-size: 15px;
            }

            .reset-password__links {
                font-size: 13px;
            }

            .success-notification,
            .error-notification {
                top: 15px;
                right: 15px;
                padding: 10px 16px;
                max-width: 280px;
            }

            .success-notification__message,
            .error-notification__message {
                font-size: 13px;
            }

            .success-notification__icon svg,
            .error-notification__icon svg {
                width: 18px;
                height: 18px;
            }
        }

        @media (max-width: 480px) {
            .reset-password {
                padding: 20px;
            }

            .reset-password__title {
                font-size: 20px;
            }

            .reset-password__subtitle {
                font-size: 12px;
                margin-bottom: 16px;
            }

            .reset-password__label {
                font-size: 12px;
            }

            .reset-password__input {
                padding: 8px 12px 8px 32px;
                font-size: 12px;
            }

            .reset-password__input-icon svg,
            .reset-password__toggle-password svg {
                width: 16px;
                height: 16px;
            }

            .reset-password__error,
            .reset-password__success {
                font-size: 12px;
                margin: -8px 0 8px;
            }

            .reset-password__submit-button {
                padding: 8px;
                font-size: 14px;
            }

            .reset-password__links {
                font-size: 12px;
                margin-top: 16px;
            }

            .success-notification,
            .error-notification {
                top: 10px;
                right: 10px;
                padding: 8px 12px;
                max-width: 250px;
            }

            .success-notification__message,
            .error-notification__message {
                font-size: 12px;
            }

            .success-notification__icon svg,
            .error-notification__icon svg {
                width: 16px;
                height: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="reset-password">
        <h1 class="reset-password__title">Reset Password</h1>
        <p class="reset-password__subtitle">Enter your email and create a new password</p>
        @if ($errors->any())
            @foreach ($errors->all() as $error)
                <p class="reset-password__error">{{ $error }}</p>
            @endforeach
        @endif
        <form class="reset-password__form" id="reset-password-form">
            @csrf
            <input type="hidden" name="token" value="{{ $token }}">
            <div class="reset-password__field">
                <label for="email" class="reset-password__label">Email Address</label>
                <div class="reset-password__input-wrapper">
                    <span class="reset-password__input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                            <polyline points="22 6 12 13 2 6"></polyline>
                        </svg>
                    </span>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value="{{ $email ?? old('email') }}"
                        class="reset-password__input"
                        required
                        autofocus
                        readonly
                    >
                </div>
            </div>
            <div class="reset-password__field">
                <label for="password" class="reset-password__label">New Password</label>
                <div class="reset-password__input-wrapper">
                    <span class="reset-password__input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"></path>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </span>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        class="reset-password__input"
                        required
                    >
                    <button
                        type="button"
                        class="reset-password__toggle-password"
                        onclick="togglePassword('password', this)"
                    >
                        <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <svg class="eye-off-icon" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="reset-password__field">
                <label for="password_confirmation" class="reset-password__label">Confirm New Password</label>
                <div class="reset-password__input-wrapper">
                    <span class="reset-password__input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                            <polyline points="4 22 4 15 20 15"></polyline>
                        </svg>
                    </span>
                    <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        class="reset-password__input"
                        required
                    >
                    <button
                        type="button"
                        class="reset-password__toggle-password"
                        onclick="togglePassword('password_confirmation', this)"
                    >
                        <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <svg class="eye-off-icon" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <button type="submit" class="reset-password__submit-button" id="submit-button">Reset Password</button>
        </form>
        <div class="reset-password__links">
            <a href="/login">Return to Login</a>
            <span>|</span>
            <a href="/support">Contact Support</a>
        </div>
    </div>

    <!-- Right-Side Pop-up Notification -->
    <div class="success-notification" id="success-notification">
        <span class="success-notification__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
            </svg>
        </span>
        <p class="success-notification__message" id="success-message"></p>
    </div>
    <div class="error-notification" id="error-notification">
        <span class="error-notification__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                <path d="M10 10l4 4m0 -4l-4 4"></path>
            </svg>
        </span>
        <p class="error-notification__message" id="error-message"></p>
    </div>

    <script>
        function togglePassword(inputId, button) {
            const input = document.getElementById(inputId);
            const eyeIcon = button.querySelector('.eye-icon');
            const eyeOffIcon = button.querySelector('.eye-off-icon');

            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'inline';
            } else {
                input.type = 'password';
                eyeIcon.style.display = 'inline';
                eyeOffIcon.style.display = 'none';
            }
        }

        function showNotification(message, isSuccess) {
            const successNotification = document.getElementById('success-notification');
            const errorNotification = document.getElementById('error-notification');
            const successMessage = document.getElementById('success-message');
            const errorMessage = document.getElementById('error-message');

            if (isSuccess) {
                successMessage.textContent = message;
                successNotification.style.display = 'flex';
                errorNotification.style.display = 'none';
            } else {
                errorMessage.textContent = message;
                errorNotification.style.display = 'flex';
                successNotification.style.display = 'none';
            }

            // Auto-close after 3 seconds
            setTimeout(() => {
                successNotification.style.display = 'none';
                errorNotification.style.display = 'none';
                // Redirect to /login after closing
                if (isSuccess) {
                    window.location.href = '/login';
                }
            }, 3000);
        }

        // Intercept form submission and handle via fetch
        document.getElementById('reset-password-form').addEventListener('submit', async function (event) {
            event.preventDefault();

            const submitButton = document.getElementById('submit-button');
            submitButton.disabled = true;
            submitButton.textContent = 'Resetting...';

            const formData = new FormData(this);
            const actionUrl = '{{ route('password.update') }}';

            try {
                const response = await fetch(actionUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                const result = await response.json();

                if (response.ok) {
                    // Success: Show right-side pop-up with success message
                    showNotification(result.message || 'Password has been successfully reset.', true);
                } else {
                    // Error: Show right-side pop-up with error message
                    showNotification(result.message || 'Failed to reset password. Please try again.', false);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Reset Password';
                }
            } catch (error) {
                // Network or other error
                showNotification('An error occurred. Please try again later.', false);
                submitButton.disabled = false;
                submitButton.textContent = 'Reset Password';
            }
        });
    </script>
</body>
</html>
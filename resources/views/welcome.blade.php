<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FixNhost</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="{{ mix('css/app.css') }}">
    
    <!-- FontAwesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    

    <link href="https://fonts.googleapis.com/css2?family=Montserrat+Subrayada:wght@400;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet">

</head>
<body>
    <div id="root">
        <div class="container">
            <h1>Welcome to FixNhost</h1>
            <i class="fas fa-shopping-cart"></i> <!-- Example Icon -->
        </div>
    </div>

    <!-- JS -->
    <script src="{{ mix('js/app.js') }}"></script>
</body>
</html>
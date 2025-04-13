document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                
                // Redirect to homepage
                window.location.href = 'index.html';
            } else {
                alert('Erreur dans l\'identifiant ou le mot de passe');
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            alert('Erreur de connexion au serveur');
        }
    });
});
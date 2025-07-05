const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});
loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('registered') === 'true') {
        container.classList.remove('active');
        alert("Registration successful. Please log in.");
    }

    if (localStorage.getItem('login_error') === '1') {
        fetch('php/login_error.php')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                }
                localStorage.removeItem('login_error');
            });
    }
});

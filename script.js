let currentQuote = null;
let savedQuotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];

const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
const header = document.getElementById('header');
const scrollTop = document.getElementById('scrollTop');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const saveQuoteBtn = document.getElementById('saveQuoteBtn');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const contactForm = document.getElementById('contactForm');
const cookieNotification = document.getElementById('cookieNotification');

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    showCookieNotification();
    fetchQuote();
    showFavorites();
});

function setupEventListeners() {
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burger.classList.toggle('active');
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                navLinks.classList.remove('active');
                burger.classList.remove('active');
            }
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
            scrollTop.classList.add('show');
        } else {
            header.classList.remove('scrolled');
            scrollTop.classList.remove('show');
        }
    });

    newQuoteBtn.addEventListener('click', fetchQuote);
    saveQuoteBtn.addEventListener('click', saveCurrentQuote);

    contactForm.addEventListener('submit', handleFormSubmit);

    scrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !burger.contains(e.target)) {
            navLinks.classList.remove('active');
            burger.classList.remove('active');
        }
    });
}

async function fetchQuote() {
    try {
        newQuoteBtn.disabled = true;
        newQuoteBtn.textContent = 'Loading...';

        const response = await fetch('https://dummyjson.com/quotes/random');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        currentQuote = {
            content: data.quote,
            author: data.author
        };

        quoteText.textContent = `"${currentQuote.content}"`;
        quoteAuthor.textContent = `- ${currentQuote.author}`;
        
    } catch (error) {
        console.error('Error fetching quote:', error);
        
        const fallbackQuotes = [
            { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { content: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
        ];
        
        const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        currentQuote = randomQuote;
        quoteText.textContent = `"${randomQuote.content}"`;
        quoteAuthor.textContent = `- ${randomQuote.author}`;
    } finally {
        newQuoteBtn.disabled = false;
        newQuoteBtn.textContent = 'New Quote';
    }
}

function saveCurrentQuote() {
    if (!currentQuote) return;
    const quoteId = `${currentQuote.content}-${currentQuote.author}`;
    if (savedQuotes.some(q => q.id === quoteId)) {
        alert('Quote already saved!');
        return;
    }
    savedQuotes.push({
        id: quoteId,
        content: currentQuote.content,
        author: currentQuote.author
    });
    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    saveQuoteBtn.textContent = 'Saved!';
    saveQuoteBtn.style.background = '#10ac84';
    setTimeout(() => {
        saveQuoteBtn.textContent = 'Save Quote';
        saveQuoteBtn.style.background = '#667eea';
    }, 2000);
    showFavorites(); 
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const message = formData.get('message');
    let isValid = true;
    
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
        group.querySelector('.error-message').style.display = 'none';
    });
    
    if (!name.trim()) {
        showError('name', 'Please enter your name');
        isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
        showError('email', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password.trim() || password.length < 8) {
        showError('password', 'Password must be at least 8 characters');
        isValid = false;
    }
    
    if (!message.trim()) {
        showError('message', 'Please enter your message');
        isValid = false;
    }
    
    if (isValid) {
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        setTimeout(() => {
            alert('Message sent successfully!');
            contactForm.reset();
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        }, 2000);
    }
}

function showError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    formGroup.classList.add('error');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle-btn');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

function showCookieNotification() {
    const cookieAccepted = localStorage.getItem('cookieAccepted');
    if (!cookieAccepted) {
        setTimeout(() => {
            cookieNotification.classList.add('show');
        }, 1000);
    }
}

function acceptCookies() {
    localStorage.setItem('cookieAccepted', 'true');
    cookieNotification.classList.remove('show');
}

function showFavorites() {
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '';

    if (savedQuotes.length === 0) {
        grid.innerHTML = `<p style="text-align: center; color: #666; grid-column: 1 / -1;">
            No favorite quotes yet. Start saving some inspiring quotes!
        </p>`;
        return;
    }

    savedQuotes.forEach(quote => {
        const quoteCard = document.createElement('div');
        quoteCard.className = 'favorite-quote';
        quoteCard.innerHTML = `
            <p>"${quote.content}"</p>
            <p style="font-weight: bold; margin-top: 10px;">- ${quote.author}</p>
            <button class="remove-favorite" title="Remove" data-id="${quote.id}">×</button>
        `;
        grid.appendChild(quoteCard);
    });

    document.querySelectorAll('.remove-favorite').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            savedQuotes = savedQuotes.filter(q => q.id !== id);
            localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
            showFavorites();
        });
    });
}
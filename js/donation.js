// Donation Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const form = document.getElementById('donationForm');
  const amountBtns = document.querySelectorAll('.amount-btn');
  const amountInput = document.getElementById('amount');
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
  const cardDetails = document.getElementById('cardDetails');
  const successMessage = document.getElementById('successMessage');
  const formWrapper = document.querySelector('.donation-form');

  // Amount Button Selection
  amountBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      amountBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');

      const amount = this.dataset.amount;
      if (amount !== 'custom') {
        amountInput.value = amount;
        clearError('amount');
      } else {
        amountInput.value = '';
        amountInput.focus();
      }
    });
  });

  // Amount Input - Activate custom button when typing
  amountInput.addEventListener('input', function() {
    amountBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-amount="custom"]').classList.add('active');

    // Format number input
    this.value = this.value.replace(/[^0-9]/g, '');
  });

  // Payment Method Toggle
  paymentMethods.forEach(method => {
    method.addEventListener('change', function() {
      if (this.value === 'tarjeta') {
        cardDetails.classList.add('active');
        setCardFieldsRequired(true);
      } else {
        cardDetails.classList.remove('active');
        setCardFieldsRequired(false);
        clearCardErrors();
      }
    });
  });

  // Card Number Formatting
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s/g, '');
      let formattedValue = value.match(/.{1,4}/g);
      e.target.value = formattedValue ? formattedValue.join(' ') : '';

      // Detect card type
      detectCardType(value);
    });
  }

  // Card Expiry Formatting
  const cardExpiryInput = document.getElementById('cardExpiry');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }

  // CVV Input - Only numbers
  const cardCVVInput = document.getElementById('cardCVV');
  if (cardCVVInput) {
    cardCVVInput.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }

  // Phone Formatting
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value.length <= 3) {
        value = '(' + value;
      } else if (value.length <= 6) {
        value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
      } else {
        value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 10);
      }
    }
    e.target.value = value;
  });

  // Form Validation
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    let isValid = true;

    // Validate Amount
    const amount = parseFloat(amountInput.value);
    if (!amountInput.value || isNaN(amount) || amount < 10) {
      showError('amount', 'Por favor ingresa un monto válido (mínimo $10)');
      isValid = false;
    } else {
      clearError('amount');
    }

    // Validate First Name
    const firstName = document.getElementById('firstName').value.trim();
    if (!firstName || firstName.length < 2) {
      showError('firstName', 'Por favor ingresa tu nombre');
      isValid = false;
    } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(firstName)) {
      showError('firstName', 'El nombre solo debe contener letras');
      isValid = false;
    } else {
      clearError('firstName');
    }

    // Validate Last Name
    const lastName = document.getElementById('lastName').value.trim();
    if (!lastName || lastName.length < 2) {
      showError('lastName', 'Por favor ingresa tus apellidos');
      isValid = false;
    } else if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(lastName)) {
      showError('lastName', 'Los apellidos solo deben contener letras');
      isValid = false;
    } else {
      clearError('lastName');
    }

    // Validate Email
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('email', 'Por favor ingresa tu correo electrónico');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError('email', 'Por favor ingresa un correo electrónico válido');
      isValid = false;
    } else {
      clearError('email');
    }

    // Validate Phone
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    if (!phone || phone.length !== 10) {
      showError('phone', 'Por favor ingresa un teléfono válido (10 dígitos)');
      isValid = false;
    } else {
      clearError('phone');
    }

    // Validate Card Details if payment method is card
    const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if (selectedPaymentMethod === 'tarjeta') {
      // Validate Card Number
      const cardNumber = cardNumberInput.value.replace(/\s/g, '');
      if (!cardNumber || !validateCardNumber(cardNumber)) {
        showError('cardNumber', 'Por favor ingresa un número de tarjeta válido');
        isValid = false;
      } else {
        clearError('cardNumber');
      }

      // Validate Card Expiry
      const cardExpiry = cardExpiryInput.value;
      if (!cardExpiry || !validateCardExpiry(cardExpiry)) {
        showError('cardExpiry', 'Por favor ingresa una fecha válida (MM/AA)');
        isValid = false;
      } else {
        clearError('cardExpiry');
      }

      // Validate CVV
      const cardCVV = cardCVVInput.value;
      if (!cardCVV || cardCVV.length < 3 || cardCVV.length > 4) {
        showError('cardCVV', 'Por favor ingresa un CVV válido');
        isValid = false;
      } else {
        clearError('cardCVV');
      }
    }

    // Validate Terms
    const terms = document.getElementById('terms');
    if (!terms.checked) {
      showError('terms', 'Debes aceptar los términos y condiciones');
      isValid = false;
    } else {
      clearError('terms');
    }

    // If form is valid, submit
    if (isValid) {
      submitForm();
    }
  });

  // Form Reset
  form.addEventListener('reset', function() {
    setTimeout(() => {
      clearAllErrors();
      amountBtns.forEach(btn => btn.classList.remove('active'));
      document.querySelector('[data-amount="custom"]').classList.add('active');
      cardDetails.classList.add('active');
    }, 0);
  });

  // Helper Functions
  function showError(fieldName, message) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const inputElement = document.getElementById(fieldName);

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('active');
    }

    if (inputElement) {
      inputElement.classList.add('error');
    }
  }

  function clearError(fieldName) {
    const errorElement = document.getElementById(fieldName + 'Error');
    const inputElement = document.getElementById(fieldName);

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('active');
    }

    if (inputElement) {
      inputElement.classList.remove('error');
    }
  }

  function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
      error.textContent = '';
      error.classList.remove('active');
    });

    document.querySelectorAll('input, textarea').forEach(input => {
      input.classList.remove('error');
    });
  }

  function clearCardErrors() {
    clearError('cardNumber');
    clearError('cardExpiry');
    clearError('cardCVV');
  }

  function setCardFieldsRequired(required) {
    const cardFields = [cardNumberInput, cardExpiryInput, cardCVVInput];
    cardFields.forEach(field => {
      if (field) {
        if (required) {
          field.setAttribute('required', '');
        } else {
          field.removeAttribute('required');
        }
      }
    });
  }

  function validateCardNumber(number) {
    // Luhn Algorithm
    if (number.length < 13 || number.length > 19) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return (sum % 10) === 0;
  }

  function validateCardExpiry(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return false;
    }

    const [month, year] = expiry.split('/').map(num => parseInt(num, 10));

    if (month < 1 || month > 12) {
      return false;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  }

  function detectCardType(number) {
    // Simple card type detection (can be expanded)
    const firstDigit = number.charAt(0);

    if (firstDigit === '4') {
      // Visa
      return 'visa';
    } else if (firstDigit === '5') {
      // Mastercard
      return 'mastercard';
    } else if (firstDigit === '3') {
      // American Express
      return 'amex';
    }

    return 'unknown';
  }

  function submitForm() {
    // Collect form data
    const formData = {
      amount: amountInput.value,
      donationType: document.querySelector('input[name="donationType"]:checked').value,
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
      message: document.getElementById('message').value,
      timestamp: new Date().toISOString()
    };

    // If payment method is card, include card details (in production, this should be tokenized)
    if (formData.paymentMethod === 'tarjeta') {
      formData.cardLast4 = cardNumberInput.value.replace(/\s/g, '').slice(-4);
    }

    // Log form data (in production, send to server)
    console.log('Donation Form Submitted:', formData);

    // Simulate API call
    setTimeout(() => {
      // Hide form and show success message
      formWrapper.style.display = 'none';
      successMessage.style.display = 'block';

      // Scroll to success message
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Send confirmation email (simulated)
      console.log(`Sending confirmation email to ${formData.email}`);

      // Store in localStorage (for demo purposes)
      try {
        const donations = JSON.parse(localStorage.getItem('donations') || '[]');
        donations.push(formData);
        localStorage.setItem('donations', JSON.stringify(donations));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }, 1000);
  }

  // Initialize card details visibility
  if (document.querySelector('input[name="paymentMethod"]:checked').value === 'tarjeta') {
    cardDetails.classList.add('active');
    setCardFieldsRequired(true);
  }

  // Add input event listeners to clear errors on typing
  const allInputs = form.querySelectorAll('input, textarea');
  allInputs.forEach(input => {
    input.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        clearError(this.id);
      }
    });
  });

  // Terms checkbox change event
  document.getElementById('terms').addEventListener('change', function() {
    if (this.checked) {
      clearError('terms');
    }
  });
});

// Animation on scroll (optional enhancement)
window.addEventListener('scroll', function() {
  const cards = document.querySelectorAll('.info-card');
  cards.forEach(card => {
    const cardPosition = card.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;

    if (cardPosition < screenPosition) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }
  });
});

// Initialize card animations
document.querySelectorAll('.info-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

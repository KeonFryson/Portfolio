// Contact page only: phone formatting + form submit. No dependencies.
const form = document.getElementById('contactForm');

if (form) {
  const phone = form.elements.phone;
  const result = document.getElementById('contactResult');

  phone.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 10);
    phone.value = d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
                : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}`
                : d ? `(${d}` : '';
  });

  const show = (msg, color = '') => {
    result.textContent = msg;
    result.style.color = color;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    show('Sending...');
    const data = new FormData(form);
    data.append('access_key', '8b4081ef-d1fd-453f-8355-87fc76e4f870'); // public Web3Forms key (safe client-side)
    data.append('subject', 'New Contact Message from Portfolio');

    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (res.ok && json.success) {
        show('Message sent! Thank you.', 'green');
        form.reset();
      } else {
        show(json.message || 'Failed to send message.', 'red');
      }
    } catch {
      show('Something went wrong. Please try again.', 'red');
    }
  });
}

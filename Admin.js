function openAdmin() {
  adminModal.classList.remove('hidden');
}

function closeAdmin() {
  adminModal.classList.add('hidden');
}

function generateAdminLicense() {
  const tier = adminTier.value;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i=0;i<6;i++) token += chars[Math.floor(Math.random()*chars.length)];

  let sum = 0;
  for (const c of token) sum += c.charCodeAt(0);
  sum += tier.length;

  const code = `${tier}-${token}-${sum % 997}`;
  adminOutput.textContent = code;
}

// Keyboard shortcut: Ctrl+Shift+A

document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') openAdmin();
  if (e.key === 'Escape') closeAdmin();
});

adminModal.addEventListener('click', e => {
  if (e.target === adminModal) closeAdmin();
});

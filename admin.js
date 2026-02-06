document.addEventListener('keydown', function(event) {
    // Check for CTRL + SHIFT + A
    if (event.ctrlKey && event.shiftKey && (event.key === 'A' || event.key === 'a')) {
        event.preventDefault();
        
        const password = prompt("Admin Override: Enter Tier (FREE, PRO, ELITE)");
        
        if (password) {
            const tier = password.toUpperCase();
            if(['FREE', 'PRO', 'ELITE'].includes(tier)) {
                localStorage.setItem('fit_tier', tier);
                alert(`System updated to: ${tier}`);
                location.reload();
            } else {
                alert("Invalid Tier");
            }
        }
    }
});

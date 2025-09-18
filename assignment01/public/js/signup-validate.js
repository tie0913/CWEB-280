document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form#signupForm");
    if (!form) return;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^[\d\s()+\-]{7,20}$/;

    form.addEventListener("submit", (e) => {
        const name = form.name?.value.trim();
        const email = form.email?.value.trim();
        const phone = form.phone?.value.trim();
        const position = form.position?.value.trim();
        const pwd = form.password?.value || "";
        const file = form.resume?.files?.[0];

        const errs = [];
        if (!name) errs.push("Name is required");
        if (!emailRe.test(email)) errs.push("Valid email is required");
        if (!phoneRe.test(phone)) errs.push("Valid phone is required");
        if (!position) errs.push("Position is required");
        if (pwd.length < 6) errs.push("Password must be at least 6 characters");
        if (!file) errs.push("Resume (PDF) is required");
        else {
            if (file.type !== "application/pdf") errs.push("Resume must be a PDF");
            if (file.size > 2 * 1024 * 1024) errs.push("Resume must be ≤ 2MB");
        }

        if (errs.length) {
            e.preventDefault();
            const box = document.getElementById("clientErrors");
            if (box) box.textContent = errs.join(", ");
            else alert(errs.join("\n"));
        }
    });
});
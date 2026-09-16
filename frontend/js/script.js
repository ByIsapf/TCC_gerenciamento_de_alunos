const background = document.getElementById("background-effects");

const quantidade = 35;

for (let i = 0; i < quantidade; i++) {

    const particle = document.createElement("div");

    particle.classList.add("particle");

    particle.style.left = Math.random() * 100 + "%";

    particle.style.animationDuration =
        (Math.random() * 10 + 8) + "s";

    particle.style.animationDelay =
        (Math.random() * 8) + "s";

    const tamanho = Math.random() * 5 + 2;

    particle.style.width = tamanho + "px";
    particle.style.height = tamanho + "px";

    background.appendChild(particle);
}
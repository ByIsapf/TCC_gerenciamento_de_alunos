
const form = document.getElementById("form");
const status = document.getElementById("status");
const resultado = document.getElementById("resultado");

let temporizador;
function iniciarContador(segundos){
    const inicio=Date.now(), duracao=Math.max(0,Number(segundos)||60)*1000;
    const contador=document.getElementById("qr-contador-admin");
    function atualizar(){
        const restante=Math.max(0,Math.ceil((duracao-(Date.now()-inicio))/1000));
        contador.textContent=restante>0?`Expira em ${restante}s`:"QR Code expirado.";
        if(restante===0){clearInterval(temporizador);resultado.hidden=true;status.textContent="Código vencido. Gere outro se necessário.";}
    }
    atualizar();temporizador=setInterval(atualizar,250);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearInterval(temporizador);
    resultado.hidden = true;
    status.textContent = "Consultando aluno...";

    try {
        const ra = document.getElementById("ra").value.trim();

        const r = await fetch("/qr/gerar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ra })
        });

        const d = await r.json();

        if (!r.ok) {
            throw new Error(d.mensagem || "Erro ao gerar QR Code.");
        }

        document.getElementById("nome").textContent = d.aluno.nome;
        document.getElementById("ra-aluno").textContent =
            "RA: " + d.aluno.ra;

        const qr = document.getElementById("qrcode");
        qr.replaceChildren();

        if (typeof QRCode !== "function") {
            throw new Error("Biblioteca QR indisponível.");
        }

        // Endereço do computador na rede Wi-Fi
        const baseUrl = "http://192.168.18.61:3000";

        // Link completo para confirmação da presença
        const url = baseUrl
            + "/presenca.html?token="
            + encodeURIComponent(d.token);

        new QRCode(qr, {
            text: url,
            width: 220,
            height: 220
        });

        resultado.hidden = false;
        status.textContent = "Código liberado. Válido por 60 segundos.";

        iniciarContador(d.validadeSegundos);

    } catch (err) {
        status.textContent = err.message;
    }
});

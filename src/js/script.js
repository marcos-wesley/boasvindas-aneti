document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("art-form");
    const photoInput = document.getElementById("photo");
    const nameInput = document.getElementById("name");
    const cityInput = document.getElementById("city");
    const stateSelect = document.getElementById("state");
    const membershipSelect = document.getElementById("membership-level");
    const canvas = document.getElementById("art-preview");
    const ctx = canvas.getContext("2d");

    // Configurações do canvas
    canvas.width = 1080;
    canvas.height = 1350;

    // Coordenadas dos elementos nos templates (baseado na análise visual e feedback)
    const templateConfig = {
        circle: {
            x: 540,  // Centro horizontal
            y: 460,  // Posição vertical do círculo (ajustado)
            radius: 172
        },
        nameText: {
            x: 395, // Posição X exata para o texto Nome
            y: 930  // Posição Y exata para o texto Nome
        },
        cityStateText: {
            x: 395, // Posição X exata para o texto Cidade - UF
            y: 1120  // Posição Y exata para o texto Cidade - UF
        }
    };

    // Array com todas as UFs do Brasil
    const ufs = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];

    // Preencher o dropdown de UF
    ufs.forEach(uf => {
        const option = document.createElement("option");
        option.value = uf;
        option.textContent = uf;
        stateSelect.appendChild(option);
    });

    // Preview da imagem quando selecionada
    photoInput.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updatePreview();
            };
            reader.readAsDataURL(file);
        }
    });

    // Atualizar preview quando os campos mudarem
    nameInput.addEventListener("input", updatePreview);
    cityInput.addEventListener("input", updatePreview);
    stateSelect.addEventListener("change", updatePreview);
    membershipSelect.addEventListener("change", updatePreview);

    function updatePreview() {
        const membershipLevel = membershipSelect.value;
        if (!membershipLevel) return;

        // Carregar template baseado no nível de associação
        const templateImg = new Image();
        templateImg.onload = function() {
            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Desenhar template
            ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
            
            // Desenhar foto do usuário se disponível
            if (photoInput.files[0]) {
                drawUserPhoto();
            }
            
            // Desenhar textos
            drawTexts();
        };
        // Corrigir a associação dos templates
        let templateFileName = membershipLevel;
        templateImg.src = `templates/${templateFileName}.png`;
    }

    function drawUserPhoto() {
        const file = photoInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Salvar contexto
                ctx.save();
                
                // Criar máscara circular
                ctx.beginPath();
                ctx.arc(templateConfig.circle.x, templateConfig.circle.y, templateConfig.circle.radius, 0, 2 * Math.PI);
                ctx.clip();
                
                // Calcular dimensões para manter proporção e preencher o círculo
                const size = templateConfig.circle.radius * 2;
                const scale = Math.max(size / img.width, size / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                
                // Centralizar a imagem no círculo
                const x = templateConfig.circle.x - scaledWidth / 2;
                const y = templateConfig.circle.y - scaledHeight / 2;
                
                // Desenhar imagem
                ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
                
                // Restaurar contexto
                ctx.restore();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function drawTexts() {
        // Configurar fonte
        ctx.font = "bold 40px 'Open Sans'"; // Tamanho da fonte ajustado para 40px
        ctx.fillStyle = "#012d6a"; // Cor da fonte ajustada para #012d6a
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";

        // Desenhar nome
        const name = nameInput.value;
        if (name) {
            ctx.fillText(name, templateConfig.nameText.x, templateConfig.nameText.y);
        }

        // Desenhar cidade - UF
        const city = cityInput.value;
        const state = stateSelect.value;
        if (city && state) {
            const cityState = `${city} - ${state.toUpperCase()}`;
            ctx.fillText(cityState, templateConfig.cityStateText.x, templateConfig.cityStateText.y);
        }
    }

    // Submissão do formulário
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        
        // Validar campos
        if (!photoInput.files[0]) {
            showMessage("Por favor, selecione uma foto.", "error");
            return;
        }
        
        if (!nameInput.value.trim()) {
            showMessage("Por favor, insira seu nome completo.", "error");
            return;
        }
        
        if (!cityInput.value.trim()) {
            showMessage("Por favor, insira sua cidade.", "error");
            return;
        }
        
        if (!stateSelect.value) {
            showMessage("Por favor, selecione seu estado (UF).", "error");
            return;
        }
        
        if (!membershipSelect.value) {
            showMessage("Por favor, selecione seu nível de associação.", "error");
            return;
        }

        // Mostrar loading
        form.classList.add("loading");
        
        // Preparar dados para envio
        const formData = new FormData();
        formData.append("photo", photoInput.files[0]);
        formData.append("name", nameInput.value.trim());
        formData.append("city", cityInput.value.trim());
        formData.append("state", stateSelect.value);
        formData.append("membership_level", membershipSelect.value);

        // Enviar para o PHP
        fetch("src/php/generate_art.php", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error); });
            }
            return response.blob();
        })
        .then(blob => {
            // Criar link de download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `ANETI-MEMBRO-${nameInput.value.trim().replace(/\s+/g, "-").toUpperCase()}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showMessage("Arte gerada com sucesso! O download foi iniciado.", "success");
        })
        .catch(error => {
            console.error("Erro:", error);
            showMessage(`Erro ao gerar a arte: ${error.message}. Tente novamente.`, "error");
        })
        .finally(() => {
            form.classList.remove("loading");
        });
    });

    function showMessage(message, type) {
        // Remover mensagens anteriores
        const existingMessages = document.querySelectorAll(".success-message, .error-message");
        existingMessages.forEach(msg => msg.remove());
        
        // Criar nova mensagem
        const messageDiv = document.createElement("div");
        messageDiv.className = type === "success" ? "success-message" : "error-message";
        messageDiv.textContent = message;
        
        // Inserir após o formulário
        form.parentNode.insertBefore(messageDiv, form.nextSibling);
        
        // Remover após 5 segundos
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
});


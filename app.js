// Substitua pela sua URL do ngrok, exemplo: 'https://xxxxxx.ngrok.io/cadastrar'
const API_URL = 'https://baf0-34-106-88-226.ngrok-free.app';

const btnManual = document.getElementById('btnManual');
const btnNota = document.getElementById('btnNota');
const form = document.getElementById('materialForm');
const notaFiscalForm = document.getElementById('notaFiscalForm');
const notaFiscalInput = document.getElementById('notaFiscalInput');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const cameraButton = document.getElementById('cameraButton');
const enviarNotaFiscal = document.getElementById('enviarNotaFiscal');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const msgNota = document.getElementById('msgNota');
const msgDiv = document.getElementById('msg');
const respostaDiv = document.getElementById('resposta');

// Exibe o formulário manual e oculta a mensagem da nota fiscal
btnManual.onclick = function() {
  form.style.display = 'block';
  notaFiscalForm.style.display = 'none';
  imagePreview.style.display = 'none';
  msgNota.style.display = 'none';
  respostaDiv.style.display = 'none';
  msgDiv.innerText = '';
  btnManual.classList.add('active');
  btnNota.classList.remove('active');
};

// Exibe o formulário de nota fiscal e oculta o formulário manual
btnNota.onclick = function() {
  form.style.display = 'none';
  notaFiscalForm.style.display = 'block';
  respostaDiv.style.display = 'none';
  msgDiv.innerText = '';
  msgNota.innerText = 'Selecione ou tire uma foto da nota fiscal para processamento.';
  msgNota.style.display = 'block';
  btnNota.classList.add('active');
  btnManual.classList.remove('active');
};

// Por padrão, mostra o formulário manual ao carregar a página
window.onload = () => {
  btnManual.click();
};

// Atualiza o nome do arquivo selecionado
notaFiscalInput.addEventListener('change', function() {
  if (this.files && this.files[0]) {
    fileNameDisplay.textContent = this.files[0].name;

    // Exibe o preview da imagem
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      imagePreview.style.display = 'block';
    };
    reader.readAsDataURL(this.files[0]);
  } else {
    fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
    imagePreview.style.display = 'none';
  }
});

// Botão para ativar a câmera
cameraButton.addEventListener('click', function() {
  notaFiscalInput.setAttribute('capture', 'environment');
  notaFiscalInput.click();
});

// Formulário de cadastro manual
form.onsubmit = async function(e) {
  e.preventDefault();
  const descricao = document.getElementById('descricao').value.trim();
  respostaDiv.style.display = 'none';
  msgDiv.innerText = 'Enviando...';

  try {
    const response = await fetch(`${API_URL}/cadastrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descricao })
    });

    const data = await response.json();

    if (response.ok) {
      msgDiv.innerText = data.mensagem || 'Cadastro realizado!';
      if (data.mensagem && data.mensagem.toLowerCase().includes('sucesso')) {
        respostaDiv.innerHTML = `
          <strong>Descrição enviada:</strong><br>
          <pre>${descricao}</pre>
        `;
        respostaDiv.style.display = 'block';
      } else {
        respostaDiv.style.display = 'none';
      }
    } else {
      msgDiv.innerText = data.mensagem || 'Erro ao cadastrar.';
      respostaDiv.style.display = 'none';
    }
  } catch (error) {
    msgDiv.innerText = 'Erro de conexão com o servidor.';
    respostaDiv.style.display = 'none';
  }

  form.reset();
};

// Processar nota fiscal
enviarNotaFiscal.addEventListener('click', async function() {
  if (!notaFiscalInput.files || !notaFiscalInput.files[0]) {
    msgNota.innerText = 'Por favor, selecione uma imagem da nota fiscal.';
    return;
  }

  const file = notaFiscalInput.files[0];
  const reader = new FileReader();

  reader.onload = async function(e) {
    const base64Image = e.target.result;
    msgNota.innerText = 'Processando nota fiscal...';

    try {
      const response = await fetch(`${API_URL}/processar_nota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagem: base64Image })
      });

      const data = await response.json();

      if (response.ok) {
        msgNota.innerText = data.mensagem || 'Nota fiscal processada com sucesso!';
        if (data.dados) {
          respostaDiv.innerHTML = `
            <strong>Dados extraídos da nota fiscal:</strong><br>
            <pre>${JSON.stringify(data.dados, null, 2)}</pre>
          `;
          respostaDiv.style.display = 'block';
        }
      } else {
        msgNota.innerText = data.mensagem || 'Erro ao processar a nota fiscal.';
      }
    } catch (error) {
      msgNota.innerText = 'Erro de conexão com o servidor.';
    }
  };

  reader.readAsDataURL(file);
});

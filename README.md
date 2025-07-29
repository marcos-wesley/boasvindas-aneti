# Gerador de Arte ANETI

Sistema web para geração automática de artes de boas-vindas personalizadas para membros da ANETI (Associação Nacional dos Especialistas em TI).

## Descrição

Esta aplicação permite que os membros da ANETI criem suas próprias artes de boas-vindas de forma simples e automatizada. O sistema processa a foto do usuário, insere os dados pessoais nos templates correspondentes ao nível de associação e gera uma imagem final pronta para compartilhamento nas redes sociais.

## Funcionalidades

- **Upload de Foto**: Suporte para arquivos PNG e JPG
- **Formulário Personalizado**: Campos para nome completo, cidade, estado (com dropdown de UF) e nível de associação
- **Templates por Nível**: Diferentes designs para Público, Júnior, Pleno e Sênior (associação corrigida)
- **Processamento Automático**: Redimensionamento e corte circular preciso da foto do usuário, centralizado perfeitamente no círculo verde do template, ocupando 100% da área, sem sobras ou deslocamentos.
- **Inserção de Texto**: Aplicação automática dos dados nos templates com fonte Open Sans Negrito, tamanho 40px, cor #012d6a (azul escuro), com posicionamento exato e alinhamento vertical correto, sem ultrapassar os limites das caixas.
- **Download Automático**: Geração e download da arte final em alta qualidade (1080x1350px), nome do arquivo: ANETI-MEMBRO-NOME.png
- **Interface Responsiva**: Compatível com desktop e dispositivos móveis

## Estrutura do Projeto

```
aneti-art-generator/
├── index.html              # Página principal
├── src/
│   ├── css/
│   │   └── style.css       # Estilos da aplicação
│   ├── js/
│   │   └── script.js       # Lógica do frontend
│   └── php/
│       └── generate_art.php # Processamento backend
├── templates/
│   ├── publico.png         # Template para nível Público
│   ├── junior.png          # Template para nível Júnior
│   ├── pleno.png           # Template para nível Pleno
│   └── senior.png          # Template para nível Sênior
├── assets/
│   └── OpenSans-Bold.ttf   # Fonte utilizada nos textos
└── README.md               # Este arquivo
```

## Requisitos do Sistema

### Servidor
- PHP 8.1 ou superior
- Extensão PHP GD (para manipulação de imagens)
- Servidor web (Apache, Nginx ou PHP built-in server)

### Cliente
- Navegador moderno com suporte a HTML5, CSS3 e JavaScript ES6
- Conexão com a internet para carregamento da fonte Google Fonts

## Instalação

1. **Faça o download dos arquivos**
   ```bash
   # Extraia todos os arquivos para o diretório do seu servidor web
   ```

2. **Verifique as permissões**
   ```bash
   # Certifique-se de que o PHP tem permissão para ler os templates e assets
   chmod -R 755 aneti-art-generator/
   ```

3. **Configure o servidor web**
   - Para Apache: Certifique-se de que o mod_rewrite está habilitado
   - Para Nginx: Configure o bloco server apropriado
   - Para desenvolvimento: Use o servidor built-in do PHP

## Uso

### Desenvolvimento Local

1. **Inicie o servidor PHP**
   ```bash
   cd aneti-art-generator
   php -S localhost:8000
   ```

2. **Acesse a aplicação**
   ```
   http://localhost:8000
   ```

### Produção

1. **Upload dos arquivos**
   - Faça upload de todos os arquivos para o diretório público do seu servidor web

2. **Configuração do servidor**
   - Certifique-se de que o PHP e a extensão GD estão instalados
   - Configure o virtual host se necessário

3. **Teste a aplicação**
   - Acesse a URL do seu domínio
   - Teste o upload e geração de uma arte

## Como Usar a Aplicação

1. **Acesse a página principal**
2. **Preencha o formulário:**
   - Faça upload de uma foto (PNG ou JPG)
   - Digite seu nome completo
   - Digite sua cidade
   - Selecione seu estado (UF) no dropdown
   - Selecione seu nível de associação
3. **Clique em "Gerar minha arte"**
4. **Aguarde o processamento**
5. **O download será iniciado automaticamente**

## Especificações Técnicas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com Flexbox e Grid
- **JavaScript ES6**: Manipulação do DOM e requisições AJAX
- **Canvas API**: Pré-visualização da arte

### Backend
- **PHP 8.1**: Processamento server-side
- **GD Library**: Manipulação de imagens
- **Sem banco de dados**: Processamento stateless

### Processamento de Imagem
- **Redimensionamento**: Mantém proporção da foto original
- **Corte circular**: Máscara circular aplicada automaticamente, centralizada e preenchendo o círculo verde.
- **Posicionamento**: Centralização automática no círculo verde do template
- **Qualidade**: Saída em PNG de alta qualidade

### Tipografia
- **Fonte**: Open Sans Bold
- **Tamanho**: 40px
- **Cor**: Azul escuro (#012d6a)
- **Posicionamento**: Alinhamento preciso nos campos de texto para Nome e Cidade - UF, com correção da inversão.

## Resolução de Problemas

### Erro de Upload
- Verifique se o arquivo é PNG ou JPG
- Certifique-se de que o arquivo não excede o limite de upload do PHP
- Verifique as permissões de escrita no diretório temporário

### Erro de Processamento
- Verifique se a extensão PHP GD está instalada
- Confirme se os templates estão no diretório correto
- Verifique se a fonte OpenSans-Bold.ttf está acessível

### Problemas de Layout
- Limpe o cache do navegador
- Verifique se todos os arquivos CSS e JS foram carregados
- Teste em diferentes navegadores

## Suporte

Para suporte técnico ou dúvidas sobre a aplicação, entre em contato com a equipe de desenvolvimento da ANETI.

## Licença

Este projeto foi desenvolvido exclusivamente para a ANETI e seus membros. Todos os direitos reservados.

